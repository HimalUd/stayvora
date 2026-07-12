import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HotelOwnerBookingDetail.css';

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

function updateBookingStatus(bookingCode, newStatus) {
  const bookings = JSON.parse(localStorage.getItem('stayvora_bookings') || '[]');
  const idx = bookings.findIndex(b => b.bookingCode === bookingCode);
  if (idx !== -1) {
    bookings[idx].status = newStatus;
    localStorage.setItem('stayvora_bookings', JSON.stringify(bookings));
  }
}

export default function HotelOwnerBookingDetail() {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  const booking = useMemo(() => {
    const bookings = JSON.parse(localStorage.getItem('stayvora_bookings') || '[]');
    return bookings.find(b => b.bookingCode === bookingCode);
  }, [bookingCode, status]);

  if (!booking) {
    return (
      <div className="hobd-page">
        <div className="hobd-content">
          <p className="hobd-empty">Booking not found</p>
          <button className="hobd-back-btn" onClick={() => navigate('/hotel-owner-dashboard')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3.33" y="3.33" width="4.67" height="9.33" rx="1.33" stroke="#1976D2" strokeWidth="1.33"/>
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = booking.status || 'confirmed';
  const guestName = `${booking.firstName || ''} ${booking.lastName || ''}`.trim() || 'Guest';
  const initial = guestName.charAt(0).toUpperCase();

  const handleStatusChange = (newStatus) => {
    updateBookingStatus(bookingCode, newStatus);
    setStatus(newStatus);
  };

  const canCheckIn = currentStatus === 'confirmed';
  const canCheckOut = currentStatus === 'checked_in';
  const canCancel = currentStatus !== 'checked_out' && currentStatus !== 'cancelled';

  return (
    <div className="hobd-page">
      <div className="hobd-content">
        {/* BACK */}
        <button className="hobd-back-btn" onClick={() => navigate('/hotel-owner-dashboard')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="3.33" y="3.33" width="4.67" height="9.33" rx="1.33" stroke="#1976D2" strokeWidth="1.33"/>
          </svg>
          Back to Dashboard
        </button>

        {/* HEADER CARD */}
        <div className="hobd-header-card">
          <div>
            <h1 className="hobd-header-title">Booking Details</h1>
            <p className="hobd-header-id">Booking ID: {bookingCode}</p>
          </div>
          <div className="hobd-status-badge" style={{ background: statusColors[currentStatus] }}>
            <span style={{ color: statusTextColors[currentStatus] }}>{statusLabels[currentStatus] || currentStatus.toUpperCase()}</span>
          </div>
        </div>

        {/* TWO COLUMN */}
        <div className="hobd-columns">
          {/* LEFT: CUSTOMER INFO */}
          <div className="hobd-card">
            <div className="hobd-card-heading">
              <div className="hobd-card-icon" style={{ background: '#E0E7FF' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="15" width="14" height="6" rx="1" stroke="#4F39F6" strokeWidth="2"/>
                  <rect x="8" y="3" width="8" height="8" rx="4" stroke="#4F39F6" strokeWidth="2"/>
                </svg>
              </div>
              <span className="hobd-card-title">Customer Information</span>
            </div>

            <div className="hobd-info-row">
              <span className="hobd-info-label">Full Name</span>
              <div className="hobd-name-row">
                <div className="hobd-avatar">{initial}</div>
                <span className="hobd-info-value">{guestName}</span>
              </div>
            </div>
            <hr className="hobd-divider" />
            <div className="hobd-info-row">
              <span className="hobd-info-label">Email Address</span>
              <div className="hobd-info-line">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1.33" y="2.67" width="13.33" height="10.67" rx="1.33" stroke="#6A7282" strokeWidth="1.33"/>
                  <rect x="1.33" y="4.67" width="13.33" height="4" stroke="#6A7282" strokeWidth="1.33"/>
                </svg>
                <span>{booking.email || '-'}</span>
              </div>
            </div>
            <hr className="hobd-divider" />
            <div className="hobd-info-row">
              <span className="hobd-info-label">Phone Number</span>
              <div className="hobd-info-line">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1.41" y="1.33" width="13.26" height="13.29" rx="2" stroke="#6A7282" strokeWidth="1.33"/>
                </svg>
                <span>{booking.phone || '-'}</span>
              </div>
            </div>
            <hr className="hobd-divider" />
            <div className="hobd-info-row">
              <span className="hobd-info-label">Number of Guests</span>
              <div className="hobd-info-line">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1.33" y="10" width="9.33" height="4" rx="1" stroke="#6A7282" strokeWidth="1.33"/>
                  <rect x="3.33" y="2" width="5.33" height="5.33" rx="2.67" stroke="#6A7282" strokeWidth="1.33"/>
                  <rect x="12.67" y="10.09" width="2" height="3.91" rx="1" stroke="#6A7282" strokeWidth="1.33"/>
                  <rect x="10.67" y="2.09" width="2.01" height="5.17" rx="1" stroke="#6A7282" strokeWidth="1.33"/>
                </svg>
                <span>{booking.guests || 1} Guest{(booking.guests || 1) > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: BOOKING INFO */}
          <div className="hobd-card">
            <div className="hobd-card-heading">
              <div className="hobd-card-icon" style={{ background: '#DBEAFE' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#155DFC" strokeWidth="2"/>
                </svg>
              </div>
              <span className="hobd-card-title">Booking Information</span>
            </div>

            <div className="hobd-info-row">
              <span className="hobd-info-label">Room Type</span>
              <div className="hobd-info-line">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2.67" y="1.33" width="10.67" height="13.33" rx="1.33" stroke="#6A7282" strokeWidth="1.33"/>
                  <rect x="6" y="4.67" width="4" height="4" rx="2" stroke="#6A7282" strokeWidth="1.33"/>
                </svg>
                <span>{booking.roomType || 'Standard'}</span>
              </div>
            </div>
            <hr className="hobd-divider" />
            <div className="hobd-info-row">
              <span className="hobd-info-label">Room Number</span>
              <span className="hobd-info-value">#{(booking.roomNumber || 'N/A')}</span>
            </div>
            <hr className="hobd-divider" />
            <div className="hobd-info-row-double">
              <div>
                <span className="hobd-info-label">Check-in</span>
                <span className="hobd-info-value">{booking.checkIn || '-'}</span>
              </div>
              <div>
                <span className="hobd-info-label">Check-out</span>
                <span className="hobd-info-value">{booking.checkOut || '-'}</span>
              </div>
            </div>
            <hr className="hobd-divider" />
            <div className="hobd-info-row">
              <span className="hobd-info-label">Duration</span>
              <span className="hobd-info-value">{booking.nights || 0} Night{(booking.nights || 0) > 1 ? 's' : ''}</span>
            </div>
            <hr className="hobd-divider" />
            <div className="hobd-info-row">
              <span className="hobd-info-label">Total Price</span>
              <div className="hobd-info-line">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="4" y="3.33" width="8" height="9.33" rx="1.33" stroke="#00A63E" strokeWidth="1.33"/>
                </svg>
                <span className="hobd-price">${booking.total || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SPECIAL REQUESTS */}
        <div className="hobd-card">
          <div className="hobd-card-heading">
            <div className="hobd-card-icon" style={{ background: '#FEF3C6' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="2" width="16" height="20" rx="2" stroke="#E17100" strokeWidth="2"/>
                <rect x="14" y="2" width="6" height="6" rx="1" stroke="#E17100" strokeWidth="2"/>
              </svg>
            </div>
            <span className="hobd-card-title">Special Requests</span>
          </div>
          <p className="hobd-requests-text">{booking.specialRequests || 'No special requests'}</p>
        </div>

        {/* ACTIONS */}
        <div className="hobd-actions">
          {canCheckIn && (
            <button className="hobd-btn hobd-btn-primary" onClick={() => handleStatusChange('checked_in')}>
              Check In
            </button>
          )}
          {canCheckOut && (
            <button className="hobd-btn hobd-btn-primary" onClick={() => handleStatusChange('checked_out')}>
              Check Out
            </button>
          )}
          {canCancel && (
            <button className="hobd-btn hobd-btn-danger" onClick={() => handleStatusChange('cancelled')}>
              Cancel Booking
            </button>
          )}
          {currentStatus === 'checked_out' && (
            <p className="hobd-complete-msg">This booking has been completed.</p>
          )}
          {currentStatus === 'cancelled' && (
            <p className="hobd-cancelled-msg">This booking has been cancelled.</p>
          )}
        </div>
      </div>
    </div>
  );
}
