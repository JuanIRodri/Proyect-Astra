import { describe, it, expect } from 'vitest'
import {
  buildContextMenuActions,
  createInitialGold,
  createInitialInventories,
  getCharacterList,
  getContextMenuPosition,
  getDefaultResources,
  getFilteredOutIndexes,
  isEquipKeyActive,
  resolveResources,
} from './inventorySelectors'

const personaje = (overrides = {}) => ({
  idPersonaje: 1,
  nombre: 'Astra',
  clase: 'Pícaro',
  ...overrides,
})

describe('getCharacterList', () => {
  it('limita el grupo a tres personajes', () => {
    const lista = getCharacterList([1, 2, 3, 4].map((id) => personaje({ idPersonaje: id })))
    expect(lista).toHaveLength(3)
    expect(lista[2].idPersonaje).toBe(3)
  })
})

describe('createInitialInventories', () => {
  it('crea una mochila vacía por personaje', () => {
    const inventarios = createInitialInventories([personaje({ idPersonaje: 7 })])
    expect(inventarios[7]).toHaveLength(48)
    expect(inventarios[7].every((slot) => slot === null)).toBe(true)
  })
})

describe('createInitialGold', () => {
  it('asigna la Oro inicial a cada personaje', () => {
    expect(createInitialGold([personaje({ idPersonaje: 3 })])[3]).toBe(125)
  })
})

describe('getDefaultResources', () => {
  it('deriva vida y maná de las estadísticas', () => {
    const recursos = getDefaultResources(personaje({ constitucion: 12, inteligencia: 8 }))
    expect(recursos.vidaMax).toBe(90)
    expect(recursos.manaMax).toBe(60)
    expect(recursos.vidaActual).toBe(90)
    expect(recursos.manaActual).toBe(60)
  })

  it('respeta los valores que ya trae el personaje', () => {
    const recursos = getDefaultResources(personaje({ vidaActual: 20, vidaMax: 80, manaActual: 5, manaMax: 40 }))
    expect(recursos).toMatchObject({ vidaActual: 20, vidaMax: 80, manaActual: 5, manaMax: 40 })
  })
})

describe('resolveResources', () => {
  it('devuelve los recursos guardados del personaje', () => {
    const guardados = { 1: { vidaActual: 10, vidaMax: 80, manaActual: 3, manaMax: 40 } }
    expect(resolveResources(guardados, personaje())).toBe(guardados[1])
  })

  it('cae en los recursos por defecto si no hay guardados', () => {
    expect(resolveResources({}, personaje()).vidaMax).toBe(80)
  })
})

describe('getFilteredOutIndexes', () => {
  it('marca las ranuras con objetos que no coinciden con el filtro', () => {
    const items = [null, { name: 'Poción' }, { name: 'Espada' }]
    expect([...getFilteredOutIndexes(items, [1])]).toEqual([2])
  })

  it('no marca ranuras vacías', () => {
    expect([...getFilteredOutIndexes([null, null], [1])]).toEqual([])
  })
})

describe('isEquipKeyActive', () => {
  it('se activa con un objeto equipable o consumible', () => {
    expect(isEquipKeyActive({ selectedItem: { tipoEquipamiento: 'arma' } })).toBe(true)
    expect(isEquipKeyActive({ selectedItem: { consumible: true } })).toBe(true)
  })

  it('se activa con una ranura de equipamiento ocupada', () => {
    expect(isEquipKeyActive({ selectedEquipmentSlot: 'casco', selectedEquipmentItem: { name: 'Yelmo' } })).toBe(true)
  })

  it('no se activa sin selección útil', () => {
    expect(isEquipKeyActive({ selectedEquipmentSlot: 'casco', selectedEquipmentItem: null })).toBe(false)
    expect(isEquipKeyActive({ selectedItem: null })).toBe(false)
  })
})

describe('getContextMenuPosition', () => {
  it('mantiene el menú dentro del área visible', () => {
    expect(getContextMenuPosition(-50, -20, 1000, 800)).toEqual({ x: 4, y: 4 })
    expect(getContextMenuPosition(990, 790, 1000, 800)).toEqual({ x: 830, y: 570 })
  })
})

describe('buildContextMenuActions', () => {
  const characterList = [personaje({ idPersonaje: 1 }), personaje({ idPersonaje: 2, nombre: 'Vega' })]

  it('ofrece usar y equipar según el tipo de objeto', () => {
    const acciones = buildContextMenuActions({
      item: { consumible: true, tipoEquipamiento: 'arma', quantity: 1 },
      slotIndex: 0,
      characterList,
      activeCharacterId: 1,
    })
    expect(acciones.map((accion) => accion.label)).toEqual([
      'Usar',
      'Equipar',
      'Enviar a',
      'Ver detalles',
      'Soltar',
    ])
  })

  it('agrega dividir solo cuando la pila tiene más de un objeto', () => {
    const acciones = buildContextMenuActions({
      item: { quantity: 3 },
      slotIndex: 0,
      characterList,
      activeCharacterId: 1,
    })
    expect(acciones.map((accion) => accion.label)).toContain('Dividir')
  })

  it('arma el submenú con los otros personajes del grupo', () => {
    const acciones = buildContextMenuActions({
      item: { quantity: 1 },
      slotIndex: 3,
      characterList,
      activeCharacterId: 1,
    })
    const submenu = acciones.find((accion) => accion.label === 'Enviar a').submenu
    expect(submenu).toHaveLength(1)
    expect(submenu[0].label).toBe('2 · Vega')
  })

  it('no ofrece enviar a si no hay otros personajes', () => {
    const acciones = buildContextMenuActions({
      item: { quantity: 1 },
      slotIndex: 0,
      characterList: [personaje()],
      activeCharacterId: 1,
    })
    expect(acciones.map((accion) => accion.label)).not.toContain('Enviar a')
  })
})
