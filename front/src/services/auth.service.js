import api from './api.js';

export const loginGoogle = (credential) => api.post('/usuarios/login/google', { credential });
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};
export const getUsuario = () => JSON.parse(localStorage.getItem('usuario') || 'null');
