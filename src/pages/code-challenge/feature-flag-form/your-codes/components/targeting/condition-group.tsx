import { ListTree, Plus, Trash2 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'

import { newCondition, newGroup } from '../../model/defaults'
import { COMBINATORS } from '../../model/schema'
import type { Group } from '../../model/schema'
import type { FlagForm } from '../../use-flag-form'
import { FieldError } from '../form-field'
import { DragHandle } from '../reorder/drag-handle'
import { DRAG_STATES } from '../reorder/drag-states'
import { useReorder } from '../reorder/use-reorder'
import type { HandleProps } from '../reorder/use-reorder'
import { ConditionRow } from './condition-row'
import { asGroupPath, childPath } from './paths'
import type { GroupPath } from './paths'

type ConditionGroupProps = {
  form: FlagForm
  path: GroupPath
  depth: number
  /** Nested groups only: their position in the parent group. */
  handle?: HandleProps
  onRemove?: () => void
}

/** Renders a group and, recursively, every group nested inside it. */
export function ConditionGroup({
  form,
  path,
  depth,
  handle,
  onRemove,
}: ConditionGroupProps) {
  const reorder = useReorder({
    count: () => form.getFieldValue(`${path}.children`).length,
    onMove: (from, to) => form.moveFieldValues(`${path}.children`, from, to),
  })

  return (
    <div
      role="group"
      aria-label={depth === 0 ? 'Conditions' : 'Nested group'}
      className={cn(
        'grid gap-3 rounded-lg border border-border p-3',
        depth > 0 && 'border-dashed bg-muted/40',
      )}
    >
      {/* mode="array" re-renders this group only when a child is added or removed. */}
      <form.Field name={`${path}.children`} mode="array">
        {(children) => (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {handle && <DragHandle {...handle} />}
              <form.Field name={`${path}.combinator`}>
                {(field) => (
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as Group['combinator'])
                    }
                  >
                    <SelectTrigger
                      size="sm"
                      aria-label="Combinator"
                      className="w-20"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMBINATORS.map((combinator) => (
                        <SelectItem key={combinator} value={combinator}>
                          {combinator.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
              <span className="text-xs text-muted-foreground">
                {depth === 0 ? 'Match users where' : 'Nested group'}
              </span>
              <div className="ml-auto flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => children.pushValue(newCondition())}
                >
                  <Plus /> Condition
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => children.pushValue(newGroup())}
                >
                  <ListTree /> Group
                </Button>
                {onRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove group"
                    onClick={onRemove}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>

            {/* Index keys keep each mounted field bound to one path; an id key would move a field to a new
                path and it would read the removed item for a render (TanStack's documented array pattern).
                A move re-validates, which re-renders this list, so a slot switches between condition and
                group after reordering (covered by reorder.test.tsx). */}
            {children.state.value.map((child, index) => {
              const node = childPath(path, index)
              const remove = () => children.removeValue(index)
              const isGroup = child.type === 'group'
              const handle = reorder.handleProps(
                index,
                `${isGroup ? 'group' : 'condition'} ${index + 1}`,
              )
              return (
                <div
                  key={index}
                  {...reorder.itemProps(index)}
                  className={cn('rounded-lg', DRAG_STATES)}
                >
                  {isGroup ? (
                    <ConditionGroup
                      form={form}
                      path={asGroupPath(node)}
                      depth={depth + 1}
                      handle={handle}
                      onRemove={remove}
                    />
                  ) : (
                    <ConditionRow
                      form={form}
                      path={node}
                      handle={handle}
                      onRemove={remove}
                    />
                  )}
                </div>
              )
            })}

            <FieldError
              fieldName={children.name}
              errors={children.state.meta.errors}
            />
          </>
        )}
      </form.Field>
    </div>
  )
}
