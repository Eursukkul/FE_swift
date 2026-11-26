import { Plus } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

import { newRule } from '../../model/defaults'
import { COMMON_ATTRIBUTES } from '../../model/operators'
import type { FlagForm } from '../../use-flag-form'
import { ATTRIBUTE_LIST_ID } from './paths'
import { RuleCard } from './rule-card'

export function TargetingSection({ form }: { form: FlagForm }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Targeting rules</CardTitle>
        <CardDescription>
          Rules run top to bottom; the first one that matches serves its
          variation.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <datalist id={ATTRIBUTE_LIST_ID}>
          {COMMON_ATTRIBUTES.map((attribute) => (
            <option key={attribute} value={attribute} />
          ))}
        </datalist>

        <form.Field name="targeting" mode="array">
          {(rules) => (
            <>
              {rules.state.value.map((_, index) => (
                <RuleCard
                  key={index}
                  form={form}
                  index={index}
                  onRemove={() => rules.removeValue(index)}
                />
              ))}

              {rules.state.value.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No rules yet — every user gets the default variation.
                </p>
              )}

              <Button
                type="button"
                variant="outline"
                className="justify-self-start"
                onClick={() =>
                  rules.pushValue(
                    newRule(form.getFieldValue('variations')[0]?.id ?? ''),
                  )
                }
              >
                <Plus /> Add rule
              </Button>
            </>
          )}
        </form.Field>
      </CardContent>
    </Card>
  )
}
