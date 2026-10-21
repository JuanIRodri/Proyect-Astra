import { describe, it, expect, vi } from 'vitest'
import { createInventoryKeyHandler } from './inventoryKeyHandler'

const createEvent = (key, overrides = {}) => ({
  key,
  shiftKey: false,
  target: null,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  ...overrides,
})

const createConfig = (stateOverrides = {}, actionOverrides = {}) => {
  const state = {
    items: [],
    selectedItem: null,
    selectedEquipmentItem: null,
    selectedEquipmentSlot: null,
    navigationArea: 'inventory',
    cursorSlotIndex: 0,
    equipmentCursorIndex: 0,
    heldSlotIndex: null,
    characterListLength: 3,
    showItemDetails: false,
    transferPromptActive: false,
    contextMenuActive: false,
    contextMenuActionIndex: 0,
    contextMenuActions: [],
    contextMenuSubmenuIndex: null,
    activeCharacterIndex: 0,
    ...stateOverrides,
  }
  const actions = {
    onClose: vi.fn(),
    setNotice: vi.fn(),
    setShowItemDetails: vi.fn(),
    handleCloseDetails: vi.fn(),
    setSelectedSlotIndex: vi.fn(),
    setHeldSlotIndex: vi.fn(),
    setEquipmentCursorIndex: vi.fn(),
    setSelectedEquipmentSlot: vi.fn(),
    setTransferPromptActive: vi.fn(),
    handleDropSelected: vi.fn(),
    handleToggleEquipment: vi.fn(),
    handleUnequip: vi.fn(),
    handleEquipSelected: vi.fn(),
    handleUseSelected: vi.fn(),
    handleToggleDetails: vi.fn(),
    handleSplit: vi.fn(),
    handleRequestSplit: vi.fn(),
    handleMoveItem: vi.fn(),
    handleCharacterChange: vi.fn(),
    handleOrderItems: vi.fn(),
    handleRequestTransfer: vi.fn(),
    handleTransferSelected: vi.fn(),
    handleCycleCategory: vi.fn(),
    handleCycleRarity: vi.fn(),
    handleHotbarKey: vi.fn(),
    moveSelection: vi.fn(),
    setContextMenuActionIndex: vi.fn(),
    setContextMenuSubmenuIndex: vi.fn(),
    handleCloseContextMenu: vi.fn(),
    ...actionOverrides,
  }
  return { state, actions }
}

describe('createInventoryKeyHandler', () => {
  it('cierra el inventario con la tecla I', () => {
    const config = createConfig()
    createInventoryKeyHandler(config)(createEvent('i'))
    expect(config.actions.onClose).toHaveBeenCalled()
  })

  it('ignora las teclas cuando el foco está en un campo de texto', () => {
    const config = createConfig()
    createInventoryKeyHandler(config)(createEvent('i', { target: { tagName: 'INPUT' } }))
    expect(config.actions.onClose).not.toHaveBeenCalled()
  })

  it('suelta el objeto seleccionado con la tecla Q', () => {
    const config = createConfig()
    createInventoryKeyHandler(config)(createEvent('q'))
    expect(config.actions.handleDropSelected).toHaveBeenCalled()
  })

  it('cambia al área de equipamiento con la tecla G', () => {
    const config = createConfig()
    createInventoryKeyHandler(config)(createEvent('g'))
    expect(config.actions.handleToggleEquipment).toHaveBeenCalled()
  })

  it('equipa el objeto seleccionado con la tecla E', () => {
    const config = createConfig({ selectedItem: { tipoEquipamiento: 'arma' } })
    createInventoryKeyHandler(config)(createEvent('e'))
    expect(config.actions.handleEquipSelected).toHaveBeenCalled()
  })

  it('desequipa con la tecla E cuando hay una ranura de equipamiento ocupada', () => {
    const config = createConfig({
      selectedEquipmentSlot: 'casco',
      selectedEquipmentItem: { name: 'Yelmo' },
    })
    createInventoryKeyHandler(config)(createEvent('e'))
    expect(config.actions.handleUnequip).toHaveBeenCalledWith('casco')
  })

  it('muestra los detalles con la tecla V', () => {
    const config = createConfig()
    createInventoryKeyHandler(config)(createEvent('v'))
    expect(config.actions.handleToggleDetails).toHaveBeenCalled()
  })

  it('divide la pila con R y abre el modal con C', () => {
    const config = createConfig()
    const handler = createInventoryKeyHandler(config)
    handler(createEvent('r'))
    handler(createEvent('c'))
    expect(config.actions.handleSplit).toHaveBeenCalled()
    expect(config.actions.handleRequestSplit).toHaveBeenCalled()
  })

  it('ordena la mochila con O y pide el traspaso con T', () => {
    const config = createConfig()
    const handler = createInventoryKeyHandler(config)
    handler(createEvent('o'))
    handler(createEvent('t'))
    expect(config.actions.handleOrderItems).toHaveBeenCalled()
    expect(config.actions.handleRequestTransfer).toHaveBeenCalled()
  })

  it('cambia el filtro de categoría con F y el de rareza con Shift+F', () => {
    const config = createConfig()
    const handler = createInventoryKeyHandler(config)
    handler(createEvent('f'))
    handler(createEvent('f', { shiftKey: true }))
    expect(config.actions.handleCycleCategory).toHaveBeenCalled()
    expect(config.actions.handleCycleRarity).toHaveBeenCalled()
  })

  it('asigna la ranura de la barra rápida con las teclas 4 a 8', () => {
    const config = createConfig()
    createInventoryKeyHandler(config)(createEvent('4'))
    expect(config.actions.handleHotbarKey).toHaveBeenCalledWith(0)
  })

  it('cambia de líder con las teclas 1 a 3 y con Tab', () => {
    const config = createConfig({ activeCharacterIndex: 0 })
    const handler = createInventoryKeyHandler(config)
    handler(createEvent('1'))
    handler(createEvent('tab'))
    expect(config.actions.handleCharacterChange).toHaveBeenCalledWith(0)
    expect(config.actions.handleCharacterChange).toHaveBeenCalledWith(1)
  })

  it('prepara el objeto del cursor con Enter', () => {
    const config = createConfig({
      items: [null, null, null, { name: 'Poción' }],
      cursorSlotIndex: 3,
    })
    createInventoryKeyHandler(config)(createEvent('Enter'))
    expect(config.actions.setSelectedSlotIndex).toHaveBeenCalledWith(3)
    expect(config.actions.setHeldSlotIndex).toHaveBeenCalledWith(3)
  })

  it('mueve el objeto sostenido al cursor con Enter', () => {
    const config = createConfig({ items: [{ name: 'Poción' }], cursorSlotIndex: 5, heldSlotIndex: 2 })
    createInventoryKeyHandler(config)(createEvent('Enter'))
    expect(config.actions.handleMoveItem).toHaveBeenCalledWith(2, 5)
    expect(config.actions.setHeldSlotIndex).toHaveBeenCalledWith(null)
  })

  it('mueve la selección con WASD y las flechas', () => {
    const config = createConfig()
    const handler = createInventoryKeyHandler(config)
    handler(createEvent('w'))
    handler(createEvent('ArrowRight'))
    expect(config.actions.moveSelection).toHaveBeenNthCalledWith(1, -1, 0)
    expect(config.actions.moveSelection).toHaveBeenNthCalledWith(2, 0, 1)
  })

  it('traspasa al personaje elegido con la tecla del líder', () => {
    const config = createConfig({ transferPromptActive: true })
    createInventoryKeyHandler(config)(createEvent('2'))
    expect(config.actions.handleTransferSelected).toHaveBeenCalledWith(1)
  })

  it('cancela el traspaso con Escape', () => {
    const config = createConfig({ transferPromptActive: true })
    createInventoryKeyHandler(config)(createEvent('Escape'))
    expect(config.actions.setTransferPromptActive).toHaveBeenCalledWith(false)
  })

  it('cierra los detalles abiertos con Escape', () => {
    const config = createConfig({ showItemDetails: true })
    createInventoryKeyHandler(config)(createEvent('Escape'))
    expect(config.actions.handleCloseDetails).toHaveBeenCalled()
  })

  it('recorre las acciones del menú contextual con las flechas', () => {
    const config = createConfig({
      contextMenuActive: true,
      contextMenuActions: [{ label: 'Usar' }, { label: 'Soltar' }],
    })
    createInventoryKeyHandler(config)(createEvent('ArrowDown'))
    const updater = config.actions.setContextMenuActionIndex.mock.calls[0][0]
    expect(updater(0)).toBe(1)
  })

  it('ejecuta la acción del menú contextual con Enter', () => {
    const run = vi.fn()
    const config = createConfig({
      contextMenuActive: true,
      contextMenuActions: [{ label: 'Soltar', run }],
    })
    createInventoryKeyHandler(config)(createEvent('Enter'))
    expect(run).toHaveBeenCalled()
    expect(config.actions.handleCloseContextMenu).toHaveBeenCalled()
  })

  it('cierra solo el submenú con Escape cuando está abierto', () => {
    const config = createConfig({
      contextMenuActive: true,
      contextMenuActions: [{ label: 'Enviar a', submenu: [{ label: '2 · Vega', run: vi.fn() }] }],
      contextMenuSubmenuIndex: 0,
    })
    createInventoryKeyHandler(config)(createEvent('Escape'))
    expect(config.actions.setContextMenuSubmenuIndex).toHaveBeenCalledWith(null)
    expect(config.actions.handleCloseContextMenu).not.toHaveBeenCalled()
  })
})
