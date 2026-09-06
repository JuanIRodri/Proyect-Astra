import React from 'react';
import { CharacterCard } from './CharacterCard';
import './CharacterGrid.css';

export function CharacterGrid({ personajes, onCharacterClick }) {
  if (personajes.length === 0) {
    return <p>No hay personajes registrados.</p>;
  }

  return (
    <div className="grid">
      {personajes.map((personaje) => (
        <CharacterCard 
          key={personaje.idPersonaje} 
          personaje={personaje} 
          onClick={onCharacterClick}
        />
      ))}
    </div>
  );
}
