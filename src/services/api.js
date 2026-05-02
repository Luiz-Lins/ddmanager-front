import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// O Interceptor: Antes de qualquer requisição sair, ele faz isto:
api.interceptors.request.use((config) => {
  // Vai ao cofre buscar o token
  const token = localStorage.getItem('@ddmanager:token');
  
  // Se o token existir, cola-o no cabeçalho (Header) da requisição
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;