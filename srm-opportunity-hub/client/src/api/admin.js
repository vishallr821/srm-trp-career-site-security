import api from './axios';

export const getAnalytics = async () => {
  const { data } = await api.get('/api/admin/analytics');
  return data;
};
