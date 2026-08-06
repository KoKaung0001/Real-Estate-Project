import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

const DEMO_USERS = {
  buyer: { id: '1', name: 'John Buyer', email: 'buyer@demo.com', role: 'buyer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', phone: '+1-555-0101', rating: 4.8 },
  seller: { id: '2', name: 'Jane Seller', email: 'seller@demo.com', role: 'seller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', phone: '+1-555-0202', rating: 4.9 },
  admin: { id: '3', name: 'Admin User', email: 'admin@demo.com', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('smart-property-user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('smart-property-user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const demoUser = DEMO_USERS[role];
    if (demoUser && email === demoUser.email) {
      setUser(demoUser);
      localStorage.setItem('smart-property-user', JSON.stringify(demoUser));
      return;
    }
    throw new Error('Invalid credentials');
  };

  const register = async (name, email, password, role) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role: role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      phone: `+1-555-${Math.floor(Math.random() * 9000 + 1000)}`,
      rating: 5.0,
    };
    setUser(newUser);
    localStorage.setItem('smart-property-user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smart-property-user');
  };

  const updateProfile = (data) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('smart-property-user', JSON.stringify(updated));
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