import api from './api.js';

export const listarIngressos = (eventosId) =>
  api.get('/ingressos', { params: eventosId ? { eventos_id: eventosId } : {} });
export const buscarIngresso = (id) => api.get(`/ingressos/${id}`);
export const criarIngresso = (dados) => api.post('/ingressos', dados);
export const validarIngresso = (codigo) => api.patch(`/ingressos/validar/${codigo}`);
export const cancelarIngresso = (id) => api.delete(`/ingressos/${id}`);
