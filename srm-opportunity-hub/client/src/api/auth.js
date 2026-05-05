import api from './axios';

export const login = async (email, password) => {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
};

export const register = async (userData) => {
  const { data } = await api.post('/api/auth/register', userData);
  return data;
};

export const logout = async () => {
  const { data } = await api.post('/api/auth/logout');
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/api/auth/me');
  return data;
};
