import { useCallback, useEffect, useState } from 'react'
import { PhaserGame } from './PhaserGame'
import { CharacterForm } from './CharacterForm'

export function ExplorationView({ personajes, onUpdateCharacter }) {
  const [status, setStatus] = useState('Preparando la escena...')
  const [editingCharacter, setEditingCharacter] = useState(null)

  const handleStatusChange = useCallback((message) => {
    setStatus(message)
  }, [])

  const handleOpenCharacterEditor = useCallback((characterId) => {
    const character = personajes.find((personaje) => personaje.idPersonaje === characterId)
    setEditingCharacter(character || null)
  }, [personajes])

  const handleFormSubmit = async (data) => {
    await onUpdateCharacter(editingCharacter.idPersonaje, data)
    setEditingCharacter(null)
  }

  useEffect(() => {
    if (!editingCharacter) return undefined

    const handleCloseShortcut = (event) => {
      if (event.key === 'Escape' || event.code === 'Escape') {
        event.preventDefault()
        setEditingCharacter(null)
      }
    }

    window.addEventListener('keydown', handleCloseShortcut)
    return () => window.removeEventListener('keydown', handleCloseShortcut)
  }, [editingCharacter])

  return (
    <section className="phaser-game-shell">
      <h2>Prueba de exploración</h2>
      <p>Selecciona líder con 1, 2 o 3 y muévelo con las flechas o WASD.</p>
      <PhaserGame
        personajes={personajes}
        onStatusChange={handleStatusChange}
        onOpenCharacterEditor={handleOpenCharacterEditor}
      />
      <p className="phaser-status" role="status">{status}</p>
      {editingCharacter && (
        <CharacterForm
          initialData={editingCharacter}
          onSubmit={handleFormSubmit}
          onCancel={() => setEditingCharacter(null)}
          viewMode="estadistica"
        />
      )}
    </section>
  )
}