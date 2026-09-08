import './TransferModal.css'

export function TransferModal({ item, characters, activeCharacterId, onTransfer, onCancel }) {
  if (!item) return null

  return (
    <div className="transfer-overlay" onClick={onCancel}>
      <div
        className="transfer-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Traspaso de objeto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="transfer-modal-item">
          <span className="transfer-modal-item-icon">{item.icon}</span>
          <span className="transfer-modal-item-name">{item.name}</span>
          <span className="transfer-modal-item-qty">×{item.quantity}</span>
        </div>

        <p className="transfer-modal-title">¿A qué personaje deseas traspasar el objeto?</p>

        <div className="transfer-character-list">
          {characters.map((character, index) => {
            const isSelf = character.idPersonaje === activeCharacterId
            return (
              <button
                className={`transfer-character-option ${isSelf ? 'is-self' : ''}`}
                key={character.idPersonaje}
                disabled={isSelf}
                onClick={() => onTransfer(index)}
              >
                <span className="transfer-character-number">{index + 1}</span>
                <span>{character.nombre || `Héroe #${character.idPersonaje}`}</span>
                {isSelf && <span className="transfer-character-self">(tú)</span>}
              </button>
            )
          })}
        </div>

        <div className="transfer-modal-actions">
          <span className="transfer-modal-hint">1/2/3 para elegir · Escape cancela</span>
          <button className="transfer-modal-close" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}