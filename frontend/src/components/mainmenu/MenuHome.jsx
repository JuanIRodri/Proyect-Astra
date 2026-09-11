import { useMenuNav } from './useMenuNav'

export function MenuHome({ hasSaves, notice, onContinue, onLoad, onNew, onOptions }) {
  const { setFocusedIndex, registerRef } = useMenuNav({
    count: 4,
    onActivate: (index) => [onContinue, onLoad, onNew, onOptions][index](),
    onBack: () => {},
  })

  const actions = [
    { label: 'Continuar', primary: true, empty: !hasSaves, run: onContinue },
    { label: 'Cargar partida', run: onLoad },
    { label: 'Nueva partida', run: onNew },
    { label: 'Opciones', run: onOptions },
  ]

  return (
    <div className="main-menu-panel">
      <header className="main-menu-header">
        <p className="eyebrow">PROYECT-ASTRA</p>
        <h1 className="main-menu-h1">Las ruinas de Astra</h1>
        <p className="main-menu-subtitle">¿Qué vas a hacer hoy, explorador?</p>
      </header>

      <div className="main-menu-list">
        {actions.map((action, index) => (
          <button
            key={action.label}
            type="button"
            ref={registerRef(index)}
            className={`main-menu-btn${action.primary ? ' main-menu-btn-primary' : ''}${action.empty ? ' is-empty' : ''}`}
            onClick={action.run}
            onMouseEnter={() => setFocusedIndex(index)}
          >
            {action.label}
          </button>
        ))}
      </div>

      <footer className="main-menu-footer">
        <span className="main-menu-notice">{notice || '\u00A0'}</span>
        <span className="main-menu-hint" aria-hidden="true">
          <span><kbd className="main-menu-key">W/S</kbd> moverte</span>
          <span><kbd className="main-menu-key">Enter</kbd> elegir</span>
        </span>
      </footer>
    </div>
  )
}