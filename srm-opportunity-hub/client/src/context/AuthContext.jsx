import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);

  // Fetch CSRF token on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Fetch CSRF token and store in sessionStorage
        const csrfResponse = await fetch('/api/csrf-token', {
          method: 'GET',
          credentials: 'include',
        });
        if (csrfResponse.ok) {
          const { csrfToken } = await csrfResponse.json();
          setCsrfToken(csrfToken);
          // Store in sessionStorage for axios interceptor
          sessionStorage.setItem('csrfToken', csrfToken);
        }

        // Try to validate existing session via /api/auth/me
        const userData = await authApi.getMe();
        setUser(userData);
      } catch (error) {
        // User not authenticated or session expired
        console.log('Session not found or invalid');
      } finally {
        setLoading(false);
      }
    };
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

export const useAuth = () => useContext(AuthContext);
