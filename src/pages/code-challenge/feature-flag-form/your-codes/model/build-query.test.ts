import { describe, expect, it } from 'vitest'

import { buildQuery } from './build-query'
import type { Operator } from './operators'
import type { Condition, Group } from './schema'

const condition = (
  attribute: string,
  operator: Operator,
  value = '',
): Condition => ({
  id: attribute,
  type: 'condition',
  attribute,
  operator,
  value,
})

const group = (
  combinator: Group['combinator'],
  ...children: Group['children']
): Group => ({
  id: combinator,
  type: 'group',
  combinator,
  children,
})

describe('buildQuery', () => {
  it('builds a single condition like expected.json', () => {
    expect(buildQuery(group('and', condition('group', '==', 'beta')))).toBe(
      "group == 'beta'",
    )
  })

  it('joins siblings with the group combinator', () => {
    const root = group(
      'or',
      condition('country', '==', 'TH'),
      condition('age', '>=', '18'),
    )

    expect(buildQuery(root)).toBe("country == 'TH' or age >= 18")
  })

  it('wraps nested groups in parentheses at every depth', () => {
    const root = group(
      'and',
      condition('group', '==', 'beta'),
      group(
        'or',
        condition('role', 'in', 'admin, editor'),
        group(
          'and',
          condition('email', 'ew', '@acme.com'),
          condition('beta', '==', 'true'),
        ),
      ),
    )

    expect(buildQuery(root)).toBe(
      "group == 'beta' and (role in ['admin', 'editor'] or (email ew '@acme.com' and beta == true))",
    )
  })

  it('renders operators without a value', () => {
    expect(buildQuery(group('and', condition('email', 'pr')))).toBe('email pr')
  })

  it('escapes quotes in values', () => {
    expect(buildQuery(group('and', condition('name', '==', "O'Brien")))).toBe(
      "name == 'O\\'Brien'",
    )
  })

  it('skips conditions without an attribute and empty groups', () => {
    const root = group(
      'and',
      condition('', '==', 'x'),
      group('or'),
      condition('plan', '==', 'pro'),
    )

    expect(buildQuery(root)).toBe("plan == 'pro'")
  })
})
