import { useForm } from '@tanstack/react-form'

import { DEFAULT_FLAG } from './model/defaults'
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

export function useFlagForm() {
  return useForm({ defaultValues })
}

export type FlagForm = ReturnType<typeof useFlagForm>
