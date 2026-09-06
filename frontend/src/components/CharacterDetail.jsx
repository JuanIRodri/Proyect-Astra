import React from 'react';
import './CharacterDetail.css';

export function CharacterDetail({ character, onClose, onEdit, onDelete }) {
  if (!character) return null;

  return (
    <div className="detail-modal">
      <div className="detail-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="detail-header">
           <h2>{character.nombre}</h2>
           <p className="subtitle">Esencia de {character.clase}</p>
        </div>
        
        <div className="detail-sections">
          <>
              <section>
                <h4>📋 General</h4>
                <ul>
                  <li><strong>Altura:</strong> {character.altura} cm</li>
                  <li><strong>Musculatura:</strong> {character.musculatura}</li>
                </ul>
              </section>

              <section>
                <h4>👤 Cabeza ({character.Cabeza_Forma})</h4>
                <ul>
                  <li><strong>Cabello:</strong> {character.Cabello_Corte} ({character.Cabello_Tinte})</li>
                  <li><strong>Ojos:</strong> {character.Ojos_Forma}, {character.Ojos_Color}, {character.Ojos_Tamanio}</li>
                  <li><strong>Boca:</strong> {character.Boca_Forma} ({character.Boca_Color}, {character.Boca_Tamanio})</li>
                  <li><strong>Nariz:</strong> {character.Nariz_Forma} ({character.Nariz_Tamanio})</li>
                  <li><strong>Cuernos:</strong> {character.Cuernos_Cantidad} de tamaño {character.Cuernos_Tamanio} ({character.Cuernos_Color})</li>
                </ul>
              </section>

              <section>
                <h4>💪 Cuerpo</h4>
                <ul>
                  <li><strong>Torso:</strong> {character.Torso_Forma} ({character.Torso_Tamanio}) {character.Torso_Bello ? 'con vello' : 'sin vello'}</li>
                  <li><strong>Brazos:</strong> {character.Brazo_Cantidad} tipo {character.Brazo_Tipo} ({character.Brazo_Color})</li>
                  <li><strong>Piernas:</strong> {character.Pierna_Tipo} ({character.Pierna_Tamanio})</li>
                </ul>
              </section>
          </>
        </div>

          <div className="detail-actions">
            <button className="btn-edit" onClick={() => onEdit(character)}>✏️ Editar</button>
            <button className="btn-delete" onClick={() => onDelete(character.idPersonaje)}>🗑️ Eliminar</button>
          </div>
      </div>
    </div>
  );
}
