import { useState } from 'react'
import { usePartidas } from '../hooks/usePartidas'
import { resetPartida } from '../services/api'
import { MenuHome } from './mainmenu/MenuHome'
import { MenuCargar } from './mainmenu/MenuCargar'
import { MenuNueva } from './mainmenu/MenuNueva'
import { OpcionesStack } from './mainmenu/OpcionesStack'
import './MainMenu.css'

export function MainMenu({ personajes, onStart }) {
  const { partidas, loading, error, fetchPartidas } = usePartidas()
  const [view, setView] = useState('inicio')
  const [notice, setNotice] = useState('')

  if (loading) {
    return <p className="loading-message">Cargando partidas...</p>
  }

  if (error) {
    return <p className="error">{error}</p>
  }

  const savedPartidas = partidas.filter((partida) => partida.tieneGuardado)
  const lastSave = savedPartidas.length > 0
    ? savedPartidas.reduce((mostRecent, partida) => (
      new Date(partida.fechaGuardado) > new Date(mostRecent.fechaGuardado) ? partida : mostRecent
    ))
    : null

  const goHome = () => {
    setView('inicio')
    setNotice('')
  }

  const handleContinue = () => {
    if (!lastSave) {
      setNotice('Todavía no hay una partida guardada para continuar.')
      return
    }
    onStart(lastSave.idPartida, 'continuar')
  }

  const handleStartNew = (partidaId) => {
    const partida = partidas.find((item) => item.idPartida === partidaId)
    if (partida?.tieneGuardado &&
      !window.confirm('Este slot tiene un guardado. ¿Empezar de nuevo? Se perderá el progreso.')) {
      return
    }
    onStart(partidaId, 'nueva')
  }

  const handleDelete = async (partidaId) => {
    if (!window.confirm('¿Borrar esta partida? Se perderá el progreso guardado.')) return
    await resetPartida(partidaId).catch(() => {})
    await fetchPartidas()
  }

  const partyNames = personajes.slice(0, 3).map((c) => c.nombre || `Héroe #${c.idPersonaje}`)

  return (
    <div className="main-menu">
      {view === 'inicio' && (
        <MenuHome
          hasSaves={savedPartidas.length > 0}
          notice={notice}
          onContinue={handleContinue}
          onLoad={() => setView('cargar')}
          onNew={() => setView('nueva')}
          onOptions={() => setView('opciones')}
        />
      )}

      {view === 'cargar' && (
        <MenuCargar
          partidas={savedPartidas}
          onLoad={(partidaId) => onStart(partidaId, 'continuar')}
          onDelete={handleDelete}
          onBack={goHome}
        />
      )}

      {view === 'nueva' && (
        <MenuNueva
          partidas={partidas}
          onStart={handleStartNew}
          onBack={goHome}
        />
      )}

      {view === 'opciones' && (
        <OpcionesStack onExit={goHome} />
      )}

      {view === 'inicio' && partyNames.length > 0 && (
        <p className="main-menu-party">
          Grupo: {partyNames.join(' · ')}
        </p>
      )}
    </div>
  )
}