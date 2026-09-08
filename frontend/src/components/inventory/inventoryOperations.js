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

export function splitStackByQuantity(items, sourceSlotIndex, quantity) {
  const sourceItem = items[sourceSlotIndex]
  if (!sourceItem) return { error: 'Selecciona una pila antes de dividirla.' }
  if (sourceItem.quantity < 2) return { error: 'Necesitas al menos dos unidades para dividir una pila.' }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity >= sourceItem.quantity) {
    return { error: `Eligí un número entre 1 y ${sourceItem.quantity - 1}.` }
  }

  const emptySlotIndex = items.findIndex((item) => !item)
  if (emptySlotIndex === -1) return { error: 'No hay espacios libres para dividir esta pila.' }

  const nextItems = items.map((item, itemIndex) => {
    if (itemIndex === sourceSlotIndex) return { ...item, quantity: sourceItem.quantity - quantity }
    if (itemIndex === emptySlotIndex) {
      return { ...sourceItem, id: `${sourceItem.id}-split-${Date.now()}`, quantity }
    }
    return item
  })
  return {
    nextItems,
    message: `${sourceItem.name}: pila dividida en ${sourceItem.quantity - quantity} y ${quantity}.`,
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

export function moveSingleItem(items, sourceSlotIndex, targetSlotIndex) {
  const sourceItem = items[sourceSlotIndex]
  if (!sourceItem) return null
  if (sourceItem.quantity < 2) return { error: 'Esta pila ya tiene una sola unidad.' }

  const targetItem = items[targetSlotIndex]
  if (targetItem && targetItem.itemKey !== sourceItem.itemKey) {
    return { error: 'El destino está ocupado: soltá en un espacio vacío para separar una unidad.' }
  }

  const nextItems = items.map((item, itemIndex) => {
    if (targetItem && itemIndex === targetSlotIndex) return { ...item, quantity: item.quantity + 1 }
    if (itemIndex === sourceSlotIndex) return { ...item, quantity: item.quantity - 1 }
    if (itemIndex === targetSlotIndex) {
      return { ...sourceItem, id: `${sourceItem.id}-split-${Date.now()}`, quantity: 1 }
    }
    return item
  })
  return {
    nextItems,
    message: targetItem
      ? `${sourceItem.name}: una unidad separada y unida a la pila.`
      : `${sourceItem.name}: una unidad separada.`,
  }
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

export function sortInventory(items) {
  const mergedStacks = []
  items.forEach((item) => {
    if (!item) return
    const target = mergedStacks.find((stack) => (
      stack.itemKey === item.itemKey && stack.quantity < stack.maxPila
    ))
    if (target) {
      const room = target.maxPila - target.quantity
      const added = Math.min(room, item.quantity)
      target.quantity += added
      if (item.quantity > added) mergedStacks.push({ ...item, quantity: item.quantity - added })
    } else {
      mergedStacks.push({ ...item })
    }
  })

  mergedStacks.sort((a, b) => (
    a.category.localeCompare(b.category, 'es')
    || a.name.localeCompare(b.name, 'es')
    || a.rarity.localeCompare(b.rarity, 'es')
  ))

  const nextItems = Array(items.length).fill(null)
  mergedStacks.forEach((item, index) => {
    if (index >= items.length) return
    nextItems[index] = { ...item, id: `${item.itemKey}-${index}` }
  })
  return nextItems
}