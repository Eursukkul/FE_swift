import { describe, expect, it } from 'vitest'

import { DEFAULT_FLAG } from './defaults'
import { flagFormSchema } from './schema'
import type { FlagFormValues } from './schema'

function issuesOf(values: FlagFormValues) {
  const result = flagFormSchema.safeParse(values)
  return result.success
    ? []
    : result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }))
}

const edit = (mutate: (draft: FlagFormValues) => void) => {
  const draft = structuredClone(DEFAULT_FLAG)
  mutate(draft)
  return draft
}

describe('flagFormSchema', () => {
  it('accepts the default flag', () => {
    expect(issuesOf(DEFAULT_FLAG)).toStrictEqual([])
  })

  it('requires a flag name', () => {
    expect(issuesOf(edit((d) => (d.name = '  ')))).toContainEqual({
      path: 'name',
      message: 'Flag name is required',
    })
  })

  it('rejects names that are not kebab-case', () => {
    expect(issuesOf(edit((d) => (d.name = 'My Feature')))).toContainEqual({
      path: 'name',
      message: 'Use lowercase kebab-case, e.g. my-new-feature',
    })
  })

  it('requires at least two variations', () => {
    expect(issuesOf(edit((d) => d.variations.pop()))).toContainEqual({
      path: 'variations',
      message: 'Add at least 2 variations',
    })
  })

  it('flags duplicate variation names on the later one', () => {
    expect(issuesOf(edit((d) => (d.variations[1].name = 'on')))).toContainEqual(
      {
        path: 'variations.1.name',
        message: '"on" is already used',
      },
    )
  })

  it('validates variation values against the flag type', () => {
    expect(
      issuesOf(edit((d) => (d.variations[0].value = 'yes'))),
    ).toContainEqual({
      path: 'variations.0.value',
      message: 'Must be true or false',
    })
    expect(issuesOf(edit((d) => (d.type = 'number')))).toContainEqual({
      path: 'variations.0.value',
      message: 'Must be a number',
    })
  })

  it('reports rules pointing at a removed variation', () => {
    const issues = issuesOf(
      edit((d) =>
        d.variations.splice(0, 1, { id: 'x', name: 'x', value: 'true' }),
      ),
    )

    expect(issues).toContainEqual({
      path: 'targeting.0.variationId',
      message: 'Selected variation was removed — pick another one',
    })
  })

  it('limits percentage to 0-100', () => {
    expect(
      issuesOf(edit((d) => (d.targeting[0].percentage = 101))),
    ).toContainEqual({
      path: 'targeting.0.percentage',
      message: 'Must be between 0 and 100',
    })
  })

  it('validates conditions inside nested groups with the full path', () => {
    const issues = issuesOf(
      edit((d) => {
        d.targeting[0].conditions.children.push({
          id: 'g',
          type: 'group',
          combinator: 'or',
          children: [
            {
              id: 'c',
              type: 'condition',
              attribute: 'role',
              operator: 'in',
              value: '',
            },
            { id: 'empty', type: 'group', combinator: 'and', children: [] },
          ],
        })
      }),
    )

    expect(issues).toContainEqual({
      path: 'targeting.0.conditions.children.1.children.0.value',
      message: 'Value is required',
    })
    expect(issues).toContainEqual({
      path: 'targeting.0.conditions.children.1.children.1.children',
      message: 'Add a condition or remove this group',
    })
  })

  it('does not require a value for the "present" operator', () => {
    const values = edit((d) => {
      d.targeting[0].conditions.children[0] = {
        id: 'c',
        type: 'condition',
        attribute: 'email',
        operator: 'pr',
        value: '',
      }
    })

    expect(issuesOf(values)).toStrictEqual([])
  })
})
