import { WORLD_DEPTH_BASE } from './constants'
import { isoProject } from './isometric'

const SHADOW = 0x000000
const SHADOW_ALPHA = 0.28
const TRUNK = 0x5b3a1e
const FOLIAGE = 0x2e6b2e
const FOLIAGE_LIGHT = 0x3c8a3c
const FOLIAGE_DARK = 0x1c451c
const BUSH_LIGHT = 0x458f45

export const DECOR_DATA = [
  { x: 10, y: 4, kind: 'arbol' },
  { x: 21, y: 5, kind: 'arbol' },
  { x: 8, y: 17, kind: 'arbol' },
  { x: 30, y: 5, kind: 'arbol' },
  { x: 7, y: 10, kind: 'arbol' },
  { x: 24, y: 13, kind: 'arbol' },
  { x: 33, y: 3, kind: 'arbol' },
  { x: 2, y: 13, kind: 'arbol' },
  { x: 14, y: 18, kind: 'arbol' },
  { x: 2, y: 7, kind: 'arbusto' },
  { x: 12, y: 9, kind: 'arbusto' },
  { x: 27, y: 7, kind: 'arbusto' },
  { x: 18, y: 15, kind: 'arbusto' },
  { x: 28, y: 19, kind: 'arbusto' },
  { x: 5, y: 16, kind: 'arbusto' },
  { x: 33, y: 20, kind: 'arbusto' },
  { x: 23, y: 2, kind: 'arbusto' },
]

function drawShadow(graphics) {
  graphics.fillStyle(SHADOW, SHADOW_ALPHA)
  graphics.fillEllipse(0, 0, 30, 12)
}

function drawArbol(graphics) {
  drawShadow(graphics)
  graphics.fillStyle(TRUNK, 1)
  graphics.fillRect(-5, -20, 10, 20)
  const blobs = [
    { x: 0, y: -34, radius: 16, color: FOLIAGE },
    { x: -9, y: -24, radius: 12, color: FOLIAGE_LIGHT },
    { x: 9, y: -24, radius: 12, color: FOLIAGE_DARK },
    { x: 0, y: -22, radius: 13, color: FOLIAGE },
  ]
  blobs.forEach(({ x, y, radius, color }) => {
    graphics.fillStyle(color, 1)
    graphics.fillCircle(x, y, radius)
  })
}

function drawArbusto(graphics) {
  drawShadow(graphics)
  const blobs = [
    [-8, -10, 11, FOLIAGE_LIGHT],
    [7, -10, 11, BUSH_LIGHT],
    [0, -6, 12, FOLIAGE],
  ]
  blobs.forEach(([x, y, radius, color]) => {
    graphics.fillStyle(color, 1)
    graphics.fillCircle(x, y, radius)
  })
}

export function createDecor(scene, entries = DECOR_DATA) {
  const containers = entries.map((entry) => {
    const position = isoProject(entry.x, entry.y)
    const graphics = scene.add.graphics()
    if (entry.kind === 'arbusto') {
      drawArbusto(graphics)
    } else {
      drawArbol(graphics)
    }
    const container = scene.add.container(position.x, position.y, [graphics])
    container.setDepth(WORLD_DEPTH_BASE + position.y)
    return container
  })
  return containers
}