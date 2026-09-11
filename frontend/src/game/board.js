import {
  TILE_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
  TOKEN_RADIUS,
  WALL_TILES,
} from './constants'

function getWallBounds() {
  const wallLeft = 16 * TILE_SIZE
  return {
    left: wallLeft,
    right: wallLeft + TILE_SIZE,
    top: 7 * TILE_SIZE,
    bottom: 10 * TILE_SIZE,
  }
}

export function drawBoard(scene) {
  const board = scene.add.graphics()
  const worldWidth = GRID_WIDTH * TILE_SIZE
  const worldHeight = GRID_HEIGHT * TILE_SIZE

  board.fillStyle(0x172536, 1)
  board.fillRect(0, 0, worldWidth, worldHeight)
  board.lineStyle(1, 0x37506a, 0.75)

  for (let x = 0; x <= GRID_WIDTH; x += 1) {
    board.lineBetween(x * TILE_SIZE, 0, x * TILE_SIZE, worldHeight)
  }

  for (let y = 0; y <= GRID_HEIGHT; y += 1) {
    board.lineBetween(0, y * TILE_SIZE, worldWidth, y * TILE_SIZE)
  }

  board.fillStyle(0x3d5264, 1)
  WALL_TILES.forEach((tile) => {
    board.fillRect(tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
  })
}

export function createGridOverlay(scene) {
  const overlay = scene.add.graphics()
  const worldWidth = GRID_WIDTH * TILE_SIZE
  const worldHeight = GRID_HEIGHT * TILE_SIZE

  overlay.fillStyle(0xffffff, 0.03)
  overlay.fillRect(0, 0, worldWidth, worldHeight)
  overlay.lineStyle(1, 0xd6dde8, 0.35)

  for (let x = 0; x <= GRID_WIDTH; x += 1) {
    overlay.lineBetween(x * TILE_SIZE, 0, x * TILE_SIZE, worldHeight)
  }

  for (let y = 0; y <= GRID_HEIGHT; y += 1) {
    overlay.lineBetween(0, y * TILE_SIZE, worldWidth, y * TILE_SIZE)
  }

  overlay.setDepth(0.5)
  return overlay
}

export function canOccupy(x, y) {
  const radius = TOKEN_RADIUS
  const worldWidth = GRID_WIDTH * TILE_SIZE
  const worldHeight = GRID_HEIGHT * TILE_SIZE

  if (x < radius || x > worldWidth - radius || y < radius || y > worldHeight - radius) return false

  const wall = getWallBounds()
  return !(x + radius > wall.left && x - radius < wall.right && y + radius > wall.top && y - radius < wall.bottom)
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

function tileToWorld(tile) {
  return {
    x: tile.x * TILE_SIZE + TILE_SIZE / 2,
    y: tile.y * TILE_SIZE + TILE_SIZE / 2,
  }
}

function isTileBlocked(tile) {
  const world = tileToWorld(tile)
  return !canOccupy(world.x, world.y)
}

function resolveSafeTile(tile, used) {
  if (!isTileBlocked(tile) && !used.has(`${tile.x},${tile.y}`)) {
    return { x: tile.x, y: tile.y }
  }
  const free = findNearestFreeTile(tile, (candidate) => (
    !isTileBlocked(candidate) && !used.has(`${candidate.x},${candidate.y}`)
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