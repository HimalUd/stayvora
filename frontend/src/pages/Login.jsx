import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../lib/validations';
import badgeLight from '../assets/logos/badge-light.png';
import '../styles/Auth.css';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const registered = searchParams.get('registered');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setError('');
    try {
      const result = await login(data.email, data.password);
      if (result?.user?.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (result?.user?.role === 'owner') {
        navigate('/hotel-owner-dashboard');
      } else {
        if (registered) sessionStorage.setItem('showHomeGuide', '1');
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-card">
        <div className="auth-form-side">
          <div className="auth-form-container">
            
            <h1 className="auth-title">Hello Again!</h1>
            <p className="auth-subtitle">Sign in to continue your stay journey</p>

            {registered && (
              <div className="auth-success">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="#10B981"/>
                  <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Account created successfully! Please login.
              </div>
            )}
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              <div className="auth-input-group">
                <span className="auth-label">Email</span>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1.33" y="2.67" width="13.33" height="10.67" rx="1.33" stroke="#94A3B8" strokeWidth="1.33"/>
                    <path d="M1.33 4l6.67 4.67L14.67 4" stroke="#94A3B8" strokeWidth="1.33"/>
                  </svg>
                  <input type="email" className="auth-input" placeholder="you@example.com" {...register('email')} autoComplete="email" />
                </div>
                {errors.email && <span className="auth-field-error">{errors.email.message}</span>}
              </div>
              <div className="auth-input-group">
                <span className="auth-label">Password</span>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2.67" y="7.33" width="10.67" height="7.33" rx="1.33" stroke="#94A3B8" strokeWidth="1.33"/>
                    <rect x="5.33" y="4" width="5.33" height="4" rx="2.67" stroke="#94A3B8" strokeWidth="1.33"/>
                  </svg>
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="auth-input auth-input-pw"
                    placeholder="Enter your password"
                    {...register('password')}
                    autoComplete="current-password"
                  />
                  <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)} aria-label="Toggle password visibility">
                    {showPw ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1.33 8s2.67-4.67 6.67-4.67S14.67 8 14.67 8 12 12.67 8 12.67 1.33 8 1.33 8z" stroke="#64748B" strokeWidth="1.33"/>
                        <circle cx="8" cy="8" r="2" fill="#64748B"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1.33 8s2.67-4.67 6.67-4.67S14.67 8 14.67 8 12 12.67 8 12.67 1.33 8 1.33 8z" stroke="#64748B" strokeWidth="1.33"/>
                        <circle cx="8" cy="8" r="2" fill="#64748B"/>
                        <path d="M2 2l12 12" stroke="#64748B" strokeWidth="1.33" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <span className="auth-field-error">{errors.password.message}</span>}
              </div>

              <button type="submit" className="auth-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="auth-footer-text">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Create an account</Link>
            </p>

            <Link to="/" className="auth-back">← Back to Home</Link>
          </div>
        </div>
        <div className="auth-image-side">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=557&h=696&fit=crop"
            alt="Luxury hotel"
            className="auth-image"
          />
          <div className="auth-image-overlay">
            <div className="auth-image-brand">
              <img src={badgeLight} alt="StayVora" className="auth-image-brand-logo" />
            </div>
            <h2 className="auth-image-title">Discover Sri Lanka's Finest Stays</h2>
            <p className="auth-image-subtitle">From beach villas in Mirissa to mountain retreats in Ella — your perfect stay awaits.</p>
          </div>
        </div>
      </div>
    </div>
  );
}