import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { ExplorationScene } from '../game/ExplorationScene'
import { GAME_EVENTS, subscribeToGameEvent } from '../game/gameEvents'
import './PhaserGame.css'

export function PhaserGame({ personajes, onOpenCharacterEditor, onToggleInventory }) {
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

    const unsubscribeEditor = subscribeToGameEvent(
      GAME_EVENTS.openCharacterEditor,
      ({ characterId }) => onOpenCharacterEditor(characterId),
    )
    const unsubscribeInventory = subscribeToGameEvent(
      GAME_EVENTS.toggleInventory,
      onToggleInventory,
    )
    game.scene.add('ExplorationScene', ExplorationScene, true, { personajes })

    return () => {
      unsubscribeEditor()
      unsubscribeInventory()
      game.destroy(true)
    }
  }, [onOpenCharacterEditor, onToggleInventory, personajes])

  return <div className="phaser-game" ref={containerRef} aria-label="Mapa de exploración" />
}