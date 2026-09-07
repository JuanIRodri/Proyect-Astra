import { useCallback, useEffect, useRef, useState } from 'react'
import {
  desequiparObjeto,
  equiparObjeto,
  getEquipamiento,
  getInventario,
  saveInventario,
  useInventarioObjeto,
} from '../services/api'
import './InventoryPanel.css'

const GRID_COLUMNS = 6
const SLOT_COUNT = 48
const EQUIPMENT_SLOTS = [
  { key: 'pecho', label: 'Pecho', icon: '🛡' },
  { key: 'casco', label: 'Casco', icon: '⛑' },
  { key: 'pantalon', label: 'Pantalón', icon: '▣' },
  { key: 'botas', label: 'Botas', icon: '♟' },
  { key: 'arma', label: 'Arma', icon: '⚔' },
  { key: 'arma-secundaria', label: 'Arma secundaria', icon: '✦' },
]

function createInventory() {
  return Array(SLOT_COUNT).fill(null)
}

function normalizeInventory(rows) {
  const inventory = createInventory()
  rows.forEach((row) => {
    if (!row.itemKey || row.ranura < 0 || row.ranura >= SLOT_COUNT) return
    inventory[row.ranura] = normalizeItem(row)
  })
  return inventory
}

function normalizeItem(row) {
  return {
      ...row,
      id: `${row.itemKey}-${row.ranura}`,
      name: row.nombre,
      description: row.descripcion,
      category: row.categoria,
      rarity: row.rareza,
      icon: row.icono,
      quantity: Number(row.cantidad),
      weight: Number(row.peso),
      consumible: Boolean(row.consumible),
  }
}

function normalizeEquipment(rows) {
  return Object.fromEntries(rows.map((row) => [row.ranura, normalizeItem(row)]))
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

function getNextEquipmentIndex(currentIndex, rowDelta, columnDelta) {
  const columns = 2
  const currentRow = Math.floor(currentIndex / columns)
  const currentColumn = currentIndex % columns
  const nextRow = Math.max(0, Math.min(2, currentRow + rowDelta))
  const nextColumn = Math.max(0, Math.min(columns - 1, currentColumn + columnDelta))
  return (nextRow * columns) + nextColumn
}

export function InventoryPanel({ onClose, personajes, activeCharacterIndex, onActiveCharacterChange }) {
  const characterList = personajes.slice(0, 3)
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
  const [inventoryLoading, setInventoryLoading] = useState(false)
  const [equipmentByCharacter, setEquipmentByCharacter] = useState({})
  const [showItemDetails, setShowItemDetails] = useState(false)
  const [selectedEquipmentSlot, setSelectedEquipmentSlot] = useState(null)
  const [navigationArea, setNavigationArea] = useState('inventory')
  const [equipmentCursorIndex, setEquipmentCursorIndex] = useState(0)
  const slotRefs = useRef([])
  const [notice, setNotice] = useState('Usa WASD y selecciona objetos con Enter.')
  const activeCharacter = characterList[activeCharacterIndex]
  const activeCharacterId = activeCharacter?.idPersonaje
  const classThemeKey = getClassThemeKey(activeCharacter?.clase)
  const items = inventories[activeCharacterId] || createInventory()
  const equipment = equipmentByCharacter[activeCharacterId] || {}
  const selectedItem = items[selectedSlotIndex] || null
  const selectedEquipmentItem = selectedEquipmentSlot ? equipment[selectedEquipmentSlot] : null
  const detailItem = selectedEquipmentItem || selectedItem
  const goldAmount = goldByCharacter[activeCharacterId] || 0
  const equipKeyActive = Boolean(
    (selectedEquipmentSlot && selectedEquipmentItem) || selectedItem?.tipoEquipamiento || selectedItem?.consumible,
  )
  const equipmentBonuses = EQUIPMENT_SLOTS.reduce((bonuses, slot) => {
    const item = equipment[slot.key]
    if (!item) return bonuses
    return {
      fuerza: bonuses.fuerza + Number(item.bonusFuerza || 0),
      destreza: bonuses.destreza + Number(item.bonusDestreza || 0),
      inteligencia: bonuses.inteligencia + Number(item.bonusInteligencia || 0),
      constitucion: bonuses.constitucion + Number(item.bonusConstitucion || 0),
      agilidad: bonuses.agilidad + Number(item.bonusAgilidad || 0),
    }
  }, { fuerza: 0, destreza: 0, inteligencia: 0, constitucion: 0, agilidad: 0 })
  const maxWeight = 10 + (((Number(activeCharacter?.fuerza) || 10) + equipmentBonuses.fuerza) * 1.5)
  const equippedWeight = Object.values(equipment).reduce((totalWeight, item) => (
    item ? totalWeight + (item.weight || 0) : totalWeight
  ), 0)
  const currentWeight = items.reduce((totalWeight, item) => (
    item ? totalWeight + (item.weight * item.quantity) : totalWeight
  ), equippedWeight)
  const weightPercent = Math.min(100, (currentWeight / maxWeight) * 100)
  const weightState = currentWeight >= maxWeight * 0.8
    ? 'is-overloaded'
    : currentWeight >= maxWeight * 0.5
      ? 'is-warning'
      : ''

  useEffect(() => {
    if (!activeCharacterId) return undefined
    let cancelled = false
    setInventoryLoading(true)
    Promise.all([getInventario(activeCharacterId), getEquipamiento(activeCharacterId)])
      .then(([rows, equipmentRows]) => {
        if (cancelled) return
        setInventories((currentInventories) => ({
          ...currentInventories,
          [activeCharacterId]: normalizeInventory(rows),
        }))
        setEquipmentByCharacter((currentEquipment) => ({
          ...currentEquipment,
          [activeCharacterId]: normalizeEquipment(equipmentRows),
        }))
      })
      .catch(() => {
        if (!cancelled) setNotice('No se pudo cargar el inventario.')
      })
      .finally(() => {
        if (!cancelled) setInventoryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeCharacterId])

  const updateInventory = useCallback((nextItems, successNotice) => {
    setInventories((currentInventories) => ({
      ...currentInventories,
      [activeCharacterId]: nextItems,
    }))
    setNotice(successNotice)
    saveInventario(activeCharacterId, nextItems).catch(() => {
      setNotice('El cambio se aplicó visualmente, pero no se pudo guardar.')
    })
  }, [activeCharacterId])

  const handleDropSelected = useCallback(() => {
    if (!selectedItem) {
      setNotice('Selecciona un objeto antes de soltarlo.')
      return
    }

    const nextItems = items.map((item, itemIndex) => (itemIndex === selectedSlotIndex ? null : item))
    updateInventory(nextItems, `${selectedItem.name}: objeto soltado.`)
    setSelectedSlotIndex((currentIndex) => Math.max(0, currentIndex - 1))
    setCursorSlotIndex((currentIndex) => Math.max(0, currentIndex - 1))
    setHeldSlotIndex(null)
  }, [items, selectedItem, selectedSlotIndex, updateInventory])

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
    const nextItems = items.map((item, itemIndex) => {
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
    })
    updateInventory(nextItems, `${selectedItem.name}: pila dividida en ${firstQuantity} y ${secondQuantity}.`)
  }, [items, selectedItem, selectedSlotIndex, updateInventory])

  const handleMoveItem = useCallback((sourceSlotIndex, targetSlotIndex) => {
    if (sourceSlotIndex === targetSlotIndex) return

    const sourceItem = items[sourceSlotIndex]
    const targetItem = items[targetSlotIndex]
    if (!sourceItem) return

    if (targetItem && targetItem.itemKey === sourceItem.itemKey) {
      const nextItems = items.map((item, itemIndex) => {
        if (itemIndex === sourceSlotIndex) return null
        if (itemIndex === targetSlotIndex) {
          return { ...item, quantity: item.quantity + sourceItem.quantity }
        }
        return item
      })
      updateInventory(nextItems, `${sourceItem.name}: pilas acumuladas.`)
    } else {
      const nextItems = items.map((item, itemIndex) => {
        if (itemIndex === sourceSlotIndex) return targetItem
        if (itemIndex === targetSlotIndex) return sourceItem
        return item
      })
      updateInventory(nextItems, targetItem ? 'Objetos intercambiados.' : `${sourceItem.name}: objeto movido.`)
    }
    setSelectedSlotIndex(targetSlotIndex)
    setCursorSlotIndex(targetSlotIndex)
  }, [items, updateInventory])

  const handleUseSelected = useCallback(async () => {
    if (!selectedItem) {
      setNotice('Selecciona un objeto antes de usarlo.')
      return
    }
    if (!selectedItem.consumible) {
      setNotice('Este objeto no se puede consumir.')
      return
    }

    try {
      const result = await useInventarioObjeto(activeCharacterId, selectedSlotIndex)
      const nextItems = items.map((item, itemIndex) => {
        if (itemIndex !== selectedSlotIndex) return item
        if (result.quantity < 1) return null
        return { ...item, quantity: result.quantity }
      })
      setInventories((currentInventories) => ({
        ...currentInventories,
        [activeCharacterId]: nextItems,
      }))
      const effectNotice = result.effect?.vida ? ` Efecto: +${result.effect.vida} vida.` : ''
      setNotice(`${selectedItem.name} consumido.${effectNotice}`)
    } catch {
      setNotice('No se pudo consumir el objeto.')
    }
  }, [activeCharacterId, items, selectedItem, selectedSlotIndex])

  const handleEquipSelected = useCallback(async () => {
    if (!selectedItem?.tipoEquipamiento) {
      setNotice('Selecciona un objeto equipable.')
      return
    }

    try {
      await equiparObjeto(activeCharacterId, selectedSlotIndex)
      const nextItems = items.map((item, itemIndex) => (itemIndex === selectedSlotIndex ? null : item))
      setInventories((currentInventories) => ({
        ...currentInventories,
        [activeCharacterId]: nextItems,
      }))
      setEquipmentByCharacter((currentEquipment) => ({
        ...currentEquipment,
        [activeCharacterId]: {
          ...(currentEquipment[activeCharacterId] || {}),
          [selectedItem.tipoEquipamiento]: selectedItem,
        },
      }))
      setHeldSlotIndex(null)
      setNotice(`${selectedItem.name} equipado en ${selectedItem.tipoEquipamiento}.`)
    } catch (error) {
      setNotice(error.response?.data?.error || 'No se pudo equipar el objeto.')
    }
  }, [activeCharacterId, items, selectedItem, selectedSlotIndex])

  const handleUnequip = useCallback(async (equipmentSlot) => {
    try {
      await desequiparObjeto(activeCharacterId, equipmentSlot)
      const [rows, equipmentRows] = await Promise.all([
        getInventario(activeCharacterId),
        getEquipamiento(activeCharacterId),
      ])
      setInventories((currentInventories) => ({
        ...currentInventories,
        [activeCharacterId]: normalizeInventory(rows),
      }))
      setEquipmentByCharacter((currentEquipment) => ({
        ...currentEquipment,
        [activeCharacterId]: normalizeEquipment(equipmentRows),
      }))
      setSelectedEquipmentSlot(null)
      setNotice('Objeto desequipado y devuelto a la mochila.')
    } catch (error) {
      setNotice(error.response?.data?.error || 'No se pudo desequipar el objeto.')
    }
  }, [activeCharacterId])

  const handleToggleDetails = useCallback(() => {
    if (!detailItem) {
      setNotice('Selecciona un objeto para ver sus detalles.')
      return
    }
    setShowItemDetails((isVisible) => !isVisible)
  }, [detailItem])

  const handleToggleEquipment = useCallback(() => {
    if (navigationArea === 'equipment') {
      setNavigationArea('inventory')
      setSelectedEquipmentSlot(null)
      setSelectedSlotIndex(0)
      setCursorSlotIndex(0)
      setNotice('Navegación en la mochila.')
    } else {
      const equipmentSlot = EQUIPMENT_SLOTS[equipmentCursorIndex]
      setNavigationArea('equipment')
      setSelectedEquipmentSlot(equipmentSlot.key)
      setSelectedSlotIndex(-1)
      setShowItemDetails(false)
      setNotice('Navegación en el equipamiento.')
    }
  }, [equipmentCursorIndex, navigationArea])

  const moveSelection = useCallback((rowDelta, columnDelta) => {
    const nextIndex = getNextSlotIndex(cursorSlotIndex, rowDelta, columnDelta)
    setCursorSlotIndex(nextIndex)
    setSelectedSlotIndex(nextIndex)
    setShowItemDetails(false)
    setSelectedEquipmentSlot(null)
    setNavigationArea('inventory')
  }, [cursorSlotIndex])

  const handleCharacterChange = (characterIndex) => {
    onActiveCharacterChange(characterIndex)
    setSelectedSlotIndex(0)
    setCursorSlotIndex(0)
    setHeldSlotIndex(null)
    setShowItemDetails(false)
    setSelectedEquipmentSlot(null)
    setNavigationArea('inventory')
    setNotice('Usa WASD y selecciona objetos con Enter.')
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

    if (key === 'g') {
      event.preventDefault()
      event.stopPropagation()
      handleToggleEquipment()
      return
    }

    if (key === 'e') {
      event.preventDefault()
      event.stopPropagation()
      if (selectedEquipmentSlot && selectedEquipmentItem) {
        handleUnequip(selectedEquipmentSlot)
      } else if (selectedEquipmentSlot) {
        setNotice('Esta ranura de equipamiento está vacía.')
      } else if (selectedItem?.tipoEquipamiento) {
        handleEquipSelected()
      } else if (selectedItem?.consumible) {
        handleUseSelected()
      }
      return
    }

    if (key === 'v') {
      event.preventDefault()
      event.stopPropagation()
      handleToggleDetails()
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
      if (navigationArea === 'equipment') {
        if (selectedEquipmentItem) {
          setShowItemDetails(true)
        } else {
          setNotice('Esta ranura de equipamiento está vacía.')
        }
        return
      }
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
        setShowItemDetails(false)
        setNotice(`${items[cursorSlotIndex].name}: objeto preparado para mover.`)
      } else {
        setSelectedSlotIndex(cursorSlotIndex)
        setShowItemDetails(false)
        setNotice('Espacio vacío seleccionado.')
      }
      return
    }

    const movement = movements[key]
    if (!movement) return

    event.preventDefault()
    event.stopPropagation()
    if (navigationArea === 'equipment') {
      const nextIndex = getNextEquipmentIndex(equipmentCursorIndex, movement[0], movement[1])
      const equipmentSlot = EQUIPMENT_SLOTS[nextIndex]
      setEquipmentCursorIndex(nextIndex)
      setSelectedEquipmentSlot(equipmentSlot.key)
      setSelectedSlotIndex(-1)
      setShowItemDetails(false)
      return
    }
    moveSelection(movement[0], movement[1])
  }, [cursorSlotIndex, detailItem, equipmentCursorIndex, handleDropSelected, handleEquipSelected, handleMoveItem, handleSplit, handleToggleDetails, handleToggleEquipment, handleUnequip, handleUseSelected, heldSlotIndex, items, moveSelection, navigationArea, onClose, selectedEquipmentItem, selectedEquipmentSlot, selectedItem])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [handleKeyDown])

  useEffect(() => {
    slotRefs.current[cursorSlotIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [cursorSlotIndex])

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

      <div className="inventory-content">
        <div className="inventory-grid" aria-label="Objetos del inventario">
          {items.map((item, slotIndex) => item ? (
            <button
              className={`inventory-slot ${slotIndex === selectedSlotIndex ? 'is-selected' : ''} ${slotIndex === cursorSlotIndex ? 'is-cursor' : ''} ${slotIndex === heldSlotIndex ? 'is-held' : ''} ${slotIndex === draggedSlotIndex ? 'is-dragging' : ''}`}
              key={`${item.id}-${slotIndex}`}
              ref={(element) => { slotRefs.current[slotIndex] = element }}
              onClick={() => {
                if (slotIndex === selectedSlotIndex) {
                  setShowItemDetails(true)
                  return
                }
                setCursorSlotIndex(slotIndex)
                setSelectedSlotIndex(slotIndex)
                setHeldSlotIndex(null)
                setShowItemDetails(false)
                setSelectedEquipmentSlot(null)
                setNavigationArea('inventory')
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
              ref={(element) => { slotRefs.current[slotIndex] = element }}
              onClick={() => {
                setCursorSlotIndex(slotIndex)
                setSelectedSlotIndex(slotIndex)
                setHeldSlotIndex(null)
                setShowItemDetails(false)
                setSelectedEquipmentSlot(null)
                setNavigationArea('inventory')
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

        <div className="inventory-detail">
          {detailItem ? (
            <>
              <div className="inventory-detail-summary">
                <div className="inventory-detail-icon" aria-hidden="true">{detailItem.icon}</div>
                <div>
                  <p className="inventory-detail-category">{detailItem.category} / {detailItem.rarity}</p>
                  <h3>{detailItem.name}</h3>
                </div>
              </div>
              {showItemDetails && (
                <div className="inventory-detail-expanded">
                  <p>{detailItem.description}</p>
                  <p className="inventory-item-weight">Peso por unidad: {detailItem.weight.toFixed(1)}</p>
                  {detailItem.tipoEquipamiento && (
                    <p className="inventory-item-bonuses">
                      Equipo: {detailItem.tipoEquipamiento} · {[
                        ['Fuerza', detailItem.bonusFuerza],
                        ['Destreza', detailItem.bonusDestreza],
                        ['Inteligencia', detailItem.bonusInteligencia],
                        ['Constitución', detailItem.bonusConstitucion],
                        ['Agilidad', detailItem.bonusAgilidad],
                      ].filter(([, value]) => Number(value) !== 0).map(([stat, value]) => `${stat} ${value > 0 ? '+' : ''}${value}`).join(' · ')}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="inventory-empty-detail">Este espacio está vacío.</p>
          )}
          <section className="inventory-equipment" aria-label="Equipamiento del personaje">
            <div className="inventory-equipment-heading">
              <p className="inventory-kicker">EQUIPAMIENTO</p>
              <span>El equipo puesto no ocupa capacidad</span>
            </div>
            <div className="inventory-equipment-slots">
              {EQUIPMENT_SLOTS.map((slot) => {
                const equippedItem = equipment[slot.key]
                return equippedItem ? (
                  <button
                    className={`inventory-equipment-slot is-filled ${selectedEquipmentSlot === slot.key ? 'is-selected' : ''}`}
                    key={slot.key}
                    type="button"
                    onClick={() => {
                      setSelectedEquipmentSlot(slot.key)
                      setSelectedSlotIndex(-1)
                      setShowItemDetails(false)
                      setNavigationArea('equipment')
                    }}
                    title={`Ver detalles de ${equippedItem.name}`}
                    aria-label={`${slot.label}: ${equippedItem.name}. Pulsar para ver detalles`}
                  >
                    <span className="inventory-equipment-slot-icon" aria-hidden="true">{equippedItem.icon}</span>
                    <span className="inventory-equipment-slot-label">{slot.label}</span>
                    <strong>{equippedItem.name}</strong>
                  </button>
                ) : (
                  <button
                    className={`inventory-equipment-slot ${selectedEquipmentSlot === slot.key ? 'is-selected' : ''}`}
                    key={slot.key}
                    type="button"
                    onClick={() => {
                      setSelectedEquipmentSlot(slot.key)
                      setSelectedSlotIndex(-1)
                      setShowItemDetails(false)
                      setNavigationArea('equipment')
                    }}
                    aria-label={`${slot.label}: vacío`}
                  >
                    <span className="inventory-equipment-slot-icon" aria-hidden="true">{slot.icon}</span>
                    <span className="inventory-equipment-slot-label">{slot.label}</span>
                    <strong>Vacío</strong>
                  </button>
                )
              })}
            </div>
            <p className="inventory-equipment-bonuses">
              Bonificaciones:
              {Object.entries(equipmentBonuses).filter(([, value]) => value !== 0).map(([stat, value]) => ` ${stat} ${value > 0 ? '+' : ''}${value}`).join(' · ') || ' ninguna'}
            </p>
          </section>
        </div>
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
            <strong>{currentWeight.toFixed(1)} / {maxWeight.toFixed(1)}</strong>
          </div>
          <div className="inventory-weight-meter" role="progressbar" aria-label="Peso del inventario" aria-valuemin="0" aria-valuemax={maxWeight} aria-valuenow={Number(currentWeight.toFixed(1))}>
            <span style={{ width: `${weightPercent}%` }} />
          </div>
        </div>
      </div>

      <footer className="inventory-footer">
        <span className="inventory-footer-notice">{activeCharacter?.nombre || 'Personaje'} · {items.filter(Boolean).length} objetos · {inventoryLoading ? 'Cargando inventario...' : notice}</span>
        <span className="inventory-footer-keys">
          <span><span className={`inventory-key ${equipKeyActive ? '' : 'is-inactive'}`}>E</span> Equipar · Usar</span>
          <span><span className="inventory-key">Q</span> Soltar</span>
          <span><span className="inventory-key">R</span> Dividir</span>
          <span><span className="inventory-key">V</span> Detalles</span>
          <span><span className="inventory-key">G</span> Equipo</span>
          <span><span className="inventory-key">I</span> Salir</span>
        </span>
      </footer>
    </aside>
  )
}
