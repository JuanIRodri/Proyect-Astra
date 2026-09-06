import React from 'react';
import './CharacterCard.css';

export function CharacterCard({ personaje, onClick }) {
  const getIcon = (clase) => {
    switch (clase) {
      case 'Guerrero': return '⚔️';
      case 'Mago': return '🪄';
      case 'Pícaro': return '🗡️';
      case 'Paladín': return '🛡️';
      case 'Cazador': return '🏹';
      default: return '👤';
    }
  };

  const handleCardClick = () => {
    onClick(personaje.idPersonaje);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div 
      className={`card ${personaje.clase}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex="0"
      role="button"
    >
      <div className="card-header">
        <h3>{personaje.nombre || `Héroe #${personaje.idPersonaje}`}</h3>
        <span className="level">Lvl {personaje.nivel}</span>
      </div>

      <p className="class-badge">{getIcon(personaje.clase)} {personaje.clase}</p>
    </div>
  );
}
