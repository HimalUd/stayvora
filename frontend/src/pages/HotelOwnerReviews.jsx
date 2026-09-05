import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOwnerReviews } from '../hooks/useReviews';
import StarRating from '../components/StarRating/StarRating';
import badgeLight from '../assets/logos/badge-light.png';
import './HotelOwnerDashboard.css';
import './HotelOwnerReviews.css';

const formatDate = (d) => {
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function HotelOwnerReviews() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: reviews = [], isLoading: loading } = useOwnerReviews();

  return (
    <div className="hod-page">
      <header className="hod-topbar">
        <div className="hod-topbar-inner">
          <div className="hod-topbar-left">
            <Link to="/" className="hod-topbar-logo">
              <img src={badgeLight} alt="StayVora" className="hod-topbar-logo-img" />
            </Link>
            <span className="hod-topbar-title">Hotel Manager Dashboard</span>
          </div>
          <div className="hod-topbar-right">
            <div className="hod-user-chip">
              <div className="hod-user-avatar">{(user?.name || 'O').charAt(0).toUpperCase()}</div>
              <span className="hod-user-name">{user?.name || 'Owner'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="hod-content">
        <div className="hod-welcome-header">
          <div>
            <h1 className="hod-welcome">My Reviews</h1>
            <p className="hod-sub">Reviews travelers left for your hotels</p>
          </div>
          <div className="hod-welcome-actions">
            <button className="hod-welcome-btn hod-welcome-btn-primary" onClick={() => navigate('/hotel-owner-dashboard')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Dashboard
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner spinner-lg" /></div>
        ) : reviews.length === 0 ? (
          <div className="hod-empty-state">
            <div className="hod-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L12 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L12 2z" stroke="#2563EB" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 className="hod-empty-title">No reviews yet</h3>
            <p className="hod-empty-text">When travelers review your hotels, they will appear here.</p>
          </div>
        ) : (
          <div className="hor-list">
            {reviews.map(r => (
              <div key={r.id} className="hor-card">
                <div className="hor-card-top">
                  <div className="hor-hotel">
                    <div className="hor-hotel-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 22V12H15V22" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="hor-hotel-name">{r.hotel_name}</div>
                  </div>
                  <StarRating value={Math.round(Number(r.rating))} size={18} />
                </div>
                <div className="hor-divider" />
                <div className="hor-reviewer">
                  <div className="hor-avatar">{r.user_name?.charAt(0).toUpperCase() || 'U'}</div>
                  <div className="hor-reviewer-meta">
                    <span className="hor-reviewer-name">{r.user_name}</span>
                    <span className="hor-reviewer-date">{formatDate(r.created_at)}</span>
                  </div>
                </div>
                {r.title && <p className="hor-title">{r.title}</p>}
                {r.comment && <p className="hor-comment">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}