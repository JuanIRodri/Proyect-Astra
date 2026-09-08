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
  onDragStart,
  onDragEnd,
  onDrop,
  onDropEquipped,
  onContextMenu,
}) {
  return (
    <div className="inventory-grid" aria-label="Objetos del inventario">
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
          onContextMenu={(event) => {
            event.preventDefault()
            onContextMenu(slotIndex, event.clientX, event.clientY, window.innerWidth, window.innerHeight)
          }}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData('text/plain', String(slotIndex))
            event.dataTransfer.effectAllowed = 'move'
            onDragStart(slotIndex)
          }}
          onDragEnd={onDragEnd}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            const data = event.dataTransfer.getData('text/plain')
            if (data.startsWith('equip-')) {
              onDropEquipped(data.slice(5), slotIndex)
              return
            }
            onDrop(Number(data), slotIndex)
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
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            const data = event.dataTransfer.getData('text/plain')
            if (data.startsWith('equip-')) {
              onDropEquipped(data.slice(5), slotIndex)
              return
            }
            onDrop(Number(data), slotIndex)
          }}
          aria-label={`Espacio vacío ${slotIndex + 1}`}
        />
      ))}
    </div>
  )
}