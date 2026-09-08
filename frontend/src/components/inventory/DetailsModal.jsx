import { createPortal } from 'react-dom'
import './DetailsModal.css'

export function DetailsModal({ item, onClose }) {
  if (!item) return null

  const stats = [
    ['Fuerza', item.bonusFuerza],
    ['Destreza', item.bonusDestreza],
    ['Inteligencia', item.bonusInteligencia],
    ['Constitución', item.bonusConstitucion],
    ['Agilidad', item.bonusAgilidad],
  ].filter(([, value]) => Number(value) !== 0)

  return createPortal(
    <div className="details-modal-overlay" onClick={onClose}>
      <div
        className="details-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalles de ${item.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="details-modal-item">
          <span className="details-modal-item-icon" aria-hidden="true">{item.icon}</span>
          <div>
            <p className="details-modal-rarity">{item.category} · {item.rarity}</p>
            <h3>{item.name}</h3>
          </div>
        </div>

        <p className="details-modal-description">{item.description}</p>

        <p className="details-modal-weight">Peso por unidad: {item.weight.toFixed(1)}</p>

        {item.tipoEquipamiento && (
          <p className="details-modal-bonuses">
            Equipo: {item.tipoEquipamiento}
            {stats.length > 0 && (
              <span> · {stats.map(([stat, value]) => `${stat} ${value > 0 ? '+' : ''}${value}`).join(' · ')}</span>
            )}
          </p>
        )}

        <div className="details-modal-actions">
          <span className="details-modal-hint">Escape cierra</span>
          <button className="details-modal-close" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}