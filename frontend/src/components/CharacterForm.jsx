import { useRef, useState } from 'react';
import './CharacterForm.css';
import { StatsFields } from './form-parts/StatsFields';
import { getClassThemeKey } from './inventory/inventoryUtils';
import { getInitialStatsForClass } from '@/game/characterStats';

export function CharacterForm({ onSubmit, onCancel, initialData }) {
  const submitRef = useRef(null);

  const [form, setForm] = useState(() => {
    const base = {
      nombre: '',
      clase: 'Guerrero',
      nivel: 1,
      fuerza: 10,
      destreza: 10,
      inteligencia: 10,
      constitucion: 10,
      agilidad: 10,
    };

    if (initialData) {
      return {
        ...base,
        ...initialData,
      };
    }
    return base;
  });

  const totalPoints = 10 + (Number(form.nivel) - 1) * 3;
  const availablePoints = totalPoints - ((Number(form.fuerza) - 10) + (Number(form.destreza) - 10) + (Number(form.inteligencia) - 10) + (Number(form.constitucion) - 10) + (Number(form.agilidad) - 10));

  const adjustStat = (name, amount) => {
    const newValue = (form[name] || 10) + amount;
    if (newValue >= 10 && (amount < 0 || availablePoints > 0)) {
      setForm(prev => ({ ...prev, [name]: newValue }));
    }
  };

  const handleAutoDistribute = () => {
    setForm(prev => ({ ...prev, ...getInitialStatsForClass(form.clase, Number(form.nivel)) }));
  };

  const handleResetStats = () => {
    setForm(prev => ({ ...prev, fuerza: 10, destreza: 10, inteligencia: 10, constitucion: 10, agilidad: 10 }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (availablePoints < 0) return alert('Exceso de puntos.');
    onSubmit({
      ...form,
      nivel: Number(form.nivel),
      fuerza: Number(form.fuerza),
      destreza: Number(form.destreza),
      inteligencia: Number(form.inteligencia),
      constitucion: Number(form.constitucion),
      agilidad: Number(form.agilidad),
    });
  };

  return (
    <div className="inventory-layout stats-layout">
      <div className={`form-content inventory-class-${getClassThemeKey(form.clase)}`}>
        <button className="close-btn" onClick={onCancel}>&times;</button>
        <div className="detail-header">
          <p className="inventory-kicker">Atributos</p>
          <h2>Editar a {form.nombre}</h2>
          <p className="subtitle">Puntos: {availablePoints} / {totalPoints}</p>
        </div>

        <form onSubmit={handleSubmit} className="character-form">
          <StatsFields form={form} availablePoints={availablePoints} totalPoints={totalPoints} adjustStat={adjustStat} handleAutoDistribute={handleAutoDistribute} handleResetStats={handleResetStats} submitRef={submitRef} />

          <div className="form-actions">
            <button type="submit" className="btn-submit" ref={submitRef}>💾 Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}