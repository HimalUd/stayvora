import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hotelsAPI } from '../utils/api';
import SearchHotelCard from '../components/SearchHotelCard/SearchHotelCard';
import FilterPanel from '../components/FilterPanel/FilterPanel';
import { formatDisplay } from '../components/CalendarPicker/CalendarPicker';
import { formatLKRFixed } from '../utils/currency';
import './SearchResults.css';

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const buildParams = () => {
    const p = {};
    const locationVal = searchParams.get('location');
    const checkInVal = searchParams.get('check_in');
    const checkOutVal = searchParams.get('check_out');
    const guestsVal = searchParams.get('guests');
    const roomsVal = searchParams.get('rooms');
    const minPriceVal = searchParams.get('min_price');
    const maxPriceVal = searchParams.get('max_price');
    const ratingVal = searchParams.get('rating');
    const purposeVal = searchParams.get('travel_purpose');
    const eventVal = searchParams.get('event');
    const amenityVal = searchParams.get('amenity');
    if (locationVal) p.location = locationVal;
    if (checkInVal) p.check_in = checkInVal;
    if (checkOutVal) p.check_out = checkOutVal;
    if (guestsVal) p.guests = guestsVal;
    if (roomsVal) p.rooms = roomsVal;
    if (minPriceVal) p.min_price = minPriceVal;
    if (maxPriceVal) p.max_price = maxPriceVal;
    if (ratingVal) p.rating = ratingVal;
    if (purposeVal) p.travel_purpose = purposeVal;
    if (eventVal) p.event = eventVal;
    if (amenityVal) p.amenity = amenityVal;
    return p;
  };

  const initialFilters = {
    location: searchParams.get('location') || '',
    check_in: searchParams.get('check_in') || '',
    check_out: searchParams.get('check_out') || '',
    guests: searchParams.get('guests') || '',
    rooms: searchParams.get('rooms') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    rating: searchParams.get('rating') || '',
    travel_purpose: searchParams.get('travel_purpose') || '',
    event: searchParams.get('event') || '',
    amenity: searchParams.get('amenity') || '',
  };

  const queryParams = buildParams();
  const hasParams = Object.keys(queryParams).length > 0;

  const { data: rawHotels = [], isLoading: loading } = useQuery({
    queryKey: hasParams ? ['hotels', 'search', queryParams] : ['hotels', 'list'],
    queryFn: () => (hasParams ? hotelsAPI.search(queryParams) : hotelsAPI.list()).then(r => r.data.hotels || []),
  });

  const displayHotels = rawHotels.map(h => ({
    id: h.id,
    name: h.name,
    location: h.location || h.city || '',
    city: h.city || '',
    desc: h.description || '',
    price: h.min_room_price || 0,
    rating: h.rating || 0,
    reviews: h.total_reviews || 0,
    image: h.image || (h.images && h.images.length > 0 ? (typeof h.images[0] === 'string' ? h.images[0] : h.images[0].image_url) : ''),
    tags: h.amenities ? h.amenities.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3) : [],
  }));

  const [sortBy, setSortBy] = useState('recommended');
  const [searchText, setSearchText] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const sortedHotels = displayHotels
    .filter(h => {
      if (!searchApplied) return true;
      const q = searchApplied.toLowerCase();
      return (h.name || '').toLowerCase().includes(q)
        || (h.location || '').toLowerCase().includes(q)
        || (h.city || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'rating_desc': return b.rating - a.rating;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  const handleFilter = (filters) => {
    const params = new URLSearchParams();
    if (filters.location) params.set('location', filters.location);
    if (filters.check_in) params.set('check_in', filters.check_in);
    if (filters.check_out) params.set('check_out', filters.check_out);
    if (filters.guests) params.set('guests', filters.guests);
    if (filters.rooms) params.set('rooms', filters.rooms);
    if (filters.min_price) params.set('min_price', filters.min_price);
    if (filters.max_price) params.set('max_price', filters.max_price);
    if (filters.rating) params.set('rating', filters.rating);
    if (filters.travel_purpose) params.set('travel_purpose', filters.travel_purpose);
    if (filters.event) params.set('event', filters.event);
    if (filters.amenity) params.set('amenity', filters.amenity);
    navigate(`/search?${params.toString()}`);
  };

  const updateParams = (mutator) => {
    const params = new URLSearchParams(window.location.search);
    mutator(params);
    const qs = params.toString();
    navigate(qs ? `/search?${qs}` : '/search');
  };

  const removeParam = (key) => updateParams((p) => p.delete(key));
  const clearAll = () => navigate('/search');

  const removeFilterChip = (c) => {
    if (c.param) {
      updateParams((p) => {
        const vals = (p.get(c.param) || '').split(',').map(s => s.trim()).filter(Boolean);
        const next = vals.filter(v => v !== c.label);
        if (next.length > 0) p.set(c.param, next.join(','));
        else p.delete(c.param);
      });
    } else {
      removeParam(c.key);
    }
  };

  const criteriaChips = [];
  if (initialFilters.location) criteriaChips.push({ key: 'location', label: initialFilters.location });
  if (initialFilters.check_in && initialFilters.check_out) {
    criteriaChips.push({ key: 'check_in', label: `${formatDisplay(initialFilters.check_in)} - ${formatDisplay(initialFilters.check_out)}`, range: true });
  } else if (initialFilters.check_in) {
    criteriaChips.push({ key: 'check_in', label: `From ${formatDisplay(initialFilters.check_in)}` });
  } else if (initialFilters.check_out) {
    criteriaChips.push({ key: 'check_out', label: `Until ${formatDisplay(initialFilters.check_out)}` });
  }
  if (initialFilters.guests) criteriaChips.push({ key: 'guests', label: `${initialFilters.guests} Guest${Number(initialFilters.guests) > 1 ? 's' : ''}` });
  if (initialFilters.rooms) criteriaChips.push({ key: 'rooms', label: `${initialFilters.rooms} Room${Number(initialFilters.rooms) > 1 ? 's' : ''}` });

  const filterChips = [];
  if (initialFilters.min_price) filterChips.push({ key: 'min_price', label: `Min ${formatLKRFixed(initialFilters.min_price)}` });
  if (initialFilters.max_price) filterChips.push({ key: 'max_price', label: `Max ${formatLKRFixed(initialFilters.max_price)}` });
  if (initialFilters.rating) filterChips.push({ key: 'rating', label: `${initialFilters.rating}★ & up` });
  if (initialFilters.travel_purpose) filterChips.push({ key: 'travel_purpose', label: initialFilters.travel_purpose });
  (initialFilters.event ? initialFilters.event.split(',').map(s => s.trim()).filter(Boolean) : []).forEach(v => filterChips.push({ key: `event:${v}`, param: 'event', label: v }));
  (initialFilters.amenity ? initialFilters.amenity.split(',').map(s => s.trim()).filter(Boolean) : []).forEach(v => filterChips.push({ key: `amenity:${v}`, param: 'amenity', label: v }));

  const title = initialFilters.location ? `Hotels in ${initialFilters.location}` : 'Curated Luxury Hotels';
  const dateLabel = initialFilters.check_in && initialFilters.check_out
    ? `${formatDisplay(initialFilters.check_in)} - ${formatDisplay(initialFilters.check_out)}`
    : '';
  const metaParts = [];
  if (dateLabel) metaParts.push(dateLabel);
  if (initialFilters.guests) metaParts.push(`${initialFilters.guests} guest${Number(initialFilters.guests) > 1 ? 's' : ''}`);
  if (initialFilters.rooms) metaParts.push(`${initialFilters.rooms} room${Number(initialFilters.rooms) > 1 ? 's' : ''}`);

  const totalChips = criteriaChips.length + filterChips.length;

  return (
    <div className="sr-page">
      <div className="sr-layout">
        {/* ===== FILTERS ===== */}
        <aside className="sr-sidebar">
          <FilterPanel onFilter={handleFilter} initialFilters={initialFilters} />
        </aside>

        {/* ===== RESULTS ===== */}
        <main className="sr-main">
          <div className="sr-main-header">
            <div>
              <span className="sr-eyebrow">SEARCH RESULTS</span>
              <h1 className="sr-main-title">{title}</h1>
              <p className="sr-main-subtitle">
                {loading ? 'Searching hotels...' : (
                  <>
                    <strong>{sortedHotels.length}</strong> premium {sortedHotels.length === 1 ? 'property' : 'properties'} match your preferences
                    {metaParts.length > 0 && <span className="sr-meta-sep">·</span>}
                    {metaParts.join(' · ')}
                  </>
                )}
              </p>
            </div>
            <div className="sr-header-controls">
              <div className="sr-view-toggle" role="group" aria-label="View mode">
                <button
                  className={`sr-view-toggle-btn ${viewMode === 'grid' ? 'sr-view-toggle-btn-active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </button>
                <button
                  className={`sr-view-toggle-btn ${viewMode === 'list' ? 'sr-view-toggle-btn-active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="2" width="6" height="3" rx="1" fill="currentColor" />
                    <rect x="9" y="2" width="6" height="3" rx="1" fill="currentColor" />
                    <rect x="1" y="6.5" width="6" height="3" rx="1" fill="currentColor" />
                    <rect x="9" y="6.5" width="6" height="3" rx="1" fill="currentColor" />
                    <rect x="1" y="11" width="6" height="3" rx="1" fill="currentColor" />
                    <rect x="9" y="11" width="6" height="3" rx="1" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <div className="sr-sort-wrap">
                <select className="sr-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="recommended">Sort by: Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Rating: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
                <svg className="sr-sort-chevron" width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="#1A2B49" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <input
                type="text"
                className="sr-search-input"
                placeholder="Search hotels..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setSearchApplied(searchText.trim()); }}
              />
              <button className="sr-search-submit" onClick={() => setSearchApplied(searchText.trim())}>Search</button>
            </div>
          </div>

          {/* ===== SEARCH CRITERIA ===== */}
          {!loading && totalChips > 0 && (
            <div className="sr-criteria-bar">
              <span className="sr-criteria-label">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 3.5h12M4 8h8M6 12.5h4" stroke="#155DFC" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Your search
              </span>
              <div className="sr-criteria-chips">
                {criteriaChips.map((c) => (
                  <button
                    key={c.key}
                    className="sr-criteria-chip"
                    onClick={() => c.range
                      ? updateParams((p) => { p.delete('check_in'); p.delete('check_out'); })
                      : removeParam(c.key)}
                    title="Remove"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1.33c-3.68 0-6.67 2.99-6.67 6.67s2.99 6.67 6.67 6.67 6.67-2.99 6.67-6.67S11.68 1.33 8 1.33z" fill="currentColor" />
                      <path d="M6 6l4 4M10 6l-4 4" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    {c.label}
                  </button>
                ))}
                {filterChips.map((c) => (
                  <button key={c.key} className="sr-criteria-chip sr-criteria-chip-filter" onClick={() => removeFilterChip(c)} title="Remove">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1.33c-3.68 0-6.67 2.99-6.67 6.67s2.99 6.67 6.67 6.67 6.67-2.99 6.67-6.67S11.68 1.33 8 1.33z" fill="currentColor" />
                      <path d="M6 6l4 4M10 6l-4 4" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    {c.label}
                  </button>
                ))}
              </div>
              {filterChips.length > 0 && (
                <button className="sr-criteria-clear" onClick={clearAll}>Clear all filters</button>
              )}
            </div>
          )}

          {/* ===== RESULTS GRID ===== */}
          {loading ? (
            <div className={`sr-hotels-grid sr-skeleton-grid ${viewMode === 'list' ? 'sr-hotels-list' : ''}`}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="sr-skeleton-card">
                  <div className="sr-skeleton-img shimmer" />
                  <div className="sr-skeleton-body">
                    <div className="sr-skeleton-line w60 shimmer" />
                    <div className="sr-skeleton-line w90 shimmer" />
                    <div className="sr-skeleton-line w75 shimmer" />
                    <div className="sr-skeleton-line w40 shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedHotels.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M8 11h6" />
                </svg>
              </div>
              <h3>No hotels found</h3>
              <p>Try adjusting your search filters or explore different destinations.</p>
              <div className="empty-actions">
                <button className="empty-clear-btn" onClick={clearAll}>Clear all filters</button>
                <button className="empty-browse-btn" onClick={() => navigate('/home')}>Browse all hotels</button>
              </div>
            </div>
          ) : (
            <>
              <div className={`sr-hotels-grid ${viewMode === 'list' ? 'sr-hotels-list' : ''}`}>
                {sortedHotels.map(hotel => (
                  <SearchHotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
              <div className="sr-results-count">
                Showing <strong>{sortedHotels.length}</strong> of {displayHotels.length} properties
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}