import { describe, expect, it } from 'vitest'

import { describePath } from './describe-path'

describe('describePath', () => {
  it('names top-level fields', () => {
    expect(describePath(['name'])).toBe('Flag name')
    expect(describePath(['defaultVariationId'])).toBe('Default variation')
  })

  it('numbers variations from 1', () => {
    expect(describePath(['variations', 1, 'name'])).toBe('Variation 2 › Name')
  })

  it('walks into nested groups and conditions', () => {
    expect(
      describePath([
        'targeting',
        0,
        'conditions',
        'children',
        1,
        'children',
        0,
        'value',
      ]),
    ).toBe('Rule 1 › Group 2 › Condition 1 › Value')
  })

  it('points at an empty group itself', () => {
    expect(
      describePath(['targeting', 2, 'conditions', 'children', 0, 'children']),
    ).toBe('Rule 3 › Group 1')
  })

  it('names rule fields', () => {
    expect(describePath(['targeting', 0, 'percentage'])).toBe(
      'Rule 1 › Rollout',
    )
    expect(describePath(['targeting', 0, 'variationId'])).toBe('Rule 1 › Serve')
  })
})
