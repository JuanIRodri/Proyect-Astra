import { useState, useEffect, useCallback } from 'react';
import { getPersonajes, updatePersonaje } from '@/services/api';

export function usePersonajes() {
  const [personajes, setPersonajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPersonajes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPersonajes();
      setPersonajes(data);
    } catch {
      setError('Error al cargar la lista.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdate = async (id, data) => {
    try {
      await updatePersonaje(id, data);
      await fetchPersonajes();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    getPersonajes()
      .then((data) => {
        if (cancelled) return;
        setPersonajes(data);
      })
      .catch(() => {
        if (!cancelled) setError('Error al cargar la lista.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { 
    personajes, 
    loading, 
    error, 
    fetchPersonajes, 
    handleUpdate
  };
}
