import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  useAdminHotels,
  useAdminStats,
  useAdminBookings,
  useAdminReviews,
  useAdminUsers,
  useAdminUserDetail,
  useDeleteHotel,
  useDeleteReview,
  useDeleteUser,
} from '../hooks/useAdmin';
import logoLight from '../assets/logos/logo-light.png';
import { formatLKRFixed } from '../utils/currency';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelSearchQuery, setHotelSearchQuery] = useState('');
  const [hotelRatingFilter, setHotelRatingFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewSort, setReviewSort] = useState('newest');
  const [reviewPage, setReviewPage] = useState(1);
  const [deleteConfirmReview, setDeleteConfirmReview] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const PAGE_SIZE = 8;

  const { data: registeredHotels = [], isLoading: hotelsLoading } = useAdminHotels();
  const { data: stats = {} } = useAdminStats();
  const { data: recentBookings = [], isLoading: bookingsLoading } = useAdminBookings();
  const { data: allReviews = [], isLoading: reviewsLoading } = useAdminReviews();
  const { data: allUsers = [], isLoading: usersLoading } = useAdminUsers();
  const userDetailMutation = useAdminUserDetail();
  const deleteHotel = useDeleteHotel();
  const deleteReview = useDeleteReview();
  const deleteUser = useDeleteUser();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const statsView = useMemo(() => {
    const flagged = registeredHotels.filter(h => (h.rating || 0) < 3).length;
    return {
      totalHotels: stats.total_hotels ?? registeredHotels.length,
      totalBookings: stats.total_bookings ?? 0,
      totalReviews: stats.total_reviews ?? 0,
      totalUsers: stats.total_users ?? allUsers.length,
      flagged,
    };
  }, [stats, registeredHotels, allUsers]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleViewHotel = (h) => setSelectedHotel(h);
  const handleCloseHotel = () => setSelectedHotel(null);

  const handleRemoveHotel = async (hotelId) => {
    try {
      await deleteHotel.mutateAsync(hotelId);
      setSelectedHotel(null);
    } catch {
      setSelectedHotel(null);
    }
  };

  const filteredHotels = useMemo(() => {
    let list = registeredHotels;
    if (hotelRatingFilter === 'high') {
      list = list.filter(h => (h.rating || 0) >= 4);
    } else if (hotelRatingFilter === 'low') {
      list = list.filter(h => (h.starRating || h.rating || 0) < 3);
    }
    if (!hotelSearchQuery.trim()) return list;
    const q = hotelSearchQuery.toLowerCase();
    return list.filter(h =>
      (h.hotelName || h.name || '')?.toLowerCase().includes(q) ||
      (h.city || h.location || '')?.toLowerCase().includes(q) ||
      (h.country || '')?.toLowerCase().includes(q) ||
      (h.owner_email || h.email || '')?.toLowerCase().includes(q)
    );
  }, [registeredHotels, hotelSearchQuery, hotelRatingFilter]);

  const filteredReviews = useMemo(() => {
    let list = allReviews;
    if (reviewFilter === 'low') {
      list = list.filter(r => (r.rating || 0) < 3);
    }
    if (reviewSearchQuery.trim()) {
      const q = reviewSearchQuery.toLowerCase();
      list = list.filter(r =>
        (r.hotel_name || '').toLowerCase().includes(q) ||
        (r.user_name || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (reviewSort === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (reviewSort === 'highest') {
      sorted.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (reviewSort === 'lowest') {
      sorted.sort((a, b) => (Number(a.rating) || 0) - (Number(b.rating) || 0));
    } else {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return sorted;
  }, [allReviews, reviewFilter, reviewSearchQuery, reviewSort]);

  useEffect(() => {
    setReviewPage(1);
  }, [reviewFilter, reviewSearchQuery, reviewSort]);

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return allUsers;
    const q = userSearchQuery.toLowerCase();
    return allUsers.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  }, [allUsers, userSearchQuery]);

  const paginatedReviews = useMemo(() => {
    const start = (reviewPage - 1) * PAGE_SIZE;
    return filteredReviews.slice(start, start + PAGE_SIZE);
  }, [filteredReviews, reviewPage]);

  const totalPages = Math.max(Math.ceil(filteredReviews.length / PAGE_SIZE), 1);

  const hotelReviewBreakdown = useMemo(() => {
    const map = {};
    allReviews.forEach(r => {
      if (!map[r.hotel_id]) {
        map[r.hotel_id] = { name: r.hotel_name, count: 0, sum: 0 };
      }
      map[r.hotel_id].count += 1;
      map[r.hotel_id].sum += Number(r.rating) || 0;
    });
    return Object.values(map)
      .map(h => ({ ...h, avg: h.count ? (h.sum / h.count).toFixed(1) : '—' }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [allReviews]);

  const reviewStats = useMemo(() => {
    if (allReviews.length === 0) return { avg: '—', distribution: {} };
    const total = allReviews.length;
    const sum = allReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const distribution = {};
    for (let s = 5; s >= 1; s--) {
      const count = allReviews.filter(r => (Number(r.rating) || 0) === s).length;
      distribution[s] = { count, pct: total ? Math.round((count / total) * 100) : 0 };
    }
    return { avg: (sum / total).toFixed(1), distribution };
  }, [allReviews]);

  const topHotels = useMemo(() =>
    [...registeredHotels]
      .filter(h => h.rating)
      .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
      .slice(0, 3),
    [registeredHotels]);

  const getAmenitiesList = (h) => {
    if (Array.isArray(h.amenities)) return h.amenities;
    if (typeof h.amenities === 'string') return h.amenities.split(',').map(a => a.trim()).filter(Boolean);
    return [];
  };

  if (!user) return null;

  return (
    <div className="ad-page">

      {/* SIDEBAR */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-header">
          <Link to="/" className="ad-logo-wrap">
            <img src={logoLight} alt="StayVora" className="ad-logo-img" />
            <div className="ad-logo-badge">Admin Console</div>
          </Link>
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
            onClick={() => { setActiveTab('hotels'); setHotelRatingFilter('all'); }}
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
          <div
            className={`ad-nav-item ${activeTab === 'users' ? 'ad-nav-active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="5.5" cy="5.5" r="2.83" stroke={activeTab === 'users' ? '#020618' : '#90A1B9'} strokeWidth="1.33"/>
              <circle cx="12.5" cy="5.5" r="1.83" stroke={activeTab === 'users' ? '#020618' : '#90A1B9'} strokeWidth="1.33"/>
              <path d="M1.33 13.33C1.33 10.39 3.06 8.33 5.5 8.33C7.94 8.33 9.67 10.39 9.67 13.33" stroke={activeTab === 'users' ? '#020618' : '#90A1B9'} strokeWidth="1.33" strokeLinecap="round"/>
              <path d="M10.33 8.67C12.5 9 14 10.72 14 13.33" stroke={activeTab === 'users' ? '#020618' : '#90A1B9'} strokeWidth="1.33" strokeLinecap="round"/>
            </svg>
            <span>Users</span>
            {activeTab === 'users' && (
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
              <div className="ad-user-email">{user?.email || 'admin@stayvora.com'}</div>
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
            <div className="ad-overview-head">
              <div>
                
                <h1 className="ad-page-title">Welcome back, {(user?.name || 'Administrator').split(' ')[0]}!</h1>
                <p className="ad-page-date">{today} · overseeing all StayVora properties</p>
              </div>
              <button className="ad-overview-cta" onClick={() => setActiveTab('hotels')}>
                <span>Manage Hotels</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="5.25" y="3.50" width="7" height="3.50" rx="0.58" stroke="#020618" strokeWidth="1.17"/>
                </svg>
              </button>
            </div>

            {/* STAT CARDS */}
            <div className="ad-stats">
              <div className="ad-stat-card ad-stat-hover" onClick={() => setActiveTab('hotels')}>
                <div className="ad-stat-icon" style={{ background: 'rgba(81, 162, 255, 0.10)' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="5" y="1.67" width="10" height="16.67" rx="1.67" stroke="#51A2FF" strokeWidth="1.67"/>
                    <rect x="1.67" y="10" width="3.33" height="8.33" rx="1.67" stroke="#51A2FF" strokeWidth="1.67"/>
                    <rect x="15" y="7.50" width="3.33" height="10.83" rx="1.67" stroke="#51A2FF" strokeWidth="1.67"/>
                  </svg>
                </div>
                <div className="ad-stat-number">{statsView.totalHotels}</div>
                <div className="ad-stat-label">Total Hotels</div>
                <div className="ad-stat-sub">{statsView.totalHotels} owner-registered · click to view</div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-icon" style={{ background: 'rgba(0, 212, 146, 0.10)' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="1.67" y="5.83" width="16.67" height="8.33" rx="1.67" stroke="#00D492" strokeWidth="1.67"/>
                    <rect x="13.33" y="5.83" width="5" height="5" rx="1.67" stroke="#00D492" strokeWidth="1.67"/>
                  </svg>
                </div>
                <div className="ad-stat-number">{statsView.totalBookings}</div>
                <div className="ad-stat-label">Total Bookings</div>
                <div className="ad-stat-sub">all bookings in the system</div>
              </div>
              <div className="ad-stat-card ad-stat-hover" onClick={() => setActiveTab('reviews')}>
                <div className="ad-stat-icon" style={{ background: 'rgba(255, 185, 0, 0.10)' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="1.67" y="1.67" width="16.67" height="15.89" rx="1.67" stroke="#FFB900" strokeWidth="1.67"/>
                  </svg>
                </div>
                <div className="ad-stat-number">{statsView.totalReviews}</div>
                <div className="ad-stat-label">Total Reviews</div>
                <div className="ad-stat-sub">across all properties · click to view</div>
              </div>
              <div className="ad-stat-card ad-stat-hover" onClick={() => setActiveTab('users')}>
                <div className="ad-stat-icon" style={{ background: 'rgba(81, 162, 255, 0.10)' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="7" cy="7" r="3.33" stroke="#51A2FF" strokeWidth="1.67"/>
                    <circle cx="15" cy="7" r="2.17" stroke="#51A2FF" strokeWidth="1.67"/>
                    <path d="M1.67 16.67C1.67 12.72 3.83 10 7 10C10.17 10 12.33 12.72 12.33 16.67" stroke="#51A2FF" strokeWidth="1.67" strokeLinecap="round"/>
                    <path d="M13.33 10.83C15.83 11.17 17.5 13.33 17.5 16.67" stroke="#51A2FF" strokeWidth="1.67" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="ad-stat-number">{statsView.totalUsers}</div>
                <div className="ad-stat-label">Total Users</div>
                <div className="ad-stat-sub">registered traveler accounts · click to view</div>
              </div>
              <div
                className="ad-stat-card ad-stat-hover"
                onClick={() => { setHotelRatingFilter('low'); setActiveTab('hotels'); }}
              >
                <div className="ad-stat-icon" style={{ background: 'rgba(255, 100, 103, 0.10)' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3.33" y="1.67" width="13.33" height="16.67" rx="1.67" stroke="#FF6467" strokeWidth="1.67"/>
                  </svg>
                </div>
                <div className="ad-stat-number">{statsView.flagged}</div>
                <div className="ad-stat-label">Flagged Hotels</div>
                <div className="ad-stat-sub">rating below 3.0 · click to view</div>
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
                    onClick={() => { setHotelRatingFilter('low'); setActiveTab('hotels'); }}
                  >
                    <span>Manage </span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="6" y="2.50" width="7" height="3.50" rx="0.50" stroke="#FFB900" strokeWidth="1"/>
                    </svg>
                  </div>
                </div>
                {(() => {
                  const flagged = registeredHotels.filter(h => (h.rating || 0) < 3);
                  return flagged.length > 0 ? (
                    <div className="ad-hotel-list">
                      {flagged.map((h, i) => (
                        <div key={h.id} className="ad-hotel-row" style={{ cursor: 'pointer' }} onClick={() => { setSelectedHotel(h); }}>
                          <div className="ad-user-avatar" style={{ width: 36, height: 36, fontSize: 12, borderRadius: 10, background: '#314158' }}>
                            {(h.name || 'H')[0]}
                          </div>
                          <div className="ad-hotel-info">
                            <div className="ad-hotel-name">{h.name}</div>
                            <div className="ad-hotel-location">{h.city || h.location || 'N/A'}</div>
                          </div>
                          <div className="ad-rating-badge" style={{ color: '#FF6467', background: 'rgba(255, 100, 103, 0.10)' }}>
                            {h.rating || 'N/A'}
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

              {/* RECENT BOOKINGS */}
              <div className="ad-panel">
                <div className="ad-panel-header">
                  <div className="ad-panel-title">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1.33" y="1.33" width="13.33" height="12.71" rx="1.33" stroke="#FFB900" strokeWidth="1.33"/>
                    </svg>
                    Recent Bookings
                  </div>
                </div>
                {recentBookings.length > 0 && (
                  <div className="ad-booking-chips">
                    <span className="ad-booking-chip ad-booking-chip-confirmed">
                      {recentBookings.filter(b => b.status === 'confirmed').length} confirmed
                    </span>
                    <span className="ad-booking-chip ad-booking-chip-pending">
                      {recentBookings.filter(b => b.status === 'pending').length} pending
                    </span>
                    <span className="ad-booking-chip ad-booking-chip-cancelled">
                      {recentBookings.filter(b => b.status === 'cancelled').length} cancelled
                    </span>
                  </div>
                )}
                {bookingsLoading ? (
                  <div className="ad-empty-state">
                    <p className="ad-empty-title">Loading bookings...</p>
                  </div>
                ) : recentBookings.length > 0 ? (
                  <div className="ad-hotel-list">
                    {recentBookings.map((b) => (
                      <div
                        key={b.id}
                        className="ad-hotel-row"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const h = registeredHotels.find(x => x.id === b.hotel_id);
                          if (h) setSelectedHotel(h);
                        }}
                      >
                        <div className="ad-user-avatar" style={{ width: 36, height: 36, fontSize: 12, borderRadius: 10, background: '#314158' }}>
                          {(b.hotel_name || 'H')[0]}
                        </div>
                        <div className="ad-hotel-info">
                          <div className="ad-hotel-name">{b.hotel_name}</div>
                          <div className="ad-hotel-location">
                            {b.guest_name || b.user_name} · {b.booking_code}
                          </div>
                        </div>
                        <div className="ad-booking-right">
                          <div className="ad-booking-amount">{formatLKRFixed(b.total_price || 0)}</div>
                          <div className={`ad-booking-status ad-booking-status-${b.status}`}>{b.status}</div>
                          <div className="ad-booking-date">
                            {new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ad-empty-state">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.20">
                      <rect x="2.66" y="2.67" width="26.67" height="25.43" rx="2.67" stroke="#62748E" strokeWidth="2.67"/>
                    </svg>
                    <p className="ad-empty-title">No bookings yet</p>
                    <p className="ad-empty-sub">Bookings will appear here once guests make reservations</p>
                  </div>
                )}
              </div>

              {/* TOP RATED HOTELS */}
              <div className="ad-panel">
                <div className="ad-panel-header">
                  <div className="ad-panel-title">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1.33" y="1.33" width="13.33" height="13.33" rx="1.33" stroke="#FFB900" strokeWidth="1.33"/>
                      <rect x="7.33" y="1.33" width="1.33" height="13.33" rx="0.67" fill="#FFB900"/>
                    </svg>
                    Top Rated Hotels
                  </div>
                  <div className="ad-panel-manage" onClick={() => setActiveTab('hotels')}>
                    <span>View all </span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="6" y="2.50" width="7" height="3.50" rx="0.50" stroke="#FFB900" strokeWidth="1"/>
                    </svg>
                  </div>
                </div>
                {topHotels.length > 0 ? (
                  <div className="ad-hotel-list">
                    {topHotels.map((h, i) => (
                      <div
                        key={h.id}
                        className="ad-hotel-row"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedHotel(h)}
                      >
                        <div className="ad-rank">{i + 1}</div>
                        <div className="ad-user-avatar" style={{ width: 36, height: 36, fontSize: 12, borderRadius: 10, background: '#314158' }}>
                          {(h.name || 'H')[0]}
                        </div>
                        <div className="ad-hotel-info">
                          <div className="ad-hotel-name">{h.name}</div>
                          <div className="ad-hotel-location">{h.city || h.location || 'N/A'}</div>
                        </div>
                        <div className="ad-rating-badge" style={{ color: '#FFB900', background: 'rgba(255, 185, 0, 0.10)' }}>
                          {h.rating}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ad-empty-state">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.20">
                      <rect x="2.66" y="2.67" width="26.67" height="25.43" rx="2.67" stroke="#62748E" strokeWidth="2.67"/>
                    </svg>
                    <p className="ad-empty-title">No ratings yet</p>
                    <p className="ad-empty-sub">Top rated hotels will appear here once guests rate them</p>
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
                  {hotelRatingFilter === 'low'
                    ? `${filteredHotels.length} flagged ${filteredHotels.length === 1 ? 'hotel' : 'hotels'} (rating below 3.0)`
                    : `${registeredHotels.length} registered ${registeredHotels.length === 1 ? 'hotel' : 'hotels'}`}
                </p>
              </div>
              {hotelRatingFilter !== 'all' && (
                <div
                  className="ad-panel-manage"
                  onClick={() => { setHotelRatingFilter('all'); setHotelSearchQuery(''); }}
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
              <select
                className="ad-rev-sort"
                value={hotelRatingFilter}
                onChange={e => setHotelRatingFilter(e.target.value)}
              >
                <option value="all">All ratings</option>
                <option value="high">4.0 and above</option>
                <option value="low">Below 3.0 (flagged)</option>
              </select>
            </div>

            <div className="ad-hotel-grid" style={{ paddingTop: 24 }}>
              {hotelsLoading ? (
                <p className="ad-empty-title" style={{ paddingTop: 48, textAlign: 'center', width: '100%' }}>Loading hotels...</p>
              ) : filteredHotels.length > 0 ? (
                filteredHotels.map((h) => (
                  <div
                    key={h.id}
                    className="ad-stat-card ad-hotel-card"
                    onClick={() => handleViewHotel(h)}
                  >
                    <div className="ad-hotel-card-img">
                      {h.image_url ? (
                        <img src={h.image_url} alt={h.name} className="ad-hotel-card-img-src" />
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
                        {h.name}
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
                        {h.owner_name || 'Owner'} · {h.owner_email || ''}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12 }}>
                        <div
                          className="ad-rating-badge"
                          style={Number(h.rating || 0) < 3 && h.rating ? { color: '#FF6467', background: 'rgba(255, 100, 103, 0.10)' } : undefined}
                        >
                          {h.rating || 'N/A'}
                        </div>
                        <span className="ad-hotel-location" style={{ fontSize: 11 }}>
                          {h.total_bookings || 0} bookings
                        </span>
                        {getAmenitiesList(h).length > 0 && (
                          <span className="ad-hotel-location" style={{ fontSize: 11 }}>
                            · {getAmenitiesList(h).length} amenities
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className="ad-page-title">Reviews</h1>
                <p className="ad-page-date">
                  {allReviews.length} {allReviews.length === 1 ? 'review' : 'reviews'} across all hotels
                </p>
              </div>
            </div>

            {reviewsLoading ? (
              <p className="ad-empty-title" style={{ paddingTop: 48, textAlign: 'center', width: '100%' }}>Loading reviews...</p>
            ) : allReviews.length === 0 ? (
              <p className="ad-empty-title" style={{ paddingTop: 48 }}>
                No reviews yet. Reviews submitted by guests will appear here.
              </p>
            ) : (
              <>
                {/* SUMMARY */}
                <div className="ad-rev-summary-row">
                  <div className="ad-rev-summary">
                    <div className="ad-rev-summary-left">
                      <div className="ad-rev-avg">{reviewStats.avg}</div>
                      <div className="ad-rev-stars">
                        {[1, 2, 3, 4, 5].map(s => (
                          <svg key={s} width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect x="1.17" y="1.17" width="11.67" height="11.13" rx="1.17"
                              fill={s <= Math.round(Number(reviewStats.avg)) ? '#FFB900' : 'none'}
                              stroke="#FFB900" strokeWidth="1.17" />
                          </svg>
                        ))}
                      </div>
                      <div className="ad-rev-count">Based on {allReviews.length} reviews</div>
                    </div>
                    <div className="ad-rev-summary-bars">
                      {[5, 4, 3, 2, 1].map(s => {
                        const d = reviewStats.distribution[s] || { count: 0, pct: 0 };
                        return (
                          <div key={s} className="ad-rev-bar-row">
                            <span className="ad-rev-bar-label">{s}</span>
                            <div className="ad-rev-bar-track">
                              <div
                                className="ad-rev-bar-fill"
                                style={{ width: `${d.pct}%`, background: s >= 4 ? '#00D492' : s === 3 ? '#FFB900' : '#FF6467' }}
                              />
                            </div>
                            <span className="ad-rev-bar-count">{d.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* HOTEL BREAKDOWN */}
                  <div className="ad-rev-summary ad-rev-hotel-breakdown">
                    <div className="ad-rev-breakdown-title">Reviews by hotel</div>
                    {hotelReviewBreakdown.length > 0 ? (
                      <div className="ad-rev-breakdown-list">
                        {hotelReviewBreakdown.map(h => (
                          <div
                            key={h.name}
                            className="ad-rev-breakdown-row"
                            onClick={() => { setReviewSearchQuery(h.name); }}
                            title="Filter reviews for this hotel"
                          >
                            <span className="ad-rev-breakdown-name">{h.name}</span>
                            <span className="ad-rev-breakdown-bar">
                              <span
                                className="ad-rev-breakdown-bar-fill"
                                style={{ width: `${Math.round((h.count / allReviews.length) * 100)}%` }}
                              />
                            </span>
                            <span className="ad-rev-breakdown-meta">{h.count} · {h.avg}★</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="ad-empty-state" style={{ padding: '24px 8px' }}>
                        <p className="ad-empty-title">No reviews yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* TOOLBAR */}
                <div className="ad-rev-toolbar">
                  <div className="ad-rev-search">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="2" width="10.67" height="10.67" rx="1.33" stroke="#62748E" strokeWidth="1.33"/>
                      <rect x="11.13" y="11.13" width="2.87" height="2.87" rx="1.33" stroke="#62748E" strokeWidth="1.33"/>
                    </svg>
                    <input
                      className="ad-rev-search-input"
                      placeholder="Search by hotel, guest, or comment..."
                      value={reviewSearchQuery}
                      onChange={e => setReviewSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    className={`ad-rev-filter-btn ${reviewFilter === 'low' ? 'ad-rev-filter-active' : ''}`}
                    onClick={() => setReviewFilter(prev => prev === 'low' ? 'all' : 'low')}
                  >
                    <span className="ad-rev-badge-low" style={{ padding: '2px 8px' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <rect x="2.67" y="1.33" width="6.67" height="8.33" rx="1" stroke="#FF6467" strokeWidth="1.1"/>
                        <rect x="5" y="1.33" width="2" height="1.67" rx="0.5" fill="#FF6467"/>
                      </svg>
                      Low ratings (&lt;3)
                    </span>
                  </button>
                  <select
                    className="ad-rev-sort"
                    value={reviewSort}
                    onChange={e => setReviewSort(e.target.value)}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="highest">Highest rated</option>
                    <option value="lowest">Lowest rated</option>
                  </select>
                </div>

                {/* REVIEW CARDS */}
                {filteredReviews.length > 0 ? (
                  <>
                    <div className="ad-rev-cards">
                      {paginatedReviews.map(r => (
                        <div
                          key={r.id}
                          className="ad-rev-card"
                          onClick={() => setSelectedReview(r)}
                        >
                          <div className="ad-rev-card-top">
                            <div className="ad-rev-card-user">
                              <div className="ad-rev-avatar">{(r.user_name || 'G').charAt(0).toUpperCase()}</div>
                              <div>
                                <div className="ad-rev-card-name">{r.user_name}</div>
                                <div className="ad-rev-card-stars">
                                  {[1, 2, 3, 4, 5].map(s => (
                                    <svg key={s} width="12" height="12" viewBox="0 0 14 14" fill="none">
                                      <rect x="1.17" y="1.17" width="11.67" height="11.13" rx="1.17"
                                        fill={s <= Math.round(Number(r.rating || 0)) ? '#FFB900' : 'none'}
                                        stroke="#FFB900" strokeWidth="1.17" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="ad-rev-card-meta">
                              <span
                                className="ad-rev-card-hotel ad-rev-card-hotel-link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const h = registeredHotels.find(x => x.id === r.hotel_id);
                                  if (h) setSelectedHotel(h);
                                }}
                              >
                                {r.hotel_name}
                              </span>
                              <span className="ad-rev-card-date">
                                {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="ad-rev-card-actions">
                              {r.booking_id && (
                                <span className="ad-rev-badge-verified" title="Review from a confirmed booking">
                                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                    <rect x="1.5" y="1.5" width="9" height="9" rx="2" stroke="#00D492" strokeWidth="1.1"/>
                                    <path d="M3.5 6L5.2 7.7L8.5 4.5" stroke="#00D492" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Verified stay
                                </span>
                              )}
                              {(Number(r.rating) || 0) < 3 && (
                                <span className="ad-rev-badge-low">
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <rect x="2.67" y="1.33" width="6.67" height="8.33" rx="1" stroke="#FF6467" strokeWidth="1.1"/>
                                    <rect x="5" y="1.33" width="2" height="1.67" rx="0.5" fill="#FF6467"/>
                                  </svg>
                                  Low rating
                                </span>
                              )}
                              <div
                                className="ad-rev-kebab ad-rev-delete"
                                title="Remove review"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmReview(r);
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path d="M2 3.5H12" stroke="#FF6467" strokeWidth="1.2" strokeLinecap="round"/>
                                  <path d="M4.5 3.5V2.5C4.5 2.1 4.8 1.8 5.2 1.8H8.8C9.2 1.8 9.5 2.1 9.5 2.5V3.5" stroke="#FF6467" strokeWidth="1.2" strokeLinecap="round"/>
                                  <path d="M5.5 6.5V10M8.5 6.5V10" stroke="#FF6467" strokeWidth="1.2" strokeLinecap="round"/>
                                  <path d="M3 3.5L3.5 11.5C3.5 11.8 3.8 12 4.1 12H9.9C10.2 12 10.5 11.8 10.5 11.5L11 3.5" stroke="#FF6467" strokeWidth="1.2" strokeLinecap="round"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                          {r.title && <div className="ad-rev-card-title">{r.title}</div>}
                          {r.comment && <div className="ad-rev-card-comment">{r.comment}</div>}
                        </div>
                      ))}
                    </div>

                    {/* PAGINATION */}
                    {filteredReviews.length > PAGE_SIZE && (
                      <div className="ad-pagination">
                        <button
                          className="ad-pagination-btn"
                          disabled={reviewPage <= 1}
                          onClick={() => setReviewPage(p => Math.max(1, p - 1))}
                        >
                          Previous
                        </button>
                        <span className="ad-pagination-info">
                          Page {reviewPage} of {totalPages} · {filteredReviews.length} reviews
                        </span>
                        <button
                          className="ad-pagination-btn"
                          disabled={reviewPage >= totalPages}
                          onClick={() => setReviewPage(p => Math.min(totalPages, p + 1))}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="ad-empty-title" style={{ paddingTop: 48 }}>
                    No reviews match your filter.
                  </p>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className="ad-page-title">Users</h1>
                <p className="ad-page-date">
                  {allUsers.length} registered traveler {allUsers.length === 1 ? 'account' : 'accounts'}
                </p>
              </div>
            </div>

            {/* TOOLBAR */}
            <div className="ad-rev-toolbar" style={{ marginTop: 16 }}>
              <div className="ad-rev-search">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="10.67" height="10.67" rx="1.33" stroke="#62748E" strokeWidth="1.33"/>
                  <rect x="11.13" y="11.13" width="2.87" height="2.87" rx="1.33" stroke="#62748E" strokeWidth="1.33"/>
                </svg>
                <input
                  className="ad-rev-search-input"
                  placeholder="Search by name, email, or phone..."
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {usersLoading ? (
              <p className="ad-empty-title" style={{ paddingTop: 48, textAlign: 'center', width: '100%' }}>Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="ad-empty-title" style={{ paddingTop: 48 }}>
                {userSearchQuery ? 'No users match your search.' : 'No traveler users yet. Registered users will appear here.'}
              </p>
            ) : (
              <div className="ad-user-list">
                {filteredUsers.map(u => (
                  <div
                    key={u.id}
                    className="ad-user-row-card"
                    onClick={() => { setSelectedUser(u); userDetailMutation.reset(); userDetailMutation.mutate(u.id); }}
                  >
                    <div className="ad-user-avatar" style={{ width: 40, height: 40, fontSize: 15, borderRadius: 12, background: '#314158' }}>
                      {(u.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="ad-user-info">
                      <div className="ad-user-info-name-row">
                        <div className="ad-hotel-name">{u.name}</div>
                        {u.is_active === 0 && (
                          <span className="ad-user-status-badge ad-user-status-inactive">Inactive</span>
                        )}
                      </div>
                      <div className="ad-hotel-location">{u.email}</div>
                    </div>
                    <div className="ad-user-stats">
                      <span className="ad-user-stat-pill">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <rect x="1.33" y="5.83" width="13.33" height="6.67" rx="1.33" stroke="#51A2FF" strokeWidth="1.33"/>
                          <rect x="11.33" y="5.83" width="4" height="4" rx="1.33" stroke="#51A2FF" strokeWidth="1.33"/>
                        </svg>
                        {u.bookings_count || 0} bookings
                      </span>
                      <span className="ad-user-stat-pill">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <rect x="1.33" y="1.33" width="13.33" height="12.71" rx="1.33" stroke="#FFB900" strokeWidth="1.33"/>
                        </svg>
                        {u.reviews_count || 0} reviews
                      </span>
                    </div>
                    <div className="ad-user-row-chevron">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M5 3l4 4-4 4" stroke="#90A1B9" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* REVIEW DETAIL MODAL */}
        {selectedReview && (
          <div className="ad-modal-overlay" onClick={() => setSelectedReview(null)}>
            <div className="ad-modal" onClick={e => e.stopPropagation()}>
              <div className="ad-modal-header">
                <div className="ad-modal-title">Review Details</div>
                <div className="ad-modal-close" onClick={() => setSelectedReview(null)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="4" y="4" width="12.80" height="1.60" rx="0.80" fill="#90A1B9" transform="rotate(45 4 4)"/>
                    <rect x="4" y="12.80" width="12.80" height="1.60" rx="0.80" fill="#90A1B9" transform="rotate(-45 4 12.80)"/>
                  </svg>
                </div>
              </div>
              <div className="ad-modal-body">
                <div className="ad-modal-user">
                  <div className="ad-modal-avatar">{(selectedReview.user_name || 'G').charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="ad-modal-name">{selectedReview.user_name}</div>
                    <div className="ad-modal-email">{selectedReview.user_email || ''}</div>
                  </div>
                </div>
                <div className="ad-modal-stars">
                  {[1, 2, 3, 4, 5].map(s => (
                    <svg key={s} width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="1.17" y="1.17" width="11.67" height="11.13" rx="1.17"
                        fill={s <= Math.round(Number(selectedReview.rating || 0)) ? '#FFB900' : 'none'}
                        stroke="#FFB900" strokeWidth="1.17" />
                    </svg>
                  ))}
                  <span className="ad-modal-rating">{selectedReview.rating} / 5</span>
                  {selectedReview.booking_id && (
                    <span className="ad-rev-badge-verified" style={{ marginLeft: 8 }}>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <rect x="1.5" y="1.5" width="9" height="9" rx="2" stroke="#00D492" strokeWidth="1.1"/>
                        <path d="M3.5 6L5.2 7.7L8.5 4.5" stroke="#00D492" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Verified stay
                    </span>
                  )}
                </div>
                <div className="ad-modal-hotel-badge">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1.17" y="1.17" width="11.67" height="11.13" rx="1.17" stroke="#CAD5E2" strokeWidth="1.17"/>
                  </svg>
                  <span>{selectedReview.hotel_name}</span>
                </div>
                {selectedReview.title && (
                  <div className="ad-modal-comment-section">
                    <div className="ad-modal-comment-label">Title</div>
                    <div className="ad-modal-comment-text">{selectedReview.title}</div>
                  </div>
                )}
                {selectedReview.comment && (
                  <div className="ad-modal-comment-section">
                    <div className="ad-modal-comment-label">Comment</div>
                    <div className="ad-modal-comment-text">{selectedReview.comment}</div>
                  </div>
                )}
                <div className="ad-modal-date">
                  {new Date(selectedReview.created_at).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE REVIEW CONFIRM MODAL */}
        {deleteConfirmReview && (
          <div className="ad-modal-overlay" onClick={() => setDeleteConfirmReview(null)}>
            <div className="ad-modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
              <div className="ad-modal-body" style={{ textAlign: 'center', paddingTop: 32 }}>
                <div className="ad-delete-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6H21" stroke="#FF6467" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="#FF6467" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="#FF6467" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10 11V17M14 11V17" stroke="#FF6467" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="ad-modal-title" style={{ fontSize: 18, paddingTop: 16 }}>Remove Review</div>
                <p className="ad-delete-text">
                  The review by <strong>{deleteConfirmReview.user_name}</strong> for
                  <strong> {deleteConfirmReview.hotel_name}</strong> will be permanently removed.
                  This action cannot be undone.
                </p>
                <div className="ad-modal-actions">
                  <button className="ad-modal-btn ad-modal-btn-close" onClick={() => setDeleteConfirmReview(null)}>
                    Cancel
                  </button>
                  <button
                    className="ad-modal-btn ad-modal-btn-delete"
                    disabled={deleteReview.isPending}
                    onClick={() => {
                      deleteReview.mutate(deleteConfirmReview.id);
                      setDeleteConfirmReview(null);
                    }}
                  >
                    {deleteReview.isPending ? 'Removing...' : 'Remove Review'}
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
                {selectedHotel.image_url ? (
                  <img
                    src={selectedHotel.image_url}
                    alt={selectedHotel.name}
                    className="ad-hotel-modal-img"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
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
                    {selectedHotel.name}
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
                        fill={s <= Math.round(Number(selectedHotel.rating || 0)) ? '#FFB900' : 'none'}
                        stroke={'#FFB900'}
                        strokeWidth="1.17"
                      />
                    </svg>
                  ))}
                  <span className="ad-hotel-modal-rating-text">
                    {selectedHotel.rating || 'N/A'}
                  </span>
                  <span className="ad-hotel-modal-review-count">
                    {selectedHotel.confirmed_bookings || 0} bookings
                  </span>
                </div>

                {/* STATS */}
                <div className="ad-hotel-modal-stats">
                  <div className="ad-hotel-modal-stat">
                    <div className="ad-hotel-modal-stat-value">{selectedHotel.total_bookings || 0}</div>
                    <div className="ad-hotel-modal-stat-label">Total bookings</div>
                  </div>
                  <div className="ad-hotel-modal-stat">
                    <div className="ad-hotel-modal-stat-value">{selectedHotel.confirmed_bookings || 0}</div>
                    <div className="ad-hotel-modal-stat-label">Confirmed</div>
                  </div>
                  <div className="ad-hotel-modal-stat">
                    <div className="ad-hotel-modal-stat-value">{selectedHotel.owner_phone || '—'}</div>
                    <div className="ad-hotel-modal-stat-label">Owner phone</div>
                  </div>
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

                {/* OWNER INFO */}
                <div className="ad-hotel-modal-section">
                  <div className="ad-hotel-modal-section-label">Owner</div>
                  <div className="ad-hotel-modal-section-text">
                    {selectedHotel.owner_name || 'N/A'} ({selectedHotel.owner_email || 'N/A'})
                  </div>
                </div>

                <div className="ad-hotel-modal-section">
                  <div className="ad-hotel-modal-section-label">Status</div>
                  <div className="ad-hotel-modal-section-text" style={{ textTransform: 'capitalize' }}>
                    {selectedHotel.status || 'active'}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="ad-modal-actions">
                  <button className="ad-modal-btn ad-modal-btn-close" onClick={handleCloseHotel}>
                    Close
                  </button>
                  <button
                    className="ad-modal-btn ad-modal-btn-delete"
                    onClick={() => handleRemoveHotel(selectedHotel.id)}
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

        {/* USER DETAIL MODAL */}
        {selectedUser && (
          <div className="ad-modal-overlay" onClick={() => setSelectedUser(null)}>
            <div className="ad-modal ad-card-modal" onClick={e => e.stopPropagation()}>
              <div className="ad-modal-header">
                <div className="ad-modal-title">User Details</div>
                <div className="ad-modal-close" onClick={() => setSelectedUser(null)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="4" y="4" width="12.80" height="1.60" rx="0.80" fill="#90A1B9" transform="rotate(45 4 4)"/>
                    <rect x="4" y="12.80" width="12.80" height="1.60" rx="0.80" fill="#90A1B9" transform="rotate(-45 4 12.80)"/>
                  </svg>
                </div>
              </div>
              <div className="ad-card-modal-scroll">
                <div className="ad-modal-user">
                  <div className="ad-modal-avatar">{(selectedUser.name || 'U').charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="ad-modal-name">{selectedUser.name}</div>
                    <div className="ad-modal-email">{selectedUser.email}</div>
                  </div>
                </div>

                {userDetailMutation.isPending && (
                  <p className="ad-empty-title" style={{ paddingTop: 24, textAlign: 'center' }}>Loading user details...</p>
                )}

                {userDetailMutation.isSuccess && userDetailMutation.data && (
                  <>
                    <div className="ad-user-detail-stats">
                      <div className="ad-user-detail-stat">
                        <div className="ad-user-detail-stat-value">{userDetailMutation.data.bookings_count ?? 0}</div>
                        <div className="ad-user-detail-stat-label">Bookings</div>
                      </div>
                      <div className="ad-user-detail-stat">
                        <div className="ad-user-detail-stat-value">{userDetailMutation.data.reviews_count ?? 0}</div>
                        <div className="ad-user-detail-stat-label">Reviews</div>
                      </div>
                      <div className="ad-user-detail-stat">
                        <div className="ad-user-detail-stat-value">
                          <span style={{ textTransform: 'capitalize' }}>{selectedUser.role || 'traveler'}</span>
                        </div>
                        <div className="ad-user-detail-stat-label">Role</div>
                      </div>
                    </div>

                    {selectedUser.phone && (
                      <div className="ad-user-detail-row">
                        <span className="ad-user-detail-row-label">Phone</span>
                        <span className="ad-user-detail-row-value">{selectedUser.phone}</span>
                      </div>
                    )}
                    <div className="ad-user-detail-row">
                      <span className="ad-user-detail-row-label">Joined</span>
                      <span className="ad-user-detail-row-value">
                        {new Date(selectedUser.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="ad-user-detail-row">
                      <span className="ad-user-detail-row-label">Account status</span>
                      <span className="ad-user-detail-row-value">
                        <span className={`ad-rev-badge-verified ${selectedUser.is_active === 0 ? 'ad-rev-badge-inactive' : ''}`} style={{ padding: '2px 8px' }}>
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <rect x="1.5" y="1.5" width="9" height="9" rx="2" stroke={selectedUser.is_active === 0 ? '#FF6467' : '#00D492'} strokeWidth="1.1"/>
                            <path d="M3.5 6L5.2 7.7L8.5 4.5" stroke={selectedUser.is_active === 0 ? '#FF6467' : '#00D492'} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {selectedUser.is_active === 0 ? 'Inactive' : 'Active'}
                        </span>
                      </span>
                    </div>
                    <div className="ad-user-detail-row">
                      <span className="ad-user-detail-row-label">Email verified</span>
                      <span className="ad-user-detail-row-value">
                        <span className={`ad-rev-badge-verified`} style={{ padding: '2px 8px' }}>
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <rect x="1.5" y="1.5" width="9" height="9" rx="2" stroke={selectedUser.email_verified ? '#00D492' : '#FF6467'} strokeWidth="1.1"/>
                            <path d="M3.5 6L5.2 7.7L8.5 4.5" stroke={selectedUser.email_verified ? '#00D492' : '#FF6467'} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {selectedUser.email_verified ? 'Verified' : 'Not verified'}
                        </span>
                      </span>
                    </div>

                    {userDetailMutation.data.bookings?.length > 0 && (
                      <div className="ad-user-detail-section">
                        <div className="ad-user-detail-section-label">Bookings</div>
                        <div className="ad-user-detail-subs">
                          {userDetailMutation.data.bookings.map(b => (
                            <div key={b.id} className="ad-user-detail-sub">
                              <div className="ad-user-detail-sub-head">
                                <span className="ad-user-detail-sub-title">{b.hotel_name}</span>
                                <span className={`ad-user-detail-sub-status ad-user-detail-sub-status-${b.status}`}>
                                  {b.status}
                                </span>
                              </div>
                              <div className="ad-user-detail-sub-meta">
                                {b.room_type} · {b.check_in} → {b.check_out} · {b.guests} guest(s)
                              </div>
                              <div className="ad-user-detail-sub-meta">
                                {b.booking_code} · {formatLKRFixed(b.total_price)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {userDetailMutation.data.reviews?.length > 0 && (
                      <div className="ad-user-detail-section">
                        <div className="ad-user-detail-section-label">Reviews</div>
                        <div className="ad-user-detail-subs">
                          {userDetailMutation.data.reviews.map(r => (
                            <div key={r.id} className="ad-user-detail-sub">
                              <div className="ad-user-detail-sub-head">
                                <span className="ad-user-detail-sub-title">{r.hotel_name}</span>
                                <span className="ad-user-detail-sub-stars">
                                  {r.rating} <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1.17" y="1.17" width="11.67" height="11.13" rx="1.17" fill="#FFB900" stroke="#FFB900" strokeWidth="1.17"/></svg>
                                </span>
                              </div>
                              {r.comment && <div className="ad-user-detail-sub-comment">{r.comment}</div>}
                              <div className="ad-user-detail-sub-meta">
                                {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="ad-card-modal-footer">
                <div className="ad-modal-actions" style={{ margin: 0 }}>
                  <button className="ad-modal-btn ad-modal-btn-close" onClick={() => setSelectedUser(null)}>
                    Close
                  </button>
                  <button
                    className="ad-modal-btn ad-modal-btn-delete"
                    disabled={deleteUser.isPending || selectedUser.is_active === 0}
                    onClick={() => { setDeleteConfirmUser(selectedUser); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="3.33" y="4" width="9.33" height="10.67" rx="1.33" stroke="#FF6467" strokeWidth="1.33"/>
                      <rect x="5.33" y="1.33" width="5.33" height="2.67" rx="1.33" stroke="#FF6467" strokeWidth="1.33"/>
                    </svg>
                    {selectedUser.is_active === 0 ? 'Deactivated' : 'Deactivate User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE USER CONFIRM MODAL */}
        {deleteConfirmUser && (
          <div className="ad-modal-overlay" onClick={() => setDeleteConfirmUser(null)}>
            <div className="ad-modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
              <div className="ad-modal-body" style={{ textAlign: 'center', paddingTop: 32 }}>
                <div className="ad-delete-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6H21" stroke="#FF6467" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="#FF6467" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="#FF6467" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10 11V17M14 11V17" stroke="#FF6467" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="ad-modal-title" style={{ fontSize: 18, paddingTop: 16 }}>Deactivate User</div>
                <p className="ad-delete-text">
                  <strong>{deleteConfirmUser.name}</strong> will be deactivated and will no longer be able
                  to log in to the system. Their data will be preserved.
                </p>
                <div className="ad-modal-actions">
                  <button className="ad-modal-btn ad-modal-btn-close" onClick={() => setDeleteConfirmUser(null)}>
                    Cancel
                  </button>
                  <button
                    className="ad-modal-btn ad-modal-btn-delete"
                    disabled={deleteUser.isPending}
                    onClick={() => {
                      deleteUser.mutate(deleteConfirmUser.id);
                      setSelectedUser(null);
                      setDeleteConfirmUser(null);
                    }}
                  >
                    {deleteUser.isPending ? 'Deactivating...' : 'Deactivate User'}
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
