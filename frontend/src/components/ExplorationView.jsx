import { useCallback, useEffect, useState } from 'react'
import { PhaserGame } from './PhaserGame'
import { CharacterForm } from './CharacterForm'
import { InventoryPanel } from './InventoryPanel'

export function ExplorationView({ personajes, onUpdateCharacter }) {
  const [status, setStatus] = useState('Preparando la escena...')
  const [editingCharacter, setEditingCharacter] = useState(null)
  const [inventoryOpen, setInventoryOpen] = useState(false)

  const handleStatusChange = useCallback((message) => {
    setStatus(message)
  }, [])

  const handleOpenCharacterEditor = useCallback((characterId) => {
    const character = personajes.find((personaje) => personaje.idPersonaje === characterId)
    setEditingCharacter(character || null)
  }, [personajes])

  const handleToggleInventory = useCallback(() => {
    setInventoryOpen((isOpen) => !isOpen)
  }, [])

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
      <h2>Exploración</h2>
      <p>Selecciona líder con 1, 2 o 3. Muévete con las flechas o WASD y abre el inventario con I.</p>
      <PhaserGame
        personajes={personajes}
        onStatusChange={handleStatusChange}
        onOpenCharacterEditor={handleOpenCharacterEditor}
        onToggleInventory={handleToggleInventory}
      />
      <p className="phaser-status" role="status">{status}</p>
      {inventoryOpen && <InventoryPanel onClose={() => setInventoryOpen(false)} />}
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