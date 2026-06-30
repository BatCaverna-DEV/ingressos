import api from './api.js';

export const listarInscricoes = (params) => api.get('/inscricoes', { params });
export const buscarInscricao = (id) => api.get(`/inscricoes/${id}`);
export const criarInscricao = (dados) => api.post('/inscricoes', dados);
export const deferirInscricao = (id) => api.patch(`/inscricoes/${id}/deferir`);
export const indeferirInscricao = (id) => api.patch(`/inscricoes/${id}/indeferir`);
export const cancelarInscricao = (id) => api.delete(`/inscricoes/${id}`);
