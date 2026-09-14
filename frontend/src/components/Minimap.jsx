import { useEffect, useRef } from 'react'
import { drawMapCanvas, calculateFollowOffset, DEFAULT_MAP_ZOOM } from '../game/mapCanvas'
import { getPartyPositionsSnapshot } from '../game/partyPositionsStore'
import { getBlockedTilesVersion } from '../game/collision'
import { useMapCanvasController } from './map/useMapCanvasController'
import './Minimap.css'

const MINIMAP_WIDTH = 216
const MINIMAP_HEIGHT = 132

function positionsChanged(prev, next, nextLeader) {
  if (!prev || prev.leader !== nextLeader || next.length !== prev.positions.length) return true
  for (let i = 0; i < next.length; i += 1) {
    if (next[i].x !== prev.positions[i].x || next[i].y !== prev.positions[i].y) return true
  }
  return false
}

export function Minimap({
  personajes = [],
  keysDisabled = false,
  positions: positionsProp,
  leaderIndex: leaderIndexProp,
}) {
  const canvasRef = useRef(null)
  const zoomInRef = useRef(null)
  const zoomOutRef = useRef(null)
  const controller = useMapCanvasController({
    width: MINIMAP_WIDTH,
    height: MINIMAP_HEIGHT,
    positions: positionsProp ?? [],
    leaderIndex: leaderIndexProp ?? 0,
    initialZoom: DEFAULT_MAP_ZOOM,
    followLeader: true,
    disablePan: true,
  })
  const {
    zoom, onWheel, onPointerDown, onPointerMove, onPointerEnd, reset, stepZoom,
  } = controller

  const zoomRef = useRef(zoom)
  const personajesRef = useRef(personajes)
  const fallbackRef = useRef({ positions: positionsProp ?? [], leaderIndex: leaderIndexProp ?? 0 })

  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { personajesRef.current = personajes }, [personajes])
  useEffect(() => {
    fallbackRef.current = { positions: positionsProp ?? [], leaderIndex: leaderIndexProp ?? 0 }
  }, [positionsProp, leaderIndexProp])

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
    const zoomIn = zoomInRef.current
    const zoomOut = zoomOutRef.current
    if (!zoomIn || !zoomOut) return undefined
    const onIn = (event) => {
      event.stopPropagation()
      stepZoom(1)
    }
    const onOut = (event) => {
      event.stopPropagation()
      stepZoom(-1)
    }
    zoomIn.addEventListener('pointerdown', onIn)
    zoomOut.addEventListener('pointerdown', onOut)
    return () => {
      zoomIn.removeEventListener('pointerdown', onIn)
      zoomOut.removeEventListener('pointerdown', onOut)
    }
  }, [stepZoom])

  useEffect(() => {
    if (keysDisabled) return undefined
    const handleKeyDown = (event) => {
      const target = event.target
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        stepZoom(1)
      } else if (event.key === '-' || event.key === '_' || event.key === '−') {
        event.preventDefault()
        stepZoom(-1)
      } else if (event.key === '0') {
        event.preventDefault()
        reset()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keysDisabled, stepZoom, reset])

  useEffect(() => {
    let frameId = 0
    let last = null
    const drawFrame = () => {
      frameId = requestAnimationFrame(drawFrame)
      const canvas = canvasRef.current
      if (!canvas) return
      const context = canvas.getContext('2d')
      if (!context) return
      const { positions: storePositions, leaderIndex: storeLeader } = getPartyPositionsSnapshot()
      const hasStorePositions = storePositions.length > 0
      const positions = hasStorePositions ? storePositions : fallbackRef.current.positions
      const leaderIndex = hasStorePositions ? storeLeader : fallbackRef.current.leaderIndex
      const currentZoom = zoomRef.current
      const blockedVersion = getBlockedTilesVersion()
      if (!positionsChanged(last, positions, leaderIndex) && last?.zoom === currentZoom && last?.blockedVersion === blockedVersion) return
      const offset = calculateFollowOffset({
        width: MINIMAP_WIDTH,
        height: MINIMAP_HEIGHT,
        zoom: currentZoom,
        positions,
        leaderIndex,
      })
      last = { positions, leader: leaderIndex, zoom: currentZoom, blockedVersion }
      drawMapCanvas(context, {
        width: MINIMAP_WIDTH,
        height: MINIMAP_HEIGHT,
        zoom: currentZoom,
        offset,
        positions,
        leaderIndex,
        personajes: personajesRef.current,
      })
    }
    frameId = requestAnimationFrame(drawFrame)
    return () => {
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <div className="minimap" aria-label="Mapa de la zona">
      <canvas
        ref={canvasRef}
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        className="minimap-canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onDoubleClick={reset}
      />
      <div className="minimap-zoom" aria-hidden="true">
        <button
          ref={zoomInRef}
          type="button"
          className="minimap-zoom-btn"
          aria-label="Acercar mapa"
        >
          +
        </button>
        <button
          ref={zoomOutRef}
          type="button"
          className="minimap-zoom-btn"
          aria-label="Alejar mapa"
        >
          −
        </button>
      </div>
      <span className="minimap-zoom-level" aria-hidden="true">
        {zoom.toFixed(1)}×
      </span>
      {zoom > 1 && (
        <button
          type="button"
          className="minimap-reset"
          aria-label="Restablecer zoom"
          onClick={reset}
          onPointerDown={(event) => event.stopPropagation()}
        >
          ×
        </button>
      )}
    </div>
  )
}