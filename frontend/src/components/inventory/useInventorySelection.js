import { useCallback, useMemo, useState } from 'react'
import {
  EQUIPMENT_SLOTS,
  getFilterOptions,
  getFilteredIndexes,
  getNextFilteredSlotIndex,
  getNextSlotIndex,
} from './inventoryUtils'
import { getFilteredOutIndexes } from './inventorySelectors'

export function useInventorySelection({ items, equipment, setTransferPromptActive, setNotice }) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0)
  const [cursorSlotIndex, setCursorSlotIndex] = useState(0)
  const [heldSlotIndex, setHeldSlotIndex] = useState(null)
  const [showItemDetails, setShowItemDetails] = useState(false)
  const [selectedEquipmentSlot, setSelectedEquipmentSlot] = useState(null)
  const [navigationArea, setNavigationArea] = useState('inventory')
  const [equipmentCursorIndex, setEquipmentCursorIndex] = useState(0)
  const [filterCategory, setFilterCategory] = useState('todos')
  const [filterRarity, setFilterRarity] = useState('todos')

  const matchingIndexes = useMemo(() => (
    getFilteredIndexes(items, filterCategory, filterRarity)
  ), [items, filterCategory, filterRarity])
  const isFilterActive = filterCategory !== 'todos' || filterRarity !== 'todos'
  const filteredOutIndexes = useMemo(() => (
    isFilterActive ? getFilteredOutIndexes(items, matchingIndexes) : null
  ), [items, matchingIndexes, isFilterActive])
  const categoryOptions = useMemo(() => ['todos', ...getFilterOptions(items, 'category')], [items])
  const rarityOptions = useMemo(() => ['todos', ...getFilterOptions(items, 'rarity')], [items])

  const selectedItem = items[selectedSlotIndex] || null
  const selectedEquipmentItem = selectedEquipmentSlot ? equipment[selectedEquipmentSlot] : null
  const detailItem = selectedEquipmentItem || selectedItem

  const focusSlot = useCallback((slotIndex) => {
    setCursorSlotIndex(slotIndex)
    setSelectedSlotIndex(slotIndex)
    setHeldSlotIndex(null)
    setShowItemDetails(false)
    setSelectedEquipmentSlot(null)
    setTransferPromptActive(false)
    setNavigationArea('inventory')
  }, [setTransferPromptActive])

  const moveSelection = useCallback((rowDelta, columnDelta) => {
    const nextIndex = isFilterActive && matchingIndexes.length > 0
      ? getNextFilteredSlotIndex(cursorSlotIndex, rowDelta, columnDelta, new Set(matchingIndexes))
      : getNextSlotIndex(cursorSlotIndex, rowDelta, columnDelta)
    setCursorSlotIndex(nextIndex)
    setSelectedSlotIndex(nextIndex)
    setShowItemDetails(false)
    setSelectedEquipmentSlot(null)
    setNavigationArea('inventory')
  }, [cursorSlotIndex, isFilterActive, matchingIndexes])

  const changeCategory = useCallback((nextCategory) => {
    setFilterCategory(nextCategory)
    const nextMatches = getFilteredIndexes(items, nextCategory, filterRarity)
    if (navigationArea === 'equipment') return
    if (nextMatches.length > 0 && !nextMatches.includes(selectedSlotIndex)) {
      setSelectedSlotIndex(nextMatches[0])
      setCursorSlotIndex(nextMatches[0])
      setShowItemDetails(false)
    }
  }, [filterRarity, items, navigationArea, selectedSlotIndex])

  const changeRarity = useCallback((nextRarity) => {
    setFilterRarity(nextRarity)
    const nextMatches = getFilteredIndexes(items, filterCategory, nextRarity)
    if (navigationArea === 'equipment') return
    if (nextMatches.length > 0 && !nextMatches.includes(selectedSlotIndex)) {
      setSelectedSlotIndex(nextMatches[0])
      setCursorSlotIndex(nextMatches[0])
      setShowItemDetails(false)
    }
  }, [filterCategory, items, navigationArea, selectedSlotIndex])

  const cycleCategory = useCallback(() => {
    const currentIndex = Math.max(0, categoryOptions.indexOf(filterCategory))
    changeCategory(categoryOptions[(currentIndex + 1) % categoryOptions.length])
  }, [categoryOptions, filterCategory, changeCategory])

  const cycleRarity = useCallback(() => {
    const currentIndex = Math.max(0, rarityOptions.indexOf(filterRarity))
    changeRarity(rarityOptions[(currentIndex + 1) % rarityOptions.length])
  }, [rarityOptions, filterRarity, changeRarity])

  const toggleEquipmentArea = useCallback(() => {
    if (navigationArea === 'equipment') {
      setNavigationArea('inventory')
      setSelectedEquipmentSlot(null)
      setSelectedSlotIndex(0)
      setCursorSlotIndex(0)
      setNotice('Navegación en la mochila.')
      return
    }
    const equipmentSlot = EQUIPMENT_SLOTS[equipmentCursorIndex]
    setNavigationArea('equipment')
    setSelectedEquipmentSlot(equipmentSlot.key)
    setSelectedSlotIndex(-1)
    setShowItemDetails(false)
    setNotice('Navegación en el equipamiento.')
  }, [equipmentCursorIndex, navigationArea, setNotice])

  const selectEquipmentSlot = useCallback((slotKey) => {
    setSelectedEquipmentSlot(slotKey)
    setSelectedSlotIndex(-1)
    setShowItemDetails(false)
    setNavigationArea('equipment')
  }, [])

  const toggleDetails = useCallback(() => {
    if (!detailItem) {
      setNotice('Selecciona un objeto para ver sus detalles.')
      return
    }
    setShowItemDetails((isVisible) => !isVisible)
  }, [detailItem, setNotice])

  const closeDetails = useCallback(() => setShowItemDetails(false), [])
  const openDetails = useCallback(() => setShowItemDetails(true), [])

  const resetSelection = useCallback(() => {
    setSelectedSlotIndex(0)
    setCursorSlotIndex(0)
    setHeldSlotIndex(null)
    setShowItemDetails(false)
    setSelectedEquipmentSlot(null)
    setNavigationArea('inventory')
  }, [])

  const clearSelectedEquipmentSlot = useCallback(() => setSelectedEquipmentSlot(null), [])

  return {
    selectedSlotIndex,
    cursorSlotIndex,
    heldSlotIndex,
    showItemDetails,
    selectedEquipmentSlot,
    navigationArea,
    equipmentCursorIndex,
    filterCategory,
    filterRarity,
    categoryOptions,
    rarityOptions,
    matchingIndexes,
    filteredOutIndexes,
    filteredCount: matchingIndexes.length,
    isFilterActive,
    selectedItem,
    selectedEquipmentItem,
    detailItem,
    focusSlot,
    moveSelection,
    changeCategory,
    changeRarity,
    cycleCategory,
    cycleRarity,
    toggleEquipmentArea,
    selectEquipmentSlot,
    toggleDetails,
    closeDetails,
    openDetails,
    resetSelection,
    clearSelectedEquipmentSlot,
    setSelectedSlotIndex,
    setHeldSlotIndex,
    setShowItemDetails,
    setSelectedEquipmentSlot,
    setNavigationArea,
    setEquipmentCursorIndex,
  }
}
