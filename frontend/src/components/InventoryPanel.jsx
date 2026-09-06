import { useCallback, useEffect, useState } from 'react'
import './InventoryPanel.css'

const GRID_COLUMNS = 4
const SLOT_COUNT = 12
const MAX_WEIGHT = 20

const INVENTORY_ITEMS = [
  {
    id: 'astra-potion',
    itemKey: 'astra-potion',
    name: 'Poción de Astra',
    description: 'Un líquido azul que recupera parte de la vida de un aventurero.',
    category: 'Consumible',
    quantity: 3,
    weight: 0.4,
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
    weight: 0.15,
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
    weight: 0.5,
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
    weight: 2,
    icon: '✦',
    rarity: 'Epico',
  },
]

function createInventory() {
  return [
    ...INVENTORY_ITEMS.map((item) => ({ ...item })),
    ...Array(SLOT_COUNT - INVENTORY_ITEMS.length).fill(null),
  ]
}

function getClassThemeKey(clase) {
  return (clase || 'aventurero')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
}

function getNextSlotIndex(currentIndex, rowDelta, columnDelta) {
  const currentRow = Math.floor(currentIndex / GRID_COLUMNS)
  const currentColumn = currentIndex % GRID_COLUMNS
  const nextRow = Math.max(0, Math.min((SLOT_COUNT / GRID_COLUMNS) - 1, currentRow + rowDelta))
  const nextColumn = Math.max(0, Math.min(GRID_COLUMNS - 1, currentColumn + columnDelta))
  return nextRow * GRID_COLUMNS + nextColumn
}

export function InventoryPanel({ onClose, personajes }) {
  const characterList = personajes.slice(0, 3)
  const [activeCharacterIndex, setActiveCharacterIndex] = useState(0)
  const [inventories, setInventories] = useState(() => Object.fromEntries(
    characterList.map((character) => [character.idPersonaje, createInventory()]),
  ))
  const [goldByCharacter] = useState(() => Object.fromEntries(
    characterList.map((character) => [character.idPersonaje, 125]),
  ))
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0)
  const [cursorSlotIndex, setCursorSlotIndex] = useState(0)
  const [heldSlotIndex, setHeldSlotIndex] = useState(null)
  const [draggedSlotIndex, setDraggedSlotIndex] = useState(null)
  const [notice, setNotice] = useState('Usa WASD y confirma un espacio con Enter.')
  const activeCharacter = characterList[activeCharacterIndex]
  const activeCharacterId = activeCharacter?.idPersonaje
  const classThemeKey = getClassThemeKey(activeCharacter?.clase)
  const items = inventories[activeCharacterId] || createInventory()
  const selectedItem = items[selectedSlotIndex] || null
  const goldAmount = goldByCharacter[activeCharacterId] || 0
  const currentWeight = items.reduce((totalWeight, item) => (
    item ? totalWeight + (item.weight * item.quantity) : totalWeight
  ), 0)
  const weightPercent = Math.min(100, (currentWeight / MAX_WEIGHT) * 100)
  const weightState = currentWeight >= MAX_WEIGHT * 0.8
    ? 'is-overloaded'
    : currentWeight >= MAX_WEIGHT * 0.5
      ? 'is-warning'
      : ''

  const handleDropSelected = useCallback(() => {
    if (!selectedItem) {
      setNotice('Selecciona un objeto antes de soltarlo.')
      return
    }

    setInventories((currentInventories) => ({
      ...currentInventories,
      [activeCharacterId]: (currentInventories[activeCharacterId] || createInventory()).map((item, itemIndex) => (
      itemIndex === selectedSlotIndex ? null : item
      )),
    }))
    setSelectedSlotIndex((currentIndex) => Math.max(0, currentIndex - 1))
    setCursorSlotIndex((currentIndex) => Math.max(0, currentIndex - 1))
    setHeldSlotIndex(null)
    setNotice(`${selectedItem.name}: objeto soltado.`)
  }, [activeCharacterId, selectedItem, selectedSlotIndex])

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
    setInventories((currentInventories) => ({
      ...currentInventories,
      [activeCharacterId]: (currentInventories[activeCharacterId] || createInventory()).map((item, itemIndex) => {
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
      }),
    }))
    setNotice(`${selectedItem.name}: pila dividida en ${firstQuantity} y ${secondQuantity}.`)
  }, [activeCharacterId, items, selectedItem, selectedSlotIndex])

  const handleMoveItem = useCallback((sourceSlotIndex, targetSlotIndex) => {
    if (sourceSlotIndex === targetSlotIndex) return

    const sourceItem = items[sourceSlotIndex]
    const targetItem = items[targetSlotIndex]
    if (!sourceItem) return

    if (targetItem && targetItem.itemKey === sourceItem.itemKey) {
      setInventories((currentInventories) => ({
        ...currentInventories,
        [activeCharacterId]: (currentInventories[activeCharacterId] || createInventory()).map((item, itemIndex) => {
        if (itemIndex === sourceSlotIndex) return null
        if (itemIndex === targetSlotIndex) {
          return { ...item, quantity: item.quantity + sourceItem.quantity }
        }
        return item
        }),
      }))
      setNotice(`${sourceItem.name}: pilas acumuladas.`)
    } else {
      setInventories((currentInventories) => ({
        ...currentInventories,
        [activeCharacterId]: (currentInventories[activeCharacterId] || createInventory()).map((item, itemIndex) => {
        if (itemIndex === sourceSlotIndex) return targetItem
        if (itemIndex === targetSlotIndex) return sourceItem
        return item
        }),
      }))
      setNotice(targetItem ? 'Objetos intercambiados.' : `${sourceItem.name}: objeto movido.`)
    }
    setSelectedSlotIndex(targetSlotIndex)
    setCursorSlotIndex(targetSlotIndex)
  }, [activeCharacterId, items])

  const moveSelection = useCallback((rowDelta, columnDelta) => {
    const nextIndex = getNextSlotIndex(cursorSlotIndex, rowDelta, columnDelta)
    setCursorSlotIndex(nextIndex)
    setSelectedSlotIndex(nextIndex)
  }, [cursorSlotIndex])

  const handleCharacterChange = (characterIndex) => {
    setActiveCharacterIndex(characterIndex)
    setSelectedSlotIndex(0)
    setCursorSlotIndex(0)
    setHeldSlotIndex(null)
    setNotice('Usa WASD y confirma un espacio con Enter.')
  }

  const handleKeyDown = useCallback((event) => {
    const key = event.key.toLowerCase()
    const code = event.code.toLowerCase()
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

    const characterIndexByKey = {
      '1': 0,
      '2': 1,
      '3': 2,
      digit1: 0,
      digit2: 1,
      digit3: 2,
    }
    const characterIndex = characterIndexByKey[key] ?? characterIndexByKey[code]
    if (characterIndex !== undefined && characterIndex < characterList.length) {
      event.preventDefault()
      event.stopPropagation()
      handleCharacterChange(characterIndex)
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
    <aside className={`inventory-panel inventory-class-${classThemeKey}`} aria-label={`Inventario de ${activeCharacter?.nombre || 'personaje'}`}>
      <div className="inventory-heading">
        <div>
          <p className="inventory-kicker">EQUIPO DE EXPLORACIÓN · {activeCharacter?.clase || 'Aventurero'}</p>
          <h2>Inventario</h2>
        </div>
        <button className="inventory-close" onClick={onClose} aria-label="Cerrar inventario" title="Cerrar inventario">
          ×
        </button>
      </div>

      <div className="inventory-character-tabs" role="tablist" aria-label="Inventario por personaje">
        {characterList.map((character, characterIndex) => (
          <button
            className={`inventory-character-tab ${characterIndex === activeCharacterIndex ? 'is-active' : ''}`}
            key={character.idPersonaje}
            onClick={() => handleCharacterChange(characterIndex)}
            role="tab"
            aria-selected={characterIndex === activeCharacterIndex}
          >
            <span className="inventory-character-index">{characterIndex + 1}</span>
            <span>{character.nombre || `Héroe #${character.idPersonaje}`}</span>
          </button>
        ))}
      </div>

      <div className="inventory-summary">
        <div className="inventory-gold">
          <span className="inventory-summary-icon" aria-hidden="true">◈</span>
          <div>
            <strong>{goldAmount}</strong>
            <span>Oro</span>
          </div>
        </div>
        <div className={`inventory-weight ${weightState}`}>
          <div className="inventory-weight-label">
            <span>Peso</span>
            <strong>{currentWeight.toFixed(1)} / {MAX_WEIGHT}</strong>
          </div>
          <div className="inventory-weight-meter" role="progressbar" aria-label="Peso del inventario" aria-valuemin="0" aria-valuemax={MAX_WEIGHT} aria-valuenow={Number(currentWeight.toFixed(1))}>
            <span style={{ width: `${weightPercent}%` }} />
          </div>
        </div>
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
              <p className="inventory-item-weight">Peso por unidad: {selectedItem.weight.toFixed(1)}</p>
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
        <span className="inventory-footer-notice">{activeCharacter?.nombre || 'Personaje'} · {items.filter(Boolean).length} objetos · {notice}</span>
        <span className="inventory-key">I</span>
      </footer>
    </aside>
  )
}
