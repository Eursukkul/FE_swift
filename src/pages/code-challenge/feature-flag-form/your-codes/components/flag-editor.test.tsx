// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import '../test-utils'
import { FlagEditor } from './flag-editor'

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

describe('FlagEditor — validation', () => {
  it('shows no errors for the default flag', () => {
    render(<FlagEditor />)

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('explains what is wrong with the flag name and clears once fixed', () => {
    render(<FlagEditor />)
    const name = screen.getByLabelText('Flag name')

    fireEvent.change(name, { target: { value: '' } })
    expect(screen.getByRole('alert').textContent).toBe('Flag name is required')
    expect(name.getAttribute('aria-invalid')).toBe('true')
    expect(name.getAttribute('aria-describedby')).toBe('name-error')

    fireEvent.change(name, { target: { value: 'My Feature' } })
    expect(screen.getByRole('alert').textContent).toBe(
      'Use lowercase kebab-case, e.g. my-new-feature',
    )

    fireEvent.change(name, { target: { value: 'my-feature' } })
    expect(screen.queryByRole('alert')).toBeNull()
    expect(name.getAttribute('aria-invalid')).toBe('false')
  })

  it('limits the description length', () => {
    render(<FlagEditor />)

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'x'.repeat(281) },
    })

    expect(screen.getByRole('alert').textContent).toBe(
      'Keep it under 280 characters',
    )
  })
})
