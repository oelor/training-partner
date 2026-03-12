import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMe, login as apiLogin, register as apiRegister, logout as apiLogout, getToken } from './api';

interface User {
  id: string;
  name: string;
  email: string;
  sport?: string;
  skill_level?: string;
  weight_class?: string;
  city?: string;
  bio?: string;
  avatar_url?: string;
  is_gym?: boolean;
  profile_complete?: boolean;
  subscription_plan?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; sport: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await getToken();
      if (token) {
        const userData = await getMe();
        setUser(userData);
      }
    } catch {
      // Token invalid or expired — clear it
      await apiLogout();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const data = await apiLogin(email, password);
    setUser(data.user);
  }

  async function register(payload: { name: string; email: string; password: string; sport: string }) {
    const data = await apiRegister(payload);
    setUser(data.user);
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  async function refreshUser() {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch {
      // ignore
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
