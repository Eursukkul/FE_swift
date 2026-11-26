import { GripVertical } from 'lucide-react'
import type { ComponentProps } from 'react'

import { Button } from '#/components/ui/button'

export function DragHandle(props: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title="Drag to reorder, or press ↑ / ↓"
      className="cursor-grab text-muted-foreground active:cursor-grabbing"
      {...props}
    >
      <GripVertical />
    </Button>
  )
}
