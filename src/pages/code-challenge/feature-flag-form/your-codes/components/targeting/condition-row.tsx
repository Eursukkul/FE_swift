import { X } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

import { OPERATORS, OPERATOR_KEYS } from '../../model/operators'
import type { Operator } from '../../model/operators'
import type { FlagForm } from '../../use-flag-form'
import { invalidProps } from '../field-errors'
import { FieldError } from '../form-field'
import { DragHandle } from '../reorder/drag-handle'
import type { HandleProps } from '../reorder/use-reorder'
import { ATTRIBUTE_LIST_ID } from './paths'
import type { NodePath } from './paths'

type ConditionRowProps = {
  form: FlagForm
  path: NodePath
  handle: HandleProps
  onRemove: () => void
}

export function ConditionRow({
  form,
  path,
  handle,
  onRemove,
}: ConditionRowProps) {
  return (
    // Lays out by the width of its group (container query), not the screen: nested groups are narrower.
    // When stacked, an outline keeps one condition's fields together.
    <div className="grid gap-2 rounded-md border border-border p-2 @lg:grid-cols-[auto_minmax(0,1fr)_11rem_minmax(0,1fr)_auto] @lg:items-start @lg:border-0 @lg:p-0">
      <DragHandle {...handle} className="mt-0.5 hidden @lg:inline-flex" />
      <form.Field name={`${path}.attribute`}>
        {(field) => (
          <div className="grid gap-1">
            <Input
              aria-label="Attribute"
              list={ATTRIBUTE_LIST_ID}
              placeholder="attribute, e.g. role"
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

      <form.Field name={`${path}.operator`}>
        {(operator) => (
          <>
            <Select
              value={operator.state.value}
              onValueChange={(value) =>
                operator.handleChange(value as Operator)
              }
            >
              <SelectTrigger aria-label="Operator" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPERATOR_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {OPERATORS[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <form.Field name={`${path}.value`}>
              {(field) =>
                OPERATORS[operator.state.value].takesValue ? (
                  <div className="grid gap-1">
                    <Input
                      aria-label="Value"
                      placeholder={
                        operator.state.value === 'in'
                          ? 'admin, editor'
                          : 'value'
                      }
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
                ) : (
                  <span aria-hidden />
                )
              }
            </form.Field>
          </>
        )}
      </form.Field>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Remove condition"
        onClick={onRemove}
      >
        <X />
      </Button>
    </div>
  )
}
