import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

function StatusBadge({ status }) {
  const cls = status === 'confirmed'
    ? 'badge badge-success'
    : status === 'cancelled'
      ? 'badge badge-error'
      : 'badge badge-warning';
  return <span className={cls}>{status}</span>;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await bookingsAPI.listUser();
        setBookings(res.data.bookings || res.data || []);
      } catch (err) {
        setError('Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>My Bookings</h1>
            <p className="dashboard-subtitle">Welcome back, {user?.name || 'Traveler'}</p>
          </div>
          <Link to="/home" className="btn btn-primary">Browse Hotels</Link>
        </div>

        {loading && (
          <div className="loading-screen">
            <div className="spinner spinner-lg" />
            <p>Loading bookings...</p>
          </div>
        )}

        {error && !loading && (
          <div className="empty-state">
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="empty-state">
            <h3>No bookings yet</h3>
            <p>Start exploring hotels and book your first stay!</p>
            <Link to="/home" className="btn btn-primary">Browse Hotels</Link>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Hotel</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Booked On</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td data-label="Hotel">{b.hotel_name || b.hotel?.name}</td>
                    <td data-label="Room">{b.room_type || b.room?.room_type}</td>
                    <td data-label="Check-in">{b.check_in}</td>
                    <td data-label="Check-out">{b.check_out}</td>
                    <td data-label="Total">${b.total_price || b.total}</td>
                    <td data-label="Status"><StatusBadge status={b.status} /></td>
                    <td data-label="Booked On">{b.created_at || b.booking_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
