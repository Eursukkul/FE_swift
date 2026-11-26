import { z } from 'zod'

import { OPERATORS, OPERATOR_KEYS } from './operators'

export const FLAG_TYPES = ['boolean', 'string', 'number', 'json'] as const
export type FlagType = (typeof FLAG_TYPES)[number]

export const COMBINATORS = ['and', 'or'] as const

export const conditionSchema = z
  .object({
    id: z.string(),
    type: z.literal('condition'),
    attribute: z
      .string()
      .trim()
      .min(1, 'Attribute is required')
      .regex(/^[A-Za-z_][\w.]*$/, 'Use letters, numbers, "_" or "."'),
    operator: z.enum(OPERATOR_KEYS),
    value: z.string(),
  })
  .superRefine((condition, ctx) => {
    if (OPERATORS[condition.operator].takesValue && !condition.value.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['value'],
        message: 'Value is required',
      })
    }
  })

export type Condition = z.infer<typeof conditionSchema>

export type Group = {
  id: string
  type: 'group'
  combinator: (typeof COMBINATORS)[number]
  children: Array<Condition | Group>
}

export const groupSchema: z.ZodType<Group, Group> = z.object({
  id: z.string(),
  type: z.literal('group'),
  combinator: z.enum(COMBINATORS),
  get children() {
    return z
      .array(z.union([conditionSchema, groupSchema]))
      .min(1, 'Add a condition or remove this group')
  },
})

export const variationSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .regex(/^[\w-]+$/, 'Use letters, numbers, "-" or "_"'),
  // Raw text from the input; parsed according to the flag type.
  value: z.string(),
})

export type Variation = z.infer<typeof variationSchema>

export const ruleSchema = z.object({
  id: z.string(),
  conditions: groupSchema,
  variationId: z.string().min(1, 'Select a variation'),
  percentage: z
    .number({ error: 'Percentage is required' })
    .int('Use a whole number')
    .min(0, 'Must be between 0 and 100')
    .max(100, 'Must be between 0 and 100'),
})

export type Rule = z.infer<typeof ruleSchema>

export function variationValueError(type: FlagType, raw: string) {
  switch (type) {
    case 'boolean':
      return raw === 'true' || raw === 'false' ? null : 'Must be true or false'
    case 'number':
      return raw.trim() !== '' && Number.isFinite(Number(raw))
        ? null
        : 'Must be a number'
    case 'json':
      try {
        JSON.parse(raw)
        return null
      } catch {
        return 'Must be valid JSON'
      }
    case 'string':
      return null
  }
}

export const flagFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Flag name is required')
      .regex(
        /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/,
        'Use lowercase kebab-case, e.g. my-new-feature',
      ),
    description: z.string().max(280, 'Keep it under 280 characters'),
    enabled: z.boolean(),
    type: z.enum(FLAG_TYPES),
    variations: z.array(variationSchema).min(2, 'Add at least 2 variations'),
    targeting: z.array(ruleSchema),
    defaultVariationId: z.string().min(1, 'Select a default variation'),
  })
  .superRefine((flag, ctx) => {
    const seen = new Set<string>()
    flag.variations.forEach((variation, index) => {
      const name = variation.name.trim()
      if (name && seen.has(name)) {
        ctx.addIssue({
          code: 'custom',
          path: ['variations', index, 'name'],
          message: `"${name}" is already used`,
        })
      }
      seen.add(name)

      const valueError = variationValueError(flag.type, variation.value)
      if (valueError) {
        ctx.addIssue({
          code: 'custom',
          path: ['variations', index, 'value'],
          message: valueError,
        })
      }
    })

    const variationIds = new Set(flag.variations.map((v) => v.id))
    const removed = 'Selected variation was removed — pick another one'
    flag.targeting.forEach((rule, index) => {
      if (rule.variationId && !variationIds.has(rule.variationId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['targeting', index, 'variationId'],
          message: removed,
        })
      }
    })
    if (flag.defaultVariationId && !variationIds.has(flag.defaultVariationId)) {
      ctx.addIssue({
        code: 'custom',
        path: ['defaultVariationId'],
        message: removed,
      })
    }
  })

export type FlagFormValues = z.infer<typeof flagFormSchema>
