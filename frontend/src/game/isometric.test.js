import { describe, it, expect } from 'vitest'
import { isoProject, isoUnproject, isoWorldBounds } from './isometric'

describe('isoProject', () => {
  it('proyecta el centro del origen en (24, 12)', () => {
    expect(isoProject(0, 0)).toEqual({ x: 24, y: 12 })
  })

  it('proyecta (5, 4) en (48, 120)', () => {
    expect(isoProject(5, 4)).toEqual({ x: 48, y: 120 })
  })

  it('la equivalencia de arriba/unidad es (u-v)*24+24 y (u+v)*12+12', () => {
    expect(isoProject(3, 1)).toEqual({ x: (3 - 1) * 24 + 24, y: (3 + 1) * 12 + 12 })
  })
})

describe('isoUnproject', () => {
  it('invierte la proyección para varias casillas', () => {
    const tiles = [[0, 0], [5, 4], [10, 3], [35, 21]]
    for (const [u, v] of tiles) {
      const point = isoProject(u, v)
      const back = isoUnproject(point.x, point.y)
      expect(back.u).toBeCloseTo(u)
      expect(back.v).toBeCloseTo(v)
    }
  })
})

describe('isoWorldBounds', () => {
  it('calcula los límites del mundo isométrico (36×22 tiles)', () => {
    expect(isoWorldBounds()).toEqual({
      minX: -480,
      minY: 12,
      maxX: 864,
      maxY: 684,
    })
  })
})