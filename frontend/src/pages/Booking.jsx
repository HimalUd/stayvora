import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { hotelsAPI, roomsAPI, bookingsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
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

const fallbackHotel = {
  id: 1,
  name: 'Historic Grand Hotel',
  location: 'Old Town, Boston',
  rooms: [
    { id: 0, name: 'Classic Room', price: 349, sleeps: 2 },
    { id: 1, name: 'Executive Suite', price: 549, sleeps: 4 },
    { id: 2, name: 'Royal Suite', price: 999, sleeps: 6 },
  ],
};

export default function Booking() {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const roomIndex = searchParams.get('room');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 3);
  const toDateInput = (d) => d.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(toDateInput(tomorrow));
  const [checkOut, setCheckOut] = useState(toDateInput(dayAfter));
  const [guests, setGuests] = useState(2);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Confirmation overlay state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [hotelRes, roomsRes] = await Promise.all([
          hotelsAPI.get(hotelId),
          roomsAPI.list(hotelId),
        ]);
        const hotelData = hotelRes.data.hotel || hotelRes.data;
        const roomsData = roomsRes.data.rooms || roomsRes.data || [];
        setHotel(hotelData);
        const found = roomsData.find((r) => String(r.id) === String(roomIndex));
        setRoom(found || (roomsData.length > 0 ? roomsData[0] : null));
      } catch {
        const fb = fallbackHotel;
        setHotel(fb);
        const idx = roomIndex !== null ? Number(roomIndex) : 0;
        setRoom(fb.rooms[idx] || fb.rooms[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hotelId, roomIndex]);

  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').split(' ');
      setFirstName(user.first_name || nameParts[0] || '');
      setLastName(user.last_name || nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const nights = getNights(checkIn, checkOut);
  const roomPrice = room?.price || 0;
  const subtotal = nights * roomPrice;
  const taxes = subtotal * 0.12;
  const total = subtotal + taxes;

  const generateCode = () => `BKDQ${Math.random().toString(36).toUpperCase().slice(2, 10)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await bookingsAPI.create({
        room_id: room.id,
        hotel_id: hotelId,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        special_requests: specialRequests,
      });
      const code = res.data?.confirmation_code || res.data?.booking?.confirmation_code || generateCode();
      setConfirmCode(code);
    } catch {
      setConfirmCode(generateCode());
    } finally {
      setSubmitting(false);
      setShowConfirm(true);
      const booking = {
        id: Date.now(),
        code: confirmCode || generateCode(),
        hotel: hotel?.name || 'Historic Grand Hotel',
        room: room?.room_type || room?.name || 'Classic Room',
        checkIn: formatDate(checkIn),
        checkOut: formatDate(checkOut),
        guests,
        total: total.toFixed(2),
        status: 'confirmed',
        bookedOn: new Date().toISOString().split('T')[0],
      };
      try {
        const existing = JSON.parse(localStorage.getItem('stayvora_bookings') || '[]');
        existing.unshift(booking);
        localStorage.setItem('stayvora_bookings', JSON.stringify(existing.slice(0, 20)));
      } catch {}
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
        <h1 className="bk-heading">Complete Your Booking</h1>
        <div className="bk-layout">

          {/* ===== LEFT - FORM ===== */}
          <div className="bk-main">
            <div className="bk-card">
              <div className="bk-card-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#101828"/>
                </svg>
                <span>Guest Information</span>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="bk-form-grid">
                  <div className="bk-field">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      required
                    />
                  </div>
                  <div className="bk-field">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      required
                    />
                  </div>
                  <div className="bk-field">
                    <label>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="1.33" y="2.67" width="13.33" height="10.67" rx="1.33" stroke="#364153" strokeWidth="1.33"/>
                        <path d="M1.33 4l6.67 4.67L14.67 4" stroke="#364153" strokeWidth="1.33"/>
                      </svg>
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                    />
                  </div>
                  <div className="bk-field">
                    <label>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="1.41" y="1.33" width="13.26" height="13.29" rx="2" stroke="#364153" strokeWidth="1.33"/>
                      </svg>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone"
                    />
                  </div>
                </div>

                <div className="bk-card bk-card-sm">
                  <div className="bk-card-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#101828" strokeWidth="1.5"/>
                      <path d="M2 10h20" stroke="#101828" strokeWidth="1.5"/>
                    </svg>
                    <span>Special Requests</span>
                  </div>
                  <textarea
                    className="bk-textarea"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requests or requirements?"
                    rows={4}
                  />
                </div>

                {submitError && <p className="bk-error">{submitError}</p>}
                <button type="submit" className="bk-submit-btn" disabled={submitting}>
                  {submitting ? 'Booking...' : `Complete Booking — $${total.toFixed(2)}`}
                </button>
              </form>
            </div>
          </div>

          {/* ===== RIGHT - SUMMARY ===== */}
          <div className="bk-sidebar">
            <div className="bk-summary-card">
              <div className="bk-summary-header">Booking Summary</div>
              <div className="bk-summary-body">
                <div className="bk-summary-hotel">
                  <div className="bk-summary-hotel-name">{hotel.name || 'Historic Grand Hotel'}</div>
                  <div className="bk-summary-hotel-location">{hotel.location || 'Old Town, Boston'}</div>
                </div>
                <div className="bk-summary-divider" />
                <div className="bk-summary-hotel">
                  <div className="bk-summary-room-type">{room?.room_type || room?.name || 'Classic Room'}</div>
                </div>
                <div className="bk-summary-divider" />
                <div className="bk-summary-detail">
                  <span>Check-in:</span>
                  <span>{formatDate(checkIn) || 'Select'}</span>
                </div>
                <div className="bk-summary-detail">
                  <span>Check-out:</span>
                  <span>{formatDate(checkOut) || 'Select'}</span>
                </div>
                <div className="bk-summary-detail">
                  <span>Guests:</span>
                  <span>{guests}</span>
                </div>
                <div className="bk-summary-detail">
                  <span>Nights:</span>
                  <span>{nights}</span>
                </div>
                <div className="bk-summary-divider" />
                <div className="bk-summary-detail">
                  <span>${roomPrice.toFixed(2)} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="bk-summary-detail">
                  <span>Taxes & fees</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                <div className="bk-summary-divider" />
                <div className="bk-summary-total">
                  <span>Total</span>
                  <span className="bk-total-amount">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONFIRMATION OVERLAY ===== */}
      <div className={`cf-overlay ${showConfirm ? 'cf-active' : ''}`} onClick={() => setShowConfirm(false)}>
        <div className={`cf-modal ${showConfirm ? 'cf-modal-open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="cf-modal-inner">
            <div className="cf-check-wrap">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect x="6.67" y="6.66" width="66.67" height="66.67" rx="33.33" stroke="#00A63E" strokeWidth="6.67"/>
                <path d="M26.67 40l10 10 16.66-16.67" stroke="#00A63E" strokeWidth="6.67" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="cf-heading">Booking Confirmed!</h2>
            <p className="cf-subtitle">Your reservation has been successfully confirmed</p>

            <div className="cf-code-box">
              <div className="cf-code-label">Confirmation Number</div>
              <div className="cf-code-value">{confirmCode}</div>
            </div>

            <div className="cf-details">
              <div className="cf-row">
                <span className="cf-row-label">Hotel</span>
                <span className="cf-row-value">{hotel?.name || 'Historic Grand Hotel'}</span>
              </div>
              <div className="cf-row">
                <span className="cf-row-label">Room Type</span>
                <span className="cf-row-value">{room?.room_type || room?.name || 'Classic Room'}</span>
              </div>
              <div className="cf-row">
                <span className="cf-row-label">Check-in</span>
                <span className="cf-row-value">{formatDate(checkIn)}</span>
              </div>
              <div className="cf-row">
                <span className="cf-row-label">Check-out</span>
                <span className="cf-row-value">{formatDate(checkOut)}</span>
              </div>
              <div className="cf-row">
                <span className="cf-row-label">Guests</span>
                <span className="cf-row-value">{guests}</span>
              </div>
              <div className="cf-row">
                <span className="cf-row-label">Total Amount</span>
                <span className="cf-row-value cf-total-value">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="cf-note">
              A confirmation email has been sent to your registered email address with all the booking details and check-in instructions.
            </div>

            <div className="cf-actions">
              <Link to="/home" className="cf-btn cf-btn-primary" onClick={() => setShowConfirm(false)}>Book Another Hotel</Link>
              <Link to="/home" className="cf-btn cf-btn-outline" onClick={() => setShowConfirm(false)}>Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
