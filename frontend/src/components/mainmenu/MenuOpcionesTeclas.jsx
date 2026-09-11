import { useCallback, useEffect, useRef, useState } from 'react'
import { useTeclas } from './useTeclas'
import {
  BINDING_LABELS,
  BINDABLE_ACTIONS,
  eventKeyToBinding,
  prettifyBinding,
} from '../../game/bindings'

const PAIRS = [
  ['moverArriba', 'moverAbajo'],
  ['moverIzquierda', 'moverDerecha'],
  ['lider1', 'lider2'],
  ['lider3', 'editarStats'],
  ['inventario', 'interactuar'],
]

const WIDE_ROWS = [
  { id: 'restablecer', label: 'Restablecer atajos', reset: true },
  { id: 'volver', label: 'Volver a opciones' },
]

const LAST_INDEX = PAIRS.length + WIDE_ROWS.length - 1

export function MenuOpcionesTeclas({ onBack }) {
  const { bindings, setBinding, restoreDefaults } = useTeclas()
  const [focus, setFocus] = useState({ index: 0, col: 0 })
  const [capturingId, setCapturingId] = useState(null)
  const [conflict, setConflict] = useState(null)
  const [notice, setNotice] = useState('')
  const refs = useRef({})

  const registerRef = (index, col) => (node) => {
    refs.current[`${index}:${col ?? ''}`] = node
  }

  const startCapture = (actionId) => {
    document.activeElement?.blur()
    setCapturingId(actionId)
  }

  const activate = useCallback((index, col) => {
    if (index < PAIRS.length) {
      startCapture(PAIRS[index][col])
      return
    }
    const row = WIDE_ROWS[index - PAIRS.length]
    if (row.reset) {
      restoreDefaults()
      setNotice('Atajos restablecidos.')
    }
    if (row.id === 'volver') onBack()
  }, [restoreDefaults, onBack])

  useEffect(() => {
    if (capturingId || conflict) return undefined
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if (key === 'escape') {
        event.preventDefault()
        onBack()
        return
      }
      if (key === 'w' || key === 'arrowup') {
        event.preventDefault()
        setFocus((current) => ({ ...current, index: Math.max(0, current.index - 1) }))
        return
      }
      if (key === 's' || key === 'arrowdown') {
        event.preventDefault()
        setFocus((current) => ({
          ...current,
          index: current.index === LAST_INDEX ? 0 : current.index + 1,
        }))
        return
      }
      if (key === 'a' || key === 'arrowleft') {
        if (focus.index < PAIRS.length) {
          event.preventDefault()
          setFocus((current) => ({ ...current, col: 0 }))
        }
        return
      }
      if (key === 'd' || key === 'arrowright') {
        if (focus.index < PAIRS.length) {
          event.preventDefault()
          setFocus((current) => ({ ...current, col: 1 }))
        }
        return
      }
      if (key === 'enter' || key === ' ') {
        event.preventDefault()
        activate(focus.index, focus.col)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [capturingId, conflict, focus, activate, onBack])

  useEffect(() => {
    if (!capturingId) return undefined
    const handleKeyDown = (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (event.key === 'Escape') {
        setCapturingId(null)
        setNotice('Asignación cancelada.')
        return
      }
      const key = eventKeyToBinding(event)
      if (!key) return
      const takenAction = BINDABLE_ACTIONS.find(
        (id) => id !== capturingId && bindings[id] === key,
      )
      if (takenAction) {
        setConflict({ actionId: capturingId, otherAction: takenAction, key })
      } else {
        setBinding(capturingId, key)
        setNotice(`Atajo asignado: ${prettifyBinding(key)}`)
      }
      setCapturingId(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [capturingId, bindings, setBinding])

  useEffect(() => {
    if (!conflict) return undefined
    const handleKeyDown = (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (event.key === 'Enter') {
        setBinding(conflict.otherAction, null)
        setBinding(conflict.actionId, conflict.key)
        setNotice(
          `${prettifyBinding(conflict.key)} ahora está en ${BINDING_LABELS[conflict.actionId]}. Se la quité a ${BINDING_LABELS[conflict.otherAction]}.`,
        )
        setConflict(null)
        return
      }
      if (event.key === 'Escape') {
        setNotice(`${prettifyBinding(conflict.key)} sigue en ${BINDING_LABELS[conflict.otherAction]}.`)
        setConflict(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [conflict, setBinding])

  useEffect(() => {
    refs.current[`${focus.index}:${focus.col ?? ''}`]?.focus()
  }, [focus])

  if (conflict) {
    return (
      <div className="main-menu-panel">
        <header className="main-menu-header">
          <p className="eyebrow">PROYECT-ASTRA</p>
          <h2 className="main-menu-view-title">Atajos de teclado</h2>
        </header>

        <div className="main-menu-confirm">
          <p>
            <kbd className="main-menu-key is-binding">{prettifyBinding(conflict.key)}</kbd>{' '}
            ya está asignada a <strong>{BINDING_LABELS[conflict.otherAction]}</strong>.
            ¿Querés usarla para <strong>{BINDING_LABELS[conflict.actionId]}</strong>?
          </p>
          <p className="main-menu-confirm-note">
            {BINDING_LABELS[conflict.otherAction]} se queda sin tecla.
          </p>
        </div>

        <footer className="main-menu-footer">
          <span className="main-menu-hint" aria-hidden="true">
            <span><kbd className="main-menu-key">Enter</kbd> quitar y asignar</span>
            <span><kbd className="main-menu-key">ESC</kbd> cancelar</span>
          </span>
        </footer>
      </div>
    )
  }

  return (
    <div className="main-menu-panel">
      <header className="main-menu-header">
        <p className="eyebrow">PROYECT-ASTRA</p>
        <h2 className="main-menu-view-title">Atajos de teclado</h2>
      </header>

      <div className="main-menu-grid">
        {PAIRS.map((pair, rowIndex) => (
          <div key={pair[0]} className="main-menu-pair">
            {pair.map((actionId, col) => {
              const capturing = capturingId === actionId
              const focused = focus.index === rowIndex && focus.col === col
              return (
                <button
                  key={actionId}
                  type="button"
                  ref={registerRef(rowIndex, col)}
                  className={`main-menu-option${focused ? ' is-focused' : ''}${capturing ? ' is-capturing' : ''}`}
                  onClick={() => startCapture(actionId)}
                  onMouseEnter={() => setFocus({ index: rowIndex, col })}
                >
                  <span className="main-menu-option-label">{BINDING_LABELS[actionId]}</span>
                  <span className="main-menu-option-value">
                    <kbd className={`main-menu-key is-binding${capturing ? ' is-capturing' : ''}`}>
                      {capturing ? '?' : prettifyBinding(bindings[actionId])}
                    </kbd>
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="main-menu-list is-compact">
        {WIDE_ROWS.map((row, offset) => {
          const index = PAIRS.length + offset
          const focused = focus.index === index
          return (
            <button
              key={row.id}
              type="button"
              ref={registerRef(index, null)}
              className={`main-menu-option${focused ? ' is-focused' : ''}`}
              onClick={() => activate(index, 0)}
              onMouseEnter={() => setFocus({ index, col: 0 })}
            >
              <span className="main-menu-option-label">{row.label}</span>
              <span className="main-menu-option-enter" aria-hidden="true">Enter</span>
            </button>
          )
        })}
      </div>

      <footer className="main-menu-footer">
        {notice ? (
          <p className="main-menu-notice">{notice}</p>
        ) : (
          <span className="main-menu-hint" aria-hidden="true">
            <span><kbd className="main-menu-key">W/S</kbd> moverte</span>
            <span><kbd className="main-menu-key">←/→</kbd> cambiar columna</span>
            {capturingId ? (
              <span><kbd className="main-menu-key">ESC</kbd> cancelar</span>
            ) : (
              <span><kbd className="main-menu-key">Enter</kbd> cambiar tecla</span>
            )}
          </span>
        )}
      </footer>
    </div>
  )
}