import api from './axios';

export const getBookmarks = async () => {
  const { data } = await api.get('/api/bookmarks');
  return data;
};

export const addBookmark = async (opportunity_id, opportunity_type) => {
  const { data } = await api.post('/api/bookmarks', { opportunity_id, opportunity_type });
  return data;
};

export const removeBookmark = async (opportunity_id) => {
  const { data } = await api.delete(`/api/bookmarks/${opportunity_id}`);
  return data;
};
