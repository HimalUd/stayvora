import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './EmailVerification.css';

const RESEND_COOLDOWN = 60;

function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.length <= 2 ? local[0] + '*' : local.slice(0, 2) + '*'.repeat(local.length - 2);
  return `${maskedLocal}@${domain}`;
}

export default function EmailVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    authAPI.sendVerification().catch(() => {});
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  const handleCodeChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    setError('');
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    setVerifying(true);
    setError('');
    try {
      const res = await authAPI.verifyEmail({ code });
      setMessage(res.data?.message || 'Email verified successfully');
      setTimeout(() => navigate('/hotel-owner-dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setError('');
    try {
      await authAPI.sendVerification();
      setCooldown(RESEND_COOLDOWN);
      setMessage('A new verification code has been sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="ev-page">
      <div className="ev-bg">
        <div className="ev-card">
          <div className="ev-icon">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <rect x="4" y="9" width="48" height="38" rx="4" stroke="#2563EB" strokeWidth="3.5"/>
              <path d="M7 13l21 16 21-16" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="ev-title">Verify Your Email</h1>
          <p className="ev-subtitle">
            We sent a 6-digit verification code to <strong>{maskEmail(user?.email) || 'your email'}</strong>.
            Enter it below to activate your hotel account.
          </p>

          <input
            type="text"
            inputMode="numeric"
            autoFocus
            className="ev-code-input"
            placeholder="••••••"
            value={code}
            onChange={handleCodeChange}
            onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
          />

          {error && <div className="ev-error">{error}</div>}
          {message && <div className="ev-message">{message}</div>}

          <button
            className="ev-btn"
            disabled={verifying || code.length !== 6}
            onClick={handleVerify}
          >
            {verifying ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className="ev-resend">
            <span className="ev-resend-text">Didn't receive the code?</span>
            {cooldown > 0 ? (
              <span className="ev-resend-cooldown">Resend in {cooldown}s</span>
            ) : (
              <button className="ev-resend-btn" onClick={handleResend} disabled={resending}>
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>

          <Link to="/hotel-owner-login" className="ev-back-link">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
