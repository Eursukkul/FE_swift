export type GroupPath = `targeting[${number}].conditions`
export type NodePath = `${GroupPath}.children[${number}]`

export const childPath = (group: GroupPath, index: number): NodePath =>
  `${group}.children[${index}]`

/** A nested group has the root group's shape, so it is addressed through the root path type (see FlagFormData). */
export const asGroupPath = (node: NodePath) => node as unknown as GroupPath

export const ATTRIBUTE_LIST_ID = 'targeting-attribute-suggestions'
