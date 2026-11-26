import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

import type { FlagForm } from '../use-flag-form'

type VariationSelectProps = {
  form: FlagForm
  id: string
  value: string
  onChange: (variationId: string) => void
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

/** Options track the variation list live; the value is a variation id so renames never break it. */
export function VariationSelect({
  form,
  value,
  onChange,
  ...triggerProps
}: VariationSelectProps) {
  return (
    <form.Subscribe selector={(state) => state.values.variations}>
      {(variations) => (
        // A removed variation falls back to '' so the placeholder shows next to the error.
        <Select
          value={variations.some((v) => v.id === value) ? value : ''}
          onValueChange={onChange}
        >
          <SelectTrigger {...triggerProps} className="w-full">
            <SelectValue placeholder="Select a variation" />
          </SelectTrigger>
          <SelectContent>
            {variations.map((variation) => (
              <SelectItem key={variation.id} value={variation.id}>
                {variation.name || 'Unnamed variation'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </form.Subscribe>
  )
}
