import { emitInventoryToggle } from './gameEvents'
import { getLeaderIndex } from './hotkeys'
import { isInputLocked } from './inputLock'

export function createKeyHandler(scene) {
  return (event) => {
    if (isInputLocked()) return

    const key = event.key.toLowerCase()
    const code = event.code.toLowerCase()
    const leader = getLeaderIndex(event)
    if (leader !== undefined) {
      scene.setLeader(leader)
      return
    }

    if (key === 'u' || code === 'keyu') {
      scene.emitCharacterEditorRequest()
      return
    }

    if (key === 'i' || code === 'keyi') {
      emitInventoryToggle()
    }
  }
}