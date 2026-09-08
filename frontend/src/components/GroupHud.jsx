import { getPartyColorForClass } from '../game/constants'
import { usePartyPositions } from '../hooks/usePartyPositions'
import './GroupHud.css'

function percent(actual, max) {
  return max ? Math.max(0, Math.min(100, (actual / max) * 100)) : 0
}

function toCssColor(hex) {
  return `#${hex.toString(16).padStart(6, '0')}`
}

export function GroupHud({ personajes }) {
  const { leaderIndex } = usePartyPositions()
  const party = personajes.slice(0, 3)

  return (
    <div className="group-hud" aria-label="Estado del grupo">
      {party.map((character, index) => {
        const lifePercent = percent(character.vidaActual, character.vidaMax)
        const manaPercent = percent(character.manaActual, character.manaMax)
        return (
          <div
            className={`group-hud-member ${index === leaderIndex ? 'is-leader' : ''}`}
            key={character.idPersonaje}
          >
            <span
              className="group-hud-dot"
              style={{ background: toCssColor(getPartyColorForClass(character.clase)) }}
              aria-hidden="true"
            />
            <div className="group-hud-info">
              <span className="group-hud-name">{character.nombre || `Héroe #${character.idPersonaje}`}</span>
              <div className="group-hud-bar group-hud-vida">
                <span style={{ width: `${lifePercent}%` }} />
              </div>
              <div className="group-hud-bar group-hud-mana">
                <span style={{ width: `${manaPercent}%` }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}