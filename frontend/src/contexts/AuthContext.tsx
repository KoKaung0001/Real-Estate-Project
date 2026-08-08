import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authAPI } from '../utils/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { email?: string; phone?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('urbannest-token');
    const storedUser = localStorage.getItem('urbannest-user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('urbannest-token');
        localStorage.removeItem('urbannest-user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authAPI.login({ username, password });
    const data = res.data;
    localStorage.setItem('urbannest-token', data.token);
    const userData: User = {
      id: data.id,
      username: data.username,
      email: data.email,
      phone: data.phone,
      role: data.role,
    };
    setUser(userData);
    localStorage.setItem('urbannest-user', JSON.stringify(userData));
  };

  const register = async (username: string, email: string, password: string, phone: string) => {
    const res = await authAPI.register({ username, email, password, phone });
    const data = res.data;
    localStorage.setItem('urbannest-token', data.token);
    const userData: User = {
      id: data.id,
      username: data.username,
      email: data.email,
      phone: data.phone,
      role: data.role,
    };
    setUser(userData);
    localStorage.setItem('urbannest-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('urbannest-token');
    localStorage.removeItem('urbannest-user');
  };

  const updateProfile = async (data: { email?: string; phone?: string }) => {
    const res = await import('../utils/api').then(m => m.userAPI.updateProfile(data));
    if (user) {
      const updated = { ...user, ...res.data };
      setUser(updated);
      localStorage.setItem('urbannest-user', JSON.stringify(updated));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
