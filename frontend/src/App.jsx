import { usePersonajes } from './hooks/usePersonajes'
import { ExplorationView } from './components/ExplorationView'
import { MainMenu } from './components/MainMenu'
import { getPartida, resetPartida } from './services/api'
import { PARTY_POSITIONS } from './game/constants'
import { useCallback, useState } from 'react'
import './App.css'

function App() {
  const {
    personajes,
    loading,
    error,
    handleUpdate,
    fetchPersonajes,
  } = usePersonajes();
  const [activePartida, setActivePartida] = useState(null);

  const handleStart = useCallback(async (partidaId, mode) => {
    if (mode === 'nueva') {
      await resetPartida(partidaId);
      setActivePartida({ id: partidaId, positions: PARTY_POSITIONS, leaderIndex: 0 });
      return;
    }

    const partida = await getPartida(partidaId);
    setActivePartida({
      id: partida.idPartida,
      positions: [
        { x: partida.liderX, y: partida.liderY },
        { x: partida.liderX - 1, y: partida.liderY },
        { x: partida.liderX - 2, y: partida.liderY },
      ],
      leaderIndex: partida.liderIndex,
      mapa: partida.mapa,
    });
  }, []);

  const handleBackToMenu = useCallback(() => {
    setActivePartida(null);
    fetchPersonajes();
  }, [fetchPersonajes]);

  if (loading && !activePartida) {
    return (
      <div className="container">
        <p className="loading-message">Preparando la expedición...</p>
      </div>
    )
  }

  if (error && !activePartida) {
    return (
      <div className="container">
        <p className="error">{error}</p>
      </div>
    )
  }

  if (!activePartida) {
    return <MainMenu personajes={personajes} onStart={handleStart} />
  }

  return (
    <ExplorationView
      key={activePartida.id}
      personajes={personajes}
      onUpdateCharacter={handleUpdate}
      onBackToMenu={handleBackToMenu}
      inicioPartida={activePartida}
    />
  )
}

export default App