import { TOKEN_RADIUS } from './constants'
import { isoProject, isoWorldBounds } from './isometric'

export const OBJECT_RADII = {
  arbol: { rx: 10, ry: 9 },
  arbusto: { rx: 13, ry: 11 },
  roca: { rx: 14, ry: 9 },
}

let blockedObjects = []
let blockedSet = new Set()
let blockedVersion = 0
let blockedCenterCache = null

function objectShape(entry) {
  if (entry.rx !== undefined) return { rx: entry.rx, ry: entry.ry ?? entry.rx }
  return OBJECT_RADII[entry.kind] || OBJECT_RADII.roca
}

export function setBlockedTiles(tiles) {
  blockedObjects = (tiles || []).map((tile) => ({
    x: tile.x,
    y: tile.y,
    ...objectShape(tile),
  }))
  blockedSet = new Set(blockedObjects.map((tile) => `${Math.floor(tile.x)},${Math.floor(tile.y)}`))
  blockedVersion += 1
  blockedCenterCache = null
}

export function getBlockedTiles() {
  return Array.from(blockedSet).map((key) => {
    const [x, y] = key.split(',').map(Number)
    return { x, y }
  })
}

export function getBlockedTilesVersion() {
  return blockedVersion
}

export function isTileBlocked(tileX, tileY) {
  return blockedSet.has(`${Math.floor(tileX)},${Math.floor(tileY)}`)
}

function blockedCenters() {
  if (!blockedCenterCache) {
    blockedCenterCache = blockedObjects.map(({ x, y, rx, ry }) => {
      const point = isoProject(x, y)
      return { x: point.x, y: point.y, rx, ry }
    })
  }
  return blockedCenterCache
}

export function canOccupy(worldX, worldY) {
  const bounds = isoWorldBounds()
  if (worldX < bounds.minX + TOKEN_RADIUS || worldX > bounds.maxX - TOKEN_RADIUS) return false
  if (worldY < bounds.minY + TOKEN_RADIUS || worldY > bounds.maxY - TOKEN_RADIUS) return false
  return blockedCenters().every((object) => {
    const deltaX = (object.x - worldX) / object.rx
    const deltaY = (object.y - worldY) / object.ry
    return deltaX * deltaX + deltaY * deltaY >= 1
  })
}