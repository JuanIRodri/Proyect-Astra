import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getClassThemeKey } from './inventoryUtils'
import { computeLoadStats } from './inventoryOperations'
import { createInventoryKeyHandler } from './inventoryKeyHandler'
import { useInventoryData } from './useInventoryData'
import { useInventorySelection } from './useInventorySelection'
import { useInventoryActions } from './useInventoryActions'
import { useInventoryDrag } from './useInventoryDrag'
import { useInventoryContextMenu } from './useInventoryContextMenu'
import { createInitialGold, getCharacterList, isEquipKeyActive } from './inventorySelectors'

export function useInventoryPanel({
  onClose,
  personajes,
  activeCharacterIndex,
  onActiveCharacterChange,
  onTransferComplete,
  onHotbarSlotKey,
}) {
  const characterList = useMemo(() => getCharacterList(personajes), [personajes])
  const [notice, setNotice] = useState('Usa WASD y selecciona objetos con Enter.')
  const [transferPromptActive, setTransferPromptActive] = useState(false)
  const [draggedSlotIndex, setDraggedSlotIndex] = useState(null)
  const [goldByCharacter] = useState(() => createInitialGold(characterList))
  const slotRefs = useRef([])

  const activeCharacter = characterList[activeCharacterIndex]
  const activeCharacterId = activeCharacter?.idPersonaje
  const classThemeKey = getClassThemeKey(activeCharacter?.clase)

  const data = useInventoryData({ activeCharacterId, activeCharacter, characterList, setNotice })
  const selection = useInventorySelection({
    items: data.items,
    equipment: data.equipment,
    setTransferPromptActive,
    setNotice,
  })
  const actions = useInventoryActions({
    data,
    selection,
    characterList,
    activeCharacterId,
    setNotice,
    setTransferPromptActive,
    setDraggedSlotIndex,
    onActiveCharacterChange,
    onTransferComplete,
  })
  const drag = useInventoryDrag({
    items: data.items,
    updateInventory: data.updateInventory,
    moveItem: actions.handleMoveItem,
    unequipItemToSlot: actions.handleUnequipToSlot,
    draggedSlotIndex,
    setDraggedSlotIndex,
    setHeldSlotIndex: selection.setHeldSlotIndex,
    setNotice,
  })
  const contextMenu = useInventoryContextMenu({
    items: data.items,
    characterList,
    activeCharacterId,
    focusSlot: selection.focusSlot,
    setTransferPromptActive,
    onUse: actions.handleUseSelected,
    onEquip: actions.handleEquipSelected,
    onTransfer: actions.handleTransferFromSlot,
    onSplit: actions.handleRequestSplit,
    onShowDetails: selection.toggleDetails,
    onDrop: actions.handleDropSelected,
  })

  const { closeContextMenu } = contextMenu
  const { toggleEquipmentArea } = selection

  const handleToggleEquipment = useCallback(() => {
    toggleEquipmentArea()
    setTransferPromptActive(false)
    closeContextMenu()
  }, [closeContextMenu, setTransferPromptActive, toggleEquipmentArea])

  const {
    equipmentBonuses,
    maxWeight,
    currentWeight,
    weightPercent,
    weightState,
  } = useMemo(() => computeLoadStats({
    items: data.items,
    equipment: data.equipment,
    fuerza: activeCharacter?.fuerza,
  }), [activeCharacter?.fuerza, data.equipment, data.items])

  const itemCount = data.items.filter(Boolean).length
  const goldAmount = goldByCharacter[activeCharacterId] || 0
  const equipKeyActive = isEquipKeyActive({
    selectedEquipmentSlot: selection.selectedEquipmentSlot,
    selectedEquipmentItem: selection.selectedEquipmentItem,
    selectedItem: selection.selectedItem,
  })

  const keyHandlerState = useMemo(() => ({
    items: data.items,
    selectedItem: selection.selectedItem,
    selectedEquipmentItem: selection.selectedEquipmentItem,
    selectedEquipmentSlot: selection.selectedEquipmentSlot,
    navigationArea: selection.navigationArea,
    cursorSlotIndex: selection.cursorSlotIndex,
    equipmentCursorIndex: selection.equipmentCursorIndex,
    heldSlotIndex: selection.heldSlotIndex,
    characterListLength: characterList.length,
    showItemDetails: selection.showItemDetails,
    transferPromptActive,
    contextMenuActive: contextMenu.contextMenu !== null,
    contextMenuActionIndex: contextMenu.contextMenuActionIndex,
    contextMenuActions: contextMenu.contextMenuActions,
    contextMenuSubmenuIndex: contextMenu.contextMenuSubmenuIndex,
    activeCharacterIndex,
  }), [
    activeCharacterIndex,
    characterList.length,
    contextMenu.contextMenu,
    contextMenu.contextMenuActionIndex,
    contextMenu.contextMenuActions,
    contextMenu.contextMenuSubmenuIndex,
    data.items,
    selection.cursorSlotIndex,
    selection.equipmentCursorIndex,
    selection.heldSlotIndex,
    selection.navigationArea,
    selection.selectedEquipmentItem,
    selection.selectedEquipmentSlot,
    selection.selectedItem,
    selection.showItemDetails,
    transferPromptActive,
  ])

  const keyHandlerActions = useMemo(() => ({
    onClose,
    setNotice,
    setShowItemDetails: selection.setShowItemDetails,
    handleCloseDetails: selection.closeDetails,
    setSelectedSlotIndex: selection.setSelectedSlotIndex,
    setHeldSlotIndex: selection.setHeldSlotIndex,
    setEquipmentCursorIndex: selection.setEquipmentCursorIndex,
    setSelectedEquipmentSlot: selection.setSelectedEquipmentSlot,
    setTransferPromptActive,
    handleDropSelected: actions.handleDropSelected,
    handleToggleEquipment,
    handleUnequip: actions.handleUnequip,
    handleEquipSelected: actions.handleEquipSelected,
    handleUseSelected: actions.handleUseSelected,
    handleToggleDetails: selection.toggleDetails,
    handleSplit: actions.handleSplit,
    handleRequestSplit: actions.handleRequestSplit,
    handleMoveItem: actions.handleMoveItem,
    handleCharacterChange: actions.handleCharacterChange,
    handleOrderItems: actions.handleOrderItems,
    handleRequestTransfer: actions.handleRequestTransfer,
    handleTransferSelected: actions.handleTransferSelected,
    handleCycleCategory: selection.cycleCategory,
    handleCycleRarity: selection.cycleRarity,
    handleHotbarKey: onHotbarSlotKey,
    moveSelection: selection.moveSelection,
    setContextMenuActionIndex: contextMenu.setContextMenuActionIndex,
    setContextMenuSubmenuIndex: contextMenu.setContextMenuSubmenuIndex,
    handleCloseContextMenu: contextMenu.closeContextMenu,
  }), [
    actions.handleCharacterChange,
    actions.handleDropSelected,
    actions.handleEquipSelected,
    actions.handleMoveItem,
    actions.handleOrderItems,
    actions.handleRequestSplit,
    actions.handleRequestTransfer,
    actions.handleSplit,
    actions.handleTransferSelected,
    actions.handleUnequip,
    actions.handleUseSelected,
    handleToggleEquipment,
    contextMenu.closeContextMenu,
    contextMenu.setContextMenuActionIndex,
    contextMenu.setContextMenuSubmenuIndex,
    onClose,
    onHotbarSlotKey,
    selection.closeDetails,
    selection.cycleCategory,
    selection.cycleRarity,
    selection.moveSelection,
    selection.setEquipmentCursorIndex,
    selection.setHeldSlotIndex,
    selection.setSelectedEquipmentSlot,
    selection.setSelectedSlotIndex,
    selection.setShowItemDetails,
    selection.toggleDetails,
    setNotice,
    setTransferPromptActive,
  ])

  const handleKeyDown = useMemo(
    () => createInventoryKeyHandler({ state: keyHandlerState, actions: keyHandlerActions }),
    [keyHandlerActions, keyHandlerState],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [handleKeyDown])

  useEffect(() => {
    slotRefs.current[selection.cursorSlotIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selection.cursorSlotIndex])

  return {
    activeCharacter,
    characterList,
    classThemeKey,
    resources: data.resources,
    items: data.items,
    itemCount,
    equipment: data.equipment,
    detailItem: selection.detailItem,
    showItemDetails: selection.showItemDetails,
    handleToggleDetails: selection.toggleDetails,
    handleCloseDetails: selection.closeDetails,
    equipmentBonuses,
    selectedEquipmentSlot: selection.selectedEquipmentSlot,
    goldAmount,
    currentWeight,
    maxWeight,
    weightPercent,
    weightState,
    notice,
    inventoryLoading: data.inventoryLoading,
    equipKeyActive,
    transferPromptActive,
    handleRequestTransfer: actions.handleRequestTransfer,
    handleTransferSelected: actions.handleTransferSelected,
    handleCancelTransfer: actions.handleCancelTransfer,
    selectedItem: selection.selectedItem,
    selectedSlotIndex: selection.selectedSlotIndex,
    cursorSlotIndex: selection.cursorSlotIndex,
    heldSlotIndex: selection.heldSlotIndex,
    draggedSlotIndex,
    slotRefs,
    filterCategory: selection.filterCategory,
    filterRarity: selection.filterRarity,
    handleCategoryChange: selection.changeCategory,
    handleRarityChange: selection.changeRarity,
    handleCycleCategory: selection.cycleCategory,
    handleCycleRarity: selection.cycleRarity,
    categoryOptions: selection.categoryOptions,
    rarityOptions: selection.rarityOptions,
    filteredOutIndexes: selection.filteredOutIndexes,
    filteredCount: selection.filteredCount,
    contextMenu: contextMenu.contextMenu,
    contextMenuActions: contextMenu.contextMenuActions,
    contextMenuActionIndex: contextMenu.contextMenuActionIndex,
    setContextMenuActionIndex: contextMenu.setContextMenuActionIndex,
    contextMenuSubmenuIndex: contextMenu.contextMenuSubmenuIndex,
    setContextMenuSubmenuIndex: contextMenu.setContextMenuSubmenuIndex,
    handleOpenContextMenu: contextMenu.openContextMenu,
    handleCloseContextMenu: contextMenu.closeContextMenu,
    handleDoubleClickSlot: actions.handleDoubleClickSlot,
    handleEquipToSlot: actions.handleEquipToSlot,
    handleUnequipToSlot: actions.handleUnequipToSlot,
    handleDoubleClickEquipment: actions.handleDoubleClickEquipment,
    handleSelectSlot: selection.focusSlot,
    handleGridWheel: actions.handleGridWheel,
    handleOpenDetails: selection.openDetails,
    handleSelectEquipmentSlot: selection.selectEquipmentSlot,
    handleDragStartWithSplit: drag.dragStartWithSplit,
    handleDragEnd: drag.dragEnd,
    handleDropGrid: drag.dropGrid,
    handleUseSelected: actions.handleUseSelected,
    handleTransferFromSlot: actions.handleTransferFromSlot,
    splitPromptActive: actions.splitPromptActive,
    handleConfirmSplit: actions.handleConfirmSplit,
    handleCancelSplit: actions.handleCancelSplit,
  }
}
