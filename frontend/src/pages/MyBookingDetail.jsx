import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserBookings, useCancelBookingByUser } from '../hooks/useBookings';
import { useBookingReview, useHotelReviews, useSubmitReview } from '../hooks/useReviews';
import StarRating from '../components/StarRating/StarRating';
import { formatLKRFixed } from '../utils/currency';
import './MyBookingDetail.css';

const statusLabels = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  cancelled: 'CANCELLED',
};

const formatDate = (d) => {
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function ReviewList({ reviews, average }) {
  if (!reviews || reviews.length === 0) {
    return <p className="mbd-no-reviews">No reviews yet for this hotel. Be the first!</p>;
  }
  return (
    <div className="mbd-reviews-list">
      <div className="mbd-reviews-summary">
        <span className="mbd-reviews-avg">{average.toFixed(1)}</span>
        <div className="mbd-reviews-stars">
          <StarRating value={Math.round(average)} size={20} />
          <span className="mbd-reviews-count">{reviews.length} review{reviews.length > 1 ? 's' : ''}</span>
        </div>
      </div>
      {reviews.map(r => (
        <div key={r.id} className="mbd-review-item">
          <div className="mbd-review-head">
            <div className="mbd-review-avatar">{r.user_name?.charAt(0).toUpperCase() || 'U'}</div>
            <div className="mbd-review-meta">
              <span className="mbd-review-name">{r.user_name}</span>
              <span className="mbd-review-date">{formatDate(r.created_at)}</span>
            </div>
            <StarRating value={Math.round(Number(r.rating))} size={16} />
          </div>
          {r.title && <p className="mbd-review-title">{r.title}</p>}
          {r.comment && <p className="mbd-review-comment">{r.comment}</p>}
        </div>
      ))}
    </div>
  );
}

export default function MyBookingDetail() {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const { data: bookings = [], isLoading: loading } = useUserBookings();

  const booking = bookings.find(b => b.booking_code === bookingCode) || null;

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const { data: myReview, isLoading: reviewLoading } = useBookingReview(booking?.id);
  const { data: hotelReviews, isLoading: hotelReviewsLoading } = useHotelReviews(booking?.hotel_id);
  const submitReview = useSubmitReview();
  const cancelBooking = useCancelBookingByUser();
  const [cancelError, setCancelError] = useState('');
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (myReview) {
      setRating(Math.round(Number(myReview.rating)));
      setTitle(myReview.title || '');
      setComment(myReview.comment || '');
    }
  }, [myReview]);

  if (loading) {
    return (
      <div className="mbd-page">
        <div className="mbd-content">
          <div className="loading-screen"><div className="spinner spinner-lg" /></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mbd-page">
        <div className="mbd-content">
          <p className="mbd-empty">Booking not found</p>
          <button className="mbd-back-btn" onClick={() => navigate('/my-bookings')}>Back to My Bookings</button>
        </div>
      </div>
    );
  }

  const currentStatus = booking.status || 'pending';
  const nights = Math.max(Math.round((new Date(booking.check_out) - new Date(booking.check_in)) / 86400000), 1);
  const totalPrice = Number(booking.total_price) || 0;
  const perNight = totalPrice / nights;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!rating) {
      setFormError('Please select a star rating');
      return;
    }
    if (!comment.trim()) {
      setFormError('Please write a review comment');
      return;
    }
    try {
      const res = await submitReview.mutateAsync({
        hotel_id: booking.hotel_id,
        booking_id: booking.id,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });
      setFormSuccess(res.message === 'Review updated successfully' ? 'Review updated successfully' : 'Review submitted successfully');
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to submit review');
    }
  };

  const canReview = currentStatus === 'confirmed';

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    setCancelError('');
    try {
      await cancelBooking.mutateAsync(booking.id);
      setCancelled(true);
    } catch (err) {
      setCancelError(err?.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const currentBooking = cancelled ? { ...booking, status: 'cancelled' } : booking;
  const bookingStatus = currentBooking.status || 'pending';
  const canCancel = bookingStatus === 'pending';
  const showCancelled = bookingStatus === 'cancelled' && currentStatus !== 'cancelled';

  return (
    <div className="mbd-page">
      <div className="mbd-content">
        <button className="mbd-back-btn" onClick={() => navigate('/my-bookings')}>
          ← Back to My Bookings
        </button>

        <div className="mbd-header">
          <div>
            
            <h1 className="mbd-header-title">Booking Details</h1>
            <p className="mbd-header-id">Booking ID: {bookingCode}</p>
          </div>
          <div className={`mbd-status-badge mbd-status-${bookingStatus}`}>
            {statusLabels[bookingStatus] || bookingStatus.toUpperCase()}
          </div>
        </div>

        {cancelError && <p className="mbd-cancel-error">{cancelError}</p>}
        {showCancelled && <p className="mbd-cancel-success">This booking has been cancelled.</p>}

        {canCancel && (
          <div className="mbd-cancel-action">
            <button
              className="mbd-btn mbd-btn-danger"
              onClick={handleCancel}
              disabled={cancelBooking.isPending}
            >
              {cancelBooking.isPending ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          </div>
        )}

        <div className="mbd-columns">
          <div className="mbd-card">
            <div className="mbd-card-heading">
              <div className="mbd-card-icon" style={{ background: '#DBEAFE' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#155DFC" strokeWidth="2"/>
                </svg>
              </div>
              <span className="mbd-card-title">Stay Details</span>
            </div>
            {booking.hotel_image && (
              <img src={booking.hotel_image} alt={booking.hotel_name} className="mbd-hotel-img" />
            )}
            <div className="mbd-info-row">
              <span className="mbd-info-label">Hotel</span>
              <span className="mbd-info-value">{booking.hotel_name}</span>
            </div>
            <div className="mbd-info-row">
              <span className="mbd-info-label">Location</span>
              <span className="mbd-info-value">{booking.hotel_location || '-'}</span>
            </div>
            <div className="mbd-info-row">
              <span className="mbd-info-label">Room Type</span>
              <span className="mbd-info-value">{booking.room_type}</span>
            </div>
            <hr className="mbd-divider" />
            <div className="mbd-info-row-double">
              <div>
                <span className="mbd-info-label">Check-in</span>
                <span className="mbd-info-value">{formatDate(booking.check_in)}</span>
              </div>
              <div>
                <span className="mbd-info-label">Check-out</span>
                <span className="mbd-info-value">{formatDate(booking.check_out)}</span>
              </div>
            </div>
            <div className="mbd-stay">
              <span className="mbd-stay-days">{nights} night{nights > 1 ? 's' : ''}</span>
              <span className="mbd-stay-sep">·</span>
              <span className="mbd-stay-rate">{formatLKRFixed(perNight)}/night</span>
            </div>
            <hr className="mbd-divider" />
            <div className="mbd-info-row">
              <span className="mbd-info-label">Guests</span>
              <span className="mbd-info-value">{booking.guests || 1} Guest{(booking.guests || 1) > 1 ? 's' : ''}</span>
            </div>
            <div className="mbd-info-row">
              <span className="mbd-info-label">Total Price</span>
              <span className="mbd-price">{formatLKRFixed(totalPrice)}</span>
            </div>
          </div>

          <div className="mbd-card">
            <div className="mbd-card-heading">
              <div className="mbd-card-icon" style={{ background: '#FEF3C6' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="2" width="16" height="20" rx="2" stroke="#E17100" strokeWidth="2"/>
                  <rect x="14" y="2" width="6" height="6" rx="1" stroke="#E17100" strokeWidth="2"/>
                </svg>
              </div>
              <span className="mbd-card-title">Special Requests</span>
            </div>
            <p className="mbd-requests-text">{booking.special_requests || 'No special requests'}</p>

            <hr className="mbd-divider" />

            <div className="mbd-review-heading">Rate your stay</div>

            {!canReview ? (
              <p className="mbd-review-hint">
                {currentStatus === 'cancelled'
                  ? 'This booking was cancelled, so you cannot review this stay.'
                  : 'You can review this hotel after the owner confirms your booking.'}
              </p>
            ) : (
              <form className="mbd-review-form" onSubmit={handleSubmit}>
                {myReview && <p className="mbd-review-exists">You already reviewed this stay. You can update your review below.</p>}
                <div className="mbd-form-field">
                  <label className="mbd-form-label">Your rating *</label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div className="mbd-form-field">
                  <label className="mbd-form-label">Title (optional)</label>
                  <input
                    className="mbd-input"
                    type="text"
                    placeholder="e.g. Great stay, wonderful staff"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div className="mbd-form-field">
                  <label className="mbd-form-label">Your review *</label>
                  <textarea
                    className="mbd-textarea"
                    rows="4"
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>
                {formError && <p className="mbd-form-error">{formError}</p>}
                {formSuccess && <p className="mbd-form-success">{formSuccess}</p>}
                <button
                  type="submit"
                  className="mbd-submit-btn"
                  disabled={submitReview.isPending || reviewLoading}
                >
                  {submitReview.isPending ? 'Submitting...' : (myReview ? 'Update Review' : 'Submit Review')}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mbd-card">
          <div className="mbd-card-heading">
            <div className="mbd-card-icon" style={{ background: '#E0E7FF' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L12 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L12 2z" stroke="#4F39F6" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="mbd-card-title">Guest Reviews</span>
          </div>
          {hotelReviewsLoading ? (
            <div className="loading-screen"><div className="spinner" /></div>
          ) : (
            <ReviewList reviews={hotelReviews?.reviews} average={hotelReviews?.summary?.average || 0} />
          )}
        </div>
      </div>
    </div>
  );
}