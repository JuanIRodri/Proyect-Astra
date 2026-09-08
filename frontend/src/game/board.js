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

export function canOccupy(x, y) {
  const radius = TOKEN_RADIUS
  const worldWidth = GRID_WIDTH * TILE_SIZE
  const worldHeight = GRID_HEIGHT * TILE_SIZE

  if (x < radius || x > worldWidth - radius || y < radius || y > worldHeight - radius) return false

  const wall = getWallBounds()
  return !(x + radius > wall.left && x - radius < wall.right && y + radius > wall.top && y - radius < wall.bottom)
}