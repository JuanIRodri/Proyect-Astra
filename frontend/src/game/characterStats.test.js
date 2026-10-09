import { describe, it, expect } from 'vitest'
import { getInitialStatsForClass } from './characterStats'

const STATS = ['fuerza', 'destreza', 'inteligencia', 'constitucion', 'agilidad']

function pointSpread(stats) {
  return STATS.reduce((total, stat) => total + (stats[stat] - 10), 0)
}

describe('getInitialStatsForClass', () => {
  it('nivel 1 reparte los 10 puntos base: todas las stats en 10 o más', () => {
    const stats = getInitialStatsForClass('Guerrero', 1)
    expect(pointSpread(stats)).toBe(10)
    expect(STATS.every((stat) => stats[stat] >= 10)).toBe(true)
  })

  it('conserva los puntos totales (10 + (nivel-1)*3) para cualquier clase y nivel', () => {
    const cases = [
      ['Guerrero', 1],
      ['Mago', 2],
      ['Pícaro', 5],
      ['Paladín', 10],
      ['Cazador', 3],
    ]
    for (const [clase, nivel] of cases) {
      const stats = getInitialStatsForClass(clase, nivel)
      expect(pointSpread(stats)).toBe(10 + (nivel - 1) * 3)
      expect(STATS.every((stat) => stats[stat] >= 10)).toBe(true)
    }
  })

  it('Mago prioriza inteligencia', () => {
    const stats = getInitialStatsForClass('Mago', 5)
    expect(stats.inteligencia).toBe(Math.max(...STATS.map((stat) => stats[stat])))
  })

  it('Guerrero y Paladín priorizan fuerza', () => {
    for (const clase of ['Guerrero', 'Paladín']) {
      const stats = getInitialStatsForClass(clase, 5)
      expect(stats.fuerza).toBeGreaterThanOrEqual(stats.destreza)
      expect(stats.fuerza).toBeGreaterThan(stats.inteligencia)
    }
  })

  it('Pícaro prioriza destreza', () => {
    const stats = getInitialStatsForClass('Pícaro', 5)
    expect(stats.destreza).toBe(Math.max(...STATS.map((stat) => stats[stat])))
  })

  it('una clase desconocida usa pesos neutros', () => {
    const stats = getInitialStatsForClass('Aventurero', 4)
    expect(pointSpread(stats)).toBe(19)
    expect(stats.fuerza).toBeGreaterThanOrEqual(10)
  })
})