import {
  CONTEXT_MENU_HEIGHT,
  CONTEXT_MENU_MARGIN,
  CONTEXT_MENU_WIDTH,
  DEFAULT_GOLD,
  DEFAULT_MANA_BASE,
  DEFAULT_STAT_VALUE,
  DEFAULT_VIDA_BASE,
  MAX_PARTY_SIZE,
} from './inventoryConstants'
import { createInventory } from './inventoryUtils'

export function getCharacterList(personajes) {
  return personajes.slice(0, MAX_PARTY_SIZE)
}

export function createInitialInventories(characterList) {
  return Object.fromEntries(characterList.map((character) => [character.idPersonaje, createInventory()]))
}

export function createInitialGold(characterList) {
  return Object.fromEntries(characterList.map((character) => [character.idPersonaje, DEFAULT_GOLD]))
}

export function getDefaultResources(character) {
  const vidaMax = character?.vidaMax ?? DEFAULT_VIDA_BASE + (character?.constitucion ?? DEFAULT_STAT_VALUE) * 5
  const manaMax = character?.manaMax ?? DEFAULT_MANA_BASE + (character?.inteligencia ?? DEFAULT_STAT_VALUE) * 5
  return {
    vidaActual: character?.vidaActual ?? vidaMax,
    vidaMax,
    manaActual: character?.manaActual ?? manaMax,
    manaMax,
  }
}

export function resolveResources(resourcesByCharacter, character) {
  const characterId = character?.idPersonaje
  return resourcesByCharacter[characterId] || getDefaultResources(character)
}

export function getFilteredOutIndexes(items, matchingIndexes) {
  const matching = new Set(matchingIndexes)
  return new Set(items.map((item, index) => (item && !matching.has(index) ? index : null)).filter((index) => index !== null))
}

export function isEquipKeyActive({ selectedEquipmentSlot, selectedEquipmentItem, selectedItem }) {
  return Boolean((selectedEquipmentSlot && selectedEquipmentItem) || selectedItem?.tipoEquipamiento || selectedItem?.consumible)
}

export function getContextMenuPosition(clientX, clientY, limitX, limitY) {
  return {
    x: Math.max(CONTEXT_MENU_MARGIN, Math.min(clientX, limitX - CONTEXT_MENU_WIDTH)),
    y: Math.max(CONTEXT_MENU_MARGIN, Math.min(clientY, limitY - CONTEXT_MENU_HEIGHT)),
  }
}

export function buildContextMenuActions({
  item,
  slotIndex,
  characterList,
  activeCharacterId,
  onUse,
  onEquip,
  onTransfer,
  onSplit,
  onShowDetails,
  onDrop,
}) {
  const actions = []
  if (item?.consumible) actions.push({ label: 'Usar', run: onUse })
  if (item?.tipoEquipamiento) actions.push({ label: 'Equipar', run: onEquip })

  const targetCharacters = characterList
    .map((character, index) => ({ character, index }))
    .filter(({ character }) => character.idPersonaje !== activeCharacterId)
  if (item && targetCharacters.length > 0) {
    actions.push({
      label: 'Enviar a',
      submenu: targetCharacters.map(({ character, index }) => ({
        label: `${index + 1} · ${character.nombre || `Héroe #${character.idPersonaje}`}`,
        run: () => onTransfer(slotIndex, index),
      })),
    })
  }

  if (item && item.quantity > 1) actions.push({ label: 'Dividir', run: onSplit })
  actions.push({ label: 'Ver detalles', run: onShowDetails })
  actions.push({ label: 'Soltar', run: onDrop })
  return actions
}
