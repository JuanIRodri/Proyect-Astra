import { useEffect, useRef, useState } from 'react'
import './PauseMenu.css'

const PAUSE_ACTIONS = ['continuar', 'guardar']

export function PauseMenu({ onContinue, onSaveAndExit, saving }) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const actionRefs = useRef([])

  useEffect(() => {
    actionRefs.current[focusedIndex]?.focus()
  }, [focusedIndex])

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if (key === 'w' || key === 'arrowup') {
        event.preventDefault()
        setFocusedIndex((index) => (index - 1 + PAUSE_ACTIONS.length) % PAUSE_ACTIONS.length)
        return
      }
      if (key === 's' || key === 'arrowdown') {
        event.preventDefault()
        setFocusedIndex((index) => (index + 1) % PAUSE_ACTIONS.length)
        return
      }
      if (key === 'enter' || key === ' ') {
        event.preventDefault()
        actionRefs.current[focusedIndex]?.click()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedIndex])

  return (
    <div className="pause-menu-backdrop">
      <div className="pause-menu" role="dialog" aria-label="Menú de pausa">
        <h2 className="pause-menu-title">Pausa</h2>
        <div className="pause-menu-actions">
          <button
            type="button"
            ref={(node) => { actionRefs.current[0] = node }}
            className="pause-menu-btn"
            onClick={() => onContinue()}
            onMouseEnter={() => setFocusedIndex(0)}
          >
            Continuar
          </button>
          <button
            type="button"
            ref={(node) => { actionRefs.current[1] = node }}
            className="pause-menu-btn pause-menu-btn-secondary"
            onClick={() => onSaveAndExit()}
            onMouseEnter={() => setFocusedIndex(1)}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar y salir'}
          </button>
        </div>
        <p className="pause-menu-hint">W/S · flechas para moverte, Enter para elegir, ESC para continuar</p>
      </div>
    </div>
  )
}