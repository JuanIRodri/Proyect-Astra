import { createPortal } from 'react-dom'
import './SplitModal.css'

export function SplitModal({ item, onConfirm, onCancel }) {
  if (!item) return null

  const maxQuantity = item.quantity - 1

  const confirmWithInput = (event) => {
    const quantity = Number(event.target.value)
    if (!Number.isInteger(quantity)) return
    onConfirm(Math.max(1, Math.min(quantity, maxQuantity)))
  }

  return createPortal(
    <div className="split-overlay" onClick={onCancel}>
      <div
        className="split-modal"
        role="dialog"
        aria-modal="true"
        aria-label="División de objeto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="split-modal-item">
          <span className="split-modal-item-icon">{item.icon}</span>
          <span className="split-modal-item-name">{item.name}</span>
          <span className="split-modal-item-qty">×{item.quantity}</span>
        </div>

        <p className="split-modal-title">¿Cuántas unidades separás a un nuevo espacio?</p>

        <input
          className="split-modal-input"
          type="number"
          min={1}
          max={maxQuantity}
          defaultValue={Math.floor(maxQuantity / 2)}
          autoFocus
          aria-label={`Cantidad a separar (entre 1 y ${maxQuantity})`}
          onKeyDown={(event) => {
            if (event.key === 'Enter') confirmWithInput(event)
            if (event.key === 'Escape') onCancel()
          }}
        />

        <div className="split-modal-actions">
          <span className="split-modal-hint">Entre 1 y {maxQuantity} · Enter confirma · Escape cancela</span>
          <button className="split-modal-confirm" onClick={confirmWithInput}>Separar</button>
          <button className="split-modal-close" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}