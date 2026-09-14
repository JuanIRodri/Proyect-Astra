let positions = []
let leaderIndex = 0

export function setPartyPositionsStore(nextPositions, nextLeaderIndex) {
  positions = nextPositions
  leaderIndex = nextLeaderIndex
}

export function getPartyPositionsSnapshot() {
  return { positions, leaderIndex }
}