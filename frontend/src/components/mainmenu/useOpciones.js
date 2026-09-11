import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'astra-opciones'
const DEFAULT_OPCIONES = { musica: 70, efectos: 80 }

export function useOpciones() {
  const [opciones, setOpciones] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) return { ...DEFAULT_OPCIONES, ...JSON.parse(raw) }
    } catch {
      return DEFAULT_OPCIONES
    }
    return DEFAULT_OPCIONES
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(opciones))
    } catch {
      return undefined
    }
  }, [opciones])

  const setVolumen = useCallback((clave, value) => {
    setOpciones((current) => ({
      ...current,
      [clave]: Math.max(0, Math.min(100, value)),
    }))
  }, [])

  return { opciones, setVolumen }
}