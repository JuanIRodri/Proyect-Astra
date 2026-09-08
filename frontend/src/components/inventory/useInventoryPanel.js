import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  desequiparObjeto,
  equiparObjeto,
  getEquipamiento,
  getInventario,
  saveInventario,
  usarObjeto,
} from '../../services/api'
import {
  EQUIPMENT_SLOTS,
  createInventory,
  getClassThemeKey,
  getNextSlotIndex,
  normalizeEquipment,
  normalizeInventory,
} from './inventoryUtils'
import {
  computeLoadStats,
  moveOrMergeItems,
  removeItem,
  setQuantity,
  splitStack,
} from './inventoryOperations'
import { createInventoryKeyHandler } from './inventoryKeyHandler'

export function useInventoryPanel({ onClose, personajes, activeCharacterIndex, onActiveCharacterChange }) {
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
  const {
    equipmentBonuses,
    maxWeight,
    currentWeight,
    weightPercent,
    weightState,
  } = computeLoadStats({ items, equipment, fuerza: activeCharacter?.fuerza })
  const itemCount = items.filter(Boolean).length

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

    updateInventory(removeItem(items, selectedSlotIndex), `${selectedItem.name}: objeto soltado.`)
    setSelectedSlotIndex((currentIndex) => Math.max(0, currentIndex - 1))
    setCursorSlotIndex((currentIndex) => Math.max(0, currentIndex - 1))
    setHeldSlotIndex(null)
  }, [items, selectedItem, selectedSlotIndex, updateInventory])

  const handleSplit = useCallback(() => {
    const result = splitStack(items, selectedSlotIndex)
    if (result.error) {
      setNotice(result.error)
      return
    }
    updateInventory(result.nextItems, result.message)
  }, [items, selectedSlotIndex, updateInventory])

  const handleMoveItem = useCallback((sourceSlotIndex, targetSlotIndex) => {
    const result = moveOrMergeItems(items, sourceSlotIndex, targetSlotIndex)
    if (!result) return

    updateInventory(result.nextItems, result.message)
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
      const result = await usarObjeto(activeCharacterId, selectedSlotIndex)
      const nextItems = setQuantity(items, selectedSlotIndex, result.quantity)
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
      setInventories((currentInventories) => ({
        ...currentInventories,
        [activeCharacterId]: removeItem(items, selectedSlotIndex),
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

  const handleKeyDown = useMemo(
    () => createInventoryKeyHandler({
      items,
      selectedItem,
      selectedEquipmentItem,
      selectedEquipmentSlot,
      navigationArea,
      cursorSlotIndex,
      equipmentCursorIndex,
      heldSlotIndex,
      characterListLength: characterList.length,
      onClose,
      setNotice,
      setShowItemDetails,
      setSelectedSlotIndex,
      setHeldSlotIndex,
      setEquipmentCursorIndex,
      setSelectedEquipmentSlot,
      handleDropSelected,
      handleToggleEquipment,
      handleUnequip,
      handleEquipSelected,
      handleUseSelected,
      handleToggleDetails,
      handleSplit,
      handleMoveItem,
      handleCharacterChange,
      moveSelection,
    }),
    [cursorSlotIndex, detailItem, equipmentCursorIndex, handleDropSelected, handleEquipSelected, handleMoveItem, handleSplit, handleToggleDetails, handleToggleEquipment, handleUnequip, handleUseSelected, heldSlotIndex, items, moveSelection, navigationArea, onClose, selectedEquipmentItem, selectedEquipmentSlot, selectedItem],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [handleKeyDown])

  useEffect(() => {
    slotRefs.current[cursorSlotIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [cursorSlotIndex])

  const handleSelectSlot = (slotIndex) => {
    setCursorSlotIndex(slotIndex)
    setSelectedSlotIndex(slotIndex)
    setHeldSlotIndex(null)
    setShowItemDetails(false)
    setSelectedEquipmentSlot(null)
    setNavigationArea('inventory')
  }

  const handleOpenDetails = () => setShowItemDetails(true)

  const handleSelectEquipmentSlot = (slotKey) => {
    setSelectedEquipmentSlot(slotKey)
    setSelectedSlotIndex(-1)
    setShowItemDetails(false)
    setNavigationArea('equipment')
  }

  const handleDragStart = (slotIndex) => {
    setDraggedSlotIndex(slotIndex)
    setHeldSlotIndex(null)
  }

  const handleDragEnd = () => setDraggedSlotIndex(null)

  const handleDrop = (sourceIndex, targetIndex) => {
    handleMoveItem(sourceIndex, targetIndex)
    setDraggedSlotIndex(null)
    setHeldSlotIndex(null)
  }

  return {
    activeCharacter,
    classThemeKey,
    items,
    itemCount,
    equipment,
    detailItem,
    showItemDetails,
    equipmentBonuses,
    selectedEquipmentSlot,
    goldAmount,
    currentWeight,
    maxWeight,
    weightPercent,
    weightState,
    notice,
    inventoryLoading,
    equipKeyActive,
    selectedSlotIndex,
    cursorSlotIndex,
    heldSlotIndex,
    draggedSlotIndex,
    slotRefs,
    handleSelectSlot,
    handleOpenDetails,
    handleSelectEquipmentSlot,
    handleDragStart,
    handleDragEnd,
    handleDrop,
  }
}