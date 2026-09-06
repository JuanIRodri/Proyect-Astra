import { useCallback, useEffect, useState } from 'react'
import './InventoryPanel.css'

const GRID_COLUMNS = 4
const SLOT_COUNT = 12

const INVENTORY_ITEMS = [
  {
    id: 'astra-potion',
    itemKey: 'astra-potion',
    name: 'Poción de Astra',
    description: 'Un líquido azul que recupera parte de la vida de un aventurero.',
    category: 'Consumible',
    quantity: 3,
    icon: '🧪',
    rarity: 'Comun',
  },
  {
    id: 'ember-shard',
    itemKey: 'ember-shard',
    name: 'Fragmento de brasa',
    description: 'Una chispa mineral que todavía conserva calor en su interior.',
    category: 'Material',
    quantity: 8,
    icon: '◆',
    rarity: 'Raro',
  },
  {
    id: 'field-ration',
    itemKey: 'field-ration',
    name: 'Racion de viaje',
    description: 'Comida seca preparada para largas jornadas fuera del refugio.',
    category: 'Suministro',
    quantity: 5,
    icon: '◈',
    rarity: 'Comun',
  },
  {
    id: 'old-compass',
    itemKey: 'old-compass',
    name: 'Brújula antigua',
    description: 'La aguja apunta hacia el norte incluso bajo las ruinas de Astra.',
    category: 'Objeto clave',
    quantity: 1,
    icon: '✦',
    rarity: 'Epico',
  },
]

export function InventoryPanel({ onClose }) {
  const [items, setItems] = useState([
    ...INVENTORY_ITEMS,
    ...Array(SLOT_COUNT - INVENTORY_ITEMS.length).fill(null),
  ])
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0)
  const [cursorSlotIndex, setCursorSlotIndex] = useState(0)
  const [heldSlotIndex, setHeldSlotIndex] = useState(null)
  const [draggedSlotIndex, setDraggedSlotIndex] = useState(null)
  const [notice, setNotice] = useState('Usa WASD y confirma un espacio con Enter.')
  const selectedItem = items[selectedSlotIndex] || null

  const handleDropSelected = useCallback(() => {
    if (!selectedItem) {
      setNotice('Selecciona un objeto antes de soltarlo.')
      return
    }

    setItems((currentItems) => currentItems.map((item, itemIndex) => (
      itemIndex === selectedSlotIndex ? null : item
    )))
    setSelectedSlotIndex((currentIndex) => Math.max(0, currentIndex - 1))
    setCursorSlotIndex((currentIndex) => Math.max(0, currentIndex - 1))
    setHeldSlotIndex(null)
    setNotice(`${selectedItem.name}: objeto soltado.`)
  }, [selectedItem, selectedSlotIndex])

  const handleSplit = useCallback(() => {
    if (!selectedItem) {
      setNotice('Selecciona una pila antes de dividirla.')
      return
    }
    if (selectedItem.quantity < 2) {
      setNotice('Necesitas al menos dos unidades para dividir una pila.')
      return
    }

    const emptySlotIndex = items.findIndex((item) => !item)
    if (emptySlotIndex === -1) {
      setNotice('No hay espacios libres para dividir esta pila.')
      return
    }

    const firstQuantity = Math.ceil(selectedItem.quantity / 2)
    const secondQuantity = Math.floor(selectedItem.quantity / 2)
    setItems((currentItems) => currentItems.map((item, itemIndex) => {
      if (itemIndex === selectedSlotIndex) {
        return { ...item, quantity: firstQuantity }
      }
      if (itemIndex === emptySlotIndex) {
        return {
          ...selectedItem,
          id: `${selectedItem.id}-split-${Date.now()}`,
          quantity: secondQuantity,
        }
      }
      return item
    }))
    setNotice(`${selectedItem.name}: pila dividida en ${firstQuantity} y ${secondQuantity}.`)
  }, [items, selectedItem, selectedSlotIndex])

  const handleMoveItem = useCallback((sourceSlotIndex, targetSlotIndex) => {
    if (sourceSlotIndex === targetSlotIndex) return

    const sourceItem = items[sourceSlotIndex]
    const targetItem = items[targetSlotIndex]
    if (!sourceItem) return

    if (targetItem && targetItem.itemKey === sourceItem.itemKey) {
      setItems((currentItems) => currentItems.map((item, itemIndex) => {
        if (itemIndex === sourceSlotIndex) return null
        if (itemIndex === targetSlotIndex) {
          return { ...item, quantity: item.quantity + sourceItem.quantity }
        }
        return item
      }))
      setNotice(`${sourceItem.name}: pilas acumuladas.`)
    } else {
      setItems((currentItems) => currentItems.map((item, itemIndex) => {
        if (itemIndex === sourceSlotIndex) return targetItem
        if (itemIndex === targetSlotIndex) return sourceItem
        return item
      }))
      setNotice(targetItem ? 'Objetos intercambiados.' : `${sourceItem.name}: objeto movido.`)
    }
    setSelectedSlotIndex(targetSlotIndex)
    setCursorSlotIndex(targetSlotIndex)
  }, [items])

  const moveSelection = useCallback((rowDelta, columnDelta) => {
    setCursorSlotIndex((currentIndex) => {
      const currentRow = Math.floor(currentIndex / GRID_COLUMNS)
      const currentColumn = currentIndex % GRID_COLUMNS
      const nextRow = Math.max(0, Math.min((SLOT_COUNT / GRID_COLUMNS) - 1, currentRow + rowDelta))
      const nextColumn = Math.max(0, Math.min(GRID_COLUMNS - 1, currentColumn + columnDelta))
      return nextRow * GRID_COLUMNS + nextColumn
    })
  }, [])

  const handleKeyDown = useCallback((event) => {
    const key = event.key.toLowerCase()
    const movements = {
      w: [-1, 0],
      arrowup: [-1, 0],
      a: [0, -1],
      arrowleft: [0, -1],
      s: [1, 0],
      arrowdown: [1, 0],
      d: [0, 1],
      arrowright: [0, 1],
    }

    if (key === 'i' || key === 'escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
      return
    }

    if (key === 'q') {
      event.preventDefault()
      event.stopPropagation()
      handleDropSelected()
      return
    }

    if (key === 'r') {
      event.preventDefault()
      event.stopPropagation()
      handleSplit()
      return
    }

    if (key === 'enter' || key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      if (heldSlotIndex !== null) {
        if (heldSlotIndex === cursorSlotIndex) {
          setHeldSlotIndex(null)
          setNotice('Movimiento cancelado.')
          return
        }
        handleMoveItem(heldSlotIndex, cursorSlotIndex)
        setHeldSlotIndex(null)
        return
      }

      if (items[cursorSlotIndex]) {
        setSelectedSlotIndex(cursorSlotIndex)
        setHeldSlotIndex(cursorSlotIndex)
        setNotice(`${items[cursorSlotIndex].name}: objeto preparado para mover.`)
      } else {
        setSelectedSlotIndex(cursorSlotIndex)
        setNotice('Espacio vacío seleccionado.')
      }
      return
    }

    const movement = movements[key]
    if (!movement) return

    event.preventDefault()
    event.stopPropagation()
    moveSelection(movement[0], movement[1])
  }, [cursorSlotIndex, handleDropSelected, handleMoveItem, handleSplit, heldSlotIndex, items, moveSelection, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [handleKeyDown])

  return (
    <aside className="inventory-panel" aria-label="Inventario del grupo">
      <div className="inventory-heading">
        <div>
          <p className="inventory-kicker">EQUIPO DE EXPLORACIÓN</p>
          <h2>Inventario</h2>
        </div>
        <button className="inventory-close" onClick={onClose} aria-label="Cerrar inventario" title="Cerrar inventario">
          ×
        </button>
      </div>

      <div className="inventory-content">
        <div className="inventory-grid" aria-label="Objetos del inventario">
          {items.map((item, slotIndex) => item ? (
            <button
              className={`inventory-slot ${slotIndex === selectedSlotIndex ? 'is-selected' : ''} ${slotIndex === cursorSlotIndex ? 'is-cursor' : ''} ${slotIndex === heldSlotIndex ? 'is-held' : ''} ${slotIndex === draggedSlotIndex ? 'is-dragging' : ''}`}
              key={`${item.id}-${slotIndex}`}
              onClick={() => {
                setCursorSlotIndex(slotIndex)
                setSelectedSlotIndex(slotIndex)
                setHeldSlotIndex(null)
              }}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('text/plain', String(slotIndex))
                event.dataTransfer.effectAllowed = 'move'
                setDraggedSlotIndex(slotIndex)
                setHeldSlotIndex(null)
              }}
              onDragEnd={() => setDraggedSlotIndex(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                handleMoveItem(Number(event.dataTransfer.getData('text/plain')), slotIndex)
                setDraggedSlotIndex(null)
                setHeldSlotIndex(null)
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
              onClick={() => {
                setCursorSlotIndex(slotIndex)
                setSelectedSlotIndex(slotIndex)
                setHeldSlotIndex(null)
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                handleMoveItem(Number(event.dataTransfer.getData('text/plain')), slotIndex)
                setDraggedSlotIndex(null)
                setHeldSlotIndex(null)
              }}
              aria-label={`Espacio vacío ${slotIndex + 1}`}
            />
          ))}
        </div>

        {selectedItem && (
          <div className="inventory-detail">
            <div className="inventory-detail-icon" aria-hidden="true">{selectedItem.icon}</div>
            <div>
              <p className="inventory-detail-category">{selectedItem.category} / {selectedItem.rarity}</p>
              <h3>{selectedItem.name}</h3>
              <p>{selectedItem.description}</p>
            </div>
          </div>
        )}
        {!selectedItem && <p className="inventory-empty-detail">Este espacio está vacío.</p>}
      </div>

      <div className="inventory-actions">
        <button type="button" onClick={handleDropSelected} disabled={!selectedItem} title="Soltar el objeto seleccionado (Q)">
          <span className="inventory-shortcut" aria-hidden="true">Q</span> Soltar
        </button>
        <button type="button" onClick={handleSplit} disabled={!selectedItem || selectedItem.quantity < 2} title="Dividir la pila seleccionada">
          <span className="inventory-shortcut" aria-hidden="true">R</span> Dividir
        </button>
      </div>

      <footer className="inventory-footer">
        <span className="inventory-footer-notice">{items.filter(Boolean).length} objetos registrados · {notice}</span>
        <span className="inventory-key">I</span>
      </footer>
    </aside>
  )
}
