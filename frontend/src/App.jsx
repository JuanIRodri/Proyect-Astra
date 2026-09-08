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
      {loading && <p className="loading-message">Preparando la expedición...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <ExplorationView personajes={personajes} onUpdateCharacter={handleUpdate} />
      )}
    </div>
  )
}

export default App
