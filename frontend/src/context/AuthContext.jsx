import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

const IDLE_TIMEOUT = 60 * 60 * 1000; // 1 hour of inactivity
const WARNING_BEFORE = 30 * 1000; // warn 30s before expiring

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idleWarning, setIdleWarning] = useState(false);
  const [warningSeconds, setWarningSeconds] = useState(30);
  const idleTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    authAPI.checkSession()
      .then((res) => {
        if (res.data.user) setUser(res.data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    return res.data;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch (_) {}
    clearIdleTimers();
    setUser(null);
    queryClient.clear();
  };

  const clearIdleTimers = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    idleTimerRef.current = null;
    warningTimerRef.current = null;
  };

  const handleActivity = () => {
    lastActivityRef.current = Date.now();
    clearIdleTimers();
    setIdleWarning(false);
    idleTimerRef.current = setTimeout(() => {
      setIdleWarning(true);
      setWarningSeconds(Math.round(WARNING_BEFORE / 1000));
      warningTimerRef.current = setTimeout(async () => {
        clearIdleTimers();
        await logout();
        window.location.href = '/';
      }, WARNING_BEFORE);
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const onActivity = () => handleActivity();
    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }));

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastActivityRef.current > IDLE_TIMEOUT) {
        clearIdleTimers();
        logout();
        window.location.href = '/';
      } else {
        handleActivity();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    handleActivity();

    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity));
      document.removeEventListener('visibilitychange', onVisibility);
      clearIdleTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!idleWarning) return;
    setWarningSeconds(Math.round(WARNING_BEFORE / 1000));
    const iv = setInterval(() => setWarningSeconds(s => s - 1), 1000);
    return () => clearInterval(iv);
  }, [idleWarning]);

  const staySignedIn = () => {
    handleActivity();
    authAPI.checkSession().catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
      {idleWarning && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(2, 6, 24, 0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
        }}>
          <div style={{
            width: 380, maxWidth: '90vw', background: '#0F172B',
            borderRadius: 16, outline: '1px solid #1D293D', outlineOffset: -1,
            padding: 32, textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, margin: '0 auto', background: 'rgba(255, 185, 0, 0.12)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 6V12L16 14" stroke="#FFB900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="9" stroke="#FFB900" strokeWidth="2"/>
              </svg>
            </div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, paddingTop: 16 }}>
              Session expiring soon
            </div>
            <p style={{ color: '#90A1B9', fontSize: 14, lineHeight: 22, paddingTop: 8, margin: 0 }}>
              You have been inactive for a while. Your session will expire in
              <strong style={{ color: '#FFB900' }}> {warningSeconds}s</strong>.
            </p>
            <button
              onClick={staySignedIn}
              style={{
                width: '100%', marginTop: 24, padding: '12px 16px',
                background: '#1447E6', color: '#020618', border: 'none',
                borderRadius: 12, fontFamily: "'Inter', sans-serif",
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Stay signed in
            </button>
            <button
              onClick={() => { logout(); window.location.href = '/'; }}
              style={{
                width: '100%', marginTop: 8, padding: '10px 16px',
                background: 'transparent', color: '#90A1B9', border: 'none',
                borderRadius: 12, fontFamily: "'Inter', sans-serif",
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Log out now
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
