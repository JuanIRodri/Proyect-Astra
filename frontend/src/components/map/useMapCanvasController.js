import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MAP_ZOOM_LEVELS,
  MIN_MAP_ZOOM,
  calculateFollowOffset,
  clampOffset,
  viewMetrics,
} from '../../game/mapCanvas'
import { isoUnproject } from '../../game/isometric'

const WHEEL_THRESHOLD = 60

function clampIndex(index) {
  return Math.min(MAP_ZOOM_LEVELS.length - 1, Math.max(0, index))
}

function normalizeWheelDelta(event) {
  return event.deltaY * (event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? 800 : 1)
}

export function useMapCanvasController({
  width, height, positions = [], leaderIndex = 0, initialZoom = MIN_MAP_ZOOM,
  followLeader = false, disablePan = false,
}) {
  const [zoom, setZoom] = useState(initialZoom)
  const [offset, setOffset] = useState(() => calculateFollowOffset({
    width,
    height,
    zoom: initialZoom,
    positions,
    leaderIndex,
  }))
  const zoomRef = useRef(zoom)
  const offsetRef = useRef(offset)
  const positionsRef = useRef(positions)
  const leaderIndexRef = useRef(leaderIndex)
  const followRef = useRef(followLeader)
  const disablePanRef = useRef(disablePan)
  const dragRef = useRef(null)
  const wheelAccumRef = useRef(0)

  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { offsetRef.current = offset }, [offset])
  useEffect(() => { positionsRef.current = positions }, [positions])
  useEffect(() => { leaderIndexRef.current = leaderIndex }, [leaderIndex])
  useEffect(() => { followRef.current = followLeader }, [followLeader])
  useEffect(() => { disablePanRef.current = disablePan }, [disablePan])

  const centerOn = useCallback((nextZoom) => calculateFollowOffset({
    width,
    height,
    zoom: nextZoom,
    positions: positionsRef.current,
    leaderIndex: leaderIndexRef.current,
  }), [width, height])

  const stepZoom = useCallback((direction) => {
    const currentIndex = MAP_ZOOM_LEVELS.indexOf(zoomRef.current)
    const nextIndex = clampIndex((currentIndex >= 0 ? currentIndex : 0) + direction)
    const next = MAP_ZOOM_LEVELS[nextIndex]
    if (next === zoomRef.current) return
    setZoom(next)
    setOffset(centerOn(next))
  }, [centerOn])

  const onWheel = useCallback((event) => {
    wheelAccumRef.current += normalizeWheelDelta(event)
    let direction = 0
    while (wheelAccumRef.current <= -WHEEL_THRESHOLD) {
      direction += 1
      wheelAccumRef.current += WHEEL_THRESHOLD
    }
    while (wheelAccumRef.current >= WHEEL_THRESHOLD) {
      direction -= 1
      wheelAccumRef.current -= WHEEL_THRESHOLD
    }
    if (direction !== 0) stepZoom(direction)
  }, [stepZoom])

  const onPointerDown = useCallback((event) => {
    if (disablePanRef.current) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: offsetRef.current,
    }
  }, [])

  const onPointerMove = useCallback((event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const { scale } = viewMetrics(width, height, zoomRef.current)
    const delta = isoUnproject((event.clientX - drag.startX) / scale, (event.clientY - drag.startY) / scale)
    setOffset(clampOffset(
      { x: drag.startOffset.x - delta.u, y: drag.startOffset.y - delta.v },
      width,
      height,
      zoomRef.current,
    ))
  }, [width, height])

  const onPointerEnd = useCallback(() => {
    dragRef.current = null
  }, [])

  const panBy = useCallback((dx, dy) => {
    const { scale } = viewMetrics(width, height, zoomRef.current)
    const delta = isoUnproject(dx / scale, dy / scale)
    const next = clampOffset(
      { x: offsetRef.current.x + delta.u, y: offsetRef.current.y + delta.v },
      width,
      height,
      zoomRef.current,
    )
    if (next.x === offsetRef.current.x && next.y === offsetRef.current.y) return
    setOffset(next)
  }, [width, height])

  const reset = useCallback(() => {
    setZoom(initialZoom)
    setOffset(centerOn(initialZoom))
  }, [initialZoom, centerOn])

  const recenterIfLeaderOutside = useCallback(() => {
    const currentZoom = zoomRef.current
    const currentOffset = offsetRef.current
    const position = positionsRef.current[leaderIndexRef.current]
    if (currentZoom <= MIN_MAP_ZOOM) {
      if (currentOffset.x !== 0 || currentOffset.y !== 0) {
        setOffset(clampOffset({ x: 0, y: 0 }, width, height, MIN_MAP_ZOOM))
      }
      return
    }
    if (!position) return
    if (followRef.current) {
      const next = centerOn(currentZoom)
      if (next.x !== currentOffset.x || next.y !== currentOffset.y) setOffset(next)
      return
    }
    const { visibleTilesW, visibleTilesH } = viewMetrics(width, height, currentZoom)
    const margin = 0.25
    const isVisible = (
      position.x >= currentOffset.x - margin
      && position.y >= currentOffset.y - margin
      && position.x < currentOffset.x + visibleTilesW - 1 + margin
      && position.y < currentOffset.y + visibleTilesH - 1 + margin
    )
    if (!isVisible) setOffset(centerOn(currentZoom))
  }, [width, height, centerOn])

  return {
    zoom,
    offset,
    stepZoom,
    panBy,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerEnd,
    reset,
    recenterIfLeaderOutside,
  }
}