import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { registerSchema } from '../lib/validations';
import badgeLight from '../assets/logos/badge-dark.png';
import '../styles/Auth.css';
import './Register.css';

export default function Register() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'traveler' },
  });

  const onSubmit = async (data) => {
    setError('');
    try {
      const { confirmPassword, ...payload } = data;
      await authRegister(payload);
      navigate(payload.role === 'owner' ? '/hotel-owner-login?registered=1' : '/login?registered=1');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  const pwIcon = (visible) => (
    visible ? (
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
    )
  );

  return (
    <div className="auth-page register-page">
      <div className="auth-card register-card-layout">
        <div className="auth-image-side">
          <img
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=557&h=696&fit=crop"
            alt="Travel destination"
            className="auth-image"
          />
          <div className="auth-image-overlay">
            <div className="auth-image-brand">
              <img src={badgeLight} alt="StayVora" className="auth-image-brand-logo" />
            </div>
            <h2 className="auth-image-title">Your Gateway to Memorable Stays</h2>
            <p className="auth-image-subtitle">Join thousands of travelers booking handpicked hotels across Sri Lanka.</p>
          </div>
        </div>
        <div className="auth-form-side">
          <div className="auth-form-container">
            
            <h1 className="auth-title">Create Your Account</h1>
            <p className="auth-subtitle">Start booking your perfect stay today</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              <div className="auth-input-group">
                <span className="auth-label">Full Name</span>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 8a3 3 0 100-6 3 3 0 000 6z" stroke="#94A3B8" strokeWidth="1.33"/>
                    <path d="M2.5 14.5v-1a4.5 4.5 0 0111 0v1" stroke="#94A3B8" strokeWidth="1.33"/>
                  </svg>
                  <input type="text" className="auth-input" placeholder="Nuwan Perera" {...register('name')} autoComplete="name" />
                </div>
                {errors.name && <span className="auth-field-error">{errors.name.message}</span>}
              </div>
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
                    placeholder="Enter a strong password"
                    {...register('password')}
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)} aria-label="Toggle password visibility">
                    {pwIcon(showPw)}
                  </button>
                </div>
                <span className="auth-hint">Min 8 characters with uppercase, lowercase, number &amp; special character</span>
                {errors.password && <span className="auth-field-error">{errors.password.message}</span>}
              </div>
              <div className="auth-input-group">
                <span className="auth-label">Confirm Password</span>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2.67" y="7.33" width="10.67" height="7.33" rx="1.33" stroke="#94A3B8" strokeWidth="1.33"/>
                    <rect x="5.33" y="4" width="5.33" height="4" rx="2.67" stroke="#94A3B8" strokeWidth="1.33"/>
                  </svg>
                  <input
                    type={showPw2 ? 'text' : 'password'}
                    className="auth-input auth-input-pw"
                    placeholder="Re-enter your password"
                    {...register('confirmPassword')}
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-pw-toggle" onClick={() => setShowPw2(v => !v)} aria-label="Toggle password visibility">
                    {pwIcon(showPw2)}
                  </button>
                </div>
                {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword.message}</span>}
              </div>
              <div className="auth-input-group">
                <span className="auth-label">Phone Number</span>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1.41" y="1.33" width="13.26" height="13.29" rx="2" stroke="#94A3B8" strokeWidth="1.33"/>
                  </svg>
                  <input type="tel" className="auth-input" placeholder="+94 77 123 4567" {...register('phone')} autoComplete="tel" />
                </div>
                {errors.phone && <span className="auth-field-error">{errors.phone.message}</span>}
              </div>
              <div className="auth-input-group">
                <span className="auth-label">I am a</span>
                <select className="auth-input auth-select" {...register('role')}>
                  <option value="traveler">Traveler</option>
                  <option value="owner">Hotel Owner</option>
                </select>
              </div>

              <button type="submit" className="auth-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create an Account'}
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Login</Link>
            </p>

            <Link to="/" className="auth-back">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}