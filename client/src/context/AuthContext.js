import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored || stored === 'undefined' || stored === 'null') return null;
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // token aur user dono store karo
      localStorage.setItem('token',  data.token);
      localStorage.setItem('user',   JSON.stringify(data.user));
      // state update karo
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Check credentials.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
