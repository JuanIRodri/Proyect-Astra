import { EQUIPMENT_SLOTS, getNextEquipmentIndex } from '../inventoryUtils'
import { MOVEMENT_KEYS } from '../inventoryConstants'

export function handleMovementKey(event, key, config) {
  const movement = MOVEMENT_KEYS[key]
  if (!movement) return false

  const { state, actions } = config

  event.preventDefault()
  event.stopPropagation()

  if (state.navigationArea === 'equipment') {
    const nextIndex = getNextEquipmentIndex(state.equipmentCursorIndex, movement[0], movement[1])
    const equipmentSlot = EQUIPMENT_SLOTS[nextIndex]
    actions.setEquipmentCursorIndex(nextIndex)
    actions.setSelectedEquipmentSlot(equipmentSlot.key)
    actions.setSelectedSlotIndex(-1)
    actions.setShowItemDetails(false)
    return true
  }

  actions.moveSelection(movement[0], movement[1])
  return true
}
