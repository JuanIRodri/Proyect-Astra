import { getLeaderIndex } from '@/game/hotkeys'
import { handleActionKey } from './keys/actionKeys'
import { handleCharacterKey } from './keys/characterKeys'
import { handleContextMenuKey } from './keys/contextMenuKeys'
import { handleMovementKey } from './keys/movementKeys'

function isEditableTarget(target) {
  if (!target || typeof target.tagName !== 'string') return false
  return target.tagName === 'INPUT'
    || target.tagName === 'SELECT'
    || Boolean(target.classList?.contains('inventory-filter-control'))
}

export function createInventoryKeyHandler(config) {
  const { state, actions } = config

  return (event) => {
    if (isEditableTarget(event.target)) return

    const key = event.key.toLowerCase()

    if (state.contextMenuActive) {
      handleContextMenuKey(event, key, config)
      return
    }

    if (state.showItemDetails) {
      event.preventDefault()
      event.stopPropagation()
      if (key === 'escape') actions.handleCloseDetails()
      return
    }

    if (state.transferPromptActive) {
      if (key === 'escape') {
        event.preventDefault()
        event.stopPropagation()
        actions.setTransferPromptActive(false)
        actions.setNotice('Traspaso cancelado.')
        return
      }
      const targetIndex = getLeaderIndex(event)
      if (targetIndex !== undefined && targetIndex < state.characterListLength) {
        event.preventDefault()
        event.stopPropagation()
        actions.handleTransferSelected(targetIndex)
        return
      }
    }

    if (handleActionKey(event, key, config)) return
    if (handleCharacterKey(event, key, config)) return
    handleMovementKey(event, key, config)
  }
}
