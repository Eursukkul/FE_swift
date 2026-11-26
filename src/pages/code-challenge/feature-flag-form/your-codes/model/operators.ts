// Operators of the nikunjy/rules query language that GoFeatureFlag evaluates.
export const OPERATORS = {
  '==': { label: 'Equals to', takesValue: true },
  '!=': { label: 'Not equals to', takesValue: true },
  '<': { label: 'Less than', takesValue: true },
  '>': { label: 'Greater than', takesValue: true },
  '<=': { label: 'Less than or equal to', takesValue: true },
  '>=': { label: 'Greater than or equal to', takesValue: true },
  co: { label: 'Contains', takesValue: true },
  sw: { label: 'Starts with', takesValue: true },
  ew: { label: 'Ends with', takesValue: true },
  in: { label: 'In a list', takesValue: true },
  pr: { label: 'Is present', takesValue: false },
} as const

export type Operator = keyof typeof OPERATORS

/** Evaluation-context attributes offered as suggestions; any attribute name is allowed. */
export const COMMON_ATTRIBUTES = [
  'key',
  'group',
  'role',
  'email',
  'country',
  'plan',
  'env',
]

export const OPERATOR_KEYS = Object.keys(OPERATORS) as [
  Operator,
  ...Array<Operator>,
]
