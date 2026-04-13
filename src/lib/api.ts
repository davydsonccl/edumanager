import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const empresaId = localStorage.getItem('activeEmpresaId');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (empresaId) {
    config.headers['x-empresa-id'] = empresaId;
  }
  return config;
});

export default api;
