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
    showItemDetails,
    handleCloseDetails,
    setSelectedSlotIndex,
    setHeldSlotIndex,
    setEquipmentCursorIndex,
    setSelectedEquipmentSlot,
    handleRequestTransfer,
    transferPromptActive,
    setTransferPromptActive,
    contextMenuActive,
    contextMenuActionIndex,
    setContextMenuActionIndex,
    contextMenuSubmenuIndex,
    setContextMenuSubmenuIndex,
    contextMenuActions,
    handleCloseContextMenu,
    handleDropSelected,
    handleToggleEquipment,
    handleUnequip,
    handleEquipSelected,
    handleUseSelected,
    handleToggleDetails,
    handleSplit,
    handleRequestSplit,
    activeCharacterIndex,
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
      (targetNode.tagName === 'INPUT' || targetNode.tagName === 'SELECT' || targetNode.classList?.contains('inventory-filter-control'))) {
      return
    }

    const key = event.key.toLowerCase()

    if (contextMenuActive) {
      event.preventDefault()
      event.stopPropagation()
      const selectedAction = contextMenuActions[contextMenuActionIndex]
      const hasSubmenu = Boolean(selectedAction?.submenu?.length)
      const submenuOpen = hasSubmenu && contextMenuSubmenuIndex !== null

      if (key === 'escape') {
        if (submenuOpen) {
          setContextMenuSubmenuIndex(null)
        } else {
          handleCloseContextMenu()
        }
        return
      }

      if (submenuOpen) {
        if (key === 'arrowleft' || key === 'a') {
          setContextMenuSubmenuIndex(null)
          return
        }
        if (key === 'arrowdown' || key === 's') {
          setContextMenuSubmenuIndex((index) => (index + 1) % selectedAction.submenu.length)
          return
        }
        if (key === 'arrowup' || key === 'w') {
          setContextMenuSubmenuIndex((index) => (index - 1 + selectedAction.submenu.length) % selectedAction.submenu.length)
          return
        }
        if (key === 'enter' || key === ' ') {
          selectedAction.submenu[contextMenuSubmenuIndex]?.run()
          handleCloseContextMenu()
          return
        }
        return
      }

      const openSubmenu = () => {
        if (hasSubmenu) {
          setContextMenuSubmenuIndex(0)
          return true
        }
        return false
      }

      if (key === 'enter' || key === ' ') {
        if (!openSubmenu()) {
          selectedAction?.run()
          handleCloseContextMenu()
        }
        return
      }
      if (key === 'arrowright' || key === 'd') {
        if (!openSubmenu()) {
          setContextMenuActionIndex((index) => (index + 1) % contextMenuActions.length)
        }
        return
      }
      if (key === 'arrowdown' || key === 's') {
        setContextMenuActionIndex((index) => (index + 1) % contextMenuActions.length)
        return
      }
      if (key === 'arrowup' || key === 'w' || key === 'arrowleft' || key === 'a') {
        setContextMenuActionIndex((index) => (index - 1 + contextMenuActions.length) % contextMenuActions.length)
        return
      }
      return
    }

    if (showItemDetails) {
      event.preventDefault()
      event.stopPropagation()
      if (key === 'escape') {
        handleCloseDetails()
      }
      return
    }

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

    if (key === 'c') {
      event.preventDefault()
      event.stopPropagation()
      handleRequestSplit()
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

    if (key === 'tab') {
      event.preventDefault()
      event.stopPropagation()
      const direction = event.shiftKey ? -1 : 1
      const nextIndex = (activeCharacterIndex + direction + characterListLength) % characterListLength
      handleCharacterChange(nextIndex)
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