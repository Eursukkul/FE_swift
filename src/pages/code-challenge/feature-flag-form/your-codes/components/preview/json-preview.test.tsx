// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { type } from '../../test-utils'
import { FlagEditor } from '../flag-editor'

// Monaco loads from a CDN and needs a real browser; the boundary is replaced by a plain
// textarea showing the same `value`.
vi.mock('@monaco-editor/react', () => ({
  Editor: ({ value }: { value: string }) => (
    <textarea aria-label="Output JSON" readOnly value={value} />
  ),
}))

afterEach(cleanup)

const output = () =>
  JSON.parse(screen.getByLabelText<HTMLTextAreaElement>('Output JSON').value)
const preview = () =>
  within(screen.getByRole('region', { name: 'JSON preview' }))

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

describe('JsonPreview', () => {
  it('shows expected.json for the default flag', () => {
    render(<FlagEditor />)

    expect(output()).toStrictEqual(EXPECTED)
    expect(preview().getByRole('status').textContent).toBe('Valid')
  })

  it('updates in real time while editing', () => {
    render(<FlagEditor />)

    type(screen.getByLabelText('Flag name'), 'checkout-v2')
    fireEvent.click(screen.getByRole('switch'))

    expect(output().flags['checkout-v2']).toMatchObject({ disable: true })
    expect(output().flags).not.toHaveProperty('my-new-feature')
  })

  it('reflects targeting edits in the query', () => {
    render(<FlagEditor />)

    type(screen.getByLabelText('Rollout'), '75')
    fireEvent.click(screen.getByRole('button', { name: 'Group' }))
    const nested = within(screen.getByRole('group', { name: 'Nested group' }))
    type(nested.getByLabelText('Attribute'), 'role')
    type(nested.getByLabelText('Value'), 'admin')

    expect(output().flags['my-new-feature'].targeting).toStrictEqual([
      {
        query: "group == 'beta' and (role == 'admin')",
        percentage: 75,
        variation: 'on',
      },
    ])
  })

  it('lists one issue per field with where it is', () => {
    render(<FlagEditor />)

    type(screen.getByLabelText('Flag name'), '')
    fireEvent.click(screen.getByRole('button', { name: 'Group' }))

    expect(preview().getByRole('status').textContent).toBe('3 issues')
    const issues = within(preview().getByRole('list', { name: 'Issues' }))
      .getAllByRole('listitem')
      .map((item) => item.textContent)
    expect(issues).toStrictEqual([
      'Flag name — Flag name is required',
      'Rule 1 › Group 2 › Condition 1 › Attribute — Attribute is required',
      'Rule 1 › Group 2 › Condition 1 › Value — Value is required',
    ])
  })
})
