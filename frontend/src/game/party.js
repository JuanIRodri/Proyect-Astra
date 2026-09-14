import {
  getPartyColorForClass,
  PARTY_POSITIONS,
  LEADER_MARKER_SIZE,
  WORLD_DEPTH_BASE,
} from './constants'
import { isoProject } from './isometric'

const LEADER_STROKE = 0xffffff
const FOLLOWER_STROKE = 0x18202b
const STROKE_WIDTH = 3
const SHADOW_ALPHA = 0.25
const BODY_RADIUS = 11
const HEAD_RADIUS = 8
const BODY_OFFSET_Y = -13
const HEAD_OFFSET_Y = -28
const MARKER_OFFSET_Y = -14

function lighten(hexColor, amount) {
  const r = Math.min(255, ((hexColor >> 16) & 0xff) + amount)
  const g = Math.min(255, ((hexColor >> 8) & 0xff) + amount)
  const b = Math.min(255, (hexColor & 0xff) + amount)
  return (r << 16) | (g << 8) | b
}

export function buildPartyData(personajes = []) {
  return personajes.slice(0, 3).map((personaje) => ({
    id: personaje.idPersonaje,
    name: personaje.nombre || `Héroe #${personaje.idPersonaje}`,
    clase: personaje.clase,
    color: getPartyColorForClass(personaje.clase),
  }))
}

function createCharacterToken(scene, color, stroke) {
  const graphics = scene.add.graphics()
  graphics.fillStyle(0x000000, SHADOW_ALPHA)
  graphics.fillEllipse(0, 3, 30, 10)

  graphics.fillStyle(color, 1)
  graphics.fillCircle(0, BODY_OFFSET_Y, BODY_RADIUS)
  graphics.lineStyle(STROKE_WIDTH, stroke, 1)
  graphics.strokeCircle(0, BODY_OFFSET_Y, BODY_RADIUS)

  const headColor = lighten(color, 40)
  graphics.fillStyle(headColor, 1)
  graphics.fillCircle(0, HEAD_OFFSET_Y, HEAD_RADIUS)
  graphics.lineStyle(STROKE_WIDTH, stroke, 1)
  graphics.strokeCircle(0, HEAD_OFFSET_Y, HEAD_RADIUS)

  const token = scene.add.container(0, 0, [graphics])
  token.color = color
  token.headColor = headColor
  return token
}

function strokeToken(tokens, tokenIndex, stroke) {
  const token = tokens[tokenIndex]
  if (!token?.list?.[0]) return
  const graphics = token.list[0]
  graphics.lineStyle(STROKE_WIDTH, stroke, 1)
  graphics.strokeCircle(0, BODY_OFFSET_Y, BODY_RADIUS)
  graphics.strokeCircle(0, HEAD_OFFSET_Y, HEAD_RADIUS)
}

export function createParty(scene, partyData, positions = PARTY_POSITIONS) {
  const tokens = partyData.map((character, index) => {
    const position = positions[index] || PARTY_POSITIONS[index]
    const screen = isoProject(position.x, position.y)
    const token = createCharacterToken(scene, character.color, index === 0 ? LEADER_STROKE : FOLLOWER_STROKE)
    token.setPosition(screen.x, screen.y)
    token.setDepth(WORLD_DEPTH_BASE + screen.y)
    return token
  })

  const leaderMarker = scene.add.rectangle(0, 0, LEADER_MARKER_SIZE, LEADER_MARKER_SIZE)
  leaderMarker.setStrokeStyle(2, 0xffe28a)
  leaderMarker.setFillStyle(0xffffff, 0)
  leaderMarker.setDepth(WORLD_DEPTH_BASE)

  return { tokens, leaderMarker }
}

export function updatePartyLeaderStyling(tokens, leaderIndex) {
  tokens.forEach((token, tokenIndex) => {
    strokeToken(tokens, tokenIndex, tokenIndex === leaderIndex ? LEADER_STROKE : FOLLOWER_STROKE)
  })
}

export function updateLeaderMarker(tokens, leaderMarker, leaderIndex) {
  const leader = tokens[leaderIndex]
  leaderMarker.setPosition(leader.x, leader.y + MARKER_OFFSET_Y)
  leaderMarker.setDepth(leader.depth)
}