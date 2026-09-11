import { useEffect } from 'react'
import { useMenuNav } from './useMenuNav'
import { useOpciones } from './useOpciones'

const ROWS = [
  { id: 'musica', label: 'Música' },
  { id: 'efectos', label: 'Efectos de sonido' },
  { id: 'volver', label: 'Volver a opciones' },
]

export function MenuOpcionesAudio({ onBack }) {
  const { opciones, setVolumen } = useOpciones()
  const { focusedIndex, setFocusedIndex, registerRef } = useMenuNav({
    count: ROWS.length,
    onActivate: (index) => {
      if (ROWS[index].id === 'volver') onBack()
    },
    onBack,
  })

  useEffect(() => {
    const handleKeyDown = (event) => {
      const row = ROWS[focusedIndex]
      if (!row || row.id === 'volver') return
      const delta =
        event.key === 'ArrowLeft' || event.key === 'a'
          ? -5
          : event.key === 'ArrowRight' || event.key === 'd'
            ? 5
            : 0
      if (!delta) return
      event.preventDefault()
      setVolumen(row.id, (opciones[row.id] || 0) + delta)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedIndex, opciones, setVolumen])

  return (
    <div className="main-menu-panel">
      <header className="main-menu-header">
        <p className="eyebrow">PROYECT-ASTRA</p>
        <h2 className="main-menu-view-title">Audio</h2>
      </header>

      <div className="main-menu-list">
        {ROWS.map((row, index) => {
          const focused = focusedIndex === index
          const value = opciones[row.id]
          return (
            <button
              key={row.id}
              type="button"
              ref={registerRef(index)}
              className={`main-menu-option${focused ? ' is-focused' : ''}`}
              onClick={() => {
                if (row.id === 'volver') onBack()
              }}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              <span className="main-menu-option-label">{row.label}</span>
              <span className="main-menu-option-value">
                <span className="main-menu-option-meter" aria-hidden="true">
                  <span style={{ width: `${value}%` }} />
                </span>
                <strong>{value}%</strong>
              </span>
            </button>
          )
        })}
      </div>

      <footer className="main-menu-footer">
        <span className="main-menu-hint" aria-hidden="true">
          <span><kbd className="main-menu-key">W/S</kbd> moverte</span>
          <span><kbd className="main-menu-key">A/D</kbd> o <kbd className="main-menu-key">←/→</kbd> ajustar</span>
          <span><kbd className="main-menu-key">ESC</kbd> volver</span>
        </span>
      </footer>
    </div>
  )
}