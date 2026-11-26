import { Trash2 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

import { cn } from '#/lib/utils'

import { buildQuery } from '../../model/build-query'
import { asFlagValues } from '../../use-flag-form'
import type { FlagForm } from '../../use-flag-form'
import { invalidProps } from '../field-errors'
import { FormField } from '../form-field'
import { DragHandle } from '../reorder/drag-handle'
import { DRAG_STATES } from '../reorder/drag-states'
import type { Reorder } from '../reorder/use-reorder'
import { VariationSelect } from '../variation-select'
import { ConditionGroup } from './condition-group'

type RuleCardProps = {
  form: FlagForm
  index: number
  reorder: Reorder
  onRemove: () => void
}

export function RuleCard({ form, index, reorder, onRemove }: RuleCardProps) {
  const rule = `targeting[${index}]` as const
  const title = `Rule ${index + 1}`

  return (
    <article
      aria-label={title}
      {...reorder.itemProps(index)}
      className={cn(
        'grid gap-4 rounded-lg border border-border bg-card p-4 transition-shadow',
        DRAG_STATES,
      )}
    >
      <header className="flex items-center gap-1">
        <DragHandle {...reorder.handleProps(index, title)} />
        <h3 className="mr-auto text-sm font-medium">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${title}`}
          onClick={onRemove}
        >
          <Trash2 />
        </Button>
      </header>

      <ConditionGroup form={form} path={`${rule}.conditions`} depth={0} />

      <form.Subscribe
        selector={(state) => {
          const values = asFlagValues(state.values)
          const current = values.targeting.at(index)
          return current ? buildQuery(current.conditions) : ''
        }}
      >
        {(query) => (
          <output
            aria-label={`${title} query`}
            className="block rounded-md bg-muted px-3 py-2 font-mono text-xs break-all text-muted-foreground"
          >
            {query || 'Add a condition to build the query'}
          </output>
        )}
      </form.Subscribe>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name={`${rule}.variationId`}>
          {(field) => (
            <FormField
              label="Serve"
              htmlFor={field.name}
              errors={field.state.meta.errors}
            >
              <VariationSelect
                form={form}
                id={field.name}
                value={field.state.value}
                onChange={field.handleChange}
                {...invalidProps(field.name, field.state.meta.errors)}
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name={`${rule}.percentage`}>
          {(field) => (
            <FormField
              label="Rollout"
              htmlFor={field.name}
              errors={field.state.meta.errors}
              hint="Share of matching users that get this variation."
            >
              <div className="relative">
                <Input
                  id={field.name}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  step={1}
                  className="pr-8"
                  {...invalidProps(field.name, field.state.meta.errors)}
                  value={
                    Number.isNaN(field.state.value) ? '' : field.state.value
                  }
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                  %
                </span>
              </div>
            </FormField>
          )}
        </form.Field>
      </div>
    </article>
  )
}
