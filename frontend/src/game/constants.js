export const TILE_SIZE = 48
export const GRID_WIDTH = 36
export const GRID_HEIGHT = 22

export const PARTY_CLASS_COLORS = {
  guerrero: 0xef4444,
  mago: 0x3b82f6,
  picaro: 0xa855f7,
  paladin: 0xeab308,
  cazador: 0x22c55e,
  aventurero: 0xc5a059,
}

export function getPartyColorForClass(clase) {
  const key = (clase || 'aventurero')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
  return PARTY_CLASS_COLORS[key] || PARTY_CLASS_COLORS.aventurero
}

export const PARTY_POSITIONS = [
  { x: 5, y: 4 },
  { x: 4, y: 4 },
  { x: 3, y: 4 },
]

export const MOVEMENT_SPEED = 180
export const TRAIL_LENGTH = 42
export const FOLLOWER_SPACING = 14
export const FOLLOWER_SMOOTHING = 0.18

export const TOKEN_RADIUS = 15
export const LEADER_MARKER_SIZE = TILE_SIZE - 6

export const CAMERA_ZOOM = 0.72
export const CAMERA_SMOOTHNESS = 0.12

export const WALL_TILES = [
  { x: 16, y: 7 },
  { x: 16, y: 8 },
  { x: 16, y: 9 },
]