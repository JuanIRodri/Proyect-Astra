export const GAME_EVENTS = {
  explorationStatus: 'exploration-status',
  openCharacterEditor: 'open-character-editor',
}

export function emitGameEvent(eventName, detail) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }))
}

export function subscribeToGameEvent(eventName, handler) {
  const listener = (event) => handler(event.detail)
  window.addEventListener(eventName, listener)
  return () => window.removeEventListener(eventName, listener)
}