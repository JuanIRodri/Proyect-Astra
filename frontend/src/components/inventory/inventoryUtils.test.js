import { describe, it, expect } from 'vitest'
import {
  createInventory,
  normalizeInventory,
  normalizeEquipment,
  getClassThemeKey,
  getNextSlotIndex,
  getNextEquipmentIndex,
  getFilterOptions,
  getFilteredIndexes,
  getNextFilteredSlotIndex,
} from './inventoryUtils'

const row = (overrides = {}) => ({
  itemKey: 'pocion',
  ranura: 0,
  nombre: 'Poción',
  descripcion: 'Recupera vida',
  categoria: 'consumible',
  rareza: 'Raro',
  icono: '🧪',
  cantidad: '2',
  peso: '1',
  consumible: 1,
  ...overrides,
})

describe('createInventory', () => {
  it('crea una mochila de 48 ranuras vacías', () => {
    const inventory = createInventory()
    expect(inventory).toHaveLength(48)
    expect(inventory.every((slot) => slot === null)).toBe(true)
  })
})

describe('normalizeInventory', () => {
  it('normaliza filas a objetos de mochila con tipos', () => {
    const inventory = normalizeInventory([row()])
    expect(inventory[0]).toMatchObject({
      itemKey: 'pocion',
      name: 'Poción',
      category: 'consumible',
      rarity: 'Raro',
      quantity: 2,
      weight: 1,
      consumible: true,
    })
  })

  it('ignora ranuras fuera de rango o sin itemKey', () => {
    const inventory = normalizeInventory([row({ ranura: 99 }), { ranura: 1 }])
    expect(inventory[99]).toBeUndefined()
    expect(inventory[1]).toBeNull()
  })
})

describe('normalizeEquipment', () => {
  it('mapea el equipamiento por ranura', () => {
    const equipment = normalizeEquipment([row({ ranura: 'casco', itemKey: 'yelmo' })])
    expect(equipment.casco.itemKey).toBe('yelmo')
  })
})

describe('getClassThemeKey', () => {
  it('normaliza el nombre de clase a kebab-case sin acentos', () => {
    expect(getClassThemeKey('Pícaro')).toBe('picaro')
    expect(getClassThemeKey('Cazador')).toBe('cazador')
    expect(getClassThemeKey()).toBe('aventurero')
  })
})

describe('getNextSlotIndex', () => {
  it('se desplaza por la grilla de 8 columnas con límites', () => {
    expect(getNextSlotIndex(0, 1, 0)).toBe(8)
    expect(getNextSlotIndex(0, 0, 1)).toBe(1)
    expect(getNextSlotIndex(7, 0, 1)).toBe(7)
    expect(getNextSlotIndex(40, 1, 0)).toBe(40)
    expect(getNextSlotIndex(0, -1, 0)).toBe(0)
  })
})

describe('getNextEquipmentIndex', () => {
  it('se desplaza en la grilla de equipamiento 2 columnas × 3 filas', () => {
    expect(getNextEquipmentIndex(0, 1, 0)).toBe(2)
    expect(getNextEquipmentIndex(1, 0, 1)).toBe(1)
    expect(getNextEquipmentIndex(5, 1, 0)).toBe(5)
  })
})

describe('getFilterOptions', () => {
  it('lista valores únicos ordenados', () => {
    const items = [
      { category: 'bach', rarity: 'Zeta' },
      { category: 'alfa', rarity: 'Alfa' },
      { category: 'alfa', rarity: 'Zeta' },
    ]
    expect(getFilterOptions(items, 'category')).toEqual(['alfa', 'bach'])
    expect(getFilterOptions(items, 'rarity')).toEqual(['Alfa', 'Zeta'])
  })
})

describe('getFilteredIndexes', () => {
  const items = [
    null,
    { category: 'consumible', rarity: 'Raro' },
    { category: 'arma', rarity: 'Raro' },
    { category: 'consumible', rarity: 'Común' },
  ]

  it('filtra por categoría y rareza', () => {
    expect(getFilteredIndexes(items, 'consumible', 'todos')).toEqual([1, 3])
    expect(getFilteredIndexes(items, 'todos', 'Raro')).toEqual([1, 2])
    expect(getFilteredIndexes(items, 'consumible', 'Raro')).toEqual([1])
  })

  it('"todos" no filtra', () => {
    expect(getFilteredIndexes(items, 'todos', 'todos')).toEqual([1, 2, 3])
  })
})

describe('getNextFilteredSlotIndex', () => {
  it('navega por las ranuras que coinciden con el filtro en la misma columna', () => {
    const matching = new Set([9, 17])
    expect(getNextFilteredSlotIndex(1, 1, 0, matching)).toBe(9)
    expect(getNextFilteredSlotIndex(17, -1, 0, matching)).toBe(9)
  })

  it('da la vuelta por el final de la columna al llegar arriba', () => {
    expect(getNextFilteredSlotIndex(1, -1, 0, new Set([41]))).toBe(41)
  })

  it('se queda en la posición actual si el set está vacío', () => {
    expect(getNextFilteredSlotIndex(2, 1, 0, new Set())).toBe(2)
  })
})