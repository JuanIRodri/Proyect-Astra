import { useEffect, useState } from 'react'
import { GAME_EVENTS, subscribeToGameEvent } from '../game/gameEvents'
import { PARTY_POSITIONS } from '../game/constants'

export function usePartyPositions(partySize = 3, initialPositions, initialLeaderIndex = 0) {
  const [positions, setPositions] = useState(() => {
    const base = initialPositions?.length
      ? initialPositions
      : PARTY_POSITIONS
    return base.slice(0, partySize).map((position) => ({ x: position.x, y: position.y }))
  })
  const [leaderIndex, setLeaderIndex] = useState(initialLeaderIndex)

  useEffect(() => {
    const unsubscribe = subscribeToGameEvent(
      GAME_EVENTS.partyPositionUpdate,
      ({ positions: nextPositions, leaderIndex: nextLeader }) => {
        setPositions(nextPositions.slice(0, partySize).map((position) => ({ x: position.x, y: position.y })))
        setLeaderIndex(nextLeader)
      },
    )
    return unsubscribe
  }, [partySize])

  return { positions, leaderIndex }
}