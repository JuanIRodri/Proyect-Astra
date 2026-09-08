import './InventoryHeader.css'

export function InventoryHeader({ activeCharacter, onClose }) {
  return (
    <div className="inventory-heading">
      <div>
        <p className="inventory-kicker">EQUIPO DE EXPLORACIÓN · {activeCharacter?.clase || 'Aventurero'}</p>
        <h2>Inventario</h2>
      </div>
      <button className="inventory-close" onClick={onClose} aria-label="Cerrar inventario" title="Cerrar inventario">
        ×
      </button>
    </div>
  )
}