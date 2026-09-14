import { GRID_WIDTH, GRID_HEIGHT, getPartyColorForClass } from './constants'
import { getBlockedTiles } from './collision'
import { isoProject, isoWorldBounds, ISO_HALF_W, ISO_HALF_H } from './isometric'

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
  const bounds = isoWorldBounds()
  const isoWidth = bounds.maxX - bounds.minX
  const isoHeight = bounds.maxY - bounds.minY
  const base = Math.min(width / isoWidth, height / isoHeight)
  const scale = base * zoom
  return {
    base,
    scale,
    visibleTilesW: width / (scale * ISO_HALF_W),
    visibleTilesH: height / (scale * ISO_HALF_H),
  }
}

export function clampOffset(offset = { x: 0, y: 0 }, width, height, zoom = MIN_MAP_ZOOM) {
  const { visibleTilesW, visibleTilesH } = viewMetrics(width, height, zoom)
  const maxU = Math.max(0, GRID_WIDTH - visibleTilesW)
  const maxV = Math.max(0, GRID_HEIGHT - visibleTilesH)
  return {
    x: clamp(offset.x, 0, maxU),
    y: clamp(offset.y, 0, maxV),
  }
}

export function calculateFollowOffset({ width, height, zoom = MIN_MAP_ZOOM, positions = [], leaderIndex = 0 }) {
  const position = positions[leaderIndex]
  if (!position) return clampOffset({ x: 0, y: 0 }, width, height, zoom)
  if (zoom <= MIN_MAP_ZOOM) return clampOffset({ x: 0, y: 0 }, width, height, zoom)
  const { visibleTilesW, visibleTilesH } = viewMetrics(width, height, zoom)
  return clampOffset(
    {
      x: position.x - visibleTilesW / 2,
      y: position.y - visibleTilesH / 2,
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
  const { scale } = viewMetrics(width, height, zoom)
  const off = clampOffset(offset, width, height, zoom)
  const base = isoWorldBounds()
  const origin = isoProject(off.x, off.y)

  context.clearRect(0, 0, width, height)
  context.fillStyle = BACKGROUND_COLOR
  context.fillRect(0, 0, width, height)

  const project = (isoPoint) => ({
    x: (isoPoint.x - origin.x - base.minX) * scale,
    y: (isoPoint.y - origin.y - base.minY) * scale,
  })

  context.strokeStyle = GRID_COLOR
  context.lineWidth = 1

  for (let u = 0; u <= GRID_WIDTH; u += 1) {
    const a = project(isoProject(u, 0))
    const b = project(isoProject(u, GRID_HEIGHT - 1))
    context.beginPath()
    context.moveTo(a.x, a.y)
    context.lineTo(b.x, b.y)
    context.stroke()
  }

  for (let v = 0; v <= GRID_HEIGHT; v += 1) {
    const a = project(isoProject(0, v))
    const b = project(isoProject(GRID_WIDTH - 1, v))
    context.beginPath()
    context.moveTo(a.x, a.y)
    context.lineTo(b.x, b.y)
    context.stroke()
  }

  context.fillStyle = WALL_COLOR
  getBlockedTiles().forEach((tile) => {
    const center = project(isoProject(tile.x, tile.y))
    context.beginPath()
    context.moveTo(center.x, center.y - ISO_HALF_H * scale)
    context.lineTo(center.x + ISO_HALF_W * scale, center.y)
    context.lineTo(center.x, center.y + ISO_HALF_H * scale)
    context.lineTo(center.x - ISO_HALF_W * scale, center.y)
    context.closePath()
    context.fill()
  })

  positions.forEach((position, index) => {
    const isLeader = index === leaderIndex
    const center = project(isoProject(position.x, position.y))
    const radius = isLeader ? Math.max(5, scale * 0.17) : Math.max(3.8, scale * 0.13)

    context.beginPath()
    context.arc(center.x, center.y, radius, 0, Math.PI * 2)
    context.fillStyle = toCssColor(getPartyColorForClass(personajes?.[index]?.clase))
    context.fill()
    context.lineWidth = isLeader ? 2.2 : 1.4
    context.strokeStyle = isLeader ? LEADER_COLOR : FOLLOWER_COLOR
    context.stroke()
  })
}