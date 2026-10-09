import { describe, it, expect } from 'vitest'
import {
  removeItem,
  setQuantity,
  splitStack,
  splitStackByQuantity,
  moveOrMergeItems,
  moveSingleItem,
  computeLoadStats,
  sortInventory,
} from './inventoryOperations'

const po = (overrides = {}) => ({
  itemKey: 'pocion',
  name: 'Poción',
  category: 'consumible',
  rarity: 'Raro',
  weight: 1,
  quantity: 5,
  maxPila: 10,
  ...overrides,
})

describe('removeItem', () => {
  it('deja la ranura en null y conserva el resto', () => {
    const items = [po(), null, po()]
    const next = removeItem(items, 0)
    expect(next[0]).toBeNull()
    expect(next[2]).toEqual(items[2])
  })

  it('no muta el arreglo original', () => {
    const items = [po()]
    removeItem(items, 0)
    expect(items[0]).not.toBeNull()
  })
})

describe('setQuantity', () => {
  it('actualiza la cantidad de una pila', () => {
    const items = [po({ quantity: 5 })]
    expect(setQuantity(items, 0, 3)[0].quantity).toBe(3)
  })

  it('vacía la ranura si la cantidad baja de 1', () => {
    const items = [po()]
    expect(setQuantity(items, 0, 0)[0]).toBeNull()
  })
})

describe('splitStack', () => {
  const items = [po({ quantity: 5 }), null, po({ quantity: 3 })]

  it('divide en mitades ceil/floor en la primera ranura vacía', () => {
    const { nextItems } = splitStack(items, 0)
    expect(nextItems[0].quantity).toBe(3)
    expect(nextItems[1].quantity).toBe(2)
    expect(nextItems[1].itemKey).toBe('pocion')
  })

  it('rechaza pilas de una sola unidad', () => {
    expect(splitStack([po({ quantity: 1 })], 0).error).toBeDefined()
  })

  it('rechaza cuando no hay ranura vacía', () => {
    expect(splitStack([po({ quantity: 5 }), po()], 0).error).toBeDefined()
  })
})

describe('splitStackByQuantity', () => {
  const items = [po({ quantity: 5 }), null]

  it('separa la cantidad pedida', () => {
    const { nextItems } = splitStackByQuantity(items, 0, 2)
    expect(nextItems[0].quantity).toBe(3)
    expect(nextItems[1].quantity).toBe(2)
  })

  it('valida cantidad entera dentro del rango', () => {
    expect(splitStackByQuantity(items, 0, 0).error).toBeDefined()
    expect(splitStackByQuantity(items, 0, 5).error).toBeDefined()
    expect(splitStackByQuantity(items, 0, 2.5).error).toBeDefined()
  })
})

describe('moveOrMergeItems', () => {
  it('devuelve null si origen y destino son la misma ranura', () => {
    expect(moveOrMergeItems([po()], 0, 0)).toBeNull()
  })

  it('acumula pilas del mismo objeto', () => {
    const items = [po({ quantity: 5 }), po({ quantity: 3 })]
    const { nextItems } = moveOrMergeItems(items, 0, 1)
    expect(nextItems[0]).toBeNull()
    expect(nextItems[1].quantity).toBe(8)
  })

  it('intercambia objetos de distinto itemKey en ranuras ocupadas', () => {
    const a = po({ itemKey: 'a', name: 'A' })
    const b = po({ itemKey: 'b', name: 'B' })
    const { nextItems } = moveOrMergeItems([a, b], 0, 1)
    expect(nextItems[0].name).toBe('B')
    expect(nextItems[1].name).toBe('A')
  })

  it('mueve a una ranura vacía', () => {
    const { nextItems } = moveOrMergeItems([po(), null], 0, 1)
    expect(nextItems[1].name).toBe('Poción')
    expect(nextItems[0]).toBeNull()
  })
})

describe('moveSingleItem', () => {
  it('rechaza una pila de una unidad', () => {
    expect(moveSingleItem([po({ quantity: 1 })], 0, 1).error).toBeDefined()
  })

  it('une una unidad a una pila del mismo objeto en destino', () => {
    const items = [po({ quantity: 3 }), po({ quantity: 2 })]
    const { nextItems } = moveSingleItem(items, 0, 1)
    expect(nextItems[0].quantity).toBe(2)
    expect(nextItems[1].quantity).toBe(3)
  })

  it('separa una unidad en una ranura vacía', () => {
    const items = [po({ quantity: 3 }), null]
    const { nextItems } = moveSingleItem(items, 0, 1)
    expect(nextItems[0].quantity).toBe(2)
    expect(nextItems[1].quantity).toBe(1)
  })
})

describe('computeLoadStats', () => {
  it('calcula la capacidad con la fórmula 10 + fuerza*1.5 y el bonificador de equipo', () => {
    const stats = computeLoadStats({ items: [], equipment: {}, fuerza: 10 })
    expect(stats.maxWeight).toBe(10 + 10 * 1.5)
    expect(stats.currentWeight).toBe(0)
    expect(stats.weightPercent).toBe(0)
  })

  it('suma el peso del equipo equipado a la capacidad con su bonus de fuerza', () => {
    const stats = computeLoadStats({
      items: [],
      equipment: { pecho: { weight: 8, bonusFuerza: 2 } },
      fuerza: 10,
    })
    expect(stats.maxWeight).toBe(10 + 12 * 1.5)
    expect(stats.currentWeight).toBe(8)
  })

  it('contabiliza peso * cantidad en la mochila', () => {
    const stats = computeLoadStats({
      items: [po({ weight: 2, quantity: 3 })],
      equipment: {},
      fuerza: 10,
    })
    expect(stats.currentWeight).toBe(6)
  })

  it('topea el porcentaje en 100 y marca estados de carga', () => {
    const lotsOfItems = Array.from({ length: 12 }, () => po({ weight: 10, quantity: 1 }))
    const full = computeLoadStats({ items: lotsOfItems, equipment: {}, fuerza: 10 })
    expect(full.weightPercent).toBe(100)
    expect(full.weightState).toBe('is-overloaded')

    const mid = computeLoadStats({ items: [po({ weight: 15, quantity: 1 })], equipment: {}, fuerza: 10 })
    expect(mid.weightPercent).toBe(60)
    expect(mid.weightState).toBe('is-warning')

    const light = computeLoadStats({ items: [po({ weight: 1, quantity: 1 })], equipment: {}, fuerza: 10 })
    expect(light.weightState).toBe('')
  })
})

describe('sortInventory', () => {
  it('une pilas del mismo objeto respetando el máximo por pila', () => {
    const items = [po({ quantity: 7, maxPila: 10 }), po({ quantity: 4, maxPila: 10 })]
    const sorted = sortInventory(items)
    const filled = sorted.filter(Boolean)
    expect(filled[0].quantity).toBe(10)
    expect(filled[1].quantity).toBe(1)
  })

  it('acomoda por categoría, nombre y rareza', () => {
    const items = [
      { ...po({ itemKey: 'a', name: 'Espada', category: 'arma', rarity: 'Épico' }) },
      { ...po({ itemKey: 'b', name: 'Espada', category: 'arma', rarity: 'Común' }) },
      { ...po({ itemKey: 'c', name: 'Bicho', category: 'materiales', rarity: 'Común' }) },
    ]
    const sorted = sortInventory(items).filter(Boolean)
    expect(sorted.map((item) => item.itemKey)).toEqual(['b', 'a', 'c'])
  })
})