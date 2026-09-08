import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './InventoryTooltip.css'

let lastMousePosition = { x: 0, y: 0 }
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (event) => {
    lastMousePosition = { x: event.clientX, y: event.clientY }
  }, { passive: true })
}

const TOOLTIP_WIDTH = 210
const TOOLTIP_HEIGHT = 130
const OFFSET = 16

function clampPosition(clientX, clientY) {
  let x = clientX + OFFSET
  let y = clientY + OFFSET
  if (x + TOOLTIP_WIDTH > window.innerWidth) x = clientX - TOOLTIP_WIDTH - OFFSET
  if (y + TOOLTIP_HEIGHT > window.innerHeight) y = clientY - TOOLTIP_HEIGHT - OFFSET
  return { x, y }
}

export function InventoryTooltip({ item }) {
  const [position, setPosition] = useState(() => clampPosition(lastMousePosition.x, lastMousePosition.y))

  useEffect(() => {
    if (!item) return undefined
    const onMouseMove = (event) => setPosition(clampPosition(event.clientX, event.clientY))
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [item])

  if (!item) return null
  const stats = [
    ['Fuerza', item.bonusFuerza],
    ['Destreza', item.bonusDestreza],
    ['Inteligencia', item.bonusInteligencia],
    ['Constitución', item.bonusConstitucion],
    ['Agilidad', item.bonusAgilidad],
  ].filter(([, value]) => Number(value) !== 0)

  return createPortal(
    <div
      className="inventory-tooltip"
      style={{ left: position.x, top: position.y }}
      role="tooltip"
    >
      <span className="inventory-tooltip-rarity">
        {item.category} · {item.rarity}
      </span>
      <strong>{item.name}</strong>
      <p>{item.description}</p>
      {item.tipoEquipamiento && stats.length > 0 && (
        <span className="inventory-tooltip-stats">
          {item.tipoEquipamiento}: {stats.map(([stat, value]) => `${stat} ${value > 0 ? '+' : ''}${value}`).join(' · ')}
        </span>
      )}
      <em>{item.weight.toFixed(1)} kg</em>
    </div>,
    document.body,
  )
}