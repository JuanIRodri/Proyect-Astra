import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './ItemTooltip.css'

const STAT_LABELS = [
  ['bonusFuerza', 'Fuerza'],
  ['bonusDestreza', 'Destreza'],
  ['bonusInteligencia', 'Inteligencia'],
  ['bonusConstitucion', 'Constitución'],
  ['bonusAgilidad', 'Agilidad'],
]

function rarityClass(rarity) {
  const token = String(rarity || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (token === 'legendario' || token === 'unico') return 'is-legendary'
  if (token === 'epico') return 'is-epic'
  if (token === 'raro') return 'is-rare'
  return ''
}

export function ItemTooltip({ item, x, y }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    let left = x + 14
    let top = y + 16
    if (left + rect.width > window.innerWidth - 8) left = x - rect.width - 14
    if (top + rect.height > window.innerHeight - 8) top = y - rect.height - 16
    el.style.left = `${Math.max(8, left)}px`
    el.style.top = `${Math.max(8, top)}px`
  }, [x, y, item])

  if (!item) return null

  const stats = STAT_LABELS.filter(([key]) => Number(item[key] || 0) !== 0)
  const effect = item.efectoVida || item.effectVida

  return createPortal(
    <div
      className={`item-tooltip ${rarityClass(item.rarity ?? item.rareza)}`}
      ref={ref}
      style={{ left: x, top: y }}
      role="tooltip"
    >
      <div className="item-tooltip-header">
        <span className="item-tooltip-icon" aria-hidden="true">{item.icon || '📦'}</span>
        <div className="item-tooltip-title">
          <strong>{item.name || item.nombre}</strong>
          {Number(item.quantity ?? item.cantidad ?? 0) > 1 && (
            <span className="item-tooltip-qty">×{item.quantity ?? item.cantidad}</span>
          )}
        </div>
      </div>

      {(item.rarity ?? item.rareza) || (item.category ?? item.categoria) ? (
        <div className="item-tooltip-tags">
          {item.rarity ?? item.rareza ? <span className="item-tooltip-tag item-tooltip-rarity">{item.rarity ?? item.rareza}</span> : null}
          {item.category ?? item.categoria ? <span className="item-tooltip-tag">{item.category ?? item.categoria}</span> : null}
          {item.tipoEquipamiento ? <span className="item-tooltip-tag">Equipable</span> : null}
          {item.consumible ? <span className="item-tooltip-tag">Consumible</span> : null}
        </div>
      ) : null}

      {item.description ?? item.descripcion ? (
        <p className="item-tooltip-description">{item.description || item.descripcion}</p>
      ) : null}

      <div className="item-tooltip-meta">
        {Number(item.weight ?? item.peso ?? 0) > 0 && <span>Peso {item.weight ?? item.peso}</span>}
        {effect > 0 && <span>Vida +{effect}</span>}
        {Number(item.maxPila ?? 0) > 1 && <span>Pila máx. {item.maxPila}</span>}
      </div>

      {stats.length > 0 && (
        <ul className="item-tooltip-stats">
          {stats.map(([key, label]) => (
            <li key={key}>
              <span>{label}</span>
              <strong>{item[key] > 0 ? `+${item[key]}` : item[key]}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>,
    document.body,
  )
}