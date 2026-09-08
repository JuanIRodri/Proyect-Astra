import { useCallback, useEffect, useState } from 'react';
import { getPartidas } from '../services/api';

export function usePartidas() {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPartidas = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await getPartidas();
      setPartidas(data);
      setError(null);
    } catch {
      setError('Error al cargar las partidas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPartidas(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchPartidas]);

  return { partidas, loading, error, fetchPartidas };
}