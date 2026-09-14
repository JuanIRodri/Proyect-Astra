import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT } from './constants'

export const ISO_HALF_W = TILE_SIZE / 2
export const ISO_HALF_H = TILE_SIZE / 4

let worldBounds = null

export function isoProject(u, v) {
  return {
    x: (u - v) * ISO_HALF_W + ISO_HALF_W,
    y: (u + v) * ISO_HALF_H + ISO_HALF_H,
  }
}

export function isoUnproject(x, y) {
  const a = (x - ISO_HALF_W) / ISO_HALF_W
  const b = (y - ISO_HALF_H) / ISO_HALF_H
  return {
    u: (a + b) / 2,
    v: (b - a) / 2,
  }
}

export function isoWorldBounds() {
  if (worldBounds) return worldBounds
  const corners = [
    isoProject(0, 0),
    isoProject(GRID_WIDTH - 1, 0),
    isoProject(0, GRID_HEIGHT - 1),
    isoProject(GRID_WIDTH - 1, GRID_HEIGHT - 1),
  ]
  const xs = corners.map((corner) => corner.x)
  const ys = corners.map((corner) => corner.y)
  worldBounds = {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  }
  return worldBounds
}