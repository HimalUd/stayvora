import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { ownerRegisterSchema } from '../lib/validations';
import logoLight from '../assets/logos/logo-light.png';
import './HotelOwnerRegister.css';

const ownerPerks = [
  {
    title: 'List your hotel for free',
    desc: 'Add your property, rooms and photos — no upfront costs, no listing fees.',
  },
  {
    title: 'Get found by travelers',
    desc: 'Appear in search results the moment guests search for stays in your city.',
  },
  {
    title: 'Grow all year round',
    desc: 'Seasonal insights, reviews and direct bookings help you win repeat guests.',
  },
];

export default function HotelOwnerRegister() {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(ownerRegisterSchema),
  });

  const onSubmit = async (data) => {
    setError('');
    try {
      await authRegister({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'owner',
      });
      navigate('/hotel-owner-login?registered=1');
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
    <div className="hor-page">
      <div className="hor-side">
        <img src={logoLight} alt="StayVora" className="hor-side-logo" />
        <div className="hor-side-content">
          <h2 className="hor-side-title">Grow your hotel business with StayVora</h2>
          <div className="hor-perks">
            {ownerPerks.map(p => (
              <div key={p.title} className="hor-perk">
                <div className="hor-perk-check">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5l3.5 3.5L13 5" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="hor-perk-title">{p.title}</div>
                  <div className="hor-perk-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="hor-side-foot">© {new Date().getFullYear()} StayVora · Sri Lanka</p>
      </div>

      <div className="hor-main">
        <div className="hor-box">
          <h1 className="hor-title">Create your owner account</h1>
          <p className="hor-subtitle">
            Join Sri Lanka's own hotel booking platform. You can add your hotel from the dashboard after registration.
          </p>

          <div className="hor-card">
            <form onSubmit={handleSubmit(onSubmit)} className="hor-form-body">
              <div className="hor-field">
                <label className="hor-label">Full Name *</label>
                <input className="hor-input" placeholder="Nuwan Perera" {...register('name')} />
                {errors.name && <span className="hor-error">{errors.name.message}</span>}
              </div>

              <div className="hor-field">
                <label className="hor-label">Email *</label>
                <input type="email" className="hor-input" placeholder="owner@hotel.com" {...register('email')} />
                {errors.email && <span className="hor-error">{errors.email.message}</span>}
              </div>

              <div className="hor-field">
                <label className="hor-label">Mobile Number *</label>
                <input type="tel" className="hor-input" placeholder="+94 77 123 4567" {...register('phone')} />
                {errors.phone && <span className="hor-error">{errors.phone.message}</span>}
              </div>

              <div className="hor-field">
                <label className="hor-label">Password *</label>
                <div className="hor-input-wrap">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="hor-input hor-input-pw"
                    placeholder="Enter a strong password"
                    {...register('password')}
                  />
                  <button type="button" className="hor-pw-toggle" onClick={() => setShowPw(v => !v)} aria-label="Toggle password visibility">
                    {pwIcon(showPw)}
                  </button>
                </div>
                <span className="hor-hint">Min 8 characters with uppercase, lowercase, number &amp; special character</span>
                {errors.password && <span className="hor-error">{errors.password.message}</span>}
              </div>

              <div className="hor-field">
                <label className="hor-label">Confirm Password *</label>
                <div className="hor-input-wrap">
                  <input
                    type={showPw2 ? 'text' : 'password'}
                    className="hor-input hor-input-pw"
                    placeholder="Re-enter your password"
                    {...register('confirmPassword')}
                  />
                  <button type="button" className="hor-pw-toggle" onClick={() => setShowPw2(v => !v)} aria-label="Toggle password visibility">
                    {pwIcon(showPw2)}
                  </button>
                </div>
                {errors.confirmPassword && <span className="hor-error">{errors.confirmPassword.message}</span>}
              </div>

              {error && <div className="hor-error-box">{error}</div>}

              <button type="submit" className="hor-btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create Owner Account'}
              </button>
            </form>
          </div>

          <p className="hor-login-text">
            Already registered? <Link to="/hotel-owner-login" className="hor-login-link">Login here</Link>
          </p>

          <Link to="/" className="hor-back">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}