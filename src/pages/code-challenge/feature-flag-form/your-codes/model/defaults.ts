import type {
  Condition,
  FlagFormValues,
  FlagType,
  Group,
  Rule,
  Variation,
} from './schema'

const newId = () => crypto.randomUUID()

export const newCondition = (): Condition => ({
  id: newId(),
  type: 'condition',
  attribute: '',
  operator: '==',
  value: '',
})

export const newGroup = (): Group => ({
  id: newId(),
  type: 'group',
  combinator: 'and',
  children: [newCondition()],
})

export const newRule = (variationId: string): Rule => ({
  id: newId(),
  conditions: newGroup(),
  variationId,
  percentage: 100,
})

/** Names the variation `variation_<n>` with the first n not already taken. */
export function newVariation(
  type: FlagType,
  existing: ReadonlyArray<Variation>,
): Variation {
  const taken = new Set(existing.map((v) => v.name.trim()))
  let n = existing.length + 1
  while (taken.has(`variation_${n}`)) n++
  return { id: newId(), name: `variation_${n}`, value: initialValue(type) }
}

export function initialValue(type: FlagType) {
  return { boolean: 'false', string: '', number: '0', json: '{}' }[type]
}

// Mirrors expected.json from the assignment. Fixed ids keep server and client renders identical.
export const DEFAULT_FLAG: FlagFormValues = {
  name: 'my-new-feature',
  description: '',
  enabled: true,
  type: 'boolean',
  variations: [
    { id: 'variation-on', name: 'on', value: 'true' },
    { id: 'variation-off', name: 'off', value: 'false' },
  ],
  targeting: [
    {
      id: 'rule-1',
      conditions: {
        id: 'rule-1-root',
        type: 'group',
        combinator: 'and',
        children: [
          {
            id: 'rule-1-condition-1',
            type: 'condition',
            attribute: 'group',
            operator: '==',
            value: 'beta',
          },
        ],
      },
      variationId: 'variation-on',
      percentage: 50,
    },
  ],
  defaultVariationId: 'variation-off',
}
