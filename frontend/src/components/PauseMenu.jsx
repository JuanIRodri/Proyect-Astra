import './PauseMenu.css'

export function PauseMenu({ onContinue, onSaveAndExit, saving }) {
  return (
    <div className="pause-menu-backdrop">
      <div className="pause-menu" role="dialog" aria-label="Menú de pausa">
        <h2 className="pause-menu-title">Pausa</h2>
        <div className="pause-menu-actions">
          <button type="button" className="pause-menu-btn" onClick={onContinue}>
            Continuar
          </button>
          <button
            type="button"
            className="pause-menu-btn pause-menu-btn-secondary"
            onClick={onSaveAndExit}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar y salir'}
          </button>
        </div>
        <p className="pause-menu-hint">ESC para continuar</p>
      </div>
    </div>
  )
}