import { useMenuNav } from './useMenuNav'

const ROWS = [
  { id: 'audio', label: 'Audio' },
  { id: 'video', label: 'Video' },
  { id: 'teclas', label: 'Atajos de teclado' },
  { id: 'volver', label: 'Volver al menú' },
]

export function MenuOpciones({ onBack, onAudio, onVideo, onTeclas }) {
  const { focusedIndex, setFocusedIndex, registerRef } = useMenuNav({
    count: ROWS.length,
    onActivate: (index) => {
      const row = ROWS[index]
      if (row.id === 'audio') onAudio()
      if (row.id === 'video') onVideo()
      if (row.id === 'teclas') onTeclas()
      if (row.id === 'volver') onBack()
    },
    onBack,
  })

  return (
    <div className="main-menu-panel">
      <header className="main-menu-header">
        <p className="eyebrow">PROYECT-ASTRA</p>
        <h2 className="main-menu-view-title">Opciones</h2>
      </header>

      <div className="main-menu-list">
        {ROWS.map((row, index) => {
          const focused = focusedIndex === index
          return (
            <button
              key={row.id}
              type="button"
              ref={registerRef(index)}
              className={`main-menu-option${focused ? ' is-focused' : ''}`}
              onClick={() => {
                if (row.id === 'audio') onAudio()
                if (row.id === 'video') onVideo()
                if (row.id === 'teclas') onTeclas()
                if (row.id === 'volver') onBack()
              }}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              <span className="main-menu-option-label">{row.label}</span>
              <span className="main-menu-option-value">
                <span className="main-menu-option-enter" aria-hidden="true">Enter</span>
              </span>
            </button>
          )
        })}
      </div>

      <footer className="main-menu-footer">
        <span className="main-menu-hint" aria-hidden="true">
          <span><kbd className="main-menu-key">W/S</kbd> moverte</span>
          <span><kbd className="main-menu-key">Enter</kbd> abrir</span>
          <span><kbd className="main-menu-key">ESC</kbd> volver</span>
        </span>
      </footer>
    </div>
  )
}