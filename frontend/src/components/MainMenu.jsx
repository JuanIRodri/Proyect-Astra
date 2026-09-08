import { usePartidas } from '../hooks/usePartidas'
import './MainMenu.css'

function formatFecha(fecha) {
  if (!fecha) return null
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MainMenu({ personajes, onStart }) {
  const { partidas, loading, error } = usePartidas()

  if (loading) {
    return <p className="loading-message">Cargando partidas...</p>
  }

  if (error) {
    return <p className="error">{error}</p>
  }

  const partyNames = personajes.slice(0, 3).map((c) => c.nombre || `Héroe #${c.idPersonaje}`)

  return (
    <div className="main-menu">
      <div className="main-menu-title">
        <p className="eyebrow">PROYECT-ASTRA</p>
        <h1 className="main-menu-h1">Las ruinas de Astra</h1>
      </div>

      <section className="main-menu-slots">
        {partidas.map((partida) => (
          <article className="menu-slot" key={partida.idPartida}>
            <div className="menu-slot-info">
              <h2 className="menu-slot-title">{partida.nombre}</h2>
              <p className="menu-slot-status">
                {partida.tieneGuardado
                  ? <>Guardado: {formatFecha(partida.fechaGuardado)}</>
                  : 'Sin guardado'}
              </p>
            </div>
            <div className="menu-slot-actions">
              <button
                type="button"
                className="menu-btn menu-btn-continuar"
                disabled={!partida.tieneGuardado}
                onClick={() => onStart(partida.idPartida, 'continuar')}
              >
                Continuar
              </button>
              <button
                type="button"
                className="menu-btn menu-btn-nueva"
                onClick={() => onStart(partida.idPartida, 'nueva')}
              >
                Nueva partida
              </button>
            </div>
          </article>
        ))}
      </section>

      {partyNames.length > 0 && (
        <p className="main-menu-party">
          Grupo: {partyNames.join(' · ')}
        </p>
      )}
    </div>
  )
}