import { X } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

import type { FlagType } from '../../model/schema'
import type { FlagForm } from '../../use-flag-form'
import { invalidProps } from '../field-errors'
import { FieldError } from '../form-field'
import { VariationValueInput } from './variation-value-input'

type VariationRowProps = {
  form: FlagForm
  index: number
  flagType: FlagType
  canRemove: boolean
  onRemove: () => void
}

export function VariationRow({
  form,
  index,
  flagType,
  canRemove,
  onRemove,
}: VariationRowProps) {
  const variation = `variations[${index}]` as const

  return (
    <div
      role="group"
      aria-label={`Variation ${index + 1}`}
      className="grid gap-2 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] sm:items-start"
    >
      <form.Field name={`${variation}.name`}>
        {(field) => (
          <div className="grid gap-1">
            <Input
              id={field.name}
              aria-label="Variation name"
              placeholder="name, e.g. on"
              autoComplete="off"
              {...invalidProps(field.name, field.state.meta.errors)}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError
              fieldName={field.name}
              errors={field.state.meta.errors}
            />
          </div>
        )}
      </form.Field>

      <form.Field name={`${variation}.value`}>
        {(field) => (
          <div className="grid gap-1">
            <VariationValueInput
              flagType={flagType}
              id={field.name}
              {...invalidProps(field.name, field.state.meta.errors)}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
            />
            <FieldError
              fieldName={field.name}
              errors={field.state.meta.errors}
            />
          </div>
        )}
      </form.Field>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove variation ${index + 1}`}
        title={canRemove ? undefined : 'A flag needs at least 2 variations'}
        disabled={!canRemove}
        onClick={onRemove}
      >
        <X />
      </Button>
    </div>
  )
}
