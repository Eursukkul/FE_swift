import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

import type { FlagForm } from '../use-flag-form'
import { invalidProps } from './field-errors'
import { FormField } from './form-field'
import { VariationSelect } from './variation-select'

export function DefaultRuleSection({ form }: { form: FlagForm }) {
  return (
    <Card role="region" aria-label="Default rule">
      <CardHeader>
        <CardTitle>Default rule</CardTitle>
        <CardDescription>
          Served when no targeting rule matches.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form.Field name="defaultVariationId">
          {(field) => (
            <FormField
              label="Default variation"
              htmlFor={field.name}
              errors={field.state.meta.errors}
              className="sm:max-w-sm"
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
      </CardContent>
    </Card>
  )
}
