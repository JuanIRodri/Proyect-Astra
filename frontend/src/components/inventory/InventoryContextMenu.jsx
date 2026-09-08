import { createPortal } from 'react-dom'
import './InventoryContextMenu.css'

export function InventoryContextMenu({ actions, actionIndex, submenuIndex, position, onRun, onHover, onHoverSubmenu, onClose }) {
  const activeAction = actions[actionIndex]
  return createPortal(
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
            onClick={() => {
              if (action.submenu) return
              onRun(action)
            }}
            onMouseEnter={() => {
              onHover(index)
              if (action.submenu) onHoverSubmenu(0)
            }}
          >
            {action.label}
            {action.submenu && <span className="context-menu-chevron" aria-hidden="true">›</span>}
          </button>
        ))}
      </div>
      {activeAction?.submenu && (
        <div className="context-menu context-menu-submenu" style={{ left: position.x + 150, top: position.y }}>
          <p className="context-menu-title">Enviar a</p>
          {activeAction.submenu.map((subAction, index) => (
            <button
              className={`context-menu-option ${index === submenuIndex ? 'is-active' : ''}`}
              key={subAction.label}
              onClick={() => onRun(subAction)}
              onMouseEnter={() => onHoverSubmenu(index)}
            >
              {subAction.label}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  )
}