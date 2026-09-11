import { useCallback, useEffect, useRef, useState } from 'react'
import { getInventario, usarObjeto } from '../services/api'
import { HOTBAR_KEYS, HOTBAR_SLOT_COUNT, HOTBAR_STORAGE_KEY } from '../game/hotbarConfig'
import { isInputLocked } from '../game/inputLock'

function loadSlots(personajeId) {
  try {
    const all = JSON.parse(window.localStorage.getItem(HOTBAR_STORAGE_KEY) || 'null')
    const slots = all?.[personajeId]
    if (Array.isArray(slots) && slots.length === HOTBAR_SLOT_COUNT) return slots
  } catch {
    return Array(HOTBAR_SLOT_COUNT).fill(null)
  }
  return Array(HOTBAR_SLOT_COUNT).fill(null)
}

function saveSlots(personajeId, slots) {
  try {
    const all = JSON.parse(window.localStorage.getItem(HOTBAR_STORAGE_KEY) || '{}')
    all[personajeId] = slots
    window.localStorage.setItem(HOTBAR_STORAGE_KEY, JSON.stringify(all))
  } catch {
    return undefined
  }
}

function toSlotItem(item) {
  if (!item) return null
  return {
    itemKey: item.itemKey,
    name: item.name || item.nombre,
    icon: item.icon || item.icono,
    quantity: Number(item.quantity ?? item.cantidad ?? 0),
    description: item.description ?? item.descripcion ?? '',
    category: item.category ?? item.categoria ?? '',
    rarity: item.rarity ?? item.rareza ?? '',
    weight: Number(item.weight ?? item.peso ?? 0),
    consumible: Boolean(item.consumible),
    efectoVida: Number(item.efecioVida ?? item.efectoVida ?? 0),
    maxPila: Number(item.maxPila ?? 0),
    tipoEquipamiento: item.tipoEquipamiento ?? '',
    bonusFuerza: Number(item.bonusFuerza ?? 0),
    bonusDestreza: Number(item.bonusDestreza ?? 0),
    bonusInteligencia: Number(item.bonusInteligencia ?? 0),
    bonusConstitucion: Number(item.bonusConstitucion ?? 0),
    bonusAgilidad: Number(item.bonusAgilidad ?? 0),
  }
}

export function useHotbar({ personajeId, items, onUseRequest, useShortcuts = false }) {
  const [assigned, setAssigned] = useState(() => loadSlots(personajeId))
  const [rows, setRows] = useState(null)
  const [pickerIndex, setPickerIndex] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const feedbackTimer = useRef(null)

  const showFeedback = useCallback((text) => {
    setFeedback({ text, token: Date.now() })
    window.clearTimeout(feedbackTimer.current)
    feedbackTimer.current = window.setTimeout(() => setFeedback(null), 2400)
  }, [])

  useEffect(() => () => window.clearTimeout(feedbackTimer.current), [])

  useEffect(() => {
    if (items) return undefined
    let cancelled = false
    getInventario(personajeId)
      .then((nextRows) => { if (!cancelled) setRows(nextRows) })
      .catch(() => { if (!cancelled) setRows([]) })
    return () => { cancelled = true }
  }, [personajeId, items])

  const quantityOf = useCallback((itemKey) => {
    if (!itemKey) return 0
    if (items) {
      return items
        .filter((item) => item && item.itemKey === itemKey)
        .reduce((total, item) => total + item.quantity, 0)
    }
    if (!rows) return 0
    return rows
      .filter((row) => row.itemKey === itemKey)
      .reduce((total, row) => total + Number(row.cantidad || 0), 0)
  }, [items, rows])

  const findRanura = useCallback((itemKey) => {
    if (!itemKey) return -1
    if (items) return items.findIndex((item) => item && item.itemKey === itemKey)
    if (!rows) return -1
    const index = rows.findIndex((row) => row.itemKey === itemKey)
    return index === -1 ? -1 : rows[index].ranura
  }, [items, rows])

  const consumables = useCallback(() => {
    if (items) {
      return items.filter((item) => item && item.consumible)
    }
    if (!rows) return []
    return rows
      .filter((row) => row.consumible)
      .map((row) => ({
        ...row,
        name: row.nombre,
        icon: row.icono,
        quantity: Number(row.cantidad || 0),
      }))
  }, [items, rows])

  const persistAndSet = useCallback((nextSlots) => {
    setAssigned(nextSlots)
    saveSlots(personajeId, nextSlots)
  }, [personajeId])

  const assignSlot = useCallback((slotIndex, item) => {
    const normalized = toSlotItem(item)
    if (!normalized) {
      showFeedback('Selecciona un objeto consumible para asignarlo.')
      return false
    }
    if (item.consumible === false) {
      showFeedback('Solo se pueden asignar consumibles a la barra.')
      return false
    }
    const nextSlots = [...assigned]
    nextSlots[slotIndex] = normalized
    persistAndSet(nextSlots)
    setPickerIndex(null)
    showFeedback(`${normalized.name} asignado a la ranura ${slotIndex + 1}.`)
    return true
  }, [assigned, persistAndSet, showFeedback])

  const clearSlot = useCallback((slotIndex) => {
    const nextSlots = [...assigned]
    nextSlots[slotIndex] = null
    persistAndSet(nextSlots)
    setPickerIndex(null)
  }, [assigned, persistAndSet])

  const triggerSlot = useCallback(async (slotIndex) => {
    const slot = assigned[slotIndex]
    if (!slot) {
      showFeedback(`La ranura ${slotIndex + 1} está vacía.`)
      return
    }
    const ranura = findRanura(slot.itemKey)
    if (ranura === -1) {
      showFeedback(`Ya no tienes ${slot.name} en la mochila.`)
      return
    }

    let result
    if (onUseRequest) {
      result = await onUseRequest(ranura)
    } else {
      try {
        result = await usarObjeto(personajeId, ranura)
      } catch {
        showFeedback('No se pudo usar el objeto.')
        return
      }
      if (rows) {
        const remaining = result.quantity
        const nextRows = rows
          .map((row) => (row.ranura === ranura ? { ...row, cantidad: remaining } : row))
          .filter((row) => row.cantidad > 0)
        setRows(nextRows)
      }
    }

    const effectNotice = result?.effect?.vida > 0 ? ` (+${result.effect.vida} Vida)` : ''
    if (result?.name) {
      showFeedback(`${result.name} usado.${effectNotice}`)
    } else if (effectNotice) {
      showFeedback(effectNotice.trim())
    }

    if (quantityOf(slot.itemKey) <= 0) {
      clearSlot(slotIndex)
    }
  }, [assigned, findRanura, onUseRequest, personajeId, rows, showFeedback, quantityOf, clearSlot])

  useEffect(() => {
    if (!useShortcuts) return undefined
    const handler = (event) => {
      if (isInputLocked()) return
      const slotIndex = HOTBAR_KEYS.indexOf(event.key)
      if (slotIndex === -1) return
      event.preventDefault()
      triggerSlot(slotIndex)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [useShortcuts, triggerSlot])

  const slots = assigned.map((slot) => (
    slot ? { ...slot, quantity: quantityOf(slot.itemKey) } : null
  ))

  return {
    slots,
    pickerIndex,
    openPicker: setPickerIndex,
    closePicker: () => setPickerIndex(null),
    consumables: consumables(),
    feedback,
    assignSlot,
    clearSlot,
    triggerSlot,
    quantityOf,
  }
}