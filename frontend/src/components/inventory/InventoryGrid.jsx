import { useEffect, useRef } from 'react'
import { useItemTooltip } from '../../hooks/useItemTooltip'
import { ItemTooltip } from '../ItemTooltip'
import './InventoryGrid.css'

export function InventoryGrid({
  items,
  selectedSlotIndex,
  cursorSlotIndex,
  heldSlotIndex,
  draggedSlotIndex,
  filteredOutIndexes,
  slotRefs,
  onSelectSlot,
  onOpenDetails,
  onDoubleClickSlot,
  onDragStartWithSplit,
  onDragEnd,
  onDropGrid,
  onContextMenu,
  onWheel,
}) {
  const gridRef = useRef(null)
  const { itemTooltip, showTooltip, moveTooltip, hideTooltip } = useItemTooltip()

  useEffect(() => {
    const grid = gridRef.current
    if (!grid || !onWheel) return undefined
    grid.addEventListener('wheel', onWheel, { passive: false })
    return () => grid.removeEventListener('wheel', onWheel)
  }, [onWheel])

  return (
    <div className="inventory-grid" ref={gridRef} aria-label="Objetos del inventario">
      {items.map((item, slotIndex) => item ? (
        <button
          className={`inventory-slot ${slotIndex === selectedSlotIndex ? 'is-selected' : ''} ${slotIndex === cursorSlotIndex ? 'is-cursor' : ''} ${slotIndex === heldSlotIndex ? 'is-held' : ''} ${slotIndex === draggedSlotIndex ? 'is-dragging' : ''} ${filteredOutIndexes?.has(slotIndex) ? 'is-filtered-out' : ''}`}
          key={`${item.id}-${slotIndex}`}
          ref={(element) => { slotRefs.current[slotIndex] = element }}
          onClick={() => {
            if (slotIndex === selectedSlotIndex) {
              onOpenDetails()
              return
            }
            onSelectSlot(slotIndex)
          }}
          onDoubleClick={() => onDoubleClickSlot(slotIndex)}
          onMouseEnter={(event) => showTooltip(event, item)}
          onMouseMove={moveTooltip}
          onMouseLeave={hideTooltip}
          onContextMenu={(event) => {
            event.preventDefault()
            onContextMenu(slotIndex, event.clientX, event.clientY, window.innerWidth, window.innerHeight)
          }}
          draggable
          onDragStart={(event) => {
            const split = event.shiftKey || event.ctrlKey || event.metaKey
            event.dataTransfer.setData('text/plain', String(slotIndex))
            event.dataTransfer.effectAllowed = 'move'
            onDragStartWithSplit(slotIndex, split)
          }}
          onDragEnd={onDragEnd}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            const data = event.dataTransfer.getData('text/plain')
            onDropGrid(data, slotIndex)
          }}
          aria-label={`${item.name}, cantidad ${item.quantity}`}
        >
          <span className="inventory-icon" aria-hidden="true">{item.icon}</span>
          <span className="inventory-quantity">{item.quantity}</span>
          <span className="inventory-slot-name">{item.name}</span>
        </button>
      ) : (
        <button
          className={`inventory-slot inventory-slot-empty ${slotIndex === selectedSlotIndex ? 'is-selected' : ''} ${slotIndex === cursorSlotIndex ? 'is-cursor' : ''}`}
          key={`empty-${slotIndex}`}
          ref={(element) => { slotRefs.current[slotIndex] = element }}
          onClick={() => onSelectSlot(slotIndex)}
          onDoubleClick={() => onDoubleClickSlot(slotIndex)}
          onMouseLeave={hideTooltip}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            const data = event.dataTransfer.getData('text/plain')
            onDropGrid(data, slotIndex)
          }}
          aria-label={`Espacio vacío ${slotIndex + 1}`}
        />
      ))}
      <ItemTooltip item={itemTooltip?.item} x={itemTooltip?.x} y={itemTooltip?.y} />
    </div>
  )
}