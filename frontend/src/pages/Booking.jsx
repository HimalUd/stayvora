import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHotel } from '../hooks/useHotels';
import { useRooms } from '../hooks/useRooms';
import { useCreateBooking } from '../hooks/useBookings';
import { useAuth } from '../context/AuthContext';
import { bookingSchema } from '../lib/validations';
import { formatLKR } from '../utils/currency';
import './Booking.css';

function getNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatMoney(n) {
  return formatLKR(n);
}

export default function Booking() {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room');
  const { user } = useAuth();

  const { data: hotel, isLoading: loading, error } = useHotel(hotelId);
  const { data: rooms = [] } = useRooms(hotelId);
  const createBooking = useCreateBooking();

  const [selectedRoomId, setSelectedRoomId] = useState(roomId);
  useEffect(() => {
    if (rooms.length > 0) {
      const target = rooms.find((r) => String(r.id) === String(selectedRoomId));
      setSelectedRoomId(String(target?.id ?? rooms[0].id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms.length]);

  const room = rooms.find((r) => String(r.id) === String(selectedRoomId)) || rooms[0] || null;
  const maxGuests = room?.capacity || 8;

  const toDateInput = (d) => d.toISOString().split('T')[0];

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit: formSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      first_name: user?.first_name || (user?.name || '').split(' ')[0] || '',
      last_name: user?.last_name || (user?.name || '').split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: '',
      check_in: toDateInput(new Date(Date.now() + 86400000)),
      check_out: toDateInput(new Date(Date.now() + 3 * 86400000)),
      guests: 2,
      special_requests: '',
    },
  });

  const checkIn = watch('check_in');
  const checkOut = watch('check_out');
  const guests = watch('guests');

  const nights = getNights(checkIn, checkOut);
  const roomPrice = Number(room?.price) || 0;
  const subtotal = nights * roomPrice;
  const taxes = subtotal * 0.12;
  const total = subtotal + taxes;

  const selectRoom = (r) => {
    setSelectedRoomId(String(r.id));
    setValue('guests', Math.min(Number(guests || 2), r.capacity || 8));
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(confirmCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const onSubmit = async (data) => {
    setSubmitError('');
    try {
      const res = await createBooking.mutateAsync({
        room_id: room.id,
        hotel_id: hotelId,
        check_in: data.check_in,
        check_out: data.check_out,
        guests: data.guests,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        special_requests: data.special_requests,
      });
      setConfirmCode(res?.booking?.booking_code || res?.confirmation_code || `BKDQ${Math.random().toString(36).toUpperCase().slice(2, 10)}`);
      setGuestName(data.first_name);
      setShowConfirm(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Booking failed. Please ensure you are logged in and try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <p>Loading booking information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <h3>Something went wrong</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!hotel || !room) {
    return (
      <div className="empty-state">
        <h3>Booking unavailable</h3>
        <p>The hotel or room you selected could not be found.</p>
        <Link to="/home" className="btn btn-primary">Browse Hotels</Link>
      </div>
    );
  }

  return (
    <div className="bk-page">
      <div className="bk-container">
        <Link to={`/hotel/${hotelId}`} className="bk-back-link">← Back to hotel</Link>

        <div className="bk-head">
          <span className="bk-eyebrow">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1.33" y="7.33" width="13.33" height="7.33" rx="1.33" stroke="#2563EB" strokeWidth="1.33"/>
              <path d="M4.67 7.33V5.33a3.33 3.33 0 0 1 6.66 0v2" stroke="#2563EB" strokeWidth="1.33" strokeLinecap="round"/>
            </svg>
            Secure Checkout
          </span>
          <h1 className="bk-heading">Complete Your Booking</h1>
          <p className="bk-subtitle">{hotel.name} · {hotel.location}</p>
        </div>

        <div className="bk-layout">

          {/* ===== LEFT - FORM ===== */}
          <div className="bk-main">
            <div className="bk-card">
              <div className="bk-card-header">
                <span className="bk-step">1</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#0A1B33"/>
                </svg>
                <span>Guest Information</span>
              </div>
              <form onSubmit={formSubmit(onSubmit)}>
                <div className="bk-form-grid">
                  <div className="bk-field">
                    <label>First Name</label>
                    <input type="text" {...register('first_name')} placeholder="First Name" />
                    {errors.first_name && <span className="bk-field-error">{errors.first_name.message}</span>}
                  </div>
                  <div className="bk-field">
                    <label>Last Name</label>
                    <input type="text" {...register('last_name')} placeholder="Last Name" />
                    {errors.last_name && <span className="bk-field-error">{errors.last_name.message}</span>}
                  </div>
                  <div className="bk-field">
                    <label>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="1.33" y="2.67" width="13.33" height="10.67" rx="1.33" stroke="#64748B" strokeWidth="1.33"/>
                        <path d="M1.33 4l6.67 4.67L14.67 4" stroke="#64748B" strokeWidth="1.33"/>
                      </svg>
                      Email
                    </label>
                    <input type="email" {...register('email')} placeholder="Email" />
                    {errors.email && <span className="bk-field-error">{errors.email.message}</span>}
                  </div>
                  <div className="bk-field">
                    <label>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="1.41" y="1.33" width="13.26" height="13.29" rx="2" stroke="#64748B" strokeWidth="1.33"/>
                      </svg>
                      Phone
                    </label>
                    <input type="tel" {...register('phone')} placeholder="Phone (optional)" />
                  </div>
                </div>

                <div className="bk-card bk-card-sm">
                  <div className="bk-card-header">
                    <span className="bk-step">2</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#0A1B33" strokeWidth="1.5"/>
                      <rect x="6" y="2" width="4" height="4" rx="1" stroke="#0A1B33" strokeWidth="1.5"/>
                      <rect x="14" y="2" width="4" height="4" rx="1" stroke="#0A1B33" strokeWidth="1.5"/>
                    </svg>
                    <span>Booking Details</span>
                  </div>

                  <div className="bk-room-list">
                    {rooms.map((r) => {
                      const active = String(r.id) === String(selectedRoomId);
                      return (
                        <button
                          key={r.id}
                          type="button"
                          className={`bk-room-card ${active ? 'bk-room-card-active' : ''}`}
                          onClick={() => selectRoom(r)}
                        >
                          <span className={`bk-radio ${active ? 'bk-radio-on' : ''}`}>
                            {active && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>}
                          </span>
                          <span className="bk-room-info">
                            <span className="bk-room-name">{r.room_type}</span>
                            {r.capacity && <span className="bk-room-cap">Sleeps up to {r.capacity} guests</span>}
                          </span>
                          <span className="bk-room-price">{formatMoney(r.price)}<em>/night</em></span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="bk-form-grid bk-dates-grid">
                    <div className="bk-field">
                      <label>Check-in</label>
                      <input type="date" {...register('check_in')} min={toDateInput(new Date())} />
                      {errors.check_in && <span className="bk-field-error">{errors.check_in.message}</span>}
                    </div>
                    <div className="bk-field">
                      <label>Check-out</label>
                      <input type="date" {...register('check_out')} min={checkIn || toDateInput(new Date())} />
                      {errors.check_out && <span className="bk-field-error">{errors.check_out.message}</span>}
                    </div>
                    <div className="bk-field">
                      <label>Guests</label>
                      <select {...register('guests', { valueAsNumber: true })}>
                        {Array.from({ length: maxGuests }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bk-card bk-card-sm">
                  <div className="bk-card-header">
                    <span className="bk-step">3</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#0A1B33" strokeWidth="1.5"/>
                      <path d="M2 10h20" stroke="#0A1B33" strokeWidth="1.5"/>
                    </svg>
                    <span>Special Requests</span>
                  </div>
                  <textarea className="bk-textarea" {...register('special_requests')} placeholder="Any special requests or requirements? (optional)" rows={4} />
                </div>

                {submitError && <p className="bk-error">{submitError}</p>}
                <button type="submit" className="bk-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Booking...' : `Complete Booking — ${formatMoney(total)}`}
                </button>
              </form>
            </div>
          </div>

          {/* ===== RIGHT - SUMMARY ===== */}
          <div className="bk-sidebar">
            <div className="bk-summary-card">
              <div className="bk-summary-thumb">
                {hotel.image ? (
                  <img src={hotel.image} alt={hotel.name} />
                ) : (
                  <div className="bk-summary-thumb-ph">{hotel.name.charAt(0)}</div>
                )}
                <span className="bk-summary-rating">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.77l-5.2 2.73.99-5.8-4.21-4.1 5.82-.85z"/>
                  </svg>
                  {hotel.rating || '4.5'}
                </span>
              </div>
              <div className="bk-summary-header">Booking Summary</div>
              <div className="bk-summary-body">
                <div className="bk-summary-hotel">
                  <div className="bk-summary-hotel-name">{hotel.name}</div>
                  <div className="bk-summary-hotel-location">{hotel.location}</div>
                </div>
                <div className="bk-summary-divider" />
                <div className="bk-summary-hotel">
                  <div className="bk-summary-room-type">{room.room_type}</div>
                </div>
                <div className="bk-summary-divider" />
                <div className="bk-summary-detail">
                  <span>Check-in</span>
                  <span>{formatDate(checkIn) || 'Select'}</span>
                </div>
                <div className="bk-summary-detail">
                  <span>Check-out</span>
                  <span>{formatDate(checkOut) || 'Select'}</span>
                </div>
                <div className="bk-summary-detail">
                  <span>Guests</span>
                  <span>{guests}</span>
                </div>
                <div className="bk-summary-detail">
                  <span>Nights</span>
                  <span>{nights}</span>
                </div>
                <div className="bk-summary-divider" />
                <div className="bk-summary-detail">
                  <span>{formatMoney(roomPrice)} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="bk-summary-detail">
                  <span>Taxes & fees</span>
                  <span>{formatMoney(taxes)}</span>
                </div>
                <div className="bk-summary-divider" />
                <div className="bk-summary-total">
                  <span>Total</span>
                  <span className="bk-total-amount">{formatMoney(total)}</span>
                </div>

                <div className="bk-trust">
                  <span className="bk-trust-item">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill="#10B981"/>
                      <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Free cancellation
                  </span>
                  <span className="bk-trust-item">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill="#10B981"/>
                      <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    No booking fees
                  </span>
                  <span className="bk-trust-item">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill="#10B981"/>
                      <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Secure checkout
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONFIRMATION OVERLAY ===== */}
      <div className={`bkc-overlay ${showConfirm ? 'bkc-active' : ''}`} onClick={() => setShowConfirm(false)}>
        <div className={`bkc-modal ${showConfirm ? 'bkc-modal-open' : ''}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Booking confirmation">
          <button type="button" className="bkc-close" onClick={() => setShowConfirm(false)} aria-label="Close confirmation">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="bkc-hero">
            <div className="bkc-check-wrap">
              <span className="bkc-ring bkc-ring-1" />
              <span className="bkc-ring bkc-ring-2" />
              <svg className="bkc-check" width="72" height="72" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="33" fill="#10B981" className="bkc-check-circle" />
                <path d="M26.67 40l10 10 16.66-16.67" stroke="#fff" strokeWidth="6.67" strokeLinecap="round" className="bkc-check-path" />
              </svg>
            </div>
            <h2 className="bkc-heading">Booking Confirmed!</h2>
            <p className="bkc-subtitle">
              Thank you, <span className="bkc-guest-name">{guestName || 'Guest'}</span>!
            </p>
            <p className="bkc-subtitle bkc-subtitle-2">Your reservation has been confirmed</p>
          </div>

          <div className="bkc-body">
            <div className="bkc-code-box">
              <div className="bkc-code-label">Confirmation Number</div>
              <div className="bkc-code-row">
                <div className="bkc-code-value">{confirmCode}</div>
                <button type="button" className="bkc-copy-btn" onClick={copyCode} aria-label="Copy confirmation number">
                  {copied ? 'Copied!' : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="5.33" y="5.33" width="9.34" height="9.33" rx="1.33" stroke="currentColor" strokeWidth="1.33"/>
                      <path d="M10.67 5.33V3.33a1.33 1.33 0 0 0-1.34-1.33H3.33A1.33 1.33 0 0 0 2 3.33v6a1.33 1.33 0 0 0 1.33 1.34h2" stroke="currentColor" strokeWidth="1.33"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="bkc-hotel-card">
              {hotel.image ? (
                <img className="bkc-hotel-img" src={hotel.image} alt={hotel.name} />
              ) : (
                <div className="bkc-hotel-img bkc-hotel-img-ph">{hotel.name.charAt(0)}</div>
              )}
              <div className="bkc-hotel-info">
                <div className="bkc-hotel-name">{hotel.name}</div>
                <div className="bkc-hotel-loc">{hotel.location}</div>
                <div className="bkc-hotel-room">{room.room_type}</div>
              </div>
              <span className="bkc-hotel-rating">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.77l-5.2 2.73.99-5.8-4.21-4.1 5.82-.85z"/>
                </svg>
                {hotel.rating || '4.5'}
              </span>
            </div>

            <div className="bkc-grid">
              <div className="bkc-cell">
                <span className="bkc-cell-label">Check-in</span>
                <span className="bkc-cell-value">{formatDate(checkIn)}</span>
              </div>
              <div className="bkc-cell">
                <span className="bkc-cell-label">Check-out</span>
                <span className="bkc-cell-value">{formatDate(checkOut)}</span>
              </div>
              <div className="bkc-cell">
                <span className="bkc-cell-label">Guests</span>
                <span className="bkc-cell-value">{guests} {guests > 1 ? 'guests' : 'guest'}</span>
              </div>
              <div className="bkc-cell">
                <span className="bkc-cell-label">Nights</span>
                <span className="bkc-cell-value">{nights} {nights === 1 ? 'night' : 'nights'}</span>
              </div>
            </div>

            <div className="bkc-price">
              <div className="bkc-row">
                <span className="bkc-row-label">{formatMoney(roomPrice)} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                <span className="bkc-row-value">{formatMoney(subtotal)}</span>
              </div>
              <div className="bkc-row">
                <span className="bkc-row-label">Taxes & fees</span>
                <span className="bkc-row-value">{formatMoney(taxes)}</span>
              </div>
              <div className="bkc-row bkc-row-total">
                <span className="bkc-row-label">Total Amount</span>
                <span className="bkc-total-value">{formatMoney(total)}</span>
              </div>
            </div>

            <div className="bkc-note">
              A confirmation email has been sent to your registered email address with all the booking details and check-in instructions.
            </div>

            <div className="bkc-actions">
              <Link to="/my-bookings" className="bkc-btn bkc-btn-primary" onClick={() => setShowConfirm(false)}>View My Bookings</Link>
              <Link to="/home" className="bkc-btn bkc-btn-outline" onClick={() => setShowConfirm(false)}>Book Another Hotel</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
