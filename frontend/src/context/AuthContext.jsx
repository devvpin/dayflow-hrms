import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser({ ...userData, role: userData.role?.toLowerCase() });
        } catch (err) {
          console.error('Failed to load user', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for unauthorized events from api interceptor
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const data = await authService.login(credentials);
      localStorage.setItem('token', data.access_token);
      // After login, fetch the user
      const userData = await authService.getCurrentUser();
      setUser({ ...userData, role: userData.role?.toLowerCase() });
      return true;
    } catch (err) {
      let msg = 'Login failed';
      if (err.response?.data?.detail) {
        msg = typeof err.response.data.detail === 'string'
          ? err.response.data.detail
          : err.response.data.detail[0]?.msg || msg;
      }
      setError(msg);
      return false;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      await authService.register(userData);
      return true;
    } catch (err) {
      let msg = 'Registration failed';
      if (err.response?.data?.detail) {
        msg = typeof err.response.data.detail === 'string'
          ? err.response.data.detail
          : err.response.data.detail[0]?.msg || msg;
      }
      setError(msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
