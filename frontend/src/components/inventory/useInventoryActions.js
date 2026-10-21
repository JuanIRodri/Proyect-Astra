import { useCallback, useState } from 'react'
import { moveOrMergeItems, removeItem, sortInventory, splitStack, splitStackByQuantity } from './inventoryOperations'

export function useInventoryActions({
  data,
  selection,
  characterList,
  activeCharacterId,
  setNotice,
  setTransferPromptActive,
  setDraggedSlotIndex,
  onActiveCharacterChange,
  onTransferComplete,
}) {
  const [splitPromptActive, setSplitPromptActive] = useState(false)

  const {
    items,
    updateInventory,
    consumeItem,
    equipItem,
    unequipItem,
    unequipItemToSlot,
    transferItem,
  } = data

  const {
    selectedSlotIndex,
    selectedItem,
    navigationArea,
    setSelectedSlotIndex,
    setCursorSlotIndex,
    setHeldSlotIndex,
    setShowItemDetails,
    setNavigationArea,
    clearSelectedEquipmentSlot,
    resetSelection,
    cycleCategory,
    cycleRarity,
    moveSelection,
  } = selection

  const handleUseSelected = useCallback(async (slotIndex = selectedSlotIndex) => {
    const { ok, result } = await consumeItem(slotIndex)
    return ok ? result : undefined
  }, [consumeItem, selectedSlotIndex])

  const handleEquipSelected = useCallback(async (slotIndex = selectedSlotIndex) => {
    const { ok } = await equipItem(slotIndex)
    if (ok) setHeldSlotIndex(null)
  }, [equipItem, selectedSlotIndex, setHeldSlotIndex])

  const handleEquipToSlot = useCallback(async (slotIndex, equipmentSlotKey) => {
    const { ok } = await equipItem(slotIndex, equipmentSlotKey)
    if (ok) setHeldSlotIndex(null)
  }, [equipItem, setHeldSlotIndex])

  const handleUnequip = useCallback(async (equipmentSlot) => {
    const { ok } = await unequipItem(equipmentSlot)
    if (ok) clearSelectedEquipmentSlot()
  }, [clearSelectedEquipmentSlot, unequipItem])

  const handleUnequipToSlot = useCallback(async (equipmentSlotKey, targetSlotIndex) => {
    const { ok } = await unequipItemToSlot(equipmentSlotKey, targetSlotIndex)
    if (!ok) return
    setHeldSlotIndex(null)
    clearSelectedEquipmentSlot()
    setNavigationArea('inventory')
    setShowItemDetails(false)
  }, [clearSelectedEquipmentSlot, setHeldSlotIndex, setNavigationArea, setShowItemDetails, unequipItemToSlot])

  const handleTransferFromSlot = useCallback(async (slotIndex, targetCharacterIndex) => {
    const target = characterList[targetCharacterIndex]
    if (!target) {
      setTransferPromptActive(false)
      return
    }
    if (target.idPersonaje === activeCharacterId) {
      setTransferPromptActive(false)
      setNotice('No puedes enviarte un objeto a vos mismo.')
      return
    }

    const { ok, item } = await transferItem(slotIndex, target)
    setTransferPromptActive(false)
    if (!ok) return
    setSelectedSlotIndex((current) => Math.max(0, current - 1))
    setCursorSlotIndex((current) => Math.max(0, current - 1))
    setHeldSlotIndex(null)
    setDraggedSlotIndex(null)
    onTransferComplete?.()
    setNotice(`${item.name} enviado a ${target.nombre}.`)
  }, [
    activeCharacterId,
    characterList,
    setCursorSlotIndex,
    setDraggedSlotIndex,
    setHeldSlotIndex,
    setNotice,
    setSelectedSlotIndex,
    setTransferPromptActive,
    onTransferComplete,
    transferItem,
  ])

  const handleTransferSelected = useCallback((targetCharacterIndex) => {
    handleTransferFromSlot(selectedSlotIndex, targetCharacterIndex)
  }, [handleTransferFromSlot, selectedSlotIndex])

  const handleDropSelected = useCallback(() => {
    if (!selectedItem) {
      setNotice('Selecciona un objeto antes de soltarlo.')
      return
    }
    updateInventory(removeItem(items, selectedSlotIndex), `${selectedItem.name}: objeto soltado.`)
    setSelectedSlotIndex((current) => Math.max(0, current - 1))
    setCursorSlotIndex((current) => Math.max(0, current - 1))
    setHeldSlotIndex(null)
  }, [items, selectedItem, selectedSlotIndex, setCursorSlotIndex, setHeldSlotIndex, setNotice, setSelectedSlotIndex, updateInventory])

  const handleMoveItem = useCallback((sourceSlotIndex, targetSlotIndex) => {
    const result = moveOrMergeItems(items, sourceSlotIndex, targetSlotIndex)
    if (!result) return
    updateInventory(result.nextItems, result.message)
    setSelectedSlotIndex(targetSlotIndex)
    setCursorSlotIndex(targetSlotIndex)
  }, [items, setCursorSlotIndex, setSelectedSlotIndex, updateInventory])

  const handleOrderItems = useCallback(() => {
    updateInventory(sortInventory(items), 'Mochila ordenada: pilas unidas y objetos acomodados.')
  }, [items, updateInventory])

  const handleDoubleClickSlot = useCallback((slotIndex) => {
    const item = items[slotIndex]
    if (!item) return
    if (item.tipoEquipamiento) {
      handleEquipSelected(slotIndex)
    } else if (item.consumible) {
      handleUseSelected(slotIndex)
    }
  }, [handleEquipSelected, handleUseSelected, items])

  const handleDoubleClickEquipment = useCallback((equipmentSlotKey) => {
    handleUnequip(equipmentSlotKey)
  }, [handleUnequip])

  const handleSplit = useCallback(() => {
    const result = splitStack(items, selectedSlotIndex)
    if (result.error) {
      setNotice(result.error)
      return
    }
    updateInventory(result.nextItems, result.message)
  }, [items, selectedSlotIndex, setNotice, updateInventory])

  const handleRequestSplit = useCallback(() => {
    const item = items[selectedSlotIndex]
    if (!item || item.quantity < 2) {
      setNotice('Selecciona una pila con más de un objeto para dividirla.')
      return
    }
    setSplitPromptActive(true)
  }, [items, selectedSlotIndex, setNotice])

  const handleConfirmSplit = useCallback((quantity) => {
    setSplitPromptActive(false)
    const result = splitStackByQuantity(items, selectedSlotIndex, quantity)
    if (result.error) {
      setNotice(result.error)
      return
    }
    updateInventory(result.nextItems, result.message)
  }, [items, selectedSlotIndex, setNotice, updateInventory])

  const handleCancelSplit = useCallback(() => {
    setSplitPromptActive(false)
    setNotice('División cancelada.')
  }, [setNotice])

  const handleRequestTransfer = useCallback(() => {
    if (navigationArea !== 'inventory') {
      setNotice('Sal primero del equipamiento para transferir un objeto.')
      return
    }
    if (!selectedItem) {
      setNotice('Selecciona un objeto antes de transferirlo.')
      return
    }
    setTransferPromptActive(true)
    setNotice(`Elegí el personaje al que enviar ${selectedItem.name}.`)
  }, [navigationArea, selectedItem, setNotice, setTransferPromptActive])

  const handleCancelTransfer = useCallback(() => {
    setTransferPromptActive(false)
    setNotice('Traspaso cancelado.')
  }, [setNotice, setTransferPromptActive])

  const handleCharacterChange = useCallback((characterIndex) => {
    onActiveCharacterChange(characterIndex)
    data.setInventoryLoading(true)
    resetSelection()
    setTransferPromptActive(false)
    setNotice('Usa WASD y selecciona objetos con Enter.')
  }, [data, onActiveCharacterChange, resetSelection, setNotice, setTransferPromptActive])

  const handleGridWheel = useCallback((event) => {
    event.preventDefault()
    const direction = event.deltaY > 0 ? 1 : -1
    if (event.shiftKey) {
      if (direction > 0) cycleCategory()
      else cycleRarity()
      return
    }
    moveSelection(direction, 0)
  }, [cycleCategory, cycleRarity, moveSelection])

  return {
    splitPromptActive,
    handleUseSelected,
    handleEquipSelected,
    handleEquipToSlot,
    handleUnequip,
    handleUnequipToSlot,
    handleTransferFromSlot,
    handleTransferSelected,
    handleDropSelected,
    handleMoveItem,
    handleOrderItems,
    handleDoubleClickSlot,
    handleDoubleClickEquipment,
    handleSplit,
    handleRequestSplit,
    handleConfirmSplit,
    handleCancelSplit,
    handleRequestTransfer,
    handleCancelTransfer,
    handleCharacterChange,
    handleGridWheel,
  }
}
