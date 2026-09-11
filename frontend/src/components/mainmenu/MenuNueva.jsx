import { useMenuNav } from './useMenuNav'
import { formatFecha } from './utils'

export function MenuNueva({ partidas, onStart, onBack }) {
  const { focusedIndex, setFocusedIndex, registerRef } = useMenuNav({
    count: partidas.length,
    onActivate: (index) => onStart(partidas[index].idPartida),
    onBack,
  })

  return (
    <div className="main-menu-panel">
      <header className="main-menu-header">
        <p className="eyebrow">PROYECT-ASTRA</p>
        <h2 className="main-menu-view-title">Nueva partida</h2>
        <p className="main-menu-subtitle">Elegí un slot para empezar tu aventura.</p>
      </header>

      <ul className="main-menu-slots">
        {partidas.map((partida, index) => (
          <li
            key={partida.idPartida}
            className={`main-menu-slot${focusedIndex === index ? ' is-focused' : ''}`}
          >
            <button
              type="button"
              ref={registerRef(index)}
              className="main-menu-slot-main"
              onClick={() => onStart(partida.idPartida)}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              <span className="main-menu-slot-name">{partida.nombre}</span>
              <span className={`main-menu-slot-status${partida.tieneGuardado ? ' is-danger' : ''}`}>
                {partida.tieneGuardado
                  ? `Se sobrescribirá el guardado del ${formatFecha(partida.fechaGuardado)}`
                  : 'Empezar desde cero'}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <footer className="main-menu-footer">
        <span className="main-menu-hint" aria-hidden="true">
          <span><kbd className="main-menu-key">W/S</kbd> moverte</span>
          <span><kbd className="main-menu-key">Enter</kbd> empezar</span>
          <span><kbd className="main-menu-key">ESC</kbd> volver</span>
        </span>
      </footer>
    </div>
  )
}