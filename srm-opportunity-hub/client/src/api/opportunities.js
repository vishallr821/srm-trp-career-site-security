import api from './axios';

export const getHackathons = async (filters = {}) => {
  const { data } = await api.get('/api/hackathons', { params: filters });
  return data;
};

export const getInternships = async (filters = {}) => {
  const { data } = await api.get('/api/internships', { params: filters });
  return data;
};

export const getContests = async (filters = {}) => {
  const { data } = await api.get('/api/contests', { params: filters });
  return data;
};

export const getStats = async () => {
  const { data } = await api.get('/api/stats');
  return data;
};
