import { HOTBAR_KEYS } from '@/game/hotbarConfig'
import { handleConfirmKey } from './confirmKeys'

export function handleActionKey(event, key, config) {
  const { state, actions } = config

  if (key === 'i' || key === 'escape') {
    event.preventDefault()
    event.stopPropagation()
    actions.onClose()
    return true
  }

  if (key === 'q') {
    event.preventDefault()
    event.stopPropagation()
    actions.handleDropSelected()
    return true
  }

  if (key === 'g') {
    event.preventDefault()
    event.stopPropagation()
    actions.handleToggleEquipment()
    return true
  }

  if (key === 'e') {
    event.preventDefault()
    event.stopPropagation()
    if (state.selectedEquipmentSlot && state.selectedEquipmentItem) {
      actions.handleUnequip(state.selectedEquipmentSlot)
    } else if (state.selectedEquipmentSlot) {
      actions.setNotice('Esta ranura de equipamiento está vacía.')
    } else if (state.selectedItem?.tipoEquipamiento) {
      actions.handleEquipSelected()
    } else if (state.selectedItem?.consumible) {
      actions.handleUseSelected()
    }
    return true
  }

  if (key === 'v') {
    event.preventDefault()
    event.stopPropagation()
    actions.handleToggleDetails()
    return true
  }

  if (key === 'r') {
    event.preventDefault()
    event.stopPropagation()
    actions.handleSplit()
    return true
  }

  if (key === 'c') {
    event.preventDefault()
    event.stopPropagation()
    actions.handleRequestSplit()
    return true
  }

  if (key === 'o') {
    event.preventDefault()
    event.stopPropagation()
    actions.handleOrderItems()
    return true
  }

  if (key === 't') {
    event.preventDefault()
    event.stopPropagation()
    actions.handleRequestTransfer()
    return true
  }

  if (event.shiftKey && key === 'f') {
    event.preventDefault()
    event.stopPropagation()
    actions.handleCycleRarity()
    return true
  }

  if (key === 'f') {
    event.preventDefault()
    event.stopPropagation()
    actions.handleCycleCategory()
    return true
  }

  const hotbarSlotIndex = HOTBAR_KEYS.indexOf(key)
  if (hotbarSlotIndex !== -1) {
    event.preventDefault()
    event.stopPropagation()
    actions.handleHotbarKey?.(hotbarSlotIndex)
    return true
  }

  return handleConfirmKey(event, key, config)
}
