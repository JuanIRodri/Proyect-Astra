import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  desequiparObjeto,
  desequiparObjetoEnRanura,
  equiparObjeto,
  getEquipamiento,
  getInventario,
  saveInventario,
  transferirObjeto,
  usarObjeto,
} from '@/services/api'
import { createInventory, normalizeEquipment, normalizeInventory } from './inventoryUtils'
import { removeItem, setQuantity } from './inventoryOperations'
import { createInitialInventories, resolveResources } from './inventorySelectors'

export function useInventoryData({ activeCharacterId, activeCharacter, characterList, setNotice }) {
  const [inventories, setInventories] = useState(() => createInitialInventories(characterList))
  const [equipmentByCharacter, setEquipmentByCharacter] = useState({})
  const [resourcesByCharacter, setResourcesByCharacter] = useState({})
  const [inventoryLoading, setInventoryLoading] = useState(true)

  const items = inventories[activeCharacterId] || createInventory()
  const equipment = useMemo(
    () => equipmentByCharacter[activeCharacterId] || {},
    [activeCharacterId, equipmentByCharacter],
  )
  const resources = resolveResources(resourcesByCharacter, activeCharacter)

  useEffect(() => {
    if (!activeCharacterId) return undefined
    let cancelled = false
    Promise.all([getInventario(activeCharacterId), getEquipamiento(activeCharacterId)])
      .then(([rows, equipmentRows]) => {
        if (cancelled) return
        setInventories((currentInventories) => ({
          ...currentInventories,
          [activeCharacterId]: normalizeInventory(rows),
        }))
        setEquipmentByCharacter((currentEquipment) => ({
          ...currentEquipment,
          [activeCharacterId]: normalizeEquipment(equipmentRows),
        }))
      })
      .catch(() => {
        if (!cancelled) setNotice('No se pudo cargar el inventario.')
      })
      .finally(() => {
        if (!cancelled) setInventoryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeCharacterId, setNotice])

  const updateInventory = useCallback((nextItems, successNotice) => {
    setInventories((currentInventories) => ({
      ...currentInventories,
      [activeCharacterId]: nextItems,
    }))
    setNotice(successNotice)
    saveInventario(activeCharacterId, nextItems).catch(() => {
      setNotice('El cambio se aplicó visualmente, pero no se pudo guardar.')
    })
  }, [activeCharacterId, setNotice])

  const consumeItem = useCallback(async (slotIndex) => {
    const item = items[slotIndex]
    if (!item) {
      setNotice('Selecciona un objeto antes de usarlo.')
      return { ok: false }
    }
    if (!item.consumible) {
      setNotice('Este objeto no se puede consumir.')
      return { ok: false }
    }

    try {
      const result = await usarObjeto(activeCharacterId, slotIndex)
      const nextItems = setQuantity(items, slotIndex, result.quantity)
      setInventories((currentInventories) => ({
        ...currentInventories,
        [activeCharacterId]: nextItems,
      }))
      const nextResources = {
        vidaActual: result.effect?.vidaActual ?? resources.vidaActual,
        manaActual: result.effect?.manaActual ?? resources.manaActual,
      }
      setResourcesByCharacter((currentResources) => ({
        ...currentResources,
        [activeCharacterId]: { ...resources, ...nextResources },
      }))
      const effectNotice = result.effect?.vida
        ? ` Efecto: +${result.effect.vida} vida (${nextResources.vidaActual}/${resources.vidaMax}).`
        : ''
      setNotice(`${item.name} consumido.${effectNotice}`)
      return { ok: true, result: { name: item.name, quantity: result.quantity, effect: result.effect } }
    } catch {
      setNotice('No se pudo consumir el objeto.')
      return { ok: false }
    }
  }, [activeCharacterId, items, resources, setNotice])

  const equipItem = useCallback(async (slotIndex, equipmentSlotKey) => {
    const item = items[slotIndex]
    if (!item?.tipoEquipamiento) {
      setNotice('Selecciona un objeto equipable.')
      return { ok: false }
    }
    if (equipmentSlotKey && item.tipoEquipamiento !== equipmentSlotKey) {
      setNotice('Solo se puede equipar en la ranura correspondiente.')
      return { ok: false }
    }
    const targetSlot = equipmentSlotKey || item.tipoEquipamiento

    try {
      await equiparObjeto(activeCharacterId, slotIndex)
      setInventories((currentInventories) => ({
        ...currentInventories,
        [activeCharacterId]: removeItem(items, slotIndex),
      }))
      setEquipmentByCharacter((currentEquipment) => ({
        ...currentEquipment,
        [activeCharacterId]: {
          ...(currentEquipment[activeCharacterId] || {}),
          [targetSlot]: item,
        },
      }))
      setNotice(`${item.name} equipado en ${targetSlot}.`)
      return { ok: true, item }
    } catch (error) {
      setNotice(error.response?.data?.error || 'No se pudo equipar el objeto.')
      return { ok: false }
    }
  }, [activeCharacterId, items, setNotice])

  const unequipItem = useCallback(async (equipmentSlot) => {
    try {
      await desequiparObjeto(activeCharacterId, equipmentSlot)
      const [rows, equipmentRows] = await Promise.all([
        getInventario(activeCharacterId),
        getEquipamiento(activeCharacterId),
      ])
      setInventories((currentInventories) => ({
        ...currentInventories,
        [activeCharacterId]: normalizeInventory(rows),
      }))
      setEquipmentByCharacter((currentEquipment) => ({
        ...currentEquipment,
        [activeCharacterId]: normalizeEquipment(equipmentRows),
      }))
      setNotice('Objeto desequipado y devuelto a la mochila.')
      return { ok: true }
    } catch (error) {
      setNotice(error.response?.data?.error || 'No se pudo desequipar el objeto.')
      return { ok: false }
    }
  }, [activeCharacterId, setNotice])

  const unequipItemToSlot = useCallback(async (equipmentSlotKey, targetSlotIndex) => {
    const equipmentItem = equipment[equipmentSlotKey]
    if (!equipmentItem) {
      setNotice('Esa ranura de equipamiento está vacía.')
      return { ok: false }
    }

    try {
      await desequiparObjetoEnRanura(activeCharacterId, equipmentSlotKey, targetSlotIndex)
      setEquipmentByCharacter((currentEquipment) => {
        const next = { ...(currentEquipment[activeCharacterId] || {}) }
        delete next[equipmentSlotKey]
        return { ...currentEquipment, [activeCharacterId]: next }
      })
      const nextItems = items.map((item, itemIndex) => (
        itemIndex === targetSlotIndex ? equipmentItem : item
      ))
      setInventories((currentInventories) => ({
        ...currentInventories,
        [activeCharacterId]: nextItems,
      }))
      setNotice(`${equipmentItem.name} desequipado y dejado en la mochila.`)
      return { ok: true }
    } catch (error) {
      setNotice(error.response?.data?.error || 'No se pudo desequipar el objeto.')
      return { ok: false }
    }
  }, [activeCharacterId, equipment, items, setNotice])

  const transferItem = useCallback(async (slotIndex, targetCharacter) => {
    const item = items[slotIndex]
    if (!item) {
      setNotice('Selecciona un objeto antes de transferirlo.')
      return { ok: false }
    }

    try {
      await transferirObjeto(activeCharacterId, slotIndex, targetCharacter.idPersonaje)
      setInventories((currentInventories) => {
        const next = { ...currentInventories, [activeCharacterId]: removeItem(items, slotIndex) }
        delete next[targetCharacter.idPersonaje]
        return next
      })
      return { ok: true, item }
    } catch (error) {
      setNotice(error.response?.data?.error || 'No se pudo transferir el objeto.')
      return { ok: false }
    }
  }, [activeCharacterId, items, setNotice])

  return {
    items,
    equipment,
    resources,
    inventoryLoading,
    setInventoryLoading,
    updateInventory,
    consumeItem,
    equipItem,
    unequipItem,
    unequipItemToSlot,
    transferItem,
  }
}
