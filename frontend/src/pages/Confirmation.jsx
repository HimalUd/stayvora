import React from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import './Confirmation.css';

export default function Confirmation() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const code = searchParams.get('code') || 'BKDQ84N0OX2';
  const data = location.state || {};

  return (
    <div className="cf-page">
      <div className="cf-container">
        <div className="cf-card">
          <div className="cf-icon-wrap">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#10B981" />
              <path d="M14 24l7 7 13-13" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1 className="cf-heading">Booking Confirmed!</h1>
          <p className="cf-subtitle">Your reservation has been successfully confirmed.</p>

          <div className="cf-code-box">
            <span className="cf-code-label">Confirmation Number</span>
            <span className="cf-code-value">{code}</span>
          </div>

          <div className="cf-details">
            <div className="cf-row">
              <span className="cf-row-label">Hotel</span>
              <span className="cf-row-value">{data.hotel || 'Mirissa Beach Hotel'}</span>
            </div>
            <div className="cf-row">
              <span className="cf-row-label">Room Type</span>
              <span className="cf-row-value">{data.room || 'Classic Room'}</span>
            </div>
            <div className="cf-row">
              <span className="cf-row-label">Check-in</span>
              <span className="cf-row-value">{data.checkIn || 'Jul 15, 2026'}</span>
            </div>
            <div className="cf-row">
              <span className="cf-row-label">Check-out</span>
              <span className="cf-row-value">{data.checkOut || 'Jul 18, 2026'}</span>
            </div>
            <div className="cf-row">
              <span className="cf-row-label">Guests</span>
              <span className="cf-row-value">{data.guests || 2} Guest{(data.guests || 2) > 1 ? 's' : ''}</span>
            </div>
            <div className="cf-row cf-row-total">
              <span className="cf-row-label">Total Amount</span>
              <span className="cf-row-value cf-total-value">${data.total || '390.88'}</span>
            </div>
          </div>

          <div className="cf-note">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9V9h2v6zm0-8H9V5h2v2z" fill="#D4AF37"/>
            </svg>
            <span>A confirmation email has been sent to your email address. Please check your inbox for booking details.</span>
          </div>

          <div className="cf-actions">
            <Link to="/home" className="cf-btn cf-btn-primary">Book Another Hotel</Link>
            <Link to="/home" className="cf-btn cf-btn-outline">Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
