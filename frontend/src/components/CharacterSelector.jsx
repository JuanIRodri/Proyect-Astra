import './CharacterSelector.css'

export function CharacterSelector({ personajes, activeCharacterIndex, onSelect }) {
  const characterList = personajes.slice(0, 3)
  return (
    <aside className="character-selector" aria-label="Selección de personaje">
      <p className="character-selector-kicker">EQUIPO</p>
      <div className="character-selector-list" role="tablist" aria-label="Inventario por personaje">
        {characterList.map((character, characterIndex) => (
          <button
            className={`character-selector-tab ${characterIndex === activeCharacterIndex ? 'is-active' : ''}`}
            key={character.idPersonaje}
            onClick={() => onSelect(characterIndex)}
            role="tab"
            aria-selected={characterIndex === activeCharacterIndex}
          >
            <span className="character-selector-index">{characterIndex + 1}</span>
            <span>{character.nombre || `Héroe #${character.idPersonaje}`}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}