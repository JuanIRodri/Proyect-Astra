import { usePersonajes } from './hooks/usePersonajes'
import { ExplorationView } from './components/ExplorationView'
import './App.css'

function App() {
  const {
    personajes,
    loading,
    error,
    handleUpdate,
  } = usePersonajes();

  return (
    <div className="container">
      <header>
        <p className="eyebrow">PROYECT-ASTRA / EXPLORACIÓN</p>
        <h1>Las ruinas de Astra</h1>
        <p>Guía a tu grupo, observa sus estadísticas y descubre qué aguarda más allá del mapa.</p>
      </header>

      {loading && <p className="loading-message">Preparando la expedición...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <ExplorationView personajes={personajes} onUpdateCharacter={handleUpdate} />
      )}
    </div>
  )
}

export default App
