import { describe, it, expect, beforeEach } from 'vitest'
import {
  setBlockedTiles,
  getBlockedTiles,
  isTileBlocked,
  canOccupy,
} from './collision'

describe('setBlockedTiles', () => {
  beforeEach(() => {
    setBlockedTiles([])
  })

  it('registra tiles bloqueados y los reporta aún con coordenadas flotantes', () => {
    setBlockedTiles([{ x: 5, y: 4, kind: 'roca' }, { x: 3.9, y: 2.1, kind: 'arbol' }])
    expect(isTileBlocked(5, 4)).toBe(true)
    expect(isTileBlocked(3, 2)).toBe(true)
    expect(isTileBlocked(1, 1)).toBe(false)
    expect(getBlockedTiles()).toEqual([{ x: 5, y: 4 }, { x: 3, y: 2 }])
  })

  it('asigna forma personalizada cuando la trae el tile', () => {
    setBlockedTiles([{ x: 2, y: 2, rx: 20, ry: 4 }])
    const point = isoCenter(2, 2)
    expect(canOccupy(point.x + 10, point.y)).toBe(false)
    expect(canOccupy(point.x + 21, point.y)).toBe(true)
  })
})

describe('canOccupy', () => {
  beforeEach(() => {
    setBlockedTiles([])
  })

  it('respeta los límites del mundo con el radio del token', () => {
    expect(canOccupy(-500, 100)).toBe(false)
    expect(canOccupy(-465, 100)).toBe(true)
    expect(canOccupy(0, 5)).toBe(false)
    expect(canOccupy(0, 27)).toBe(true)
    expect(canOccupy(849, 660)).toBe(true)
    expect(canOccupy(850, 660)).toBe(false)
  })

  it('rechaza el centro de un objeto bloqueado', () => {
    setBlockedTiles([{ x: 5, y: 4, kind: 'roca' }])
    const center = isoCenter(5, 4)
    expect(canOccupy(center.x, center.y)).toBe(false)
    expect(canOccupy(center.x + 20, center.y)).toBe(true)
  })

  it('permite todo el mundo cuando no hay objetos bloqueados', () => {
    expect(canOccupy(0, 27)).toBe(true)
    expect(canOccupy(100, 200)).toBe(true)
  })
})

function isoCenter(u, v) {
  return {
    x: (u - v) * 24 + 24,
    y: (u + v) * 12 + 12,
  }
}