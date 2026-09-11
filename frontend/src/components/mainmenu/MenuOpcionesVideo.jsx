import { useEffect } from 'react'
import { useMenuNav } from './useMenuNav'
import { useOpcionesVideo } from './useOpcionesVideo'

const ROWS = [
  { id: 'pantallaCompleta', label: 'Pantalla completa' },
  { id: 'marcadorLider', label: 'Marcador del líder' },
  { id: 'overlayCuadricula', label: 'Overlay de cuadrícula' },
  { id: 'reducirEfectos', label: 'Reducir efectos visuales' },
  { id: 'volver', label: 'Volver a opciones' },
]

export function MenuOpcionesVideo({ onBack }) {
  const { video, toggle } = useOpcionesVideo()
  const { focusedIndex, setFocusedIndex, registerRef } = useMenuNav({
    count: ROWS.length,
    onActivate: (index) => {
      const row = ROWS[index]
      if (row.id === 'volver') onBack()
      else toggle(row.id)
    },
    onBack,
  })

  useEffect(() => {
    const handleKeyDown = (event) => {
      const row = ROWS[focusedIndex]
      if (!row || row.id === 'volver') return
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        toggle(row.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedIndex, toggle])

  return (
    <div className="main-menu-panel">
      <header className="main-menu-header">
        <p className="eyebrow">PROYECT-ASTRA</p>
        <h2 className="main-menu-view-title">Video</h2>
      </header>

      <div className="main-menu-list">
        {ROWS.map((row, index) => {
          const focused = focusedIndex === index
          const value = video[row.id]
          return (
            <button
              key={row.id}
              type="button"
              ref={registerRef(index)}
              className={`main-menu-option${focused ? ' is-focused' : ''}`}
              onClick={() => {
                if (row.id === 'volver') onBack()
                else toggle(row.id)
              }}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              <span className="main-menu-option-label">{row.label}</span>
              <span className="main-menu-option-value">
                {row.id === 'volver' ? (
                  <span className="main-menu-option-enter" aria-hidden="true">Enter</span>
                ) : (
                  <strong className={value ? 'is-on' : ''}>{value ? 'Sí' : 'No'}</strong>
                )}
              </span>
            </button>
          )
        })}
      </div>

      <footer className="main-menu-footer">
        <span className="main-menu-hint" aria-hidden="true">
          <span><kbd className="main-menu-key">W/S</kbd> moverte</span>
          <span><kbd className="main-menu-key">Enter</kbd> o <kbd className="main-menu-key">←/→</kbd> cambiar</span>
          <span><kbd className="main-menu-key">ESC</kbd> volver</span>
        </span>
      </footer>
    </div>
  )
}