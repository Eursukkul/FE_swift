import { describe, expect, it } from 'vitest'

import { newVariation } from './defaults'

const variation = (name: string) => ({ id: name, name, value: '' })

describe('newVariation', () => {
  it('numbers the name after the existing variations', () => {
    expect(
      newVariation('boolean', [variation('on'), variation('off')]),
    ).toMatchObject({
      name: 'variation_3',
      value: 'false',
    })
  })

  it('skips names that are already taken', () => {
    const existing = [variation('variation_2'), variation('variation_3')]

    expect(newVariation('string', existing).name).toBe('variation_4')
  })
})
