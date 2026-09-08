import { useEffect, useState } from 'react'
import { GAME_EVENTS, subscribeToGameEvent } from '../game/gameEvents'
import { PARTY_POSITIONS, TILE_SIZE } from '../game/constants'

function worldToTile(x) {
  return (x - TILE_SIZE / 2) / TILE_SIZE
}

export function usePartyPositions(partySize = 3) {
  const [positions, setPositions] = useState(() => (
    PARTY_POSITIONS.map((position) => ({ x: position.x, y: position.y }))
  ))
  const [leaderIndex, setLeaderIndex] = useState(0)

  useEffect(() => {
    const unsubscribe = subscribeToGameEvent(
      GAME_EVENTS.partyPositionUpdate,
      ({ positions: nextPositions, leaderIndex: nextLeader }) => {
        setPositions(
          nextPositions.slice(0, partySize).map((position) => ({
            x: worldToTile(position.x),
            y: worldToTile(position.y),
          })),
        )
        setLeaderIndex(nextLeader)
      },
    )
    return unsubscribe
  }, [partySize])

  return { positions, leaderIndex }
}