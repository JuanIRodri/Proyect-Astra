import { useCallback, useEffect, useRef, useState } from 'react';

const STAT_FIELDS = ['fuerza', 'destreza', 'inteligencia', 'constitucion', 'agilidad'];
const STAT_LABELS = {
  fuerza: 'FUE',
  destreza: 'DES',
  inteligencia: 'INT',
  constitucion: 'CON',
  agilidad: 'AGI',
};

export function StatsFields({ form, availablePoints, totalPoints, adjustStat, handleAutoDistribute, handleResetStats, submitRef }) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const rowRefs = useRef([]);

  const focusRow = useCallback((index) => {
    setFocusedIndex(index);
    rowRefs.current[index]?.focus();
  }, []);

  useEffect(() => {
    rowRefs.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const stat = STAT_FIELDS[focusedIndex];

      if (key === 'w' || key === 'arrowup') {
        event.preventDefault();
        setFocusedIndex((index) => (index - 1 + STAT_FIELDS.length) % STAT_FIELDS.length);
        return;
      }
      if (key === 's' || key === 'arrowdown') {
        event.preventDefault();
        setFocusedIndex((index) => (index + 1) % STAT_FIELDS.length);
        return;
      }
      if (key === 'a' || key === 'arrowleft' || key === '-') {
        event.preventDefault();
        adjustStat(stat, -1);
        return;
      }
      if (key === 'd' || key === 'arrowright' || key === '+' || key === '=') {
        event.preventDefault();
        adjustStat(stat, 1);
        return;
      }
      if (key === 'enter' || key === ' ') {
        event.preventDefault()
        submitRef?.current?.click()
        return
      }
      if (key === 'r') {
        event.preventDefault();
        handleResetStats?.();
        return;
      }
      if (key === 't') {
        event.preventDefault();
        handleAutoDistribute?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, focusRow, adjustStat, handleResetStats, handleAutoDistribute, submitRef]);

  return (
    <>
      <div className="stats-assignment">
        <div className="points-pool">
          <span>Puntos: <strong>{availablePoints}</strong> / {totalPoints}</span>
          <button type="button" className="btn-auto-distribute" onClick={handleAutoDistribute}>🎲 Auto</button>
        </div>
        <div className="stats-fields-grid">
          {STAT_FIELDS.map((stat, index) => (
            <div
              className={`stat-assign-row ${index === focusedIndex ? 'is-focused' : ''}`}
              key={stat}
              ref={(node) => { rowRefs.current[index] = node }}
              tabIndex={-1}
              onMouseEnter={() => focusRow(index)}
            >
              <label>{STAT_LABELS[stat]}</label>
              <div className="stat-controls">
                <button
                  type="button"
                  className="btn-stat-control"
                  onClick={() => adjustStat(stat, -1)}
                  disabled={form[stat] <= 10}
                >
                  -
                </button>
                <span className="stat-value">{form[stat]}</span>
                <button
                  type="button"
                  className="btn-stat-control"
                  onClick={() => adjustStat(stat, 1)}
                  disabled={availablePoints <= 0}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="stats-keys-hint">
        <span><strong>Mover:</strong> W/S · ↑/↓</span>
        <span><strong>Asignar:</strong> A/D · ←/→ · +/-</span>
        <span><strong>R:</strong> desasignar todo</span>
        <span><strong>T:</strong> repartir puntos automáticamente</span>
        <span><strong>Enter/espacio:</strong> guardar</span>
      </p>
    </>
  );
}