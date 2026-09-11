import { eventKeyToBinding, loadBindings } from './bindings'

export function getLeaderIndex(event) {
  const bindings = loadBindings()
  const key = eventKeyToBinding(event)
  if (!key) return undefined
  if (key === bindings.lider1) return 0
  if (key === bindings.lider2) return 1
  if (key === bindings.lider3) return 2
  return undefined
}