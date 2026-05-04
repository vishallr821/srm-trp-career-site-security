import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (error.response) {
      toast.error(error.response.data.error || `Error ${error.response.status}: Failed to process request`);
    } else if (error.request) {
      toast.error('Network Error: Unable to reach the server');
    } else {
      toast.error(error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
