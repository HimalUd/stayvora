import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../lib/validations';
import logoLight from '../assets/logos/logo-light.png';
import './HotelOwnerLogin.css';

const ownerPerks = [
  {
    title: 'Reach travelers across Sri Lanka',
    desc: 'Get discovered by guests searching for stays in your city — Colombo, Ella, Mirissa and beyond.',
  },
  {
    title: 'Manage everything in one dashboard',
    desc: 'Bookings, revenue and guest reviews — all in one simple dashboard.',
  },
  {
    title: 'Grow with seasonal insights',
    desc: 'Price smart through peak and off-peak seasons to fill rooms all year round.',
  },
];

export default function HotelOwnerLogin() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
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
      const res = await login(data.email, data.password);
      if (res?.user?.role !== 'owner') {
        setError('Access denied. Owner account required.');
        await logout();
      } else {
        navigate('/hotel-owner-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="hol-page">
      <div className="hol-side">
        <img src={logoLight} alt="StayVora" className="hol-side-logo" />
        <div className="hol-side-content">
          <h2 className="hol-side-title">Built for Sri Lankan hotel owners</h2>
          <div className="hol-perks">
            {ownerPerks.map(p => (
              <div key={p.title} className="hol-perk">
                <div className="hol-perk-check">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5l3.5 3.5L13 5" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="hol-perk-title">{p.title}</div>
                  <div className="hol-perk-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="hol-side-foot">© {new Date().getFullYear()} StayVora · Sri Lanka</p>
      </div>

      <div className="hol-main">
        <div className="hol-box">
          <h1 className="hol-title">Welcome back</h1>
          <p className="hol-subtitle">Login to your hotel dashboard</p>

          {registered && (
            <p className="hol-success">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="#10B981"/>
                <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Account created successfully! Please login.
            </p>
          )}

          <form className="hol-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="hol-field">
              <label className="hol-label">Hotel Email</label>
              <div className="hol-input-wrap">
                <svg className="hol-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1.33" y="2.67" width="13.33" height="10.67" rx="1.33" stroke="#64748B" strokeWidth="1.33"/>
                  <path d="M1.33 4l6.67 4.67L14.67 4" stroke="#64748B" strokeWidth="1.33"/>
                </svg>
                <input type="email" className="hol-input" placeholder="your-hotel@example.com" {...register('email')} />
              </div>
              {errors.email && <p className="hol-field-error">{errors.email.message}</p>}
            </div>

            <div className="hol-field">
              <label className="hol-label">Password</label>
              <div className="hol-input-wrap">
                <svg className="hol-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2.67" y="7.33" width="10.67" height="7.33" rx="1.33" stroke="#64748B" strokeWidth="1.33"/>
                  <rect x="5.33" y="4" width="5.33" height="4" rx="2.67" stroke="#64748B" strokeWidth="1.33"/>
                </svg>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="hol-input hol-input-pw"
                  placeholder="Enter your password"
                  {...register('password')}
                />
                <button type="button" className="hol-pw-toggle" onClick={() => setShowPw(v => !v)} aria-label="Toggle password visibility">
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
              {errors.password && <p className="hol-field-error">{errors.password.message}</p>}
            </div>

            {error && <p className="hol-error">{error}</p>}

            <button type="submit" className="hol-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>

          <p className="hol-register-text">
            Don't have an account? <Link to="/hotel-owner-register" className="hol-register-link">Register your hotel</Link>
          </p>

          <Link to="/" className="hol-back">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}