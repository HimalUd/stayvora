import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HotelDetail.css';

const hotelData = {
  1: {
    name: 'Mirissa beach Hotel',
    location: 'Mirissa, Srilanka.',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1277&h=644&fit=crop',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1277&h=644&fit=crop',
      'https://images.unsplash.com/photo-1572307480816-4ae3267c8c0f?w=1277&h=644&fit=crop',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1277&h=644&fit=crop',
    ],
    rating: 4.8,
    totalReviews: 1456,
    ratingLabel: 'Excellent',
    ratingScore: 4.9,
    thumbnails: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=96&h=96&fit=crop',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=96&h=96&fit=crop',
      'https://images.unsplash.com/photo-1572307480816-4ae3267c8c0f?w=96&h=96&fit=crop',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=96&h=96&fit=crop',
    ],
    description: 'Elegant historic hotel offering timeless luxury and exceptional service.',
    popularFacilities: 'Concierge, Fine Dining, Spa',
    amenities: ['Concierge', 'Fine Dining', 'Spa', 'Valet Parking', 'Business Center'],
    rooms: [
      {
        name: 'Classic Room',
        price: 349,
        originalPrice: 419,
        sleeps: 2,
        perks: ['Free WiFi', 'Free cancellation'],
        available: '4 rooms available',
        availableClass: 'available',
      },
      {
        name: 'Executive Suite',
        price: 549,
        originalPrice: 659,
        sleeps: 4,
        perks: ['Free WiFi', 'Free cancellation'],
        available: 'Only 2 rooms left!',
        availableClass: 'limited',
      },
      {
        name: 'Royal Suite',
        price: 999,
        originalPrice: 1199,
        sleeps: 6,
        perks: ['Free WiFi', 'Free cancellation'],
        available: 'Only 1 rooms left!',
        availableClass: 'limited',
      },
    ],
    address: 'Old Town',
    city: 'Boston',
    mapPlaceholder: 'Map view would be displayed here',
  },
};

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const hotel = hotelData[id] || hotelData[1];

  return (
    <div className="hd-page">

      {/* ===== HERO ===== */}
      <section className="hd-hero">
        <img src={hotel.gallery[selectedThumb]} alt={hotel.name} className="hd-hero-img" />
        <div className="hd-hero-overlay" />
        <div className="hd-hero-content">
          <div className="hd-hero-info">
            <h1 className="hd-hero-title">{hotel.name}</h1>
            <div className="hd-hero-location">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.67">
                <path d="M10 1.67c-2.76 0-5 2.24-5 5 0 3.75 5 9.17 5 9.17s5-5.42 5-9.17c0-2.76-2.24-5-5-5z" />
                <circle cx="10" cy="6.67" r="1.67" fill="white" />
              </svg>
              <span>{hotel.location}</span>
            </div>
          </div>
          <div className="hd-hero-rating">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="white">
              <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L10 1z" />
            </svg>
            <span>{hotel.rating}</span>
          </div>
        </div>
      </section>

      {/* ===== THUMBNAILS ===== */}
      <div className="hd-thumbnails">
        {hotel.thumbnails.map((thumb, i) => (
          <div
            key={i}
            className={`hd-thumb ${selectedThumb === i ? 'active' : ''}`}
            onClick={() => setSelectedThumb(i)}
          >
            <img src={thumb} alt="" />
          </div>
        ))}
      </div>

      {/* ===== TWO-COLUMN LAYOUT ===== */}
      <div className="hd-layout">

        {/* ===== LEFT COLUMN ===== */}
        <div className="hd-main">

          {/* About This Hotel */}
          <div className="hd-card">
            <div className="hd-rating-bar">
              <div className="hd-rating-badge">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#008236">
                  <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L10 1z" />
                </svg>
                <span>{hotel.ratingScore} {hotel.ratingLabel}</span>
              </div>
              <span className="hd-review-count">Based on {hotel.totalReviews.toLocaleString()} reviews</span>
            </div>
            <div className="hd-section">
              <h2 className="hd-section-title">About This Hotel</h2>
              <p className="hd-description">{hotel.description}</p>
            </div>
            <div className="hd-facilities-box">
              <span className="hd-facilities-label">Most popular facilities:</span>
              <span className="hd-facilities-text"> {hotel.popularFacilities}</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="hd-card">
            <h2 className="hd-section-title">Hotel Amenities & Services</h2>
            <div className="hd-amenities-grid">
              {hotel.amenities.map((a, i) => (
                <div key={i} className="hd-amenity-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3.33 10l4.17 4.17 9.17-9.17" stroke="#155DFC" strokeWidth="1.67" strokeLinecap="round" />
                  </svg>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Choose Your Room */}
          <div className="hd-card">
            <h2 className="hd-section-title">Choose Your Room</h2>
            <div className="hd-rooms">
              {hotel.rooms.map((room, i) => (
                <div
                  key={i}
                  className={`hd-room-card ${selectedRoom === i ? 'selected' : ''}`}
                  onClick={() => setSelectedRoom(i)}
                >
                  <div className="hd-room-left">
                    <h3 className="hd-room-name">{room.name}</h3>
                    <div className="hd-room-perks">
                      <div className="hd-perk">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M3.33 10l4.17 4.17 9.17-9.17" stroke="#00A63E" strokeWidth="1.67" strokeLinecap="round" />
                        </svg>
                        <span>Sleeps up to {room.sleeps} guests</span>
                      </div>
                      {room.perks.map((p, j) => (
                        <div key={j} className="hd-perk">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M3.33 10l4.17 4.17 9.17-9.17" stroke="#00A63E" strokeWidth="1.67" strokeLinecap="round" />
                          </svg>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`hd-room-availability ${room.availableClass}`}>
                      ✓ {room.available}
                    </div>
                  </div>
                  <div className="hd-room-right">
                    <div className="hd-room-pricing">
                      <span className="hd-room-original">${room.originalPrice}</span>
                      <span className="hd-room-current">${room.price}</span>
                      <span className="hd-room-unit">per night</span>
                    </div>
                    <button className="hd-book-btn" onClick={() => navigate(`/booking/${id}?room=${i}`)}>Book Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="hd-card">
            <h2 className="hd-section-title">Location</h2>
            <div className="hd-address">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#155DFC" strokeWidth="2" />
                <circle cx="12" cy="9" r="3" stroke="#155DFC" strokeWidth="2" />
              </svg>
              <div>
                <div className="hd-address-name">{hotel.address}</div>
                <div className="hd-address-city">{hotel.city}</div>
              </div>
            </div>
            <div className="hd-map-placeholder">
              {hotel.mapPlaceholder}
            </div>
          </div>

        </div>

        {/* ===== RIGHT COLUMN - BOOKING SUMMARY ===== */}
        <div className="hd-sidebar">
          <div className="hd-booking-card">
            <div className="hd-booking-header">
              Booking Summary
            </div>
            <div className="hd-booking-body">
              <div className="hd-booking-row">
                <div className="hd-booking-label">Check-in</div>
                <div className="hd-booking-value">Select dates</div>
              </div>
              <div className="hd-booking-divider" />
              <div className="hd-booking-row">
                <div className="hd-booking-label">Check-out</div>
                <div className="hd-booking-value">Select dates</div>
              </div>
              <div className="hd-booking-divider" />
              <div className="hd-booking-row">
                <div className="hd-booking-label">Guests</div>
                <div className="hd-booking-value">2 Guests</div>
              </div>
              <div className="hd-booking-divider" />
              <div className="hd-booking-price-section">
                <div className="hd-booking-starting">Starting from</div>
                <div className="hd-booking-amount">$349</div>
                <div className="hd-booking-unit">per night</div>
              </div>
              <div className="hd-booking-badges">
                <div className="hd-booking-badge hd-badge-green">
                  ✓ Free cancellation
                </div>
                <div className="hd-booking-badge hd-badge-blue">
                  ✓ No payment needed today
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
