import './InventoryContextMenu.css'

export function InventoryContextMenu({ actions, actionIndex, position, onRun, onHover, onClose }) {
  return (
    <div
      className="context-menu-overlay"
      onClick={onClose}
      onContextMenu={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="context-menu" style={{ left: position.x, top: position.y }}>
        <p className="context-menu-title">Acciones</p>
        {actions.map((action, index) => (
          <button
            className={`context-menu-option ${index === actionIndex ? 'is-active' : ''}`}
            key={action.label}
            onClick={() => onRun(action)}
            onMouseEnter={() => onHover(index)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}