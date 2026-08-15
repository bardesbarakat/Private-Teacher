import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(localStorage.getItem('bedu_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('bedu_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = (tokenStr, userData) => {
    localStorage.setItem('bedu_token', tokenStr);
    localStorage.setItem('bedu_user', JSON.stringify(userData));
    setToken(tokenStr);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('bedu_token');
    localStorage.removeItem('bedu_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const role = user?.role || null;
  const approvalStatus = user?.approvalStatus || 'Approved';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, role, approvalStatus, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
