import { useMenuNav } from './useMenuNav'
import { formatFecha } from './utils'

export function MenuCargar({ partidas, onLoad, onDelete, onBack }) {
  const { focusedIndex, setFocusedIndex, registerRef } = useMenuNav({
    count: Math.max(partidas.length, 1),
    onActivate: (index) => (partidas[index] ? onLoad(partidas[index].idPartida) : onBack()),
    onBack,
    onDelete: (index) => partidas[index] && onDelete(partidas[index].idPartida),
  })

  return (
    <div className="main-menu-panel">
      <header className="main-menu-header">
        <p className="eyebrow">PROYECT-ASTRA</p>
        <h2 className="main-menu-view-title">Cargar partida</h2>
      </header>

      {partidas.length === 0 ? (
        <div className="main-menu-empty">
          <p>No hay partidas guardadas todavía.</p>
          <button
            type="button"
            ref={registerRef(0)}
            className="main-menu-btn"
            onClick={onBack}
            onMouseEnter={() => setFocusedIndex(0)}
          >
            Volver al menú
          </button>
        </div>
      ) : (
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
                onClick={() => onLoad(partida.idPartida)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <span className="main-menu-slot-name">{partida.nombre}</span>
                <span className="main-menu-slot-status">Guardado: {formatFecha(partida.fechaGuardado)}</span>
              </button>
              <button
                type="button"
                className="main-menu-slot-delete"
                onClick={() => onDelete(partida.idPartida)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                Borrar
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className="main-menu-footer">
        <span className="main-menu-hint" aria-hidden="true">
          <span><kbd className="main-menu-key">W/S</kbd> moverte</span>
          <span><kbd className="main-menu-key">Enter</kbd> cargar</span>
          <span><kbd className="main-menu-key">X</kbd> borrar</span>
          <span><kbd className="main-menu-key">ESC</kbd> volver</span>
        </span>
      </footer>
    </div>
  )
}