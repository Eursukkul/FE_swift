// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { choose, errorFor, type } from '../../test-utils'
import { FlagEditor } from '../flag-editor'

afterEach(cleanup)

const variations = () =>
  within(screen.getByRole('region', { name: 'Variations' }))
const variation = (n: number) =>
  within(variations().getByRole('group', { name: `Variation ${n}` }))
const ruleServe = () =>
  within(screen.getByRole('article', { name: 'Rule 1' })).getByLabelText(
    'Serve',
  )
const defaultServe = () =>
  within(screen.getByRole('region', { name: 'Default rule' })).getByLabelText(
    'Default variation',
  )

describe('VariationsSection', () => {
  it('shows the on/off variations from expected.json', () => {
    render(<FlagEditor />)

    expect(variation(1).getByLabelText('Variation name')).toHaveProperty(
      'value',
      'on',
    )
    expect(variation(1).getByLabelText('Variation value').textContent).toBe(
      'true',
    )
    expect(variation(2).getByLabelText('Variation value').textContent).toBe(
      'false',
    )
  })

  it('adds a variation with a unique name and keeps at least two', () => {
    render(<FlagEditor />)
    const removeFirst = () =>
      variations().getByRole('button', { name: 'Remove variation 1' })

    expect(removeFirst()).toHaveProperty('disabled', true)

    fireEvent.click(variations().getByRole('button', { name: 'Add variation' }))

    expect(variation(3).getByLabelText('Variation name')).toHaveProperty(
      'value',
      'variation_3',
    )
    expect(removeFirst()).toHaveProperty('disabled', false)
  })

  it('updates rules when a variation is renamed', () => {
    render(<FlagEditor />)

    type(variation(1).getByLabelText('Variation name'), 'enabled')

    expect(ruleServe().textContent).toBe('enabled')
  })

  it('flags rules that pointed at a removed variation', () => {
    render(<FlagEditor />)

    fireEvent.click(variations().getByRole('button', { name: 'Add variation' }))
    fireEvent.click(
      variations().getByRole('button', { name: 'Remove variation 1' }),
    )

    expect(errorFor(ruleServe())).toBe(
      'Selected variation was removed — pick another one',
    )
  })

  it('rejects duplicate names', () => {
    render(<FlagEditor />)
    const name = variation(2).getByLabelText('Variation name')

    type(name, 'on')

    expect(errorFor(name)).toBe('"on" is already used')
  })

  it('validates values against the flag type', () => {
    render(<FlagEditor />)

    choose(screen.getByLabelText('Flag type'), 'JSON')
    const value = variation(1).getByLabelText('Variation value')
    type(value, '{"color": ')

    expect(errorFor(value)).toBe('Must be valid JSON')
  })

  it('resets values that do not fit a new flag type', () => {
    render(<FlagEditor />)

    choose(screen.getByLabelText('Flag type'), 'Number')

    expect(variation(1).getByLabelText('Variation value')).toHaveProperty(
      'value',
      '0',
    )
  })
})

describe('DefaultRuleSection', () => {
  it('serves the chosen default variation', () => {
    render(<FlagEditor />)
    expect(defaultServe().textContent).toBe('off')

    choose(defaultServe(), 'on')

    expect(defaultServe().textContent).toBe('on')
  })
})
