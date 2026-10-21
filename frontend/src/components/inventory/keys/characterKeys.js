import { getLeaderIndex } from '@/game/hotkeys'

export function handleCharacterKey(event, key, config) {
  const { state, actions } = config

  const characterIndex = getLeaderIndex(event)
  if (characterIndex !== undefined && characterIndex < state.characterListLength) {
    event.preventDefault()
    event.stopPropagation()
    actions.handleCharacterChange(characterIndex)
    return true
  }

  if (key === 'tab') {
    event.preventDefault()
    event.stopPropagation()
    const direction = event.shiftKey ? -1 : 1
    const nextIndex = (state.activeCharacterIndex + direction + state.characterListLength) % state.characterListLength
    actions.handleCharacterChange(nextIndex)
    return true
  }

  return false
}
