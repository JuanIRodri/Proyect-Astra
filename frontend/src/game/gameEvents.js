export const GAME_EVENTS = Object.freeze({
  explorationStatus: 'exploration-status',
  openCharacterEditor: 'open-character-editor',
})

export function emitGameEvent(eventName, detail) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }))
}

export function emitExplorationStatus(message) {
  emitGameEvent(GAME_EVENTS.explorationStatus, { message })
}

export function emitCharacterEditorRequest(characterId) {
  emitGameEvent(GAME_EVENTS.openCharacterEditor, { characterId })
}

export function subscribeToGameEvent(eventName, handler) {
  const listener = (event) => handler(event.detail)
  window.addEventListener(eventName, listener)
  return () => window.removeEventListener(eventName, listener)
}