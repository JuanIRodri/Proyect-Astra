import {
  PARTY_COLORS,
  PARTY_POSITIONS,
  TILE_SIZE,
  TOKEN_RADIUS,
  LEADER_MARKER_SIZE,
} from './constants'

const LEADER_STROKE = 0xffffff
const FOLLOWER_STROKE = 0x18202b
const STROKE_WIDTH = 3

export function buildPartyData(personajes = []) {
  return personajes.slice(0, 3).map((personaje, index) => ({
    id: personaje.idPersonaje,
    name: personaje.nombre || `Héroe #${personaje.idPersonaje}`,
    color: PARTY_COLORS[index],
  }))
}

export function createParty(scene, partyData) {
  const tokens = partyData.map((character, index) => {
    const position = PARTY_POSITIONS[index]
    const token = scene.add.circle(
      position.x * TILE_SIZE + TILE_SIZE / 2,
      position.y * TILE_SIZE + TILE_SIZE / 2,
      TOKEN_RADIUS,
      character.color,
    )
    token.setStrokeStyle(STROKE_WIDTH, index === 0 ? LEADER_STROKE : FOLLOWER_STROKE)
    token.setDepth(2)
    return token
  })

  const leaderMarker = scene.add.rectangle(0, 0, LEADER_MARKER_SIZE, LEADER_MARKER_SIZE)
  leaderMarker.setStrokeStyle(2, 0xffe28a)
  leaderMarker.setFillStyle(0xffffff, 0)
  leaderMarker.setDepth(1)

  return { tokens, leaderMarker }
}

export function updatePartyLeaderStyling(tokens, leaderIndex) {
  tokens.forEach((token, tokenIndex) => {
    token.setStrokeStyle(STROKE_WIDTH, tokenIndex === leaderIndex ? LEADER_STROKE : FOLLOWER_STROKE)
  })
}

export function updateLeaderMarker(tokens, leaderMarker, leaderIndex) {
  const leader = tokens[leaderIndex]
  leaderMarker.setPosition(leader.x, leader.y)
}