import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './HotelOwnerDashboard.css';

const statusColors = {
  confirmed: '#1976D2',
  checked_in: '#2E7D32',
  checked_out: 'rgba(0,0,0,0.08)',
  cancelled: '#D32F2F',
};

const statusLabels = {
  confirmed: 'CONFIRMED',
  checked_in: 'CHECKED IN',
  checked_out: 'CHECKED OUT',
  cancelled: 'CANCELLED',
};

const statusTextColors = {
  confirmed: 'white',
  checked_in: 'white',
  checked_out: 'rgba(0,0,0,0.87)',
  cancelled: 'white',
};

export default function HotelOwnerDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('bookings');

  const bookings = useMemo(() => {
    const data = JSON.parse(localStorage.getItem('stayvora_bookings') || '[]');
    return data.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
  }, []);

  const stats = useMemo(() => {
    const total = bookings.length;
    const avgRating = 4.7;
    const totalReviews = Math.min(total, 3);
    return { total, avgRating, totalReviews };
  }, [bookings]);

  return (
    <div className="hod-page">
      {/* TOP BAR */}
      <header className="hod-topbar">
        <div className="hod-topbar-inner">
          <div className="hod-topbar-left">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="15" width="6" height="1" rx="0.5" stroke="white" strokeWidth="2"/>
              <rect x="4" y="2" width="16" height="20" rx="1" stroke="white" strokeWidth="2"/>
            </svg>
            <span className="hod-topbar-title">Hotel Manager Dashboard</span>
          </div>
          <div className="hod-topbar-right">
            <div className="hod-notif-wrap">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2.5" y="1.67" width="15" height="12.5" rx="1.67" stroke="white" strokeWidth="1.67"/>
                <rect x="10" y="17.5" width="2.89" height="0.83" rx="0.42" stroke="white" strokeWidth="1.67"/>
              </svg>
              <div className="hod-notif-badge">3</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="2.5" width="5" height="15" rx="1.67" stroke="white" strokeWidth="1.67"/>
              <rect x="13.33" y="5.83" width="4.17" height="8.33" rx="1.67" stroke="white" strokeWidth="1.67"/>
            </svg>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="hod-content">
        <div className="hod-content-inner">
          <h1 className="hod-welcome">Welcome back!</h1>
          <p className="hod-sub">Here's what's happening with your hotel today</p>

          {/* STATS */}
          <div className="hod-stats">
            <div className="hod-stat-card">
              <div>
                <div className="hod-stat-label">Total Bookings</div>
                <div className="hod-stat-value">{stats.total}</div>
              </div>
              <div className="hod-stat-icon hod-stat-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#155DFC" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            <div className="hod-stat-card">
              <div>
                <div className="hod-stat-label">Average Rating</div>
                <div className="hod-stat-value">{stats.avgRating}</div>
              </div>
              <div className="hod-stat-icon hod-stat-icon-yellow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="19.07" rx="2" stroke="#D08700" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            <div className="hod-stat-card">
              <div>
                <div className="hod-stat-label">Total Reviews</div>
                <div className="hod-stat-value">{stats.totalReviews}</div>
              </div>
              <div className="hod-stat-icon hod-stat-icon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00A63E" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="hod-tabs">
            <button
              className={`hod-tab hod-tab-active`}
              onClick={() => setTab('bookings')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2.67" width="12" height="12" rx="1.33" stroke="currentColor" strokeWidth="1.33"/>
              </svg>
              Bookings
            </button>
            <button
              className={`hod-tab hod-tab-outline`}
              onClick={() => setTab('reviews')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.33" y="1.33" width="13.33" height="12.71" rx="1.33" stroke="#1976D2" strokeWidth="1.33"/>
              </svg>
              Reviews
            </button>
          </div>

          {/* BOOKING LIST */}
          {tab === 'bookings' && (
            <div className="hod-booking-list">
              {bookings.length === 0 ? (
                <p className="hod-empty">No bookings yet</p>
              ) : (
                bookings.map((b, idx) => {
                  const guestName = `${b.firstName || ''} ${b.lastName || ''}`.trim() || 'Guest';
                  const initial = guestName.charAt(0).toUpperCase();
                  const status = b.status || 'confirmed';
                  return (
                    <div
                      key={b.bookingCode || idx}
                      className="hod-booking-card"
                      onClick={() => navigate(`/hotel-owner-booking/${b.bookingCode}`)}
                    >
                      <div className="hod-booking-top">
                        <div className="hod-booking-user">
                          <div className="hod-avatar">{initial}</div>
                          <div>
                            <div className="hod-guest-name">{guestName}</div>
                            <div className="hod-booking-id">Booking ID: {b.bookingCode}</div>
                          </div>
                        </div>
                        <div className="hod-status-badge" style={{ background: statusColors[status] || '#1976D2' }}>
                          <span style={{ color: statusTextColors[status] || 'white' }}>{statusLabels[status] || status.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="hod-booking-details">
                        <div className="hod-bd-item">
                          <span className="hod-bd-label">Room</span>
                          <span className="hod-bd-value">{b.roomType || 'Standard'} - #{b.roomNumber || (idx + 1) * 100 + idx}</span>
                        </div>
                        <div className="hod-bd-item">
                          <span className="hod-bd-label">Check-in</span>
                          <span className="hod-bd-value">{b.checkIn || '-'}</span>
                        </div>
                        <div className="hod-bd-item">
                          <span className="hod-bd-label">Check-out</span>
                          <span className="hod-bd-value">{b.checkOut || '-'}</span>
                        </div>
                        <div className="hod-bd-item">
                          <span className="hod-bd-label">Total</span>
                          <span className="hod-bd-value">${b.total || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* REVIEWS TAB */}
          {tab === 'reviews' && (
            <p className="hod-empty">No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
