export const LEADER_KEYS = {
  '1': 0,
  '2': 1,
  '3': 2,
  digit1: 0,
  digit2: 1,
  digit3: 2,
}

export function getLeaderIndex(event) {
  const key = event.key.toLowerCase()
  const code = event.code.toLowerCase()
  return LEADER_KEYS[key] ?? LEADER_KEYS[code]
}