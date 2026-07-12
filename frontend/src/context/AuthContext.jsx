import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const DEMO_USER = {
  id: 1,
  name: 'Demo Traveler',
  email: 'demo@stayvora.com',
  phone: '+1 (555) 000-0000',
  role: 'traveler',
  first_name: 'Demo',
  last_name: 'Traveler',
};

const ADMIN_USER = {
  id: 0,
  name: 'Administrator',
  email: 'admin@stayeasy.com',
  phone: '+1 (555) 999-9999',
  role: 'admin',
  first_name: 'Admin',
  last_name: '',
};

const DEMO_EMAIL = 'demo@stayvora.com';
const DEMO_PASS = 'demo123';
const ADMIN_EMAIL = 'admin@stayeasy.com';
const ADMIN_PASS = 'admin123';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('stayvora_user');
    if (stored) {
      setUser(JSON.parse(stored));
      setLoading(false);
    } else {
      authAPI.checkSession()
        .then((res) => {
          if (res.data.user) setUser(res.data.user);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('stayvora_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('stayvora_user');
    }
  }, [user]);

  const login = async (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      setUser(ADMIN_USER);
      return ADMIN_USER;
    }
    if (email === DEMO_EMAIL && password === DEMO_PASS) {
      setUser(DEMO_USER);
      return DEMO_USER;
    }
    const res = await authAPI.login({ email, password });
    const userData = res.data.data || res.data.user;
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const userData = res.data.data || res.data.user;
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch (_) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, DEMO_EMAIL, DEMO_PASS, ADMIN_EMAIL, ADMIN_PASS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
