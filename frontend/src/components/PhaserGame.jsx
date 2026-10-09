import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { ExplorationScene } from '@/game/ExplorationScene'
import { GAME_EVENTS, subscribeToGameEvent } from '@/game/gameEvents'
import './PhaserGame.css'

export function PhaserGame({ personajes, inicioPartida, onOpenCharacterEditor, onToggleInventory }) {
  const containerRef = useRef(null)
  const gameRef = useRef(null)
  const sceneRef = useRef(null)
  const initialPersonajesRef = useRef(personajes)

  useEffect(() => {
    if (!containerRef.current) return undefined

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 576,
      height: 384,
      backgroundColor: '#223a25',
      scene: [],
      pixelArt: true,
      roundPixels: true,
      render: { antialias: false, roundPixels: true },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    })
    gameRef.current = game

    const unsubscribeEditor = subscribeToGameEvent(
      GAME_EVENTS.openCharacterEditor,
      ({ characterId }) => onOpenCharacterEditor(characterId),
    )
    const unsubscribeInventory = subscribeToGameEvent(
      GAME_EVENTS.toggleInventory,
      onToggleInventory,
    )
    const scene = game.scene.add('ExplorationScene', ExplorationScene, true, {
      personajes: initialPersonajesRef.current,
      positions: inicioPartida?.positions ?? null,
      leaderIndex: inicioPartida?.leaderIndex ?? 0,
    })
    sceneRef.current = scene

    return () => {
      unsubscribeEditor()
      unsubscribeInventory()
      gameRef.current = null
      sceneRef.current = null
      game.destroy(true)
    }
  }, [onOpenCharacterEditor, onToggleInventory, inicioPartida])

  useEffect(() => {
    sceneRef.current?.updatePartyData(personajes)
  }, [personajes])

  return <div className="phaser-game" ref={containerRef} aria-label="Mapa de exploración" />
}