export type FieldErrors = ReadonlyArray<{ message: string } | undefined>

/** The first issue is the most relevant one, e.g. "required" before a format rule. */
export function firstError(errors: FieldErrors) {
  return errors.find(Boolean)?.message
}

export const errorId = (fieldName: string) => `${fieldName}-error`

/** Props that tie an input to its error message for styling and screen readers. */
export function invalidProps(fieldName: string, errors: FieldErrors) {
  const invalid = firstError(errors) !== undefined
  return {
    'aria-invalid': invalid,
    'aria-describedby': invalid ? errorId(fieldName) : undefined,
  }
}
