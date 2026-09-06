import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { ExplorationScene } from '../game/ExplorationScene'
import { GAME_EVENTS, subscribeToGameEvent } from '../game/gameEvents'
import './PhaserGame.css'

export function PhaserGame({ personajes, onStatusChange, onOpenCharacterEditor }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return undefined

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 576,
      height: 384,
      backgroundColor: '#172536',
      scene: [],
      render: { antialias: false },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    })

    const unsubscribeStatus = subscribeToGameEvent(
      GAME_EVENTS.explorationStatus,
      ({ message }) => onStatusChange(message),
    )
    const unsubscribeEditor = subscribeToGameEvent(
      GAME_EVENTS.openCharacterEditor,
      ({ characterId }) => onOpenCharacterEditor(characterId),
    )
    game.scene.add('ExplorationScene', ExplorationScene, true, { personajes })

    return () => {
      unsubscribeStatus()
      unsubscribeEditor()
      game.destroy(true)
    }
  }, [onStatusChange, onOpenCharacterEditor, personajes])

  return <div className="phaser-game" ref={containerRef} aria-label="Mapa de exploración" />
}