import './InventoryStats.css'

const KEY_HINTS = [
  { key: 'E', label: 'Equipar · Usar', conditional: true },
  { key: 'Q', label: 'Soltar' },
  { key: 'R', label: 'Dividir' },
  { key: 'C', label: 'División exacta' },
  { key: 'V', label: 'Detalles' },
  { key: 'G', label: 'Equipo' },
  { key: 'O', label: 'Ordenar' },
  { key: 'T', label: 'Traspaso' },
  { key: 'Tab', label: 'Personaje' },
  { key: 'F', label: 'Categoría' },
  { key: '⇧F', label: 'Rareza' },
  { key: 'I', label: 'Salir' },
]

export function InventoryStats({
  goldAmount,
  currentWeight,
  maxWeight,
  weightPercent,
  weightState,
  notice,
  inventoryLoading,
  equipKeyActive,
}) {
  return (
    <>
      <div className="inventory-summary">
        <div className="inventory-gold">
          <span className="inventory-summary-icon" aria-hidden="true">◈</span>
          <div>
            <strong>{goldAmount}</strong>
            <span>Oro</span>
          </div>
        </div>
        <div className={`inventory-weight ${weightState}`}>
          <div className="inventory-weight-label">
            <span>Peso</span>
            <strong>{currentWeight.toFixed(1)} / {maxWeight.toFixed(1)}</strong>
          </div>
          <div className="inventory-weight-meter" role="progressbar" aria-label="Peso del inventario" aria-valuemin="0" aria-valuemax={maxWeight} aria-valuenow={Number(currentWeight.toFixed(1))}>
            <span style={{ width: `${weightPercent}%` }} />
          </div>
        </div>
      </div>

      <footer className="inventory-footer">
        <span className="inventory-footer-notice">{inventoryLoading ? 'Cargando inventario...' : notice}</span>
        <span className="inventory-footer-keys">
          {KEY_HINTS.map(({ key, label, conditional }) => (
            <span key={key}>
              <span className={`inventory-key ${conditional && !equipKeyActive ? 'is-inactive' : ''}`}>{key}</span> {label}
            </span>
          ))}
        </span>
      </footer>
    </>
  )
}