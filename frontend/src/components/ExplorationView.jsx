import { useCallback, useEffect, useRef, useState } from 'react'
import { PhaserGame } from './PhaserGame'
import { CharacterForm } from './CharacterForm'
import { InventoryPanel } from './InventoryPanel'
import { CharacterSelector } from './CharacterSelector'
import { lockInput, unlockInput } from '../game/inputLock'

export function ExplorationView({ personajes, onUpdateCharacter }) {
  const [editingCharacter, setEditingCharacter] = useState(null)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [activeCharacterIndex, setActiveCharacterIndex] = useState(0)
  const inventoryRef = useRef(null)

  const handleRequestTransfer = useCallback((slotIndex, targetCharacterIndex) => {
    inventoryRef.current?.transferFromSlot(slotIndex, targetCharacterIndex)
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
      if (event.key === 'Escape' || event.code === 'Escape' || event.key.toLowerCase() === 'u' || event.code.toLowerCase() === 'keyu') {
        event.preventDefault()
        setEditingCharacter(null)
      }
    }

    window.addEventListener('keydown', handleCloseShortcut)
    return () => window.removeEventListener('keydown', handleCloseShortcut)
  }, [editingCharacter])

  useEffect(() => {
    const reasons = []
    if (inventoryOpen) reasons.push('inventory')
    if (editingCharacter) reasons.push('editor')
    reasons.forEach(lockInput)
    return () => reasons.forEach(unlockInput)
  }, [inventoryOpen, editingCharacter])

  return (
    <section className="phaser-game-shell">
      <PhaserGame
        personajes={personajes}
        onOpenCharacterEditor={handleOpenCharacterEditor}
        onToggleInventory={handleToggleInventory}
      />
      {inventoryOpen && (
        <div className="inventory-layout">
          <CharacterSelector
            personajes={personajes}
            activeCharacterIndex={activeCharacterIndex}
            onSelect={setActiveCharacterIndex}
            onRequestTransfer={handleRequestTransfer}
          />
          <InventoryPanel
            ref={inventoryRef}
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