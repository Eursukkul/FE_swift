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
  invalid: boolean
}

/** Options track the variation list live; the value is a variation id so renames never break it. */
export function VariationSelect({
  form,
  id,
  value,
  onChange,
  invalid,
}: VariationSelectProps) {
  return (
    <form.Subscribe selector={(state) => state.values.variations}>
      {(variations) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={id} aria-invalid={invalid} className="w-full">
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
