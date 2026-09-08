import { EQUIPMENT_SLOTS } from './inventoryUtils'

export function removeItem(items, slotIndex) {
  return items.map((item, itemIndex) => (itemIndex === slotIndex ? null : item))
}

export function setQuantity(items, slotIndex, quantity) {
  return items.map((item, itemIndex) => {
    if (itemIndex !== slotIndex) return item
    if (quantity < 1) return null
    return { ...item, quantity }
  })
}

export function splitStack(items, sourceSlotIndex) {
  const sourceItem = items[sourceSlotIndex]
  if (!sourceItem) return { error: 'Selecciona una pila antes de dividirla.' }
  if (sourceItem.quantity < 2) return { error: 'Necesitas al menos dos unidades para dividir una pila.' }

  const emptySlotIndex = items.findIndex((item) => !item)
  if (emptySlotIndex === -1) return { error: 'No hay espacios libres para dividir esta pila.' }

  const firstQuantity = Math.ceil(sourceItem.quantity / 2)
  const secondQuantity = Math.floor(sourceItem.quantity / 2)
  const nextItems = items.map((item, itemIndex) => {
    if (itemIndex === sourceSlotIndex) return { ...item, quantity: firstQuantity }
    if (itemIndex === emptySlotIndex) {
      return { ...sourceItem, id: `${sourceItem.id}-split-${Date.now()}`, quantity: secondQuantity }
    }
    return item
  })
  return {
    nextItems,
    message: `${sourceItem.name}: pila dividida en ${firstQuantity} y ${secondQuantity}.`,
  }
}

export function moveOrMergeItems(items, sourceSlotIndex, targetSlotIndex) {
  if (sourceSlotIndex === targetSlotIndex) return null

  const sourceItem = items[sourceSlotIndex]
  const targetItem = items[targetSlotIndex]
  if (!sourceItem) return null

  if (targetItem && targetItem.itemKey === sourceItem.itemKey) {
    const nextItems = items.map((item, itemIndex) => {
      if (itemIndex === sourceSlotIndex) return null
      if (itemIndex === targetSlotIndex) {
        return { ...item, quantity: item.quantity + sourceItem.quantity }
      }
      return item
    })
    return { nextItems, message: `${sourceItem.name}: pilas acumuladas.` }
  }

  const nextItems = items.map((item, itemIndex) => {
    if (itemIndex === sourceSlotIndex) return targetItem
    if (itemIndex === targetSlotIndex) return sourceItem
    return item
  })
  return { nextItems, message: targetItem ? 'Objetos intercambiados.' : `${sourceItem.name}: objeto movido.` }
}

export function computeEquipmentBonuses(equipment) {
  return EQUIPMENT_SLOTS.reduce((bonuses, slot) => {
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
}

export function computeLoadStats({ items, equipment, fuerza }) {
  const equipmentBonuses = computeEquipmentBonuses(equipment)
  const maxWeight = 10 + (((Number(fuerza) || 10) + equipmentBonuses.fuerza) * 1.5)
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
  return { equipmentBonuses, maxWeight, currentWeight, weightPercent, weightState }
}