import React, { useState } from 'react';
import './CharacterForm.css';
import { AppearanceFields } from './form-parts/AppearanceFields';
import { StatsFields } from './form-parts/StatsFields';

const CLASES = ['Guerrero', 'Mago', 'Pícaro', 'Paladín', 'Cazador'];

const getInitialStatsForClass = (clase, nivel) => {
  const totalPoints = 10 + (nivel - 1) * 3;
  let weights = { f: 2, d: 2, i: 2, c: 2, a: 2 };
  if (clase === 'Guerrero') weights = { f: 4, d: 1, i: 0.5, c: 3.5, a: 1 };
  else if (clase === 'Mago') weights = { f: 0.5, d: 1, i: 6, c: 1, a: 1.5 };
  else if (clase === 'Pícaro') weights = { f: 2, d: 4.5, i: 1, c: 1, a: 1.5 };
  else if (clase === 'Paladín') weights = { f: 3, d: 1, i: 2, c: 3, a: 1 };
  else if (clase === 'Cazador') weights = { f: 1.5, d: 4, i: 1, c: 1.5, a: 2 };

  const totalWeight = weights.f + weights.d + weights.i + weights.c + weights.a;
  let stats = {
    fuerza: 10 + Math.round((weights.f / totalWeight) * totalPoints),
    destreza: 10 + Math.round((weights.d / totalWeight) * totalPoints),
    inteligencia: 10 + Math.round((weights.i / totalWeight) * totalPoints),
    constitucion: 10 + Math.round((weights.c / totalWeight) * totalPoints),
    agilidad: 10 + Math.round((weights.a / totalWeight) * totalPoints)
  };

  const diff = totalPoints - ((stats.fuerza - 10) + (stats.destreza - 10) + (stats.inteligencia - 10) + (stats.constitucion - 10) + (stats.agilidad - 10));
  stats.fuerza += diff;
  return stats;
};

export function CharacterForm({ onSubmit, onCancel, initialData, viewMode }) {
  const isEditing = !!initialData;
  const [step, setStep] = useState(1);

  const [form, setForm] = useState(() => {
    const base = {
      nombre: '', clase: CLASES[0], nivel: 1, altura: 170, musculatura: 50,
      fuerza: 10, destreza: 10, inteligencia: 10, constitucion: 10, agilidad: 10,
      cabello_corte: 'Corto', cabello_tinte: 'Castaño', ojos_color: 'Marrón', ojos_forma: 'Almendrados',
      boca_forma: 'Común', cabeza_forma: 'Ovalada', nariz_forma: 'Recta', torso_forma: 'Atlético',
      cuernos_cantidad: 0, cuernos_tamanio: 'N/A', cuernos_color: 'N/A', torso_bello: 0
    };

    if (initialData) {
      return {
        ...base,
        ...initialData,
        cabello_corte: initialData.Cabello_Corte || base.cabello_corte,
        cabello_tinte: initialData.Cabello_Tinte || base.cabello_tinte,
        ojos_color: initialData.Ojos_Color || base.ojos_color,
        ojos_forma: initialData.Ojos_Forma || base.ojos_forma,
        boca_forma: initialData.Boca_Forma || base.boca_forma,
        cabeza_forma: initialData.Cabeza_Forma || base.cabeza_forma,
        nariz_forma: initialData.Nariz_Forma || base.nariz_forma,
        torso_forma: initialData.Torso_Forma || base.torso_forma,
        cuernos_cantidad: initialData.Cuernos_Cantidad !== undefined ? initialData.Cuernos_Cantidad : base.cuernos_cantidad,
        cuernos_tamanio: initialData.Cuernos_Tamanio || base.cuernos_tamanio,
        cuernos_color: initialData.Cuernos_Color || base.cuernos_color,
        torso_bello: initialData.Torso_Bello !== undefined ? initialData.Torso_Bello : base.torso_bello
      };
    }
    return base;
  });

  const totalPoints = 10 + (Number(form.nivel) - 1) * 3;
  const availablePoints = totalPoints - ((Number(form.fuerza) - 10) + (Number(form.destreza) - 10) + (Number(form.inteligencia) - 10) + (Number(form.constitucion) - 10) + (Number(form.agilidad) - 10));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
  };

  const adjustStat = (name, amount) => {
    const newValue = (form[name] || 10) + amount;
    if (newValue >= 10 && (amount < 0 || availablePoints > 0)) {
      setForm(prev => ({ ...prev, [name]: newValue }));
    }
  };

  const handleAutoDistribute = () => {
    setForm(prev => ({ ...prev, ...getInitialStatsForClass(form.clase, Number(form.nivel)) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (viewMode === 'estadistica' && availablePoints < 0) return alert("Exceso de puntos.");
    onSubmit({ ...form, 
      nivel: Number(form.nivel), altura: Number(form.altura), musculatura: Number(form.musculatura),
      fuerza: Number(form.fuerza), destreza: Number(form.destreza), inteligencia: Number(form.inteligencia), 
      constitucion: Number(form.constitucion), agilidad: Number(form.agilidad), cuernos_cantidad: Number(form.cuernos_cantidad)
    });
  };

  return (
    <div className="detail-modal">
      <div className="detail-content form-content">
        <button className="close-btn" onClick={onCancel}>&times;</button>
        <div className="detail-header">
          <h2>{isEditing ? `Editar a ${form.nombre}` : 'Nuevo Héroe'}</h2>
          <p className="subtitle">
            {isEditing ? (viewMode === 'apariencia' ? 'Apariencia Física' : 'Atributos') : `Paso ${step} de 2`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="character-form">
          {isEditing && viewMode !== 'estadistica' && (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Nombre del Héroe</label>
              <input name="nombre" type="text" value={form.nombre} onChange={handleChange} required />
            </div>
          )}

          {isEditing ? (
            viewMode === 'apariencia' ? (
              <AppearanceFields form={form} handleChange={handleChange} />
            ) : (
              <StatsFields form={form} availablePoints={availablePoints} totalPoints={totalPoints} adjustStat={adjustStat} handleAutoDistribute={handleAutoDistribute} />
            )
          ) : (
            step === 1 ? (
              <>
                <div className="form-group"><label>Nombre</label><input name="nombre" type="text" value={form.nombre} onChange={handleChange} required /></div>
                <div className="form-group"><label>Clase</label><select name="clase" value={form.clase} onChange={handleChange}>{CLASES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="form-row">
                  <div className="form-group"><label>Altura</label><input name="altura" type="number" value={form.altura} onChange={handleChange} /></div>
                  <div className="form-group"><label>Musculatura</label><input name="musculatura" type="number" value={form.musculatura} onChange={handleChange} /></div>
                </div>
                <StatsFields form={form} availablePoints={availablePoints} totalPoints={totalPoints} adjustStat={adjustStat} handleAutoDistribute={handleAutoDistribute} />
              </>
            ) : (
              <AppearanceFields form={form} handleChange={handleChange} />
            )
          )}

          <div className="form-actions">
            {!isEditing && step === 1 ? (
              <button type="button" className="btn-submit" onClick={() => form.nombre ? setStep(2) : alert("Nombre requerido")}>Continuar ➡️</button>
            ) : (
              <>
                {!isEditing && step === 2 && <button type="button" className="btn-cancel" onClick={() => setStep(1)}>⬅️ Volver</button>}
                <button type="submit" className="btn-submit">{isEditing ? '💾 Guardar' : '⚔️ Reclutar'}</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
