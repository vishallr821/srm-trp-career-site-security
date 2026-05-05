import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true, // Send cookies with requests
});

// Request interceptor to add CSRF token for state-changing requests
api.interceptors.request.use(
  async (config) => {
    // For POST, PUT, DELETE requests, add CSRF token
    if (['post', 'put', 'delete'].includes(config.method?.toLowerCase())) {
      try {
        // Fetch CSRF token if not already in memory
        const existingToken = sessionStorage.getItem('csrfToken');
        if (existingToken) {
          config.headers['X-CSRF-Token'] = existingToken;
        } else {
          // Optionally fetch a new one, or add dynamically
          config.headers['X-CSRF-Token'] = existingToken || '';
        }
      } catch (err) {
        console.warn('CSRF token fetch failed:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - session expired or no token
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      } else if (status === 403) {
        // Forbidden
        toast.error(data?.error?.message || 'Access denied');
      } else if (status === 400) {
        // Validation error
        const message = data?.error?.message || 'Validation error';
        const details = data?.error?.details;
        if (details && Array.isArray(details)) {
          toast.error(`${message}: ${details.map(d => d.message).join(', ')}`);
        } else {
          toast.error(message);
        }
      } else if (status === 429) {
        // Rate limited
        toast.error('Too many requests. Please try again later.');
      } else if (status >= 500) {
        // Server error
        toast.error(data?.error?.message || 'Server error. Please try again later.');
      } else {
        toast.error(data?.error?.message || `Error ${status}: Failed to process request`);
      }
    } else if (error.request) {
      toast.error('Network Error: Unable to reach the server');
    } else {
      toast.error(error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
