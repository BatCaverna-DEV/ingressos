import api from './api.js';

export const listarEventos = () => api.get('/eventos');
export const buscarEvento = (id) => api.get(`/eventos/${id}`);
export const criarEvento = (dados) => api.post('/eventos', dados);
export const atualizarEvento = (id, dados) => api.put(`/eventos/${id}`, dados);
export const removerEvento = (id) => api.delete(`/eventos/${id}`);
