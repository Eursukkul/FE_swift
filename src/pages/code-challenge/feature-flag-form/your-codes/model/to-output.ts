import { buildQuery } from './build-query'
import type { FlagFormValues, FlagType } from './schema'

export type FlagOutput = {
  flags: Record<
    string,
    {
      variations: Record<string, unknown>
      targeting?: Array<{
        query: string
        percentage: number
        variation: string
      }>
      defaultRule: { variation: string }
      disable?: true
      metadata?: { description: string }
    }
  >
}

// Values that do not parse yet are emitted as raw text so the preview keeps updating while typing.
function parseValue(type: FlagType, raw: string): unknown {
  switch (type) {
    case 'boolean':
      return raw === 'true' ? true : raw === 'false' ? false : raw
    case 'number':
      return raw.trim() !== '' && Number.isFinite(Number(raw))
        ? Number(raw)
        : raw
    case 'json':
      try {
        return JSON.parse(raw)
      } catch {
        return raw
      }
    case 'string':
      return raw
  }
}

export function toOutput(values: FlagFormValues): FlagOutput {
  const nameById = new Map(values.variations.map((v) => [v.id, v.name.trim()]))
  const variationName = (id: string) => nameById.get(id) ?? ''

  const description = values.description.trim()

  return {
    flags: {
      [values.name.trim()]: {
        variations: Object.fromEntries(
          values.variations.map((v) => [
            v.name.trim(),
            parseValue(values.type, v.value),
          ]),
        ),
        ...(values.targeting.length > 0 && {
          targeting: values.targeting.map((rule) => ({
            query: buildQuery(rule.conditions),
            percentage: rule.percentage,
            variation: variationName(rule.variationId),
          })),
        }),
        defaultRule: { variation: variationName(values.defaultVariationId) },
        ...(!values.enabled && { disable: true as const }),
        ...(description && { metadata: { description } }),
      },
    },
  }
}
