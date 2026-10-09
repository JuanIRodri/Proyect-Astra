import { describe, it, expect, beforeEach } from 'vitest'
import { setBlockedTiles } from './collision'
import { getSafePositions } from './board'

describe('getSafePositions', () => {
  beforeEach(() => {
    setBlockedTiles([])
  })

  it('conserva las posiciones libres tal cual', () => {
    expect(getSafePositions([{ x: 5, y: 4 }, { x: 4, y: 4 }])).toEqual([
      { x: 5, y: 4 },
      { x: 4, y: 4 },
    ])
  })

  it('reubica una ficha que cayó dentro de un tile bloqueado', () => {
    setBlockedTiles([{ x: 5, y: 4, kind: 'roca' }])
    const safe = getSafePositions([{ x: 5, y: 4 }])
    expect(safe[0]).not.toEqual({ x: 5, y: 4 })
    expect(safe).toHaveLength(1)
  })

  it('no deja dos fichas en la misma casilla', () => {
    const safe = getSafePositions([{ x: 3, y: 3 }, { x: 3, y: 3 }])
    const keys = new Set(safe.map((position) => `${position.x},${position.y}`))
    expect(keys.size).toBe(2)
  })

  it('filtra entradas vacías', () => {
    expect(getSafePositions([null, undefined, { x: 1, y: 1 }])).toEqual([{ x: 1, y: 1 }])
  })
})