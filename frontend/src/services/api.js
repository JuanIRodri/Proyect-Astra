import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const getPersonajes = async () => {
  const response = await api.get('/personajes');
  return response.data;
};

export const updatePersonaje = async (id, data) => {
  const response = await api.put(`/personajes/${id}`, data);
  return response.data;
};

export const getInventario = async (id) => {
  const response = await api.get(`/personajes/${id}/inventario`);
  return response.data;
};

export const saveInventario = async (id, items) => {
  const response = await api.put(`/personajes/${id}/inventario`, { items });
  return response.data;
};

export const usarObjeto = async (id, slotIndex) => {
  const response = await api.post(`/personajes/${id}/inventario/${slotIndex}/usar`);
  return response.data;
};

export const getEquipamiento = async (id) => {
  const response = await api.get(`/personajes/${id}/equipamiento`);
  return response.data;
};

export const equiparObjeto = async (id, slotIndex) => {
  const response = await api.post(`/personajes/${id}/inventario/${slotIndex}/equipar`);
  return response.data;
};

export const desequiparObjeto = async (id, equipmentSlot) => {
  const response = await api.post(`/personajes/${id}/equipamiento/${equipmentSlot}/desequipar`);
  return response.data;
};

export default api;
