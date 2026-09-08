import { getLeaderIndex } from '../../game/hotkeys'
import { EQUIPMENT_SLOTS, getNextEquipmentIndex } from './inventoryUtils'

export function createInventoryKeyHandler(config) {
  const {
    items,
    selectedItem,
    selectedEquipmentItem,
    selectedEquipmentSlot,
    navigationArea,
    cursorSlotIndex,
    equipmentCursorIndex,
    heldSlotIndex,
    characterListLength,
    onClose,
    setNotice,
    setShowItemDetails,
    setSelectedSlotIndex,
    setHeldSlotIndex,
    setEquipmentCursorIndex,
    setSelectedEquipmentSlot,
    handleRequestTransfer,
    transferPromptActive,
    setTransferPromptActive,
    handleDropSelected,
    handleToggleEquipment,
    handleUnequip,
    handleEquipSelected,
    handleUseSelected,
    handleToggleDetails,
    handleSplit,
    handleMoveItem,
    handleCharacterChange,
    handleOrderItems,
    handleTransferSelected,
    handleCycleCategory,
    handleCycleRarity,
    moveSelection,
  } = config

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

  return (event) => {
    const targetNode = event.target
    if (targetNode && typeof targetNode.tagName === 'string' &&
      (targetNode.tagName === 'SELECT' || targetNode.classList?.contains('inventory-filter-control'))) {
      return
    }

    const key = event.key.toLowerCase()

    if (transferPromptActive) {
      if (key === 'escape') {
        event.preventDefault()
        event.stopPropagation()
        setTransferPromptActive(false)
        setNotice('Traspaso cancelado.')
        return
      }
      const targetIndex = getLeaderIndex(event)
      if (targetIndex !== undefined && targetIndex < characterListLength) {
        event.preventDefault()
        event.stopPropagation()
        handleTransferSelected(targetIndex)
        return
      }
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

    if (key === 'o') {
      event.preventDefault()
      event.stopPropagation()
      handleOrderItems()
      return
    }

    if (key === 't') {
      event.preventDefault()
      event.stopPropagation()
      handleRequestTransfer()
      return
    }

    if (event.shiftKey && key === 'f') {
      event.preventDefault()
      event.stopPropagation()
      handleCycleRarity()
      return
    }

    if (key === 'f') {
      event.preventDefault()
      event.stopPropagation()
      handleCycleCategory()
      return
    }

    const characterIndex = getLeaderIndex(event)
    if (characterIndex !== undefined && characterIndex < characterListLength) {
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
  }
}