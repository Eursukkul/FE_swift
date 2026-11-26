import { standardSchemaValidators, useForm } from '@tanstack/react-form'

import { DEFAULT_FLAG } from './model/defaults'
import { flagFormSchema } from './model/schema'
import type { Condition, FlagFormValues, Group, Rule } from './model/schema'

// TanStack Form's DeepKeys walks recursive types forever (TS2589) and stops only at `unknown`.
// The form is therefore typed one group level deep; every deeper group has the same shape,
// so recursive components address it through the first-level path type.
type NestedGroup = Omit<Group, 'children'> & { children: Array<unknown> }
type FormGroup = Omit<Group, 'children'> & {
  children: Array<Condition | NestedGroup>
}
export type FlagFormData = Omit<FlagFormValues, 'targeting'> & {
  targeting: Array<Omit<Rule, 'conditions'> & { conditions: FormGroup }>
}

const defaultValues: FlagFormData = DEFAULT_FLAG

/** Runtime form values always have the full recursive shape; only the static type is shallower. */
export const asFlagValues = (data: FlagFormData) => data as FlagFormValues

export function useFlagForm() {
  return useForm({
    defaultValues,
    validators: {
      // One schema validates the whole tree and TanStack maps each issue path to its field.
      // It is wrapped in a function because the form devtools JSON-serialize validator options,
      // and a recursive zod schema is a circular object.
      onChange: ({ value }) =>
        standardSchemaValidators.validate(
          { value, validationSource: 'form' },
          flagFormSchema,
        ),
    },
  })
}

export type FlagForm = ReturnType<typeof useFlagForm>
