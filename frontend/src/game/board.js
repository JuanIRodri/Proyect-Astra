import { GRID_WIDTH, GRID_HEIGHT } from './constants'
import { canOccupy, isTileBlocked } from './collision'
import { isoProject } from './isometric'

export { canOccupy }

export function createGridOverlay(scene) {
  const overlay = scene.add.graphics()
  const corners = [
    isoProject(0, 0),
    isoProject(GRID_WIDTH - 1, 0),
    isoProject(GRID_WIDTH - 1, GRID_HEIGHT - 1),
    isoProject(0, GRID_HEIGHT - 1),
  ]

  overlay.fillStyle(0xffffff, 0.03)
  overlay.fillPoints(corners, true, true)
  overlay.lineStyle(1, 0xd6dde8, 0.35)

  for (let u = 0; u <= GRID_WIDTH; u += 1) {
    const a = isoProject(u, 0)
    const b = isoProject(u, GRID_HEIGHT - 1)
    overlay.lineBetween(a.x, a.y, b.x, b.y)
  }

  for (let v = 0; v <= GRID_HEIGHT; v += 1) {
    const a = isoProject(0, v)
    const b = isoProject(GRID_WIDTH - 1, v)
    overlay.lineBetween(a.x, a.y, b.x, b.y)
  }

  overlay.setDepth(0.5)
  return overlay
}

export function getSafePositions(positions) {
  const used = new Map()
  return (positions || [])
    .filter(Boolean)
    .map((position) => {
      const safe = resolveSafeTile({ x: position.x, y: position.y }, used)
      used.set(`${safe.x},${safe.y}`, true)
      return safe
    })
}

function resolveSafeTile(tile, used) {
  if (!isTileBlocked(tile.x, tile.y) && !used.has(`${tile.x},${tile.y}`)) {
    return { x: tile.x, y: tile.y }
  }
  const free = findNearestFreeTile(tile, (candidate) => (
    !isTileBlocked(candidate.x, candidate.y) && !used.has(`${candidate.x},${candidate.y}`)
  ))
  return free || { x: tile.x, y: tile.y }
}

function findNearestFreeTile(origin, isFree) {
  const searchRadius = 8
  const candidates = []
  for (let dy = -searchRadius; dy <= searchRadius; dy += 1) {
    for (let dx = -searchRadius; dx <= searchRadius; dx += 1) {
      if (dx === 0 && dy === 0) continue
      candidates.push({ tile: { x: origin.x + dx, y: origin.y + dy }, distance: Math.hypot(dx, dy) })
    }
  }
  candidates.sort((a, b) => a.distance - b.distance)
  const nearest = candidates.find(({ tile }) => isFree(tile))
  return nearest ? nearest.tile : null
}