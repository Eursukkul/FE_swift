// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { type } from '../../test-utils'
import { FlagEditor } from '../flag-editor'

afterEach(cleanup)

const rule = (name: string) => screen.getByRole('article', { name })
const queryOf = (name: string) =>
  screen.getByLabelText(`${name} query`).textContent

/** Move handles of conditions and groups in DOM order, which shows what kind each slot renders. */
const handlesIn = (scope: HTMLElement) =>
  within(scope)
    .getAllByRole('button', { name: /^Move (condition|group) \d+$/ })
    .map((button) => button.getAttribute('aria-label'))

// jsdom has no DataTransfer; the drag handlers only set these fields.
const dataTransfer = { setData() {}, effectAllowed: '', dropEffect: '' }

/** Arms the handle, then drags its item onto `target`, as a mouse user would. */
function drag(handle: HTMLElement, item: HTMLElement, target: HTMLElement) {
  fireEvent.pointerDown(handle)
  fireEvent.dragStart(item, { dataTransfer })
  fireEvent.dragOver(target, { dataTransfer })
  fireEvent.drop(target, { dataTransfer })
  fireEvent.dragEnd(item, { dataTransfer })
}

function addPlanRule() {
  fireEvent.click(screen.getByRole('button', { name: 'Add rule' }))
  const second = within(rule('Rule 2'))
  type(second.getByLabelText('Attribute'), 'plan')
  type(second.getByLabelText('Value'), 'pro')
}

describe('Reordering targeting rules', () => {
  it('moves a rule by dragging its handle', () => {
    render(<FlagEditor />)
    addPlanRule()

    drag(
      screen.getByRole('button', { name: 'Move Rule 2' }),
      rule('Rule 2'),
      rule('Rule 1'),
    )

    expect(queryOf('Rule 1')).toBe("plan == 'pro'")
    expect(queryOf('Rule 2')).toBe("group == 'beta'")
  })

  it('moves a rule with the arrow keys', () => {
    render(<FlagEditor />)
    addPlanRule()

    fireEvent.keyDown(screen.getByRole('button', { name: 'Move Rule 1' }), {
      key: 'ArrowDown',
    })

    expect(queryOf('Rule 1')).toBe("plan == 'pro'")
    expect(queryOf('Rule 2')).toBe("group == 'beta'")
  })

  it('ignores a drag that started on a different list', () => {
    render(<FlagEditor />)
    addPlanRule()
    const first = within(rule('Rule 1'))
    fireEvent.click(first.getByRole('button', { name: 'Condition' }))

    // Dragging a condition and dropping it on another rule must not reorder rules.
    const condition = first.getByRole('button', { name: 'Move condition 2' })
    fireEvent.pointerDown(condition)
    fireEvent.dragStart(condition.parentElement!.parentElement!, {
      dataTransfer,
    })
    fireEvent.dragOver(rule('Rule 2'), { dataTransfer })
    fireEvent.drop(rule('Rule 2'), { dataTransfer })

    expect(queryOf('Rule 1')).toBe("group == 'beta'")
    expect(queryOf('Rule 2')).toBe("plan == 'pro'")
  })
})

describe('Reordering inside a group', () => {
  it('swaps a condition and a nested group', () => {
    render(<FlagEditor />)
    const first = within(rule('Rule 1'))
    fireEvent.click(first.getByRole('button', { name: 'Group' }))
    const nested = within(first.getByRole('group', { name: 'Nested group' }))
    type(nested.getByLabelText('Attribute'), 'role')
    type(nested.getByLabelText('Value'), 'admin')

    fireEvent.keyDown(first.getByRole('button', { name: 'Move group 2' }), {
      key: 'ArrowUp',
    })

    expect(queryOf('Rule 1')).toBe("(role == 'admin') and group == 'beta'")
    // The slots re-render as their new kind: the group (with its own condition) is now first.
    expect(handlesIn(rule('Rule 1'))).toStrictEqual([
      'Move group 1',
      'Move condition 1',
      'Move condition 2',
    ])
    expect(
      within(first.getByRole('group', { name: 'Nested group' })).getByLabelText(
        'Attribute',
      ),
    ).toHaveProperty('value', 'role')

    // Moving back when nothing else about the list changed must re-render the slots too.
    fireEvent.keyDown(first.getByRole('button', { name: 'Move group 1' }), {
      key: 'ArrowDown',
    })
    expect(queryOf('Rule 1')).toBe("group == 'beta' and (role == 'admin')")
    expect(handlesIn(rule('Rule 1'))).toStrictEqual([
      'Move condition 1',
      'Move group 2',
      'Move condition 1',
    ])
  })

  it('drags a condition within its group', () => {
    render(<FlagEditor />)
    const first = within(rule('Rule 1'))
    fireEvent.click(first.getByRole('button', { name: 'Condition' }))
    type(first.getAllByLabelText('Attribute')[1], 'plan')
    type(first.getAllByLabelText('Value')[1], 'pro')

    const handle = first.getByRole('button', { name: 'Move condition 2' })
    const item = handle.closest('[draggable]') as HTMLElement
    const target = first
      .getByRole('button', { name: 'Move condition 1' })
      .closest('[draggable]') as HTMLElement
    drag(handle, item, target)

    expect(queryOf('Rule 1')).toBe("plan == 'pro' and group == 'beta'")
    expect(first.getAllByLabelText('Attribute')[0]).toHaveProperty(
      'value',
      'plan',
    )
  })
})
