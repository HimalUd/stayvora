import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI } from '../../utils/api';
import './BookingForm.css';

function getNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

export default function BookingForm({ room, hotelId, onBookingComplete }) {
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const nights = getNights(checkIn, checkOut);
  const totalPrice = nights * (room?.price || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to book.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await bookingsAPI.create({
        room_id: room.id,
        hotel_id: hotelId,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      });
      setSuccess('Booking confirmed!');
      if (onBookingComplete) onBookingComplete();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const maxGuests = room?.capacity || 10;

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h3 className="booking-form-title">Book This Room</h3>

      <div className="booking-form-group">
        <label htmlFor="bf_check_in">Check-in</label>
        <input
          id="bf_check_in"
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          required
        />
      </div>

      <div className="booking-form-group">
        <label htmlFor="bf_check_out">Check-out</label>
        <input
          id="bf_check_out"
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          required
        />
      </div>

      <div className="booking-form-group">
        <label htmlFor="bf_guests">Guests</label>
        <input
          id="bf_guests"
          type="number"
          min={1}
          max={maxGuests}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          required
        />
      </div>

      {nights > 0 && (
        <div className="booking-form-total">
          <span>Total ({nights} night{nights > 1 ? 's' : ''})</span>
          <span className="booking-form-price">${totalPrice.toFixed(2)}</span>
        </div>
      )}

      {error && <p className="booking-form-error">{error}</p>}
      {success && <p className="booking-form-success">{success}</p>}

      <button
        type="submit"
        className="booking-form-btn"
        disabled={loading}
      >
        {loading ? 'Booking...' : 'Confirm Booking'}
      </button>
    </form>
  );
}
