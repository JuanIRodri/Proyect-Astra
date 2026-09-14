import { GRID_WIDTH, GRID_HEIGHT, WALL_TILES, getPartyColorForClass } from './constants'

export const MIN_MAP_ZOOM = 1
export const DEFAULT_MAP_ZOOM = 2
export const MAP_ZOOM_LEVELS = [MIN_MAP_ZOOM, 1.25, 1.6, DEFAULT_MAP_ZOOM, 2.6, 3.2, 4]
export const MAX_MAP_ZOOM = MAP_ZOOM_LEVELS[MAP_ZOOM_LEVELS.length - 1]

const BACKGROUND_COLOR = '#172536'
const GRID_COLOR = 'rgba(55, 80, 106, 0.55)'
const WALL_COLOR = '#3d5264'
const LEADER_COLOR = '#ffffff'
const FOLLOWER_COLOR = 'rgba(255, 255, 255, 0.45)'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function toCssColor(hex) {
  return `#${hex.toString(16).padStart(6, '0')}`
}

export function viewMetrics(width, height, zoom = MIN_MAP_ZOOM) {
  const base = Math.min(width / GRID_WIDTH, height / GRID_HEIGHT)
  const scale = base * zoom
  return {
    base,
    scale,
    visibleTilesW: width / scale,
    visibleTilesH: height / scale,
  }
}

export function clampOffset(offset = { x: 0, y: 0 }, width, height, zoom = MIN_MAP_ZOOM) {
  const { visibleTilesW, visibleTilesH } = viewMetrics(width, height, zoom)
  return {
    x: clamp(offset.x, 0, Math.max(0, GRID_WIDTH - visibleTilesW)),
    y: clamp(offset.y, 0, Math.max(0, GRID_HEIGHT - visibleTilesH)),
  }
}

export function calculateFollowOffset({ width, height, zoom = MIN_MAP_ZOOM, positions = [], leaderIndex = 0 }) {
  if (zoom <= MIN_MAP_ZOOM) return clampOffset({ x: 0, y: 0 }, width, height, zoom)
  const position = positions[leaderIndex]
  if (!position) return clampOffset({ x: 0, y: 0 }, width, height, zoom)
  const metrics = viewMetrics(width, height, zoom)
  return clampOffset(
    {
      x: position.x + 0.5 - metrics.visibleTilesW / 2,
      y: position.y + 0.5 - metrics.visibleTilesH / 2,
    },
    width,
    height,
    zoom,
  )
}

export function drawMapCanvas(context, {
  width,
  height,
  zoom = MIN_MAP_ZOOM,
  offset,
  positions = [],
  leaderIndex = 0,
  personajes = [],
}) {
  const { scale, visibleTilesW, visibleTilesH } = viewMetrics(width, height, zoom)
  const off = clampOffset(offset, width, height, zoom)

  context.clearRect(0, 0, width, height)
  context.fillStyle = BACKGROUND_COLOR
  context.fillRect(0, 0, width, height)

  const firstCol = Math.max(0, Math.floor(off.x))
  const lastCol = Math.min(GRID_WIDTH, Math.ceil(off.x + visibleTilesW))
  const firstRow = Math.max(0, Math.floor(off.y))
  const lastRow = Math.min(GRID_HEIGHT, Math.ceil(off.y + visibleTilesH))

  context.strokeStyle = GRID_COLOR
  context.lineWidth = 1
  context.beginPath()
  for (let x = firstCol; x <= lastCol; x += 1) {
    const px = Math.round((x - off.x) * scale) + 0.5
    context.moveTo(px, 0)
    context.lineTo(px, height)
  }
  for (let y = firstRow; y <= lastRow; y += 1) {
    const py = Math.round((y - off.y) * scale) + 0.5
    context.moveTo(0, py)
    context.lineTo(width, py)
  }
  context.stroke()

  context.fillStyle = WALL_COLOR
  WALL_TILES.forEach((tile) => {
    const left = (tile.x - off.x) * scale
    const top = (tile.y - off.y) * scale
    if (left + scale < 0 || top + scale < 0 || left > width || top > height) return
    context.fillRect(left, top, scale, scale)
  })

  positions.forEach((position, index) => {
    const isLeader = index === leaderIndex
    const centerX = (position.x + 0.5 - off.x) * scale
    const centerY = (position.y + 0.5 - off.y) * scale
    const radius = isLeader ? Math.max(5, scale * 0.17) : Math.max(3.8, scale * 0.13)

    context.beginPath()
    context.arc(centerX, centerY, radius, 0, Math.PI * 2)
    context.fillStyle = toCssColor(getPartyColorForClass(personajes?.[index]?.clase))
    context.fill()
    context.lineWidth = isLeader ? 2.2 : 1.4
    context.strokeStyle = isLeader ? LEADER_COLOR : FOLLOWER_COLOR
    context.stroke()
  })
}