import { useCallback } from 'react'
import { moveSingleItem } from './inventoryOperations'

export function useInventoryDrag({
  items,
  updateInventory,
  moveItem,
  unequipItemToSlot,
  setDraggedSlotIndex,
  setHeldSlotIndex,
  setNotice,
}) {
  const dragStart = useCallback((slotIndex) => {
    setDraggedSlotIndex(slotIndex)
    setHeldSlotIndex(null)
  }, [setDraggedSlotIndex, setHeldSlotIndex])

  const dragEnd = useCallback(() => {
    window.inventoryDrag = null
    setDraggedSlotIndex(null)
    setHeldSlotIndex(null)
  }, [setDraggedSlotIndex, setHeldSlotIndex])

  const dragStartWithSplit = useCallback((slotIndex, split) => {
    if (split && items[slotIndex]?.quantity > 1) window.inventoryDrag = { slotIndex, split: true }
    dragStart(slotIndex)
  }, [dragStart, items])

  const dropSplit = useCallback((sourceIndex, targetIndex) => {
    const result = moveSingleItem(items, sourceIndex, targetIndex)
    if (result?.error) {
      setNotice(result.error)
    } else if (result) {
      updateInventory(result.nextItems, result.message)
    }
    setDraggedSlotIndex(null)
    setHeldSlotIndex(null)
  }, [items, setDraggedSlotIndex, setHeldSlotIndex, setNotice, updateInventory])

  const drop = useCallback((sourceIndex, targetIndex) => {
    moveItem(sourceIndex, targetIndex)
    setDraggedSlotIndex(null)
    setHeldSlotIndex(null)
  }, [moveItem, setDraggedSlotIndex, setHeldSlotIndex])

  const dropGrid = useCallback((data, slotIndex) => {
    if (data.startsWith('equip-')) {
      unequipItemToSlot(data.slice(6), slotIndex)
      setDraggedSlotIndex(null)
      return
    }
    const sourceIndex = Number(data)
    if (!Number.isFinite(sourceIndex)) return
    const drag = window.inventoryDrag
    window.inventoryDrag = null
    if (drag?.split && drag.slotIndex === sourceIndex && items[sourceIndex]?.quantity > 1) {
      dropSplit(sourceIndex, slotIndex)
      return
    }
    drop(sourceIndex, slotIndex)
  }, [drop, dropSplit, items, setDraggedSlotIndex, unequipItemToSlot])

  return {
    dragStart,
    dragEnd,
    dragStartWithSplit,
    dropGrid,
  }
}
