import { Plus } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

import { newVariation } from '../../model/defaults'
import type { FlagForm } from '../../use-flag-form'
import { VariationRow } from './variation-row'

const MIN_VARIATIONS = 2

export function VariationsSection({ form }: { form: FlagForm }) {
  return (
    <Card role="region" aria-label="Variations">
      <CardHeader>
        <CardTitle>Variations</CardTitle>
        <CardDescription>
          The values this flag can return. Rules and the default rule pick one
          of them.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <form.Subscribe selector={(state) => state.values.type}>
          {(flagType) => (
            <form.Field name="variations" mode="array">
              {(variations) => (
                <>
                  {/* Index keys keep each field bound to one path (see condition-group.tsx). */}
                  {variations.state.value.map((_, index) => (
                    <VariationRow
                      key={index}
                      form={form}
                      index={index}
                      flagType={flagType}
                      canRemove={variations.state.value.length > MIN_VARIATIONS}
                      onRemove={() => variations.removeValue(index)}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-self-start"
                    onClick={() =>
                      variations.pushValue(
                        newVariation(
                          flagType,
                          form.getFieldValue('variations'),
                        ),
                      )
                    }
                  >
                    <Plus /> Add variation
                  </Button>
                </>
              )}
            </form.Field>
          )}
        </form.Subscribe>
      </CardContent>
    </Card>
  )
}
