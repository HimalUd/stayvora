import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hotelsAPI } from '../utils/api';
import { Link } from 'react-router-dom';
import './SearchResults.css';

const travelPurposes = ['Business', 'Family', 'Couple', 'Honeymoon', 'Solo Travel', 'Friends Trip'];
const eventFilters = ['Day Events', 'Night Events', 'Pool Parties', 'Live Music', 'Conferences', 'Wedding Events'];

const sampleHotels = [
  { id: 1, name: 'Seaside Resort', location: 'Beachfront, Miami', desc: 'Beachfront paradise with direct ocean access and tropical vibes.', price: 249, rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=352&h=256&fit=crop', tags: ['Beach Access', 'Pool', 'Bar'] },
  { id: 2, name: 'Miami Resort', location: 'Beachfront, Miami', desc: 'Beachfront paradise with direct ocean access and tropical vibes.', price: 249, rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=352&h=256&fit=crop', tags: ['Beach Access', 'Pool', 'Bar'] },
  { id: 3, name: 'Jungle villa', location: 'Beachfront, Miami', desc: 'Beachfront paradise with direct ocean access and tropical vibes.', price: 249, rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1572307480816-4ae3267c8c0f?w=352&h=256&fit=crop', tags: ['Beach Access', 'Pool', 'Bar'] },
  { id: 4, name: 'Seaside Resort', location: 'Beachfront, Miami', desc: 'Beachfront paradise with direct ocean access and tropical vibes.', price: 249, rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=352&h=256&fit=crop', tags: ['Beach Access', 'Pool', 'Bar'] },
  { id: 5, name: 'Seaside Resort', location: 'Beachfront, Miami', desc: 'Beachfront paradise with direct ocean access and tropical vibes.', price: 249, rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=352&h=256&fit=crop', tags: ['Beach Access', 'Pool', 'Bar'] },
  { id: 6, name: 'Seaside Resort', location: 'Beachfront, Miami', desc: 'Beachfront paradise with direct ocean access and tropical vibes.', price: 249, rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=352&h=256&fit=crop', tags: ['Beach Access', 'Pool', 'Bar'] },
  { id: 7, name: 'Seaside Resort', location: 'Beachfront, Miami', desc: 'Beachfront paradise with direct ocean access and tropical vibes.', price: 249, rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=352&h=256&fit=crop', tags: ['Beach Access', 'Pool', 'Bar'] },
  { id: 8, name: 'Seaside Resort', location: 'Beachfront, Miami', desc: 'Beachfront paradise with direct ocean access and tropical vibes.', price: 249, rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=352&h=256&fit=crop', tags: ['Beach Access', 'Pool', 'Bar'] },
  { id: 9, name: 'Seaside Resort', location: 'Beachfront, Miami', desc: 'Beachfront paradise with direct ocean access and tropical vibes.', price: 249, rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1572307480816-4ae3267c8c0f?w=352&h=256&fit=crop', tags: ['Beach Access', 'Pool', 'Bar'] },
];

function HotelCard({ hotel }) {
  return (
    <div className="sr-hotel-card">
      <div className="sr-hotel-card-image">
        <img src={hotel.image} alt={hotel.name} />
        <div className="sr-rating-badge">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="white">
            <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L10 1z" />
          </svg>
          <span>{hotel.rating}</span>
        </div>
        <div className="sr-card-location">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.33">
            <path d="M8 1.33c-2.21 0-4 1.79-4 4 0 3 4 7.34 4 7.34s4-4.34 4-7.34c0-2.21-1.79-4-4-4z" />
            <circle cx="8" cy="5.33" r="1.33" fill="white" />
          </svg>
          <span>{hotel.location}</span>
        </div>
      </div>
      <div className="sr-hotel-card-body">
        <h3 className="sr-hotel-name">{hotel.name}</h3>
        <p className="sr-hotel-desc">{hotel.desc}</p>
        <div className="sr-hotel-tags">
          {hotel.tags.map(tag => (
            <span key={tag} className="sr-tag">{tag}</span>
          ))}
          <span className="sr-tag sr-tag-more">+2 more</span>
        </div>
        <div className="sr-hotel-divider" />
        <div className="sr-hotel-footer">
          <span className="sr-reviews">{hotel.reviews} reviews</span>
          <div className="sr-price">
            <span className="sr-price-from">From</span>
            <span className="sr-price-amount">${hotel.price}<span className="sr-price-night">/night</span></span>
          </div>
        </div>
        <Link to={`/hotel/${hotel.id}`} className="sr-view-btn">View Details</Link>
      </div>
    </div>
  );
}

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2);
  const [rooms, setRooms] = useState(Number(searchParams.get('rooms')) || 1);
  const [selectedRating, setSelectedRating] = useState(searchParams.get('rating') ? Number(searchParams.get('rating')) : null);
  const [selectedPurpose, setSelectedPurpose] = useState(searchParams.get('purpose') || searchParams.get('purpose_below') || null);
  const [selectedEvent, setSelectedEvent] = useState(searchParams.get('event') || searchParams.get('event_below') || null);

  useEffect(() => {
    const params = {};
    if (location) params.search = location;
    if (selectedRating) params.rating = selectedRating;
    if (selectedPurpose) params.travel_purpose = selectedPurpose;
    if (selectedEvent) params.event = selectedEvent;
    if (checkIn && checkOut) { params.check_in = checkIn; params.check_out = checkOut; }

    setLoading(true);
    hotelsAPI.search(params)
      .then(res => setHotels(res.data.hotels || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [location, checkIn, checkOut, selectedRating, selectedPurpose, selectedEvent]);

  const displayHotels = hotels.length > 0 ? hotels : sampleHotels;

  const handleSidebarSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    if (rooms) params.set('rooms', rooms);
    if (selectedRating) params.set('rating', selectedRating);
    if (selectedPurpose) params.set('purpose', selectedPurpose);
    if (selectedEvent) params.set('event', selectedEvent);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="sr-page">
      <div className="sr-layout">
        {/* ===== SIDEBAR FILTERS ===== */}
        <aside className="sr-sidebar">
          <div className="sr-filter-form">
            {/* Where to go */}
            <div className="sr-input-wrap">
              <div className="sr-input-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="9.38" cy="9.38" r="5.63" stroke="#D4AF37" strokeWidth="1.25" />
                  <path d="M16.25 16.25L13.13 13.13" stroke="#D4AF37" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              </div>
              <input
                type="text"
                className="sr-input sr-input-field"
                placeholder="Where do you want to go?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Check-in */}
            <div className="sr-input-wrap">
              <div className="sr-input-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="1.88" y="3.13" width="16.25" height="15" rx="1.25" stroke="#D4AF37" strokeWidth="1.25" />
                  <rect x="5" y="1.88" width="10" height="1.25" stroke="#D4AF37" strokeWidth="1.25" />
                  <circle cx="10.63" cy="8.13" r="1.88" fill="#D4AF37" />
                  <circle cx="13.75" cy="8.13" r="1.88" fill="#D4AF37" />
                  <circle cx="10.63" cy="11.25" r="1.88" fill="#D4AF37" />
                  <circle cx="13.75" cy="11.25" r="1.88" fill="#D4AF37" />
                  <circle cx="4.38" cy="11.25" r="1.88" fill="#D4AF37" />
                  <circle cx="7.50" cy="11.25" r="1.88" fill="#D4AF37" />
                  <circle cx="4.38" cy="14.38" r="1.88" fill="#D4AF37" />
                  <circle cx="7.50" cy="14.38" r="1.88" fill="#D4AF37" />
                  <circle cx="10.63" cy="14.38" r="1.88" fill="#D4AF37" />
                </svg>
              </div>
              <input
                type="date"
                className="sr-input sr-input-field sr-date-input"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            {/* Check-out */}
            <div className="sr-input-wrap">
              <div className="sr-input-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="1.88" y="3.13" width="16.25" height="15" rx="1.25" stroke="#D4AF37" strokeWidth="1.25" />
                  <rect x="5" y="1.88" width="10" height="1.25" stroke="#D4AF37" strokeWidth="1.25" />
                  <circle cx="10.63" cy="8.13" r="1.88" fill="#D4AF37" />
                  <circle cx="13.75" cy="8.13" r="1.88" fill="#D4AF37" />
                  <circle cx="10.63" cy="11.25" r="1.88" fill="#D4AF37" />
                  <circle cx="13.75" cy="11.25" r="1.88" fill="#D4AF37" />
                  <circle cx="4.38" cy="11.25" r="1.88" fill="#D4AF37" />
                  <circle cx="7.50" cy="11.25" r="1.88" fill="#D4AF37" />
                  <circle cx="4.38" cy="14.38" r="1.88" fill="#D4AF37" />
                  <circle cx="7.50" cy="14.38" r="1.88" fill="#D4AF37" />
                  <circle cx="10.63" cy="14.38" r="1.88" fill="#D4AF37" />
                </svg>
              </div>
              <input
                type="date"
                className="sr-input sr-input-field sr-date-input"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>

            {/* Guests · Rooms */}
            <div className="sr-input-wrap">
              <div className="sr-input-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="6.55" cy="6.13" r="3.75" stroke="#D4AF37" strokeWidth="1.25" />
                  <rect x="2.50" y="11.88" width="15" height="6.25" rx="2" stroke="#D4AF37" strokeWidth="1.25" />
                </svg>
              </div>
              <div className="sr-guest-row">
                <select
                  className="sr-input sr-input-field sr-select"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                >
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
                <span className="sr-guest-sep">·</span>
                <select
                  className="sr-input sr-input-field sr-select"
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                >
                  {[1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="sr-price-section">
              <div className="sr-price-header">
                <span className="sr-section-label">Price Range</span>
                <span className="sr-price-value">$0 - $5000+</span>
              </div>
              <div className="sr-slider-track">
                <div className="sr-slider-fill" />
              </div>
            </div>

            {/* Hotel Rating */}
            <div className="sr-rating-section">
              <span className="sr-section-label">Hotel Rating</span>
              <div className="sr-rating-chips">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className={`sr-rating-chip ${selectedRating === n ? 'active' : ''}`}
                    onClick={() => setSelectedRating(selectedRating === n ? null : n)}
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="#D4AF37">
                      <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L10 1z" />
                    </svg>
                    <span>{n}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Purpose */}
            <div className="sr-purpose-section">
              <span className="sr-section-label">Travel Purpose</span>
              <div className="sr-chips-grid">
                {travelPurposes.map(p => (
                  <button
                    key={p}
                    className={`sr-chip ${selectedPurpose === p ? 'active' : ''}`}
                    onClick={() => setSelectedPurpose(p === selectedPurpose ? null : p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Filters */}
            <div className="sr-event-section">
              <span className="sr-section-label">Event Filters</span>
              <div className="sr-chips-grid">
                {eventFilters.map(e => (
                  <button
                    key={e}
                    className={`sr-chip ${selectedEvent === e ? 'active' : ''}`}
                    onClick={() => setSelectedEvent(e === selectedEvent ? null : e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <button className="sr-search-btn" onClick={handleSidebarSearch}>
              <div className="sr-search-btn-text">Search Luxury Stays</div>
            </button>
          </div>
        </aside>

        {/* ===== RESULTS ===== */}
        <main className="sr-main">
          <div className="sr-main-header">
            <div>
              <h1 className="sr-main-title">Curated Luxury Hotels</h1>
              <p className="sr-main-subtitle">09 premium properties match your preferences</p>
            </div>
            <div className="sr-sort-btn">
              <span>Sort by: Filtered</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="#1A2B49" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="sr-hotels-grid">
            {displayHotels.map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
