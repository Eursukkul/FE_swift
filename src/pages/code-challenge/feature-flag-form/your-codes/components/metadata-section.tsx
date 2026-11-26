import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Switch } from '#/components/ui/switch'
import { Textarea } from '#/components/ui/textarea'

import { FLAG_TYPES } from '../model/schema'
import type { FlagType } from '../model/schema'
import type { FlagForm } from '../use-flag-form'
import { FormField } from './form-field'

const FLAG_TYPE_LABELS: Record<FlagType, string> = {
  boolean: 'Boolean',
  string: 'String',
  number: 'Number',
  json: 'JSON',
}

export function MetadataSection({ form }: { form: FlagForm }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Flag</CardTitle>
        <CardDescription>Name, description and status.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <form.Field name="name">
          {(field) => (
            <FormField label="Flag name" htmlFor={field.name}>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="my-new-feature"
                autoComplete="off"
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="type">
          {(field) => (
            <FormField label="Flag type" htmlFor={field.name}>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as FlagType)}
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FLAG_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {FLAG_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <FormField
              label="Description"
              htmlFor={field.name}
              className="sm:col-span-2"
            >
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="What does this flag control?"
                rows={2}
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="enabled">
          {(field) => (
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5 sm:col-span-2">
              <div>
                <label htmlFor={field.name} className="text-sm font-medium">
                  {field.state.value ? 'Enabled' : 'Disabled'}
                </label>
                <p className="text-xs text-muted-foreground">
                  A disabled flag always serves the SDK default value.
                </p>
              </div>
              <Switch
                id={field.name}
                checked={field.state.value}
                onCheckedChange={field.handleChange}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>
      </CardContent>
    </Card>
  )
}
