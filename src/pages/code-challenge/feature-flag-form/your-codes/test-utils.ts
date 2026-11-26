import { fireEvent, screen } from '@testing-library/react'

// jsdom lacks browser APIs that Radix calls: ResizeObserver to measure controls,
// scrollIntoView when a Select opens.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Element.prototype.scrollIntoView ??= () => {}

export function type(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } })
}

/** Opens a Radix Select with the keyboard and picks an option, as a keyboard user would. */
export function choose(trigger: HTMLElement, option: string) {
  fireEvent.keyDown(trigger, { key: 'Enter' })
  fireEvent.keyDown(screen.getByRole('option', { name: option }), {
    key: 'Enter',
  })
}

/** Text of the error message linked to an input through aria-describedby. */
export const errorFor = (input: HTMLElement) =>
  document.getElementById(input.getAttribute('aria-describedby') ?? '')
    ?.textContent
