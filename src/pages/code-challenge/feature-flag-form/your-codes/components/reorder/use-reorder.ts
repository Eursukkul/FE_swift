import { useId, useRef, useState } from 'react'
import type { DragEvent, KeyboardEvent } from 'react'

type UseReorderOptions = {
  /** Read on demand: the list length lives in form state, not in this component's props. */
  count: () => number
  onMove: (from: number, to: number) => void
}

/**
 * Native HTML5 drag & drop plus ↑/↓ on the handle for one list.
 * Each list tracks its own drag, so dragging inside a nested list never reorders an outer one.
 */
export function useReorder({ count, onMove }: UseReorderOptions) {
  const listId = useId()
  const dragFrom = useRef<number | null>(null)
  const [armed, setArmed] = useState<number | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)

  const reset = () => {
    dragFrom.current = null
    setArmed(null)
    setDragging(null)
    setOver(null)
  }

  const handleSelector = (index: number) =>
    `[data-reorder-handle="${listId}-${index}"]`

  return {
    itemProps: (index: number) => ({
      // Only the handle arms dragging, so text in inputs can still be selected.
      draggable: armed === index,
      'data-dragging': dragging === index || undefined,
      'data-drop-target': (over === index && dragging !== index) || undefined,
      onDragStart: (e: DragEvent) => {
        e.stopPropagation()
        dragFrom.current = index
        setDragging(index)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', String(index))
      },
      onDragOver: (e: DragEvent) => {
        if (dragFrom.current === null) return
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = 'move'
        setOver(index)
      },
      onDrop: (e: DragEvent) => {
        if (dragFrom.current === null) return
        e.preventDefault()
        e.stopPropagation()
        if (dragFrom.current !== index) onMove(dragFrom.current, index)
        reset()
      },
      onDragEnd: reset,
    }),

    handleProps: (index: number, label: string) => ({
      'aria-label': `Move ${label}`,
      'aria-keyshortcuts': 'ArrowUp ArrowDown',
      'data-reorder-handle': `${listId}-${index}`,
      onPointerDown: () => setArmed(index),
      onPointerUp: () => setArmed(null),
      onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
        const to =
          e.key === 'ArrowUp'
            ? index - 1
            : e.key === 'ArrowDown'
              ? index + 1
              : -1
        if (to < 0 || to >= count()) return
        e.preventDefault()
        onMove(index, to)
        // The DOM keeps its order (index keys), so focus follows the item to its new slot.
        requestAnimationFrame(() =>
          document.querySelector<HTMLElement>(handleSelector(to))?.focus(),
        )
      },
    }),
  }
}

export type Reorder = ReturnType<typeof useReorder>
export type HandleProps = ReturnType<Reorder['handleProps']>
