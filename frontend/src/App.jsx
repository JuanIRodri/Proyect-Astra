import { useState } from 'react'
import { usePersonajes } from './hooks/usePersonajes'
import { CharacterGrid } from './components/CharacterGrid'
import { CharacterDetail } from './components/CharacterDetail'
import { CharacterForm } from './components/CharacterForm'
import { ExplorationView } from './components/ExplorationView'
import './App.css'

function App() {
  const {
    personajes,
    loading,
    error,
    fetchPersonajes,
    selectedCharacter,
    selectCharacter,
    detailLoading,
    handleCreate,
    handleUpdate,
    handleDelete
  } = usePersonajes();

  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');

  const openCreateForm = () => {
    setEditingCharacter(null);
    setShowForm(true);
  };

  const openEditForm = (character) => {
    setEditingCharacter(character);
    selectCharacter(null);
    setShowForm(true);
  };

  const onFormSubmit = async (data) => {
    if (editingCharacter) {
      await handleUpdate(editingCharacter.idPersonaje, data);
    } else {
      await handleCreate(data);
    }
    setShowForm(false);
    setEditingCharacter(null);
  };

  const onFormCancel = () => {
    setShowForm(false);
    setEditingCharacter(null);
  };

  const onDeleteCharacter = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este héroe?')) {
      await handleDelete(id);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Panel de Personajes</h1>
        <p>Administra tu gremio y explora las habilidades de cada aventurero</p>

        <div className="header-actions">
          <button
            onClick={() => setActiveView(activeView === 'dashboard' ? 'exploration' : 'dashboard')}
            className="refresh-btn"
          >
            {activeView === 'dashboard' ? '🎮 Abrir exploración' : '📋 Volver al dashboard'}
          </button>
          <button onClick={openCreateForm} className="refresh-btn create-btn">
            ➕ Nuevo Héroe
          </button>
        </div>
      </header>

      {activeView === 'exploration' ? (
        <ExplorationView personajes={personajes} onUpdateCharacter={handleUpdate} />
      ) : (
        <main>
          {loading && <p>Cargando personajes...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && (
            <CharacterGrid
              personajes={personajes}
              onCharacterClick={selectCharacter}
            />
          )}
        </main>
      )}

      {/* Modal de Detalle */}
      {activeView === 'dashboard' && detailLoading && <div className="detail-modal"><p>Cargando detalles...</p></div>}
      {activeView === 'dashboard' && selectedCharacter && !detailLoading && (
        <CharacterDetail
          character={selectedCharacter}
          onClose={() => selectCharacter(null)}
          onEdit={openEditForm}
          onDelete={onDeleteCharacter}
        />
      )}

      {/* Modal de Formulario */}
      {activeView === 'dashboard' && showForm && (
        <CharacterForm
          initialData={editingCharacter}
          onSubmit={onFormSubmit}
          onCancel={onFormCancel}
          viewMode="apariencia"
        />
      )}
    </div>
  )
}

export default App
