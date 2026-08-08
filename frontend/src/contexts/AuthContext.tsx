import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { email?: string; phone?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: User[] = [
  { id: 1, username: 'buyer', email: 'buyer@demo.com', phone: '09-123456789', role: 'USER' },
  { id: 2, username: 'seller', email: 'seller@demo.com', phone: '09-987654321', role: 'USER' },
  { id: 3, username: 'admin', email: 'admin@demo.com', phone: '09-111111111', role: 'ADMIN' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('urbannest-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('urbannest-user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, _password: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const found = DEMO_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!found) {
      throw new Error('Invalid credentials. Try: buyer, seller, or admin');
    }
    setUser(found);
    localStorage.setItem('urbannest-user', JSON.stringify(found));
  };

  const register = async (username: string, email: string, _password: string, phone: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newUser: User = {
      id: Date.now(),
      username,
      email,
      phone,
      role: 'USER',
    };
    setUser(newUser);
    localStorage.setItem('urbannest-user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('urbannest-user');
  };

  const updateProfile = (data: { email?: string; phone?: string }) => {
    if (user) {
      const updated = { ...user, ...data };
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
