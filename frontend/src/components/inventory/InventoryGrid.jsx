export function InventoryGrid({
  items,
  selectedSlotIndex,
  cursorSlotIndex,
  heldSlotIndex,
  draggedSlotIndex,
  slotRefs,
  onSelectSlot,
  onOpenDetails,
  onDragStart,
  onDragEnd,
  onDrop,
}) {
  return (
    <div className="inventory-grid" aria-label="Objetos del inventario">
      {items.map((item, slotIndex) => item ? (
        <button
          className={`inventory-slot ${slotIndex === selectedSlotIndex ? 'is-selected' : ''} ${slotIndex === cursorSlotIndex ? 'is-cursor' : ''} ${slotIndex === heldSlotIndex ? 'is-held' : ''} ${slotIndex === draggedSlotIndex ? 'is-dragging' : ''}`}
          key={`${item.id}-${slotIndex}`}
          ref={(element) => { slotRefs.current[slotIndex] = element }}
          onClick={() => {
            if (slotIndex === selectedSlotIndex) {
              onOpenDetails()
              return
            }
            onSelectSlot(slotIndex)
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
            onDrop(Number(event.dataTransfer.getData('text/plain')), slotIndex)
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
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            onDrop(Number(event.dataTransfer.getData('text/plain')), slotIndex)
          }}
          aria-label={`Espacio vacío ${slotIndex + 1}`}
        />
      ))}
    </div>
  )
}