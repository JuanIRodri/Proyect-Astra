import { useEffect, useRef, useState } from 'react'
import { drawMapCanvas, DEFAULT_MAP_ZOOM } from '../../game/mapCanvas'
import { eventKeyToBinding, loadBindings, prettifyBinding } from '../../game/bindings'
import { usePartyPositions } from '../../hooks/usePartyPositions'
import { useMapCanvasController } from './useMapCanvasController'
import './MapView.css'

export const MAP_VIEW_WIDTH = 1080
export const MAP_VIEW_HEIGHT = 660

export function MapView({ personajes = [], onClose, positions: positionsProp, leaderIndex: leaderIndexProp }) {
  const canvasRef = useRef(null)
  const positionsHook = usePartyPositions()
  const positions = positionsProp ?? positionsHook.positions
  const leaderIndex = leaderIndexProp ?? positionsHook.leaderIndex
  const controller = useMapCanvasController({
    width: MAP_VIEW_WIDTH,
    height: MAP_VIEW_HEIGHT,
    positions,
    leaderIndex,
    initialZoom: DEFAULT_MAP_ZOOM,
    followLeader: true,
  })
  const {
    zoom, offset, onWheel, onPointerDown, onPointerMove, onPointerEnd, reset, recenterIfLeaderOutside, stepZoom, panBy,
  } = controller
  const [mapKey] = useState(() => prettifyBinding(loadBindings().mapa))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const context = canvas.getContext('2d')
    if (!context) return undefined

    recenterIfLeaderOutside()
    drawMapCanvas(context, {
      width: MAP_VIEW_WIDTH,
      height: MAP_VIEW_HEIGHT,
      zoom,
      offset,
      positions,
      leaderIndex,
      personajes,
    })
  }, [positions, leaderIndex, personajes, zoom, offset, recenterIfLeaderOutside])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const handler = (event) => {
      event.preventDefault()
      onWheel(event)
    }
    canvas.addEventListener('wheel', handler, { passive: false })
    return () => canvas.removeEventListener('wheel', handler)
  }, [onWheel])

  useEffect(() => {
    const PAN_TILES = 5
    const handleKeyDown = (event) => {
      const key = eventKeyToBinding(event)
      if (event.key === 'Escape' || event.code === 'Escape' || (key && key === loadBindings().mapa)) {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        stepZoom(1)
        return
      }
      if (event.key === '-' || event.key === '_' || event.key === '−') {
        event.preventDefault()
        stepZoom(-1)
        return
      }
      if (event.key === '0') {
        event.preventDefault()
        reset()
        return
      }
      if (event.key === 'ArrowLeft') { event.preventDefault(); panBy(-PAN_TILES, 0) }
      else if (event.key === 'ArrowRight') { event.preventDefault(); panBy(PAN_TILES, 0) }
      else if (event.key === 'ArrowUp') { event.preventDefault(); panBy(0, -PAN_TILES) }
      else if (event.key === 'ArrowDown') { event.preventDefault(); panBy(0, PAN_TILES) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, stepZoom, reset, panBy])

  return (
    <div
      className="map-view-backdrop"
      role="dialog"
      aria-label="Mapa de la zona"
      onClick={onClose}
    >
      <section className="map-view" onClick={(event) => event.stopPropagation()}>
        <header className="map-view-header">
          <h2 className="map-view-title">Mapa</h2>
          <button
            type="button"
            className="map-view-close"
            aria-label="Cerrar mapa"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="map-view-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={MAP_VIEW_WIDTH}
            height={MAP_VIEW_HEIGHT}
            className="map-view-canvas"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            onDoubleClick={reset}
          />
          <div className="map-view-tools" aria-hidden="true">
            <span className="map-view-zoom-level">{zoom.toFixed(1)}×</span>
            <button
              type="button"
              className="map-view-tool"
              aria-label="Acercar"
              onClick={() => controller.stepZoom(1)}
            >
              +
            </button>
            <button
              type="button"
              className="map-view-tool"
              aria-label="Alejar"
              onClick={() => controller.stepZoom(-1)}
            >
              −
            </button>
            <button type="button" className="map-view-tool map-view-tool--wide" onClick={reset}>
              Restablecer
            </button>
          </div>
        </div>

        <footer className="map-view-footer">
          <span>Rueda / teclas + − para zoom · arrastra o flechas para moverte · 0 restablece</span>
          <span aria-hidden="true">
            <kbd className="map-view-key">{mapKey}</kbd> / <kbd className="map-view-key">ESC</kbd> cerrar
          </span>
        </footer>
      </section>
    </div>
  )
}