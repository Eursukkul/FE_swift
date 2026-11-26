import { OPERATORS } from './operators'
import type { Condition, Group } from './schema'

const BARE_LITERAL = /^(?:-?\d+(?:\.\d+)?|true|false)$/

function literal(raw: string) {
  const value = raw.trim()
  if (BARE_LITERAL.test(value)) return value
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function conditionToQuery({ attribute, operator, value }: Condition) {
  const field = attribute.trim()
  if (!field) return ''
  if (!OPERATORS[operator].takesValue) return `${field} ${operator}`
  if (operator === 'in') {
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map(literal)
    return `${field} in [${items.join(', ')}]`
  }
  return `${field} ${operator} ${literal(value)}`
}

function groupToQuery(group: Group): string {
  return group.children
    .map((child) =>
      child.type === 'group'
        ? wrap(groupToQuery(child))
        : conditionToQuery(child),
    )
    .filter(Boolean)
    .join(` ${group.combinator} `)
}

function wrap(query: string) {
  return query ? `(${query})` : ''
}

/** Compiles the condition tree into a nikunjy/rules query string. */
export function buildQuery(root: Group) {
  return groupToQuery(root)
}
