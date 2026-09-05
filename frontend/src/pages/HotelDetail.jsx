import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotel } from '../hooks/useHotels';
import { useRooms } from '../hooks/useRooms';
import { formatLKRFixed } from '../utils/currency';
import './HotelDetail.css';

const COLORS = ['#155DFC', '#00A63E', '#D08700', '#C10007', '#7C3AED', '#E91E63', '#00BCD4', '#FF5722'];

function getRatingLabel(rating) {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.0) return 'Good';
  if (rating >= 2.0) return 'Fair';
  return 'Poor';
}

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const { data: hotel, isLoading: loading, error } = useHotel(id);
  const { data: rooms = [] } = useRooms(id);

  const initMap = (retries = 0) => {
    const container = document.getElementById('hd-map-container');
    if (!container) {
      if (retries < 5) setTimeout(() => initMap(retries + 1), 200);
      return;
    }
    if (mapRef.current || container._leaflet_id) return;
    if (!window.L || !window.L.map) {
      if (retries < 5) setTimeout(() => initMap(retries + 1), 200);
      return;
    }

    const hotelLat = parseFloat(hotel.latitude) || 7.91;
    const hotelLng = parseFloat(hotel.longitude) || 80.71;

    const map = window.L.map(container, { zoomControl: true }).setView([hotelLat, hotelLng], 12);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const hotelIcon = window.L.divIcon({
      className: '',
      html: `<div style="width:40px;height:40px;background:#155DFC;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;color:#fff;font-weight:700">H</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    window.L.marker([hotelLat, hotelLng], { icon: hotelIcon })
      .addTo(map)
      .bindPopup(`<b>${hotel.name}</b><br/>${hotel.address || ''}`);

    const places = (hotel.places || []).filter(p => p.latitude && p.longitude);
    const points = [window.L.latLng(hotelLat, hotelLng)];
    const routeLayers = [];

    places.forEach((d, idx) => {
      const color = COLORS[idx % COLORS.length];
      const icon = window.L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;background:${color};border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25);color:#fff;font-size:12px;font-weight:700">${(d.distance || '').split(' ')[0] || idx + 1}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      window.L.marker([d.latitude, d.longitude], { icon })
        .addTo(map)
        .bindPopup(`<b>${d.name}</b>${d.distance ? '<br/>Distance: ' + d.distance : ''}`);

      points.push(window.L.latLng(d.latitude, d.longitude));
    });

    mapRef.current = map;

    const bounds = window.L.latLngBounds(points).pad(0.15);
    map.fitBounds(bounds);

    const routePromises = places.map((d) =>
      fetch(`https://router.project-osrm.org/route/v1/driving/${hotelLng},${hotelLat};${d.longitude},${d.latitude}?overview=full&geometries=geojson`)
        .then((r) => r.json())
        .then((data) => ({ dest: d, data }))
        .catch(() => null)
    );

    Promise.all(routePromises).then((results) => {
      results.forEach((result, idx) => {
        if (!result || !result.data?.routes?.[0]?.geometry) return;
        const coords = result.data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
        const polyline = window.L.polyline(coords, {
          color: COLORS[idx % COLORS.length],
          weight: 3,
          opacity: 0.7,
        }).addTo(map);
        routeLayers.push(polyline);
      });
    });
  };

  useEffect(() => {
    if (!hotel || !window.L) return;
    try {
      initMap();
    } catch (e) {
      console.error('Map init failed:', e);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [hotel]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <p>Loading hotel details...</p>
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

  if (!hotel) {
    return (
      <div className="empty-state">
        <h3>Hotel not found</h3>
        <p>The hotel you are looking for does not exist.</p>
      </div>
    );
  }

  const rawImages = hotel.images || [];
  const images = rawImages.map(i => typeof i === 'string' ? i : i.image_url);
  const gallery = images;
  const thumbnails = images;
  const rating = parseFloat(hotel.rating) || 0;
  const ratingLabel = getRatingLabel(rating);
  const amenitiesList = typeof hotel.amenities === 'string'
    ? hotel.amenities.split(',').map(a => a.trim()).filter(Boolean)
    : Array.isArray(hotel.amenities)
      ? hotel.amenities
      : [];
  const popularFacilities = amenitiesList.slice(0, 3).join(', ');
  const minPrice = rooms.length > 0 ? Math.min(...rooms.map(r => Number(r.price))) : 0;

  return (
    <div className="hd-page">

      {/* ===== HERO ===== */}
      <section className="hd-hero">
        <img src={gallery[selectedThumb]} alt={hotel.name} className="hd-hero-img" />
        <div className="hd-hero-overlay" />
        <div className="hd-hero-content">
          <div className="hd-hero-info">
            <div className="hd-hero-eyebrow">
              <span className="hd-hero-eyebrow-mark" />
              StayVora Featured Stay
            </div>
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
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L10 1z" />
            </svg>
            <div className="hd-hero-rating-info">
              <span className="hd-hero-rating-value">{rating}</span>
              <span className="hd-hero-rating-label">{ratingLabel}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THUMBNAILS ===== */}
      <div className="hd-thumbnails">
        {thumbnails.map((thumb, i) => (
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
                <span>{rating} {ratingLabel}</span>
              </div>
              <span className="hd-review-count">Based on {hotel.total_reviews || 0} reviews</span>
            </div>
            <div className="hd-section">
              <div className="hd-section-head">
                
                <h2 className="hd-section-title">About This Hotel</h2>
              </div>
              <p className="hd-description">{hotel.description}</p>
            </div>
            <div className="hd-facilities-box">
              <span className="hd-facilities-label">Most popular facilities:</span>
              <span className="hd-facilities-text"> {popularFacilities}</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="hd-card">
            <div className="hd-section-head">
              <span className="hd-eyebrow">Comfort &amp; Convenience</span>
              <h2 className="hd-section-title">Hotel Amenities &amp; Services</h2>
            </div>
            <div className="hd-amenities-grid">
              {amenitiesList.map((a, i) => (
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
          <div className="hd-card" id="hd-rooms-section">
            <div className="hd-section-head">
              <span className="hd-eyebrow">Pick Your Perfect Stay</span>
              <h2 className="hd-section-title">Choose Your Room</h2>
            </div>
            <div className="hd-rooms">
              {rooms.map((room, i) => (
                <div
                  key={i}
                  className={`hd-room-card ${selectedRoom === i ? 'selected' : ''}`}
                  onClick={() => setSelectedRoom(i)}
                >
                  <div className="hd-room-left">
                    <div className="hd-room-name-row">
                      <h3 className="hd-room-name">{room.room_type}</h3>
                      {selectedRoom === i && (
                        <span className="hd-room-selected-chip">
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                            <path d="M4 10.5l4 4 8-9" stroke="#0A1B33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="hd-room-perks">
                      <div className="hd-perk">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M3.33 10l4.17 4.17 9.17-9.17" stroke="#00A63E" strokeWidth="1.67" strokeLinecap="round" />
                        </svg>
                        <span>Sleeps up to {room.capacity} guests</span>
                      </div>
                      {room.description && (
                        <div className="hd-perk">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M3.33 10l4.17 4.17 9.17-9.17" stroke="#00A63E" strokeWidth="1.67" strokeLinecap="round" />
                          </svg>
                          <span>{room.description}</span>
                        </div>
                      )}
                    </div>
                    <div className={`hd-room-availability ${room.is_available ? 'available' : 'unavailable'}`}>
                      ✓ {room.is_available ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                  <div className="hd-room-right">
                    <div className="hd-room-pricing">
                      <span className="hd-room-current">{formatLKRFixed(room.price)}</span>
                      <span className="hd-room-unit">per night</span>
                    </div>
                    <button className="hd-book-btn" onClick={() => navigate(`/booking/${id}?room=${room.id}`)}>
                      {selectedRoom === i ? 'Book This Room' : 'Book Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Map */}
          <div className="hd-card">
            <div className="hd-section-head">
              <span className="hd-eyebrow">Find Your Way</span>
              <h2 className="hd-section-title">Location &amp; Nearby Destinations</h2>
            </div>
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
            <div className="hd-map-wrap" id="hd-map-container" />
            <div className="hd-destinations">
              {(hotel.places || []).length > 0 ? (
                (hotel.places || []).map((d, i) => (
                  <a key={d.id || i} className="hd-dest-item" href={d.location_url || (d.latitude && d.longitude ? `https://www.google.com/maps?q=${d.latitude},${d.longitude}` : '#')} target="_blank" rel="noopener noreferrer">
                    <div className="hd-dest-marker" style={{ background: COLORS[i % COLORS.length] }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-2.21-1.79-4-4-4z" />
                      </svg>
                    </div>
                    <div className="hd-dest-info">
                      <div className="hd-dest-name">{d.name}</div>
                      {d.distance && (
                        <div className="hd-dest-meta">
                          <span className="hd-dest-distance">{d.distance}</span>
                        </div>
                      )}
                    </div>
                    <svg className="hd-dest-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4l4 4-4 4" stroke="#99A1AF" strokeWidth="1.33" strokeLinecap="round" />
                    </svg>
                  </a>
                ))
              ) : (
                <p className="hd-no-places">No nearby destinations available</p>
              )}
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
                  <div className="hd-booking-amount">{minPrice > 0 ? formatLKRFixed(minPrice) : '-'}</div>
                  <div className="hd-booking-unit">per night</div>
                </div>
              <button
                className="hd-booking-cta"
                onClick={() => document.getElementById('hd-rooms-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Choose Your Room
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
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
