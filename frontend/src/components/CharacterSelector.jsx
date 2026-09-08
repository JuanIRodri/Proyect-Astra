import { useEffect, useState } from 'react'
import { getInventario } from '../services/api'
import './CharacterSelector.css'

export function CharacterSelector({ personajes, activeCharacterIndex, onSelect, onRequestTransfer }) {
  const characterList = personajes.slice(0, 3)
  const [countsByKey, setCountsByKey] = useState({})
  const characterIds = characterList.map((character) => character.idPersonaje).join(',')
  const counts = countsByKey[characterIds]

  useEffect(() => {
    let cancelled = false
    const list = personajes.slice(0, 3)
    Promise.all(list.map((character) => (
      getInventario(character.idPersonaje).then((rows) => [
        character.idPersonaje,
        rows.filter((row) => row.itemKey).length,
      ])
    )))
      .then((entries) => {
        if (cancelled) return
        setCountsByKey((current) => ({
          ...current,
          [characterIds]: Object.fromEntries(entries),
        }))
      })
      .catch(() => {
        if (!cancelled) {
          setCountsByKey((current) => ({ ...current, [characterIds]: {} }))
        }
      })
    return () => {
      cancelled = true
    }
  }, [characterIds, personajes, activeCharacterIndex])

  return (
    <aside className="character-selector" aria-label="Selección de personaje">
      <p className="character-selector-kicker">EQUIPO</p>
      <div className="character-selector-list" role="tablist" aria-label="Inventario por personaje">
        {characterList.map((character, characterIndex) => (
          <button
            className={`character-selector-tab ${characterIndex === activeCharacterIndex ? 'is-active' : ''}`}
            key={character.idPersonaje}
            onClick={() => onSelect(characterIndex)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              if (characterIndex === activeCharacterIndex) return
              const data = event.dataTransfer.getData('text/plain')
              const slotIndex = Number(data)
              if (!Number.isFinite(slotIndex)) return
              onRequestTransfer?.(slotIndex, characterIndex)
            }}
            role="tab"
            aria-selected={characterIndex === activeCharacterIndex}
          >
            <span className="character-selector-index">{characterIndex + 1}</span>
            <span>{character.nombre || `Héroe #${character.idPersonaje}`}</span>
            <span className={`character-selector-count ${characterIndex === activeCharacterIndex ? 'is-active' : ''}`}>
              {counts ? `${counts[character.idPersonaje] ?? 0} objetos` : '…'}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}