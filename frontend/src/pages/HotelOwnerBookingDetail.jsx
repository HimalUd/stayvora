import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOwnerBookings, useConfirmBooking, useCancelBooking } from '../hooks/useBookings';
import { formatLKRFixed } from '../utils/currency';
import './HotelOwnerBookingDetail.css';

const statusColors = {
  pending: '#F59E0B',
  confirmed: '#2563EB',
  cancelled: '#D32F2F',
};

const statusLabels = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  cancelled: 'CANCELLED',
};

const statusTextColors = {
  pending: 'white',
  confirmed: 'white',
  cancelled: 'white',
};

export default function HotelOwnerBookingDetail() {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const { data: bookings = [], isLoading: loading } = useOwnerBookings();
  const confirmMutation = useConfirmBooking();
  const cancelMutation = useCancelBooking();

  const booking = bookings.find(b => b.booking_code === bookingCode) || null;

  if (loading) {
    return (
      <div className="hobd-page">
        <div className="hobd-content">
          <div className="loading-screen"><div className="spinner spinner-lg" /></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="hobd-page">
        <div className="hobd-content">
          <p className="hobd-empty">Booking not found</p>
          <button className="hobd-back-btn" onClick={() => navigate('/hotel-owner-dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = booking.status || 'pending';
  const guestName = booking.guest_name || booking.user_name || 'Guest';
  const initial = guestName.charAt(0).toUpperCase();

  const formatDate = (d) => {
    const date = new Date(d);
    if (isNaN(date)) return d;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const nights = Math.max(Math.round((new Date(booking.check_out) - new Date(booking.check_in)) / 86400000), 1);
  const totalPrice = Number(booking.total_price) || 0;
  const perNight = totalPrice / nights;

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync(booking.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm booking');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(booking.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const canConfirm = currentStatus === 'pending';
  const canCancel = currentStatus !== 'cancelled';

  return (
    <div className="hobd-page">
      <div className="hobd-content">
        <button className="hobd-back-btn" onClick={() => navigate('/hotel-owner-dashboard')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="3.33" y="3.33" width="4.67" height="9.33" rx="1.33" stroke="#2563EB" strokeWidth="1.33"/>
          </svg>
          Back to Dashboard
        </button>

        <div className="hobd-header-card">
          <div>
            <h1 className="hobd-header-title">Booking Details</h1>
            <p className="hobd-header-id">Booking ID: {bookingCode}</p>
          </div>
          <div className="hobd-status-badge" style={{ background: statusColors[currentStatus] }}>
            <span style={{ color: statusTextColors[currentStatus] }}>{statusLabels[currentStatus] || currentStatus.toUpperCase()}</span>
          </div>
        </div>

        <div className="hobd-columns">
          <div className="hobd-card">
            <div className="hobd-card-heading">
              <div className="hobd-card-icon" style={{ background: '#E0E7FF' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="15" width="14" height="6" rx="1" stroke="#2563EB" strokeWidth="2"/>
                  <rect x="8" y="3" width="8" height="8" rx="4" stroke="#2563EB" strokeWidth="2"/>
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
                <span>{booking.guest_email || booking.user_email || '-'}</span>
              </div>
            </div>
            <hr className="hobd-divider" />
            <div className="hobd-info-row">
              <span className="hobd-info-label">Phone Number</span>
              <div className="hobd-info-line">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1.41" y="1.33" width="13.26" height="13.29" rx="2" stroke="#6A7282" strokeWidth="1.33"/>
                </svg>
                <span>{booking.guest_phone || booking.user_phone || '-'}</span>
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

          <div className="hobd-card">
            <div className="hobd-card-heading">
              <div className="hobd-card-icon" style={{ background: '#DBEAFE' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#2563EB" strokeWidth="2"/>
                </svg>
              </div>
              <span className="hobd-card-title">Booking Information</span>
            </div>

            <div className="hobd-info-row">
              <span className="hobd-info-label">Hotel</span>
              <div className="hobd-info-line">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2.67" y="1.33" width="10.67" height="13.33" rx="1.33" stroke="#6A7282" strokeWidth="1.33"/>
                  <rect x="6" y="4.67" width="4" height="4" rx="2" stroke="#6A7282" strokeWidth="1.33"/>
                </svg>
                <span>{booking.hotel_name}</span>
              </div>
            </div>
            <hr className="hobd-divider" />
            <div className="hobd-info-row">
              <span className="hobd-info-label">Room Type</span>
              <span className="hobd-info-value">{booking.room_type}</span>
            </div>
            <hr className="hobd-divider" />
            <div className="hobd-info-row-double">
              <div>
                <span className="hobd-info-label">Check-in</span>
                <span className="hobd-info-value">{formatDate(booking.check_in)}</span>
              </div>
              <div>
                <span className="hobd-info-label">Check-out</span>
                <span className="hobd-info-value">{formatDate(booking.check_out)}</span>
              </div>
            </div>
            <div className="hobd-stay">
              <span className="hobd-stay-days">{nights} night{nights > 1 ? 's' : ''}</span>
              <span className="hobd-stay-sep">·</span>
              <span className="hobd-stay-rate">{formatLKRFixed(perNight)}/night</span>
            </div>
            <hr className="hobd-divider" />
            <div className="hobd-info-row">
              <span className="hobd-info-label">Total Price</span>
              <div className="hobd-info-line">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="4" y="3.33" width="8" height="9.33" rx="1.33" stroke="#00A63E" strokeWidth="1.33"/>
                </svg>
                <span className="hobd-price">{formatLKRFixed(booking.total_price || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hobd-card">
          <div className="hobd-card-heading">
            <div className="hobd-card-icon" style={{ background: '#FEF3C6' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="2" width="16" height="20" rx="2" stroke="#F5A624" strokeWidth="2"/>
                <rect x="14" y="2" width="6" height="6" rx="1" stroke="#F5A624" strokeWidth="2"/>
              </svg>
            </div>
            <span className="hobd-card-title">Special Requests</span>
          </div>
          <p className="hobd-requests-text">{booking.special_requests || 'No special requests'}</p>
        </div>

        <div className="hobd-actions">
          {canConfirm && (
            <button className="hobd-btn hobd-btn-primary" onClick={handleConfirm} disabled={confirmMutation.isPending}>
              {confirmMutation.isPending ? 'Processing...' : 'Confirm Booking'}
            </button>
          )}
          {canCancel && (
            <button className="hobd-btn hobd-btn-danger" onClick={handleCancel} disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? 'Processing...' : 'Cancel Booking'}
            </button>
          )}
          {currentStatus === 'cancelled' && (
            <p className="hobd-cancelled-msg">This booking has been cancelled.</p>
          )}
        </div>
      </div>
    </div>
  );
}
