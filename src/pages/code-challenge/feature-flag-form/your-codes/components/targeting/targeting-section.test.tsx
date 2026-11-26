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

const rule = (name: string) => screen.getByRole('article', { name })
const queryOf = (name: string) =>
  screen.getByLabelText(`${name} query`).textContent

describe('TargetingSection', () => {
  it('starts with the rule from expected.json', () => {
    render(<FlagEditor />)

    expect(queryOf('Rule 1')).toBe("group == 'beta'")
    expect(screen.getByLabelText('Rollout')).toHaveProperty('value', '50')
  })

  it('creates a complete rule from scratch', () => {
    render(<FlagEditor />)

    fireEvent.click(screen.getByRole('button', { name: 'Add rule' }))
    const second = within(rule('Rule 2'))

    // plan == 'pro'
    type(second.getByLabelText('Attribute'), 'plan')
    type(second.getByLabelText('Value'), 'pro')

    // and (role in [admin, editor] or country == 'TH')
    fireEvent.click(second.getByRole('button', { name: 'Group' }))
    const nested = within(second.getByRole('group', { name: 'Nested group' }))
    choose(nested.getByLabelText('Combinator'), 'OR')
    type(nested.getByLabelText('Attribute'), 'role')
    choose(nested.getByLabelText('Operator'), 'In a list')
    type(nested.getByLabelText('Value'), 'admin, editor')
    fireEvent.click(nested.getByRole('button', { name: 'Condition' }))
    type(nested.getAllByLabelText('Attribute')[1], 'country')
    type(nested.getAllByLabelText('Value')[1], 'TH')

    choose(second.getByLabelText('Serve'), 'off')
    type(second.getByLabelText('Rollout'), '25')

    expect(queryOf('Rule 2')).toBe(
      "plan == 'pro' and (role in ['admin', 'editor'] or country == 'TH')",
    )
    expect(second.getByLabelText('Serve').textContent).toBe('off')
    expect(second.getByLabelText('Rollout')).toHaveProperty('value', '25')
    expect(second.queryByRole('alert')).toBeNull()
    expect(queryOf('Rule 1')).toBe("group == 'beta'")
  })

  it('adds and removes rules', () => {
    render(<FlagEditor />)

    fireEvent.click(screen.getByRole('button', { name: 'Add rule' }))
    expect(rule('Rule 2')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Remove Rule 1' }))
    expect(screen.queryByRole('article', { name: 'Rule 2' })).toBeNull()
    expect(queryOf('Rule 1')).toBe('Add a condition to build the query')
  })

  it('keeps later conditions intact when an earlier one is removed', () => {
    render(<FlagEditor />)
    const first = within(rule('Rule 1'))

    fireEvent.click(first.getByRole('button', { name: 'Condition' }))
    type(first.getAllByLabelText('Attribute')[1], 'plan')
    type(first.getAllByLabelText('Value')[1], 'pro')
    fireEvent.click(
      first.getAllByRole('button', { name: 'Remove condition' })[0],
    )

    expect(first.getByLabelText('Attribute')).toHaveProperty('value', 'plan')
    expect(queryOf('Rule 1')).toBe("plan == 'pro'")
  })

  it('keeps a later nested group intact when an earlier one is removed', () => {
    render(<FlagEditor />)
    const first = within(rule('Rule 1'))

    fireEvent.click(first.getByRole('button', { name: 'Group' }))
    fireEvent.click(first.getAllByRole('button', { name: 'Group' })[0])
    const second = within(
      first.getAllByRole('group', { name: 'Nested group' })[1],
    )
    type(second.getByLabelText('Attribute'), 'env')
    type(second.getByLabelText('Value'), 'prod')
    fireEvent.click(first.getAllByRole('button', { name: 'Remove group' })[0])

    expect(first.getAllByRole('group', { name: 'Nested group' })).toHaveLength(
      1,
    )
    expect(queryOf('Rule 1')).toBe("group == 'beta' and (env == 'prod')")
  })

  it('builds the query from conditions and nested groups', () => {
    render(<FlagEditor />)
    const first = within(rule('Rule 1'))

    fireEvent.click(first.getByRole('button', { name: 'Group' }))
    const nested = within(first.getByRole('group', { name: 'Nested group' }))
    type(nested.getByLabelText('Attribute'), 'role')
    type(nested.getByLabelText('Value'), 'admin')

    fireEvent.click(nested.getByRole('button', { name: 'Group' }))
    const deepest = within(nested.getByRole('group', { name: 'Nested group' }))
    type(deepest.getByLabelText('Attribute'), 'country')
    type(deepest.getByLabelText('Value'), 'TH')

    expect(queryOf('Rule 1')).toBe(
      "group == 'beta' and (role == 'admin' and (country == 'TH'))",
    )
  })

  it('shows errors on conditions inside nested groups', () => {
    render(<FlagEditor />)
    const first = within(rule('Rule 1'))

    fireEvent.click(first.getByRole('button', { name: 'Group' }))
    const nested = within(first.getByRole('group', { name: 'Nested group' }))
    const attribute = nested.getByLabelText('Attribute')
    type(attribute, 'role')
    type(attribute, '')

    expect(attribute.getAttribute('aria-invalid')).toBe('true')
    expect(errorFor(attribute)).toBe('Attribute is required')
    expect(errorFor(nested.getByLabelText('Value'))).toBe('Value is required')
  })

  it('asks to fill or remove an empty group', () => {
    render(<FlagEditor />)
    const first = within(rule('Rule 1'))

    fireEvent.click(first.getByRole('button', { name: 'Group' }))
    const nested = within(first.getByRole('group', { name: 'Nested group' }))
    fireEvent.click(nested.getByRole('button', { name: 'Remove condition' }))

    expect(nested.getByRole('alert').textContent).toBe(
      'Add a condition or remove this group',
    )

    fireEvent.click(nested.getByRole('button', { name: 'Remove group' }))
    expect(first.queryByRole('group', { name: 'Nested group' })).toBeNull()
  })

  it('validates the rollout percentage', () => {
    render(<FlagEditor />)

    type(screen.getByLabelText('Rollout'), '150')

    expect(within(rule('Rule 1')).getByRole('alert').textContent).toBe(
      'Must be between 0 and 100',
    )
  })
})
