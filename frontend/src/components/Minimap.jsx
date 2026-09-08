import { useEffect, useRef } from 'react'
import { GRID_WIDTH, GRID_HEIGHT, PARTY_COLORS, WALL_TILES } from '../game/constants'
import { usePartyPositions } from '../hooks/usePartyPositions'
import './Minimap.css'

const MINIMAP_WIDTH = 144
const MINIMAP_HEIGHT = 88
const BORDER = 2
const BACKGROUND_COLOR = 'rgba(17, 24, 39, 0.92)'
const GRID_COLOR = 'rgba(55, 80, 106, 0.55)'
const WALL_COLOR = '#3d5264'
const LEADER_COLOR = '#ffffff'

function toCssColor(hex) {
  return `#${hex.toString(16).padStart(6, '0')}`
}

export function Minimap() {
  const canvasRef = useRef(null)
  const { positions, leaderIndex } = usePartyPositions()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const context = canvas.getContext('2d')
    if (!context) return undefined

    const scaleX = (MINIMAP_WIDTH - BORDER * 2) / GRID_WIDTH
    const scaleY = (MINIMAP_HEIGHT - BORDER * 2) / GRID_HEIGHT

    context.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT)
    context.fillStyle = BACKGROUND_COLOR
    context.fillRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT)

    context.strokeStyle = GRID_COLOR
    context.lineWidth = 0.5
    for (let x = 1; x < GRID_WIDTH; x += 1) {
      context.beginPath()
      context.moveTo(BORDER + x * scaleX, BORDER)
      context.lineTo(BORDER + x * scaleX, MINIMAP_HEIGHT - BORDER)
      context.stroke()
    }
    for (let y = 1; y < GRID_HEIGHT; y += 1) {
      context.beginPath()
      context.moveTo(BORDER, BORDER + y * scaleY)
      context.lineTo(MINIMAP_WIDTH - BORDER, BORDER + y * scaleY)
      context.stroke()
    }

    context.fillStyle = WALL_COLOR
    context.strokeStyle = LEADER_COLOR
    context.lineWidth = 0.5
    WALL_TILES.forEach((tile) => {
      const wallX = BORDER + tile.x * scaleX
      const wallY = BORDER + tile.y * scaleY
      context.fillRect(wallX, wallY, scaleX, scaleY)
      context.strokeRect(wallX, wallY, scaleX, scaleY)
    })

    positions.forEach((position, index) => {
      const x = BORDER + position.x * scaleX + scaleX / 2
      const y = BORDER + position.y * scaleY + scaleY / 2
      const radius = index === leaderIndex ? 3.4 : 2.6

      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fillStyle = toCssColor(PARTY_COLORS[index] || PARTY_COLORS[0])
      context.fill()
      context.lineWidth = index === leaderIndex ? 1.4 : 1
      context.strokeStyle = index === leaderIndex ? LEADER_COLOR : 'rgba(255, 255, 255, 0.45)'
      context.stroke()
    })
  }, [positions, leaderIndex])

  return (
    <div className="minimap" aria-label="Mapa de la zona">
      <canvas
        ref={canvasRef}
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        className="minimap-canvas"
      />
    </div>
  )
}