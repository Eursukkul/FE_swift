import type { ReactNode } from 'react'

import { Label } from '#/components/ui/label'
import { cn } from '#/lib/utils'

type FormFieldProps = {
  label: string
  htmlFor: string
  hint?: string
  className?: string
  children: ReactNode
}

export function FormField({
  label,
  htmlFor,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
