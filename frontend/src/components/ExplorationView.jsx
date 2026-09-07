import { useCallback, useEffect, useState } from 'react'
import { PhaserGame } from './PhaserGame'
import { CharacterForm } from './CharacterForm'
import { InventoryPanel } from './InventoryPanel'
import { CharacterSelector } from './CharacterSelector'

export function ExplorationView({ personajes, onUpdateCharacter }) {
  const [editingCharacter, setEditingCharacter] = useState(null)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [activeCharacterIndex, setActiveCharacterIndex] = useState(0)

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
      if (event.key === 'Escape' || event.code === 'Escape' || event.key.toLowerCase() === 'u' || event.code.toLowerCase() === 'keyu') {
        event.preventDefault()
        setEditingCharacter(null)
      }
    }

    window.addEventListener('keydown', handleCloseShortcut)
    return () => window.removeEventListener('keydown', handleCloseShortcut)
  }, [editingCharacter])

  return (
    <section className="phaser-game-shell">
      <PhaserGame
        personajes={personajes}
        onOpenCharacterEditor={handleOpenCharacterEditor}
        onToggleInventory={handleToggleInventory}
      />
      {inventoryOpen && <InventoryPanel personajes={personajes} onClose={() => setInventoryOpen(false)} />}
      <p className="phaser-status" role="status">{status}</p>
      {inventoryOpen && (
        <div className="inventory-layout">
          <CharacterSelector
            personajes={personajes}
            activeCharacterIndex={activeCharacterIndex}
            onSelect={setActiveCharacterIndex}
          />
          <InventoryPanel
            personajes={personajes}
            activeCharacterIndex={activeCharacterIndex}
            onActiveCharacterChange={setActiveCharacterIndex}
            onClose={() => setInventoryOpen(false)}
          />
        </div>
      )}
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