import { useCallback, useEffect, useRef, useState } from 'react'
import { PhaserGame } from './PhaserGame'
import { CharacterForm } from './CharacterForm'
import { InventoryPanel } from './InventoryPanel'
import { CharacterSelector } from './CharacterSelector'
import { Minimap } from './Minimap'
import { GroupHud } from './GroupHud'
import { PauseMenu } from './PauseMenu'
import { usePartyPositions } from '../hooks/usePartyPositions'
import { savePartida } from '../services/api'
import { lockInput, unlockInput } from '../game/inputLock'

export function ExplorationView({ personajes, onUpdateCharacter, onBackToMenu, inicioPartida }) {
  const [editingCharacter, setEditingCharacter] = useState(null)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [pauseOpen, setPauseOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeCharacterIndex, setActiveCharacterIndex] = useState(inicioPartida?.leaderIndex ?? 0)
  const [transferToken, setTransferToken] = useState(0)
  const inventoryRef = useRef(null)
  const { positions, leaderIndex } = usePartyPositions(
    3,
    inicioPartida?.positions ?? undefined,
    inicioPartida?.leaderIndex ?? 0,
  )

  const handleRequestTransfer = useCallback((slotIndex, targetCharacterIndex) => {
    inventoryRef.current?.transferFromSlot(slotIndex, targetCharacterIndex)
  }, [])

  const handleTransferComplete = useCallback(() => {
    setTransferToken((current) => current + 1)
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
    if (pauseOpen) reasons.push('pause')
    reasons.forEach(lockInput)
    return () => reasons.forEach(unlockInput)
  }, [inventoryOpen, editingCharacter, pauseOpen])

  useEffect(() => {
    if (pauseOpen || inventoryOpen || editingCharacter) {
      return undefined
    }

    const handleOpenPause = (event) => {
      if (event.key === 'Escape' || event.code === 'Escape') {
        event.preventDefault()
        setPauseOpen(true)
      }
    }

    window.addEventListener('keydown', handleOpenPause)
    return () => window.removeEventListener('keydown', handleOpenPause)
  }, [pauseOpen, inventoryOpen, editingCharacter])

  useEffect(() => {
    if (!pauseOpen) return undefined

    const handleClosePause = (event) => {
      if (event.key === 'Escape' || event.code === 'Escape') {
        event.preventDefault()
        setPauseOpen(false)
      }
    }

    window.addEventListener('keydown', handleClosePause)
    return () => window.removeEventListener('keydown', handleClosePause)
  }, [pauseOpen])

  const handleSaveAndExit = async () => {
    setSaving(true)
    const partidaId = inicioPartida?.id
    if (partidaId && positions[leaderIndex]) {
      await savePartida(partidaId, {
        liderX: Math.round(positions[leaderIndex].x),
        liderY: Math.round(positions[leaderIndex].y),
        liderIndex: leaderIndex,
      }).catch(() => {})
    }
    setSaving(false)
    onBackToMenu?.()
  }

  const partidaId = inicioPartida?.id
  useEffect(() => {
    if (!partidaId || !positions[leaderIndex]) return undefined

    const timer = setTimeout(() => {
      savePartida(partidaId, {
        liderX: Math.round(positions[leaderIndex].x),
        liderY: Math.round(positions[leaderIndex].y),
        liderIndex: leaderIndex,
      }).catch(() => {})
    }, 800)

    return () => clearTimeout(timer)
  }, [partidaId, positions, leaderIndex])

  return (
    <section className="phaser-game-shell">
      <PhaserGame
        personajes={personajes}
        inicioPartida={inicioPartida}
        onOpenCharacterEditor={handleOpenCharacterEditor}
        onToggleInventory={handleToggleInventory}
      />
      <Minimap />
      <GroupHud personajes={personajes} />
      {pauseOpen && (
        <PauseMenu
          onContinue={() => setPauseOpen(false)}
          onSaveAndExit={handleSaveAndExit}
          saving={saving}
        />
      )}
      {inventoryOpen && (
        <div className="inventory-layout">
          <CharacterSelector
            personajes={personajes}
            activeCharacterIndex={activeCharacterIndex}
            onSelect={setActiveCharacterIndex}
            onRequestTransfer={handleRequestTransfer}
            refreshToken={transferToken}
          />
          <InventoryPanel
            ref={inventoryRef}
            personajes={personajes}
            activeCharacterIndex={activeCharacterIndex}
            onActiveCharacterChange={setActiveCharacterIndex}
            onTransferComplete={handleTransferComplete}
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