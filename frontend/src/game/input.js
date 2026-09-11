import { emitInventoryToggle } from './gameEvents'
import { getLeaderIndex } from './hotkeys'
import { isInputLocked } from './inputLock'
import { eventKeyToBinding, loadBindings } from './bindings'

export function createKeyHandler(scene) {
  return (event) => {
    if (isInputLocked()) return

    const leader = getLeaderIndex(event)
    if (leader !== undefined) {
      scene.setLeader(leader)
      return
    }

    const bindings = loadBindings()
    const key = eventKeyToBinding(event)
    if (!key) return

    if (key === bindings.editarStats) {
      scene.emitCharacterEditorRequest()
      return
    }

    if (key === bindings.inventario) {
      emitInventoryToggle()
    }
  }
}