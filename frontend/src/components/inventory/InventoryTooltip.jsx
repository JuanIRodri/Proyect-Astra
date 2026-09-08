import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './InventoryTooltip.css'

export function InventoryTooltip({ item }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!item) return undefined
    const onMouseMove = (event) => {
      let x = event.clientX + 16
      let y = event.clientY + 16
      if (x + 210 > window.innerWidth) x = event.clientX - 226
      if (y + 130 > window.innerHeight) y = event.clientY - 141
      setPosition({ x, y })
    }
    window.addEventListener('mousemove', onMouseMove)
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