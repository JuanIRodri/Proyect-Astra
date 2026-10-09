export const CLASS_WEIGHTS = {
  Guerrero: { f: 4, d: 1, i: 0.5, c: 3.5, a: 1 },
  Mago: { f: 0.5, d: 1, i: 6, c: 1, a: 1.5 },
  'Pícaro': { f: 2, d: 4.5, i: 1, c: 1, a: 1.5 },
  Paladín: { f: 3, d: 1, i: 2, c: 3, a: 1 },
  Cazador: { f: 1.5, d: 4, i: 1, c: 1.5, a: 2 },
}

const BASE_STATS = 10

export function getInitialStatsForClass(clase, nivel) {
  const totalPoints = BASE_STATS + (nivel - 1) * 3
  const weights = CLASS_WEIGHTS[clase] || { f: 2, d: 2, i: 2, c: 2, a: 2 }
  const totalWeight = weights.f + weights.d + weights.i + weights.c + weights.a
  let stats = {
    fuerza: BASE_STATS + Math.round((weights.f / totalWeight) * totalPoints),
    destreza: BASE_STATS + Math.round((weights.d / totalWeight) * totalPoints),
    inteligencia: BASE_STATS + Math.round((weights.i / totalWeight) * totalPoints),
    constitucion: BASE_STATS + Math.round((weights.c / totalWeight) * totalPoints),
    agilidad: BASE_STATS + Math.round((weights.a / totalWeight) * totalPoints),
  }

  const diff = totalPoints - ((stats.fuerza - BASE_STATS) + (stats.destreza - BASE_STATS) + (stats.inteligencia - BASE_STATS) + (stats.constitucion - BASE_STATS) + (stats.agilidad - BASE_STATS))
  stats.fuerza += diff
  return stats
}