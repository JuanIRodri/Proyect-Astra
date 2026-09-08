const lockReasons = new Set()

export function lockInput(reason) {
  lockReasons.add(reason)
}

export function unlockInput(reason) {
  lockReasons.delete(reason)
}

export function isInputLocked() {
  return lockReasons.size > 0
}