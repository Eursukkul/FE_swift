const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  description: 'Description',
  type: 'Flag type',
  value: 'Value',
  attribute: 'Attribute',
  operator: 'Operator',
  variationId: 'Serve',
  percentage: 'Rollout',
  defaultVariationId: 'Default variation',
}

/** Turns a schema issue path into the words a user sees on screen, e.g. "Rule 1 › Group 2 › Value". */
export function describePath(path: ReadonlyArray<PropertyKey>) {
  const parts: Array<string> = []

  for (let i = 0; i < path.length; i++) {
    const key = path[i]
    const index = path[i + 1]

    if (typeof index === 'number' && key === 'targeting') {
      parts.push(`Rule ${index + 1}`)
      i++
    } else if (typeof index === 'number' && key === 'variations') {
      parts.push(`Variation ${index + 1}`)
      i++
    } else if (typeof index === 'number' && key === 'children') {
      // A child that has children of its own is a group.
      const kind = path[i + 2] === 'children' ? 'Group' : 'Condition'
      parts.push(`${kind} ${index + 1}`)
      i++
    } else if (key === 'name' && i === 0) {
      parts.push('Flag name')
    } else if (key !== 'conditions' && key !== 'children') {
      parts.push(FIELD_LABELS[String(key)] ?? String(key))
    }
  }

  return parts.join(' › ')
}
