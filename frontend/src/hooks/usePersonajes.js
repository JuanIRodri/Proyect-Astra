import { useState, useEffect } from 'react';
import { getPersonajes, updatePersonaje } from '../services/api';

export function usePersonajes() {
  const [personajes, setPersonajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPersonajes = async () => {
    setLoading(true);
    try {
      const data = await getPersonajes();
      setPersonajes(data);
    } catch (err) {
      setError('Error al cargar la lista.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updatePersonaje(id, data);
      await fetchPersonajes();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPersonajes();
  }, []);

  return { 
    personajes, 
    loading, 
    error, 
    fetchPersonajes, 
    handleUpdate
  };
}
