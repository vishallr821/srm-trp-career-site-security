import { createContext, useState, useEffect, useContext, useRef } from 'react';
import * as authApi from '../api/auth';
import { ensureCsrfToken } from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);
  const didInit = useRef(false);

  // Fetch CSRF token on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Fetch CSRF token using shared axios client and store in sessionStorage
        const token = await ensureCsrfToken();
        if (token) {
          setCsrfToken(token);
        }

        // Try to validate existing session via /api/auth/me
        const userData = await authApi.getMe();
        setUser(userData);
      } catch {
        // User not authenticated or session expired
        console.log('Session not found or invalid');
      } finally {
        setLoading(false);
      }
    };
    if (didInit.current) return;
    didInit.current = true;
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    // User data comes in response; token is stored in HttpOnly cookie by server
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    // User data comes in response; token is stored in HttpOnly cookie by server
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    // Cookie will be cleared by server
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, csrfToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);