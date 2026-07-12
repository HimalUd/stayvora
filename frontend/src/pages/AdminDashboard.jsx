import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const defaultHotels = [
  { name: 'Garden Inn', location: 'Portland', rating: 4.4, img: 'https://placehold.co/40x40' },
  { name: 'Urban Boutique Hotel', location: 'Los Angeles', rating: 4.5, img: 'https://placehold.co/40x40' },
  { name: 'Seaside Resort', location: 'Miami', rating: 4.6, img: 'https://placehold.co/40x40' },
  { name: 'Mountain Lodge', location: 'Denver', rating: 4.7, img: 'https://placehold.co/40x40' },
  { name: 'Grand Plaza Hotel', location: 'New York', rating: 4.8, img: 'https://placehold.co/40x40' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelSearchQuery, setHotelSearchQuery] = useState('');
  const [flaggedFilter, setFlaggedFilter] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const bookings = useMemo(() => {
    return JSON.parse(localStorage.getItem('stayvora_bookings') || '[]');
  }, []);

  const allHotels = useMemo(() => {
    return JSON.parse(localStorage.getItem('stayvora_hotels') || '[]');
  }, []);

  const [registeredHotels, setRegisteredHotels] = useState(allHotels);
  useEffect(() => setRegisteredHotels(allHotels), [allHotels]);

  const allReviews = useMemo(() => {
    return JSON.parse(localStorage.getItem('stayvora_reviews') || '[]');
  }, []);

  const [reviews, setReviews] = useState(allReviews);
  useEffect(() => setReviews(allReviews), [allReviews]);

  const stats = useMemo(() => {
    const totalHotels = 6;
    const ownerRegistered = registeredHotels.length;
    const totalBookings = bookings.length;
    const revenue = bookings.reduce((sum, b) => sum + (b.total || 0), 0);
    const flagged = registeredHotels.filter(h => (h.starRating || h.rating || 0) < 3).length;
    return { totalHotels, ownerRegistered, totalBookings, revenue, totalReviews: reviews.length, flagged };
  }, [bookings, registeredHotels, reviews]);

  const reviewStats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { avg: 0, low: 0, dist: {} };
    const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    const avg = (sum / total).toFixed(1);
    const low = reviews.filter(r => r.rating <= 2).length;
    const dist = {};
    for (let i = 5; i >= 1; i--) {
      dist[i] = reviews.filter(r => r.rating === i).length;
    }
    return { avg, low, total, dist };
  }, [reviews]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleViewReview = (r) => setSelectedReview(r);
  const handleCloseReview = () => setSelectedReview(null);

  const handleDeleteReview = (id) => {
    const updated = reviews.filter(r => r.id !== id);
    setReviews(updated);
    localStorage.setItem('stayvora_reviews', JSON.stringify(updated));
    setSelectedReview(null);
  };

  const filteredReviews = useMemo(() => {
    if (!searchQuery.trim()) return reviews;
    const q = searchQuery.toLowerCase();
    return reviews.filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.hotelName?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q) ||
      r.title?.toLowerCase().includes(q)
    );
  }, [reviews, searchQuery]);

  const handleViewHotel = (h) => setSelectedHotel(h);
  const handleCloseHotel = () => setSelectedHotel(null);

  const handleRemoveHotel = (index) => {
    const updated = registeredHotels.filter((_, i) => i !== index);
    setRegisteredHotels(updated);
    localStorage.setItem('stayvora_hotels', JSON.stringify(updated));
    setSelectedHotel(null);
  };

  const filteredHotels = useMemo(() => {
    let list = registeredHotels;
    if (flaggedFilter) {
      list = list.filter(h => (h.starRating || h.rating || 0) < 3);
    }
    if (!hotelSearchQuery.trim()) return list;
    const q = hotelSearchQuery.toLowerCase();
    return list.filter(h =>
      (h.hotelName || h.name || '')?.toLowerCase().includes(q) ||
      (h.city || h.location || '')?.toLowerCase().includes(q) ||
      (h.country || '')?.toLowerCase().includes(q) ||
      (h.email || '')?.toLowerCase().includes(q)
    );
  }, [registeredHotels, hotelSearchQuery, flaggedFilter]);

  const getAmenitiesList = (h) => {
    if (Array.isArray(h.amenities)) return h.amenities;
    if (typeof h.amenities === 'string') return h.amenities.split(',').map(a => a.trim()).filter(Boolean);
    return [];
  };

  const hotelReviewCount = (hotelName) => {
    return reviews.filter(r => r.hotelName === hotelName).length;
  };

  const hotelAvgRating = (hotelName) => {
    const hReviews = reviews.filter(r => r.hotelName === hotelName);
    if (hReviews.length === 0) return 0;
    return (hReviews.reduce((s, r) => s + (r.rating || 0), 0) / hReviews.length).toFixed(1);
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="ad-page">

      {/* SIDEBAR */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-header">
          <div className="ad-logo-wrap">
            <div className="ad-logo-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3.33" y="1.67" width="13.33" height="16.67" rx="1.67" stroke="#020618" strokeWidth="1.67"/>
              </svg>
            </div>
            <div>
              <div className="ad-logo-text">StayEasy</div>
              <div className="ad-logo-badge">Admin Console</div>
            </div>
          </div>
        </div>

        <nav className="ad-nav">
          <div
            className={`ad-nav-item ${activeTab === 'overview' ? 'ad-nav-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="4.67" height="6" rx="0.67" stroke={activeTab === 'overview' ? '#020618' : '#90A1B9'} strokeWidth="1.33"/>
              <rect x="9.33" y="2" width="4.67" height="3.33" rx="0.67" stroke={activeTab === 'overview' ? '#020618' : '#90A1B9'} strokeWidth="1.33"/>
              <rect x="9.33" y="8" width="4.67" height="6" rx="0.67" stroke={activeTab === 'overview' ? '#020618' : '#90A1B9'} strokeWidth="1.33"/>
              <rect x="2" y="10.67" width="4.67" height="3.33" rx="0.67" stroke={activeTab === 'overview' ? '#020618' : '#90A1B9'} strokeWidth="1.33"/>
            </svg>
            <span>Overview</span>
            <svg className="ad-nav-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="5.25" y="3.50" width="7" height="3.50" rx="0.58" stroke="#020618" strokeWidth="1.17"/>
            </svg>
          </div>
          <div
            className={`ad-nav-item ${activeTab === 'hotels' ? 'ad-nav-active' : ''}`}
            onClick={() => setActiveTab('hotels')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="4" y="1.33" width="8" height="13.33" rx="1.33" stroke={activeTab === 'hotels' ? '#020618' : '#90A1B9'} strokeWidth="1.33"/>
              <rect x="1.33" y="8" width="2.67" height="6.67" rx="1.33" stroke={activeTab === 'hotels' ? '#020618' : '#90A1B9'} strokeWidth="1.33"/>
              <rect x="12" y="6" width="2.67" height="8.67" rx="1.33" stroke={activeTab === 'hotels' ? '#020618' : '#90A1B9'} strokeWidth="1.33"/>
            </svg>
            <span>Hotels</span>
          </div>
          <div
            className={`ad-nav-item ${activeTab === 'reviews' ? 'ad-nav-active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1.33" y="1.33" width="13.33" height="12.71" rx="1.33" stroke={activeTab === 'reviews' ? '#020618' : '#90A1B9'} strokeWidth="1.33"/>
            </svg>
            <span>Reviews</span>
            {activeTab === 'reviews' && (
              <svg className="ad-nav-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="5.25" y="3.50" width="7" height="3.50" rx="0.58" stroke="#020618" strokeWidth="1.17"/>
              </svg>
            )}
          </div>
        </nav>

        <div className="ad-sidebar-footer">
          <div className="ad-user-row">
            <div className="ad-user-avatar">A</div>
            <div>
              <div className="ad-user-name">Administrator</div>
              <div className="ad-user-email">admin@stayeasy.com</div>
            </div>
          </div>
          <div className="ad-signout" onClick={handleSignOut}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="4" height="12" rx="0.67" stroke="#90A1B9" strokeWidth="1.33"/>
              <rect x="10.67" y="4.67" width="3.33" height="6.67" rx="0.67" stroke="#90A1B9" strokeWidth="1.33"/>
            </svg>
            <span>Sign out</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="ad-main">
        {activeTab === 'overview' && (
          <>
            <h1 className="ad-page-title">Overview</h1>
            <p className="ad-page-date">{today}</p>

            {/* STAT CARDS */}
            <div className="ad-stats">
              <div className="ad-stat-card">
                <div className="ad-stat-icon" style={{ background: 'rgba(81, 162, 255, 0.10)' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="5" y="1.67" width="10" height="16.67" rx="1.67" stroke="#51A2FF" strokeWidth="1.67"/>
                    <rect x="1.67" y="10" width="3.33" height="8.33" rx="1.67" stroke="#51A2FF" strokeWidth="1.67"/>
                    <rect x="15" y="7.50" width="3.33" height="10.83" rx="1.67" stroke="#51A2FF" strokeWidth="1.67"/>
                  </svg>
                </div>
                <div className="ad-stat-number">{stats.totalHotels}</div>
                <div className="ad-stat-label">Total Hotels</div>
                <div className="ad-stat-sub">{stats.ownerRegistered} owner-registered</div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-icon" style={{ background: 'rgba(0, 212, 146, 0.10)' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="1.67" y="5.83" width="16.67" height="8.33" rx="1.67" stroke="#00D492" strokeWidth="1.67"/>
                    <rect x="13.33" y="5.83" width="5" height="5" rx="1.67" stroke="#00D492" strokeWidth="1.67"/>
                  </svg>
                </div>
                <div className="ad-stat-number">{stats.totalBookings}</div>
                <div className="ad-stat-label">Total Bookings</div>
                <div className="ad-stat-sub">${stats.revenue} revenue</div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-icon" style={{ background: 'rgba(255, 185, 0, 0.10)' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="1.67" y="1.67" width="16.67" height="15.89" rx="1.67" stroke="#FFB900" strokeWidth="1.67"/>
                  </svg>
                </div>
                <div className="ad-stat-number">{stats.totalReviews}</div>
                <div className="ad-stat-label">Total Reviews</div>
                <div className="ad-stat-sub">across all properties</div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-icon" style={{ background: 'rgba(255, 100, 103, 0.10)' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3.33" y="1.67" width="13.33" height="16.67" rx="1.67" stroke="#FF6467" strokeWidth="1.67"/>
                  </svg>
                </div>
                <div className="ad-stat-number">{stats.flagged}</div>
                <div className="ad-stat-label">Flagged Hotels</div>
                <div className="ad-stat-sub">rating below 3.0</div>
              </div>
            </div>

            {/* BOTTOM PANELS */}
            <div className="ad-panels">
              {/* HOTELS NEEDING ATTENTION */}
              <div className="ad-panel">
                <div className="ad-panel-header">
                  <div className="ad-panel-title">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1.32" y="1.99" width="13.34" height="12.01" rx="1.33" stroke="#FFB900" strokeWidth="1.33"/>
                    </svg>
                    Hotels Needing Attention
                  </div>
                  <div
                    className="ad-panel-manage"
                    onClick={() => { setFlaggedFilter(true); setActiveTab('hotels'); }}
                  >
                    <span>Manage </span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="6" y="2.50" width="7" height="3.50" rx="0.50" stroke="#FFB900" strokeWidth="1"/>
                    </svg>
                  </div>
                </div>
                {(() => {
                  const flagged = registeredHotels.filter(h => (h.starRating || h.rating || 0) < 3);
                  return flagged.length > 0 ? (
                    <div className="ad-hotel-list">
                      {flagged.map((h, i) => (
                        <div key={i} className="ad-hotel-row" style={{ cursor: 'pointer' }} onClick={() => { setSelectedHotel(h); }}>
                          <div className="ad-user-avatar" style={{ width: 36, height: 36, fontSize: 12, borderRadius: 10, background: '#314158' }}>
                            {(h.hotelName || h.name || 'H')[0]}
                          </div>
                          <div className="ad-hotel-info">
                            <div className="ad-hotel-name">{h.hotelName || h.name || `Hotel ${i + 1}`}</div>
                            <div className="ad-hotel-location">{h.city || h.location || 'N/A'}</div>
                          </div>
                          <div className="ad-rating-badge" style={{ color: '#FF6467', background: 'rgba(255, 100, 103, 0.10)' }}>
                            {h.starRating || h.rating || 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ad-empty-state">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.20">
                        <rect x="2.66" y="2.67" width="26.67" height="25.43" rx="2.67" stroke="#62748E" strokeWidth="2.67"/>
                      </svg>
                      <p className="ad-empty-title">All hotels have good ratings</p>
                      <p className="ad-empty-sub">No hotels need attention right now</p>
                    </div>
                  );
                })()}
              </div>

              {/* RECENT REVIEWS */}
              <div className="ad-panel">
                <div className="ad-panel-header">
                  <div className="ad-panel-title">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1.33" y="1.33" width="13.33" height="12.71" rx="1.33" stroke="#FFB900" strokeWidth="1.33"/>
                    </svg>
                    Recent Reviews
                  </div>
                  <div className="ad-panel-manage" onClick={() => setActiveTab('reviews')}>
                    <span>View all </span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="6" y="2.50" width="7" height="3.50" rx="0.50" stroke="#FFB900" strokeWidth="1"/>
                    </svg>
                  </div>
                </div>
                {reviews.length > 0 ? (
                  <div className="ad-review-list">
                    {reviews.slice(0, 3).map((r, i) => (
                      <div key={i} className="ad-hotel-row">
                        <div className="ad-user-avatar" style={{ width: 36, height: 36, fontSize: 12, background: '#314158' }}>
                          {r.name?.[0] || 'G'}
                        </div>
                        <div className="ad-hotel-info">
                          <div className="ad-hotel-name">{r.hotelName || r.hotel}</div>
                          <div className="ad-hotel-location">{r.name} &middot; {r.rating}/5</div>
                        </div>
                        <div className="ad-rating-badge">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <rect x="1" y="1" width="10" height="9.54" rx="1" fill="#00D492" stroke="#00D492" strokeWidth="0.50"/>
                          </svg>
                          {r.rating}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ad-empty-state">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.20">
                      <rect x="2.66" y="2.67" width="26.67" height="25.43" rx="2.67" stroke="#62748E" strokeWidth="2.67"/>
                    </svg>
                    <p className="ad-empty-title">No reviews yet</p>
                    <p className="ad-empty-sub">Reviews will appear here once guests submit them</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'hotels' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className="ad-page-title">Hotels</h1>
                <p className="ad-page-date">
                  {flaggedFilter
                    ? `${filteredHotels.length} flagged ${filteredHotels.length === 1 ? 'hotel' : 'hotels'} (rating below 3.0)`
                    : `${registeredHotels.length} registered ${registeredHotels.length === 1 ? 'hotel' : 'hotels'}`}
                </p>
              </div>
              {flaggedFilter && (
                <div
                  className="ad-panel-manage"
                  onClick={() => { setFlaggedFilter(false); setHotelSearchQuery(''); }}
                  style={{ paddingTop: 8, cursor: 'pointer' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2.33" y="2.33" width="11.67" height="1.17" rx="0.58" fill="#FFB900" transform="rotate(45 2.33 2.33)"/>
                    <rect x="2.33" y="11.67" width="11.67" height="1.17" rx="0.58" fill="#FFB900" transform="rotate(-45 2.33 11.67)"/>
                  </svg>
                  <span>Show all hotels</span>
                </div>
              )}
            </div>

            <div className="ad-rev-toolbar">
              <div className="ad-rev-search">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="10.67" height="10.67" rx="1.33" stroke="#62748E" strokeWidth="1.33"/>
                  <rect x="11.13" y="11.13" width="2.87" height="2.87" rx="1.33" stroke="#62748E" strokeWidth="1.33"/>
                </svg>
                <input
                  className="ad-rev-search-input"
                  placeholder="Search hotels, location, email..."
                  value={hotelSearchQuery}
                  onChange={e => setHotelSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="ad-hotel-grid" style={{ paddingTop: 24 }}>
              {filteredHotels.length > 0 ? (
                filteredHotels.map((h, i) => (
                  <div
                    key={i}
                    className="ad-stat-card ad-hotel-card"
                    onClick={() => handleViewHotel(h)}
                  >
                    <div className="ad-hotel-card-img">
                      {h.images?.[0] ? (
                        <img src={h.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <rect x="6" y="2" width="12" height="20" rx="2" stroke="#45556C" strokeWidth="2"/>
                          <rect x="2" y="12" width="4" height="10" rx="2" stroke="#45556C" strokeWidth="2"/>
                          <rect x="18" y="9" width="4" height="13" rx="2" stroke="#45556C" strokeWidth="2"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ paddingTop: 16 }}>
                      <div className="ad-hotel-name" style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                        {h.hotelName || h.name || `Hotel ${i + 1}`}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <rect x="2.33" y="1.17" width="7" height="8.75" rx="1.17" stroke="#62748E" strokeWidth="1.17"/>
                          <rect x="4.25" y="3.08" width="3.50" height="3.50" rx="1.17" stroke="#62748E" strokeWidth="1.17"/>
                        </svg>
                        <span className="ad-hotel-location" style={{ fontSize: 13 }}>
                          {h.city || h.location || 'N/A'}{h.country ? `, ${h.country}` : ''}
                        </span>
                      </div>
                      <div className="ad-hotel-location" style={{ paddingTop: 4 }}>
                        {h.email || ''}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12 }}>
                        <div className="ad-rating-badge">{h.starRating || h.rating || 'N/A'}</div>
                        {getAmenitiesList(h).length > 0 && (
                          <span className="ad-hotel-location" style={{ fontSize: 11 }}>
                            {getAmenitiesList(h).length} amenities
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="ad-empty-title" style={{ paddingTop: 48, textAlign: 'center', width: '100%' }}>
                  {registeredHotels.length === 0
                    ? 'No hotels registered yet. Hotels registered by owners will appear here.'
                    : 'No hotels match your search.'}
                </p>
              )}
            </div>
          </>
        )}

        {activeTab === 'reviews' && (
          <>
            <h1 className="ad-page-title">Reviews</h1>
            <p className="ad-page-date">
              {reviewStats.total} total &middot; avg {reviewStats.avg} ★ &middot; {reviewStats.low} low-rated
            </p>

            {reviewStats.total > 0 ? (
              <>
                {/* RATING SUMMARY */}
                <div className="ad-rev-summary">
                  <div className="ad-rev-summary-left">
                    <div className="ad-rev-avg">{reviewStats.avg}</div>
                    <div className="ad-rev-stars">
                      {[1,2,3,4,5].map(i => (
                        <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <rect x="1.33" y="1.33" width="13.33" height="12.71" rx="1.33"
                            fill={i <= Math.round(reviewStats.avg) ? '#FFB900' : 'none'}
                            stroke={i <= Math.round(reviewStats.avg) ? '#FFB900' : '#314158'}
                            strokeWidth="1.33"
                          />
                        </svg>
                      ))}
                    </div>
                    <div className="ad-rev-count">{reviewStats.total} reviews</div>
                  </div>
                  <div className="ad-rev-summary-bars">
                    {[5,4,3,2,1].map(star => {
                      const count = reviewStats.dist[star] || 0;
                      const pct = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
                      const barColor =
                        star >= 4 ? '#00BC7D' :
                        star === 3 ? '#FE9A00' :
                        '#FB2C36';
                      return (
                        <div key={star} className="ad-rev-bar-row">
                          <span className="ad-rev-bar-label">{star}</span>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <rect x="1" y="1" width="10" height="9.54" rx="1" fill="#FFB900" stroke="#FFB900" strokeWidth="0.50"/>
                          </svg>
                          <div className="ad-rev-bar-track">
                            <div className="ad-rev-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                          </div>
                          <span className="ad-rev-bar-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SEARCH + FILTERS */}
                <div className="ad-rev-toolbar">
                  <div className="ad-rev-search">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="2" width="10.67" height="10.67" rx="1.33" stroke="#62748E" strokeWidth="1.33"/>
                      <rect x="11.13" y="11.13" width="2.87" height="2.87" rx="1.33" stroke="#62748E" strokeWidth="1.33"/>
                    </svg>
                    <input
                      className="ad-rev-search-input"
                      placeholder="Search reviews, guests, hotels..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* REVIEW CARDS */}
                <div className="ad-rev-cards">
                  {filteredReviews.map((r, i) => {
                    const isLow = r.rating <= 2;
                    return (
                      <div
                        key={r.id || i}
                        className="ad-rev-card"
                        style={isLow ? { outline: '1px solid rgba(159, 7, 18, 0.50)' } : {}}
                        onClick={() => handleViewReview(r)}
                      >
                        <div className="ad-rev-card-top">
                          <div className="ad-rev-card-user">
                            <div className="ad-rev-avatar">{r.name?.[0] || 'G'}</div>
                            <div>
                              <div className="ad-rev-card-name">{r.name}</div>
                              <div className="ad-rev-card-stars">
                                {[1,2,3,4,5].map(s => (
                                  <svg key={s} width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <rect x="1" y="1" width="10" height="9.54" rx="1"
                                      fill={s <= r.rating ? '#FFB900' : 'none'}
                                      stroke={s <= r.rating ? '#FFB900' : '#314158'}
                                      strokeWidth="0.50"
                                    />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="ad-rev-card-meta">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <rect x="3" y="1" width="6" height="10" rx="1" stroke="#62748E" strokeWidth="1"/>
                              <rect x="1" y="6" width="2" height="5" rx="1" stroke="#62748E" strokeWidth="1"/>
                              <rect x="9" y="4.50" width="2" height="6.50" rx="1" stroke="#62748E" strokeWidth="1"/>
                            </svg>
                            <span className="ad-rev-card-hotel">{r.hotelName}</span>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <rect x="1.50" y="2" width="9" height="9" rx="1" stroke="#45556C" strokeWidth="1"/>
                            </svg>
                            <span className="ad-rev-card-date">{r.date}</span>
                          </div>
                          <div className="ad-rev-card-actions">
                            {isLow && (
                              <span className="ad-rev-badge-low">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <rect x="0.99" y="1.49" width="10.01" height="9.01" rx="1" stroke="#FF6467" strokeWidth="1"/>
                                </svg>
                                Low
                              </span>
                            )}
                            <div className="ad-rev-kebab">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <rect x="2.92" y="3.50" width="8.17" height="9.33" rx="1.17" stroke="#45556C" strokeWidth="1.17"/>
                                <rect x="4.67" y="1.17" width="4.67" height="2.33" rx="0.58" stroke="#45556C" strokeWidth="1.17"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                        {r.title && <div className="ad-rev-card-title">{r.title}</div>}
                        <div className="ad-rev-card-comment">{r.comment}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="ad-empty-title" style={{ paddingTop: 48 }}>
                No reviews yet. Guest reviews will appear here.
              </p>
            )}
          </>
        )}

        {/* REVIEW DETAIL MODAL */}
        {selectedReview && (
          <div className="ad-modal-overlay" onClick={handleCloseReview}>
            <div className="ad-modal" onClick={e => e.stopPropagation()}>
              <div className="ad-modal-header">
                <div className="ad-modal-title">Review Details</div>
                <div className="ad-modal-close" onClick={handleCloseReview}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="4.29" y="4.29" width="16" height="2" rx="1" fill="#62748E" transform="rotate(45 4.29 4.29)"/>
                    <rect x="4.29" y="15.71" width="16" height="2" rx="1" fill="#62748E" transform="rotate(-45 4.29 15.71)"/>
                  </svg>
                </div>
              </div>
              <div className="ad-modal-body">
                <div className="ad-modal-user">
                  <div className="ad-modal-avatar">{selectedReview.name?.[0] || 'G'}</div>
                  <div>
                    <div className="ad-modal-name">{selectedReview.name}</div>
                    <div className="ad-modal-email">{selectedReview.email || 'No email'}</div>
                    <div className="ad-modal-stars">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <rect x="1.17" y="1.17" width="11.67" height="11.13" rx="1.17"
                            fill={s <= selectedReview.rating ? '#FFB900' : 'none'}
                            stroke={s <= selectedReview.rating ? '#FFB900' : '#314158'}
                            strokeWidth="1.17"
                          />
                        </svg>
                      ))}
                      <span className="ad-modal-rating">{selectedReview.rating}/5</span>
                    </div>
                  </div>
                </div>

                <div className="ad-modal-hotel-badge">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="4" y="1.33" width="8" height="13.33" rx="1.33" stroke="#90A1B9" strokeWidth="1.33"/>
                    <rect x="1.33" y="8" width="2.67" height="6.67" rx="1.33" stroke="#90A1B9" strokeWidth="1.33"/>
                    <rect x="12" y="6" width="2.67" height="8.67" rx="1.33" stroke="#90A1B9" strokeWidth="1.33"/>
                  </svg>
                  <span>{selectedReview.hotelName}</span>
                </div>

                <div className="ad-modal-comment-section">
                  <div className="ad-modal-comment-label">Comment</div>
                  <div className="ad-modal-comment-text">{selectedReview.comment}</div>
                </div>

                <div className="ad-modal-date">
                  Submitted {selectedReview.submitted || selectedReview.date}
                </div>

                <div className="ad-modal-actions">
                  <button className="ad-modal-btn ad-modal-btn-close" onClick={handleCloseReview}>
                    Close
                  </button>
                  <button
                    className="ad-modal-btn ad-modal-btn-delete"
                    onClick={() => handleDeleteReview(selectedReview.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="3.33" y="4" width="9.33" height="10.67" rx="1.33" stroke="#FF6467" strokeWidth="1.33"/>
                      <rect x="5.33" y="1.33" width="5.33" height="2.67" rx="1.33" stroke="#FF6467" strokeWidth="1.33"/>
                    </svg>
                    Delete Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOTEL DETAIL MODAL */}
        {selectedHotel && (
          <div className="ad-modal-overlay" onClick={handleCloseHotel}>
            <div className="ad-modal ad-modal-hotel" onClick={e => e.stopPropagation()}>
              {/* IMAGE HEADER */}
              <div className="ad-hotel-modal-img-wrap">
                {selectedHotel.images?.[0] ? (
                  <img src={selectedHotel.images[0]} alt="" className="ad-hotel-modal-img" />
                ) : (
                  <div className="ad-hotel-modal-img ad-hotel-modal-img-placeholder" />
                )}
                <div className="ad-hotel-modal-gradient" />
                <div className="ad-hotel-modal-close" onClick={handleCloseHotel}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="4" y="4" width="12.80" height="1.60" rx="0.80" fill="white" transform="rotate(45 4 4)"/>
                    <rect x="4" y="12.80" width="12.80" height="1.60" rx="0.80" fill="white" transform="rotate(-45 4 12.80)"/>
                  </svg>
                </div>
                <div className="ad-hotel-modal-title-wrap">
                  <div className="ad-hotel-modal-title">
                    {selectedHotel.hotelName || selectedHotel.name || 'Hotel'}
                  </div>
                  <div className="ad-hotel-modal-location">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="2.33" y="1.17" width="9.33" height="11.67" rx="1.17" stroke="#CAD5E2" strokeWidth="1.17"/>
                      <rect x="5.25" y="4.08" width="3.50" height="3.50" rx="1.17" stroke="#CAD5E2" strokeWidth="1.17"/>
                    </svg>
                    <span>{selectedHotel.city || selectedHotel.location || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* BODY */}
              <div className="ad-hotel-modal-body">
                {/* RATING */}
                <div className="ad-hotel-modal-rating-row">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="1.17" y="1.17" width="11.67" height="11.13" rx="1.17"
                        fill={s <= Math.round(Number(hotelAvgRating(selectedHotel.hotelName || selectedHotel.name) || selectedHotel.starRating || selectedHotel.rating || 0)) ? '#FFB900' : 'none'}
                        stroke={'#FFB900'}
                        strokeWidth="1.17"
                      />
                    </svg>
                  ))}
                  <span className="ad-hotel-modal-rating-text">
                    {selectedHotel.starRating || selectedHotel.rating || hotelAvgRating(selectedHotel.hotelName || selectedHotel.name) || 'N/A'}
                  </span>
                  <span className="ad-hotel-modal-review-count">
                    {hotelReviewCount(selectedHotel.hotelName || selectedHotel.name)} reviews
                  </span>
                </div>

                {/* ABOUT */}
                <div className="ad-hotel-modal-section">
                  <div className="ad-hotel-modal-section-label">About</div>
                  <div className="ad-hotel-modal-section-text">
                    {selectedHotel.description || 'No description available.'}
                  </div>
                </div>

                {/* AMENITIES */}
                {getAmenitiesList(selectedHotel).length > 0 && (
                  <div className="ad-hotel-modal-section">
                    <div className="ad-hotel-modal-section-label">Amenities</div>
                    <div className="ad-hotel-modal-amenities">
                      {getAmenitiesList(selectedHotel).map((a, i) => (
                        <div key={i} className="ad-hotel-modal-amenity-pill">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <rect x="1" y="1" width="10" height="10" rx="1" stroke="#00D492" strokeWidth="1"/>
                            <rect x="4.50" y="2" width="6.50" height="5" rx="1" stroke="#00D492" strokeWidth="1"/>
                          </svg>
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* REVIEWS */}
                <div className="ad-hotel-modal-section">
                  <div className="ad-hotel-modal-section-label">
                    Reviews ({hotelReviewCount(selectedHotel.hotelName || selectedHotel.name)})
                  </div>
                  {hotelReviewCount(selectedHotel.hotelName || selectedHotel.name) > 0 ? (
                    <div className="ad-hotel-modal-reviews">
                      {reviews.filter(r => r.hotelName === (selectedHotel.hotelName || selectedHotel.name)).slice(0, 3).map((r, i) => (
                        <div key={i} className="ad-hotel-modal-review-item">
                          <div className="ad-rev-card-user">
                            <div className="ad-rev-avatar" style={{ width: 32, height: 32, fontSize: 12, minWidth: 32 }}>{r.name?.[0] || 'G'}</div>
                            <div>
                              <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{r.name}</div>
                              <div style={{ display: 'flex', gap: 1, paddingTop: 1 }}>
                                {[1,2,3,4,5].map(s => (
                                  <svg key={s} width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <rect x="0.83" y="0.83" width="8.33" height="7.95" rx="0.83"
                                      fill={s <= r.rating ? '#FFB900' : 'none'}
                                      stroke="#FFB900" strokeWidth="0.83"
                                    />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                          {r.comment && <div className="ad-hotel-modal-review-comment">{r.comment}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ad-hotel-modal-empty-reviews">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="2" width="20" height="19.07" rx="2" stroke="#45556C" strokeWidth="2"/>
                      </svg>
                      <span>No reviews yet for this hotel</span>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="ad-modal-actions">
                  <button className="ad-modal-btn ad-modal-btn-close" onClick={handleCloseHotel}>
                    Close
                  </button>
                  <button
                    className="ad-modal-btn ad-modal-btn-delete"
                    onClick={() => {
                      const idx = registeredHotels.findIndex(h => h === selectedHotel);
                      if (idx !== -1) handleRemoveHotel(idx);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="3.33" y="4" width="9.33" height="10.67" rx="1.33" stroke="#FF6467" strokeWidth="1.33"/>
                      <rect x="5.33" y="1.33" width="5.33" height="2.67" rx="1.33" stroke="#FF6467" strokeWidth="1.33"/>
                    </svg>
                    Remove Hotel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
