export function handleConfirmKey(event, key, config) {
  if (key !== 'enter' && key !== ' ') return false

  const { state, actions } = config

  event.preventDefault()
  event.stopPropagation()

  if (state.navigationArea === 'equipment') {
    if (state.selectedEquipmentItem) {
      actions.setShowItemDetails(true)
    } else {
      actions.setNotice('Esta ranura de equipamiento está vacía.')
    }
    return true
  }

  if (state.heldSlotIndex !== null) {
    if (state.heldSlotIndex === state.cursorSlotIndex) {
      actions.setHeldSlotIndex(null)
      actions.setNotice('Movimiento cancelado.')
      return true
    }
    actions.handleMoveItem(state.heldSlotIndex, state.cursorSlotIndex)
    actions.setHeldSlotIndex(null)
    return true
  }

  const item = state.items[state.cursorSlotIndex]
  if (item) {
    actions.setSelectedSlotIndex(state.cursorSlotIndex)
    actions.setHeldSlotIndex(state.cursorSlotIndex)
    actions.setShowItemDetails(false)
    actions.setNotice(`${item.name}: objeto preparado para mover.`)
  } else {
    actions.setSelectedSlotIndex(state.cursorSlotIndex)
    actions.setShowItemDetails(false)
    actions.setNotice('Espacio vacío seleccionado.')
  }
  return true
}
