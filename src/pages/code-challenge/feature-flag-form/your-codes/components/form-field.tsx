import type { ReactNode } from 'react'

import { Label } from '#/components/ui/label'
import { cn } from '#/lib/utils'

import { errorId, firstError } from './field-errors'
import type { FieldErrors } from './field-errors'

export function FieldError({
  fieldName,
  errors,
}: {
  fieldName: string
  errors: FieldErrors
}) {
  const message = firstError(errors)
  if (!message) return null
  return (
    <p
      id={errorId(fieldName)}
      role="alert"
      className="text-xs text-destructive"
    >
      {message}
    </p>
  )
}

type FormFieldProps = {
  label: string
  htmlFor: string
  errors: FieldErrors
  hint?: string
  className?: string
  children: ReactNode
}

export function FormField({
  label,
  htmlFor,
  errors,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('grid content-start gap-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <FieldError fieldName={htmlFor} errors={errors} />
      {hint && !firstError(errors) && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}
