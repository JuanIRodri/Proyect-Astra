import { useCallback, useState } from 'react'
import { DEFAULT_BINDINGS, loadBindings, saveBindings } from '../../game/bindings'

export function useTeclas() {
  const [bindings, setBindings] = useState(loadBindings)

  const setBinding = useCallback((actionId, key) => {
    setBindings((current) => {
      const next = { ...current, [actionId]: key }
      saveBindings(next)
      return next
    })
  }, [])

  const restoreDefaults = useCallback(() => {
    const defaults = { ...DEFAULT_BINDINGS }
    saveBindings(defaults)
    setBindings(defaults)
  }, [])

  return { bindings, setBinding, restoreDefaults }
}