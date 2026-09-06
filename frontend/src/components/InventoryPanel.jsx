import { useState } from 'react'
import './InventoryPanel.css'

const INVENTORY_ITEMS = [
  {
    id: 'astra-potion',
    name: 'Poción de Astra',
    description: 'Un líquido azul que recupera parte de la vida de un aventurero.',
    category: 'Consumible',
    quantity: 3,
    icon: '🧪',
    rarity: 'Comun',
  },
  {
    id: 'ember-shard',
    name: 'Fragmento de brasa',
    description: 'Una chispa mineral que todavía conserva calor en su interior.',
    category: 'Material',
    quantity: 8,
    icon: '◆',
    rarity: 'Raro',
  },
  {
    id: 'field-ration',
    name: 'Racion de viaje',
    description: 'Comida seca preparada para largas jornadas fuera del refugio.',
    category: 'Suministro',
    quantity: 5,
    icon: '◈',
    rarity: 'Comun',
  },
  {
    id: 'old-compass',
    name: 'Brújula antigua',
    description: 'La aguja apunta hacia el norte incluso bajo las ruinas de Astra.',
    category: 'Objeto clave',
    quantity: 1,
    icon: '✦',
    rarity: 'Epico',
  },
]

export function InventoryPanel({ onClose }) {
  const [selectedItemId, setSelectedItemId] = useState(INVENTORY_ITEMS[0].id)
  const selectedItem = INVENTORY_ITEMS.find((item) => item.id === selectedItemId)

  return (
    <aside className="inventory-panel" aria-label="Inventario del grupo">
      <div className="inventory-heading">
        <div>
          <p className="inventory-kicker">EQUIPO DE EXPLORACIÓN</p>
          <h2>Inventario</h2>
        </div>
        <button className="inventory-close" onClick={onClose} aria-label="Cerrar inventario" title="Cerrar inventario">
          ×
        </button>
      </div>

      <div className="inventory-content">
        <div className="inventory-grid" aria-label="Objetos del inventario">
          {INVENTORY_ITEMS.map((item) => (
            <button
              className={`inventory-slot ${item.id === selectedItemId ? 'is-selected' : ''}`}
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              aria-label={`${item.name}, cantidad ${item.quantity}`}
            >
              <span className="inventory-icon" aria-hidden="true">{item.icon}</span>
              <span className="inventory-quantity">{item.quantity}</span>
              <span className="inventory-slot-name">{item.name}</span>
            </button>
          ))}
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="inventory-slot inventory-slot-empty" key={`empty-${index}`} aria-hidden="true" />
          ))}
        </div>

        {selectedItem && (
          <div className="inventory-detail">
            <div className="inventory-detail-icon" aria-hidden="true">{selectedItem.icon}</div>
            <div>
              <p className="inventory-detail-category">{selectedItem.category} / {selectedItem.rarity}</p>
              <h3>{selectedItem.name}</h3>
              <p>{selectedItem.description}</p>
            </div>
          </div>
        )}
      </div>

      <footer className="inventory-footer">
        <span>4 objetos registrados</span>
        <span className="inventory-key">I</span>
      </footer>
    </aside>
  )
}
