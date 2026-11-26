import { describe, expect, it } from 'vitest'

import { DEFAULT_FLAG } from './defaults'
import { toOutput } from './to-output'

// expected.json from the assignment page.
const EXPECTED = {
  flags: {
    'my-new-feature': {
      variations: { on: true, off: false },
      targeting: [
        { query: "group == 'beta'", percentage: 50, variation: 'on' },
      ],
      defaultRule: { variation: 'off' },
    },
  },
}

describe('toOutput', () => {
  it('produces expected.json for the default flag', () => {
    expect(toOutput(DEFAULT_FLAG)).toStrictEqual(EXPECTED)
  })

  it('serializes keys in the same order as expected.json', () => {
    expect(JSON.stringify(toOutput(DEFAULT_FLAG))).toBe(
      JSON.stringify(EXPECTED),
    )
  })

  it('resolves variation ids to their current names', () => {
    const values = structuredClone(DEFAULT_FLAG)
    values.variations[0].name = 'enabled'

    const flag = toOutput(values).flags['my-new-feature']

    expect(flag.variations).toStrictEqual({ enabled: true, off: false })
    expect(flag.targeting?.[0].variation).toBe('enabled')
  })

  it('omits targeting when there are no rules', () => {
    const values = { ...DEFAULT_FLAG, targeting: [] }

    expect(toOutput(values).flags['my-new-feature']).not.toHaveProperty(
      'targeting',
    )
  })

  it('adds disable and metadata only when set', () => {
    const values = {
      ...DEFAULT_FLAG,
      enabled: false,
      description: ' Beta rollout ',
    }

    expect(toOutput(values).flags['my-new-feature']).toMatchObject({
      disable: true,
      metadata: { description: 'Beta rollout' },
    })
  })

  it('parses variation values by flag type', () => {
    const values = {
      ...DEFAULT_FLAG,
      type: 'json' as const,
      variations: [
        { id: 'a', name: 'a', value: '{"color":"red"}' },
        { id: 'b', name: 'b', value: '[1, 2' },
      ],
    }

    expect(toOutput(values).flags['my-new-feature'].variations).toStrictEqual({
      a: { color: 'red' },
      b: '[1, 2',
    })
  })
})
