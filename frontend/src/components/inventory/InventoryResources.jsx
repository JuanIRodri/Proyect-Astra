import './InventoryResources.css'

export function InventoryResources({ resources }) {
  const vidaPercent = resources?.vidaMax ? Math.max(0, Math.min(100, (resources.vidaActual / resources.vidaMax) * 100)) : 0
  const manaPercent = resources?.manaMax ? Math.max(0, Math.min(100, (resources.manaActual / resources.manaMax) * 100)) : 0

  return (
    <div className="inventory-resources">
      <div className="inventory-resource inventory-resource-vida">
        <div className="inventory-resource-label">
          <span>Vida</span>
          <strong>{resources?.vidaActual ?? 0} / {resources?.vidaMax ?? 0}</strong>
        </div>
        <div className="inventory-resource-meter" role="progressbar" aria-label="Vida" aria-valuemin="0" aria-valuemax={resources?.vidaMax ?? 0} aria-valuenow={resources?.vidaActual ?? 0}>
          <span style={{ width: `${vidaPercent}%` }} />
        </div>
      </div>
      <div className="inventory-resource inventory-resource-mana">
        <div className="inventory-resource-label">
          <span>Maná</span>
          <strong>{resources?.manaActual ?? 0} / {resources?.manaMax ?? 0}</strong>
        </div>
        <div className="inventory-resource-meter" role="progressbar" aria-label="Maná" aria-valuemin="0" aria-valuemax={resources?.manaMax ?? 0} aria-valuenow={resources?.manaActual ?? 0}>
          <span style={{ width: `${manaPercent}%` }} />
        </div>
      </div>
    </div>
  )
}