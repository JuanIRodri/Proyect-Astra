import { EQUIPMENT_SLOTS } from './inventoryUtils'
import './InventoryDetail.css'

export function InventoryDetail({
  detailItem,
  showItemDetails,
  equipment,
  selectedEquipmentSlot,
  equipmentBonuses,
  onSelectEquipmentSlot,
  onDoubleClickEquipmentSlot,
  onDropEquip,
}) {
  return (
    <div className="inventory-detail">
      {detailItem ? (
        <>
          <div className="inventory-detail-summary">
            <div className="inventory-detail-icon" aria-hidden="true">{detailItem.icon}</div>
            <div>
              <p className="inventory-detail-category">{detailItem.category} / {detailItem.rarity}</p>
              <h3>{detailItem.name}</h3>
            </div>
          </div>
          {showItemDetails && (
            <div className="inventory-detail-expanded">
              <p>{detailItem.description}</p>
              <p className="inventory-item-weight">Peso por unidad: {detailItem.weight.toFixed(1)}</p>
              {detailItem.tipoEquipamiento && (
                <p className="inventory-item-bonuses">
                  Equipo: {detailItem.tipoEquipamiento} · {[
                    ['Fuerza', detailItem.bonusFuerza],
                    ['Destreza', detailItem.bonusDestreza],
                    ['Inteligencia', detailItem.bonusInteligencia],
                    ['Constitución', detailItem.bonusConstitucion],
                    ['Agilidad', detailItem.bonusAgilidad],
                  ].filter(([, value]) => Number(value) !== 0).map(([stat, value]) => `${stat} ${value > 0 ? '+' : ''}${value}`).join(' · ')}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="inventory-empty-detail">Este espacio está vacío.</p>
      )}
      <section className="inventory-equipment" aria-label="Equipamiento del personaje">
        <div className="inventory-equipment-heading">
          <p className="inventory-kicker">EQUIPAMIENTO</p>
          <span>El equipo puesto no ocupa capacidad</span>
        </div>
        <div className="inventory-equipment-slots">
          {EQUIPMENT_SLOTS.map((slot) => {
            const equippedItem = equipment[slot.key]
            return equippedItem ? (
              <button
                className={`inventory-equipment-slot is-filled ${selectedEquipmentSlot === slot.key ? 'is-selected' : ''}`}
                key={slot.key}
                type="button"
                onClick={() => onSelectEquipmentSlot(slot.key)}
                onDoubleClick={() => onDoubleClickEquipmentSlot(slot.key)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  const data = event.dataTransfer.getData('text/plain')
                  if (/^\d+$/.test(data)) onDropEquip(Number(data), slot.key)
                }}
                title={`Ver detalles de ${equippedItem.name}`}
                aria-label={`${slot.label}: ${equippedItem.name}. Pulsar para ver detalles`}
              >
                <span
                  className="inventory-equipment-slot-drag"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', `equip-${slot.key}`)
                    event.dataTransfer.effectAllowed = 'move'
                  }}
                >
                  <span className="inventory-equipment-slot-icon" aria-hidden="true">{equippedItem.icon}</span>
                  <span className="inventory-equipment-slot-label">{slot.label}</span>
                  <strong>{equippedItem.name}</strong>
                </span>
              </button>
            ) : (
              <button
                className={`inventory-equipment-slot ${selectedEquipmentSlot === slot.key ? 'is-selected' : ''}`}
                key={slot.key}
                type="button"
                onClick={() => onSelectEquipmentSlot(slot.key)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  const data = event.dataTransfer.getData('text/plain')
                  if (/^\d+$/.test(data)) onDropEquip(Number(data), slot.key)
                }}
                aria-label={`${slot.label}: vacío`}
              >
                <span className="inventory-equipment-slot-icon" aria-hidden="true">{slot.icon}</span>
                <span className="inventory-equipment-slot-label">{slot.label}</span>
                <strong>Vacío</strong>
              </button>
            )
          })}
        </div>
        <p className="inventory-equipment-bonuses">
          Bonificaciones:
          {Object.entries(equipmentBonuses).filter(([, value]) => value !== 0).map(([stat, value]) => ` ${stat} ${value > 0 ? '+' : ''}${value}`).join(' · ') || ' ninguna'}
        </p>
      </section>
    </div>
  )
}