export const GAME_EVENTS = Object.freeze({
  openCharacterEditor: 'open-character-editor',
  toggleInventory: 'toggle-inventory',
  partyPositionUpdate: 'party-position-update',
  videoSettingsChange: 'video-settings-change',
  leaderChange: 'leader-change',
})

export function emitGameEvent(eventName, detail) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }))
}

export function emitCharacterEditorRequest(characterId) {
  emitGameEvent(GAME_EVENTS.openCharacterEditor, { characterId })
}

export function emitInventoryToggle() {
  emitGameEvent(GAME_EVENTS.toggleInventory, {})
}

export function emitPartyPositionUpdate(positions, leaderIndex) {
  emitGameEvent(GAME_EVENTS.partyPositionUpdate, { positions, leaderIndex })
}

export function emitVideoSettingsChange() {
  emitGameEvent(GAME_EVENTS.videoSettingsChange, {})
}

export function emitLeaderChange(index) {
  emitGameEvent(GAME_EVENTS.leaderChange, { index })
}

export function subscribeToGameEvent(eventName, handler) {
  const listener = (event) => handler(event.detail)
  window.addEventListener(eventName, listener)
  return () => window.removeEventListener(eventName, listener)
}