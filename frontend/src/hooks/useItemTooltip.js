import { useCallback, useState } from 'react'

export function useItemTooltip() {
  const [tooltip, setTooltip] = useState(null)

  const showTooltip = useCallback((event, item) => {
    if (!item) return
    setTooltip({ x: event.clientX, y: event.clientY, item })
  }, [])

  const moveTooltip = useCallback((event) => {
    setTooltip((current) => (current ? { x: event.clientX, y: event.clientY, item: current.item } : current))
  }, [])

  const hideTooltip = useCallback(() => setTooltip(null), [])

  return { itemTooltip: tooltip, showTooltip, moveTooltip, hideTooltip }
}