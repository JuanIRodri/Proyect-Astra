export const GRID_COLUMNS = 8
export const SLOT_COUNT = 48
export const EQUIPMENT_SLOTS = [
  { key: 'pecho', label: 'Pecho', icon: '🛡' },
  { key: 'casco', label: 'Casco', icon: '⛑' },
  { key: 'pantalon', label: 'Pantalón', icon: '▣' },
  { key: 'botas', label: 'Botas', icon: '♟' },
  { key: 'arma', label: 'Arma', icon: '⚔' },
  { key: 'arma-secundaria', label: 'Arma secundaria', icon: '✦' },
]

export function createInventory() {
  return Array(SLOT_COUNT).fill(null)
}

export function normalizeItem(row) {
  return {
    ...row,
    id: `${row.itemKey}-${row.ranura}`,
    name: row.nombre,
    description: row.descripcion,
    category: row.categoria,
    rarity: row.rareza,
    icon: row.icono,
    quantity: Number(row.cantidad),
    weight: Number(row.peso),
    consumible: Boolean(row.consumible),
  }
}

export function normalizeInventory(rows) {
  const inventory = createInventory()
  rows.forEach((row) => {
    if (!row.itemKey || row.ranura < 0 || row.ranura >= SLOT_COUNT) return
    inventory[row.ranura] = normalizeItem(row)
  })
  return inventory
}

export function normalizeEquipment(rows) {
  return Object.fromEntries(rows.map((row) => [row.ranura, normalizeItem(row)]))
}

export function getClassThemeKey(clase) {
  return (clase || 'aventurero')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
}

export function getNextSlotIndex(currentIndex, rowDelta, columnDelta) {
  const currentRow = Math.floor(currentIndex / GRID_COLUMNS)
  const currentColumn = currentIndex % GRID_COLUMNS
  const nextRow = Math.max(0, Math.min((SLOT_COUNT / GRID_COLUMNS) - 1, currentRow + rowDelta))
  const nextColumn = Math.max(0, Math.min(GRID_COLUMNS - 1, currentColumn + columnDelta))
  return nextRow * GRID_COLUMNS + nextColumn
}

export function getNextEquipmentIndex(currentIndex, rowDelta, columnDelta) {
  const columns = 2
  const currentRow = Math.floor(currentIndex / columns)
  const currentColumn = currentIndex % columns
  const nextRow = Math.max(0, Math.min(2, currentRow + rowDelta))
  const nextColumn = Math.max(0, Math.min(columns - 1, currentColumn + columnDelta))
  return (nextRow * columns) + nextColumn
}

export function getFilterOptions(items, field) {
  const values = []
  items.forEach((item) => {
    if (!item?.[field]) return
    if (!values.includes(item[field])) values.push(item[field])
  })
  return values.sort((a, b) => a.localeCompare(b, 'es'))
}

export function getFilteredIndexes(items, category, rarity) {
  const matches = []
  items.forEach((item, index) => {
    if (!item) return
    const matchesCategory = !category || category === 'todos' || item.category === category
    const matchesRarity = !rarity || rarity === 'todos' || item.rarity === rarity
    if (matchesCategory && matchesRarity) matches.push(index)
  })
  return matches
}

export function getNextFilteredSlotIndex(currentIndex, rowDelta, columnDelta, matchingSet) {
  if (!matchingSet || matchingSet.size === 0) return currentIndex
  const baseStep = ((rowDelta * GRID_COLUMNS) + columnDelta) || 1
  let nextIndex = getNextSlotIndex(currentIndex, rowDelta, columnDelta)
  for (let steps = 0; steps < SLOT_COUNT; steps += 1) {
    if (matchingSet.has(nextIndex)) return nextIndex
    nextIndex = (nextIndex + baseStep + SLOT_COUNT) % SLOT_COUNT
  }
  return currentIndex
}