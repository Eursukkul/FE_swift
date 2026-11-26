import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'

import type { FlagType } from '../../model/schema'

type VariationValueInputProps = {
  flagType: FlagType
  id: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

/** One input per flag type; every type stores raw text that the schema parses. */
export function VariationValueInput({
  flagType,
  onChange,
  ...props
}: VariationValueInputProps) {
  switch (flagType) {
    case 'boolean':
      return (
        <Select
          value={
            props.value === 'true' || props.value === 'false' ? props.value : ''
          }
          onValueChange={onChange}
        >
          <SelectTrigger
            id={props.id}
            aria-label="Variation value"
            aria-invalid={props['aria-invalid']}
            aria-describedby={props['aria-describedby']}
            onBlur={props.onBlur}
            className="w-full"
          >
            <SelectValue placeholder="Select true or false" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">true</SelectItem>
            <SelectItem value="false">false</SelectItem>
          </SelectContent>
        </Select>
      )
    case 'json':
      return (
        <Textarea
          {...props}
          aria-label="Variation value"
          rows={2}
          spellCheck={false}
          placeholder='{"color": "blue"}'
          className="font-mono text-xs"
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case 'number':
    case 'string':
      return (
        <Input
          {...props}
          aria-label="Variation value"
          inputMode={flagType === 'number' ? 'decimal' : undefined}
          placeholder={flagType === 'number' ? '0' : 'value'}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
        />
      )
  }
}
