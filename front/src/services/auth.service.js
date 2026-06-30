import { ref } from 'vue';
import api from './api.js';

export const autenticado = ref(!!localStorage.getItem('token'));

export const loginGoogle = (credential) => api.post('/usuarios/login/google', { credential });
export const registrar = (dados) => api.post('/usuarios/registrar', dados);

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  autenticado.value = false;
};

export const getUsuario = () => JSON.parse(localStorage.getItem('usuario') || 'null');
