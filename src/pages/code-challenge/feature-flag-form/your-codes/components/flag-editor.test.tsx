// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { FlagEditor } from './flag-editor'

// jsdom has no ResizeObserver; Radix measures the switch thumb with it.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

afterEach(cleanup)

describe('FlagEditor — metadata', () => {
  it('shows the default flag values', () => {
    render(<FlagEditor />)

    expect(screen.getByLabelText('Flag name')).toHaveProperty(
      'value',
      'my-new-feature',
    )
    expect(screen.getByRole('switch')).toHaveProperty('ariaChecked', 'true')
  })

  it('keeps inputs in sync with form state', () => {
    render(<FlagEditor />)

    const name = screen.getByLabelText('Flag name')
    fireEvent.change(name, { target: { value: 'checkout-v2' } })
    expect(name).toHaveProperty('value', 'checkout-v2')

    const description = screen.getByLabelText('Description')
    fireEvent.change(description, { target: { value: 'New checkout' } })
    expect(description).toHaveProperty('value', 'New checkout')
  })

  it('toggles the enabled status', () => {
    render(<FlagEditor />)

    fireEvent.click(screen.getByRole('switch'))

    expect(screen.getByRole('switch')).toHaveProperty('ariaChecked', 'false')
    expect(screen.getByText('Disabled')).toBeTruthy()
  })
})
