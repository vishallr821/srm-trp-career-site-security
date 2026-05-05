import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true, // Send cookies with requests
});

// Helper to fetch and store a fresh CSRF token
export const ensureCsrfToken = async () => {
  try {
    const { data } = await api.get('/api/csrf-token');
    if (data.csrfToken) {
      sessionStorage.setItem('csrfToken', data.csrfToken);
      return data.csrfToken;
    }
  } catch (err) {
    console.warn('Failed to fetch CSRF token:', err);
  }
  return null;
};

// Request interceptor to add CSRF token for state-changing requests
api.interceptors.request.use(
  (config) => {
    // For POST, PUT, DELETE requests, add CSRF token (read fresh from sessionStorage each time)
    if (['post', 'put', 'delete'].includes(config.method?.toLowerCase())) {
      config.headers['X-CSRF-Token'] = sessionStorage.getItem('csrfToken');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and CSRF refresh+retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle 403 CSRF errors: refresh token and retry once
      if (status === 403 && data?.error?.code === 'CSRF_ERROR') {
        // Prevent infinite retries using a flag
        if (error.config?._retry) {
          // Already retried; give up and reject
          toast.error('CSRF token validation failed after retry');
          return Promise.reject(error);
        }

        // Mark as retried
        error.config._retry = true;

        try {
          // Fetch and store a fresh CSRF token
          await ensureCsrfToken();

          // Retry the original request
          return api(error.config);
        } catch (refreshErr) {
          console.error('CSRF refresh failed:', refreshErr);
          toast.error('Failed to refresh security token');
          return Promise.reject(refreshErr);
        }
      }

      // Handle other 403 errors (not CSRF)
      if (status === 403) {
        toast.error(data?.error?.message || 'Access denied');
      } else if (status === 401) {
        // Unauthorized - session expired or no token
        const url = error.config?.url || '';

        // Don't spam "session expired" on initial session check
        if (url.includes('/api/auth/me')) {
          return Promise.reject(error);
        }

        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
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
