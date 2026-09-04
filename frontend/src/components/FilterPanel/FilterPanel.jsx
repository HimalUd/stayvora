import React, { useState, useEffect, useRef } from 'react';
import CalendarPicker, { toDateInput, formatDisplay } from '../CalendarPicker/CalendarPicker';
import { EVENT_TYPES } from '../../lib/eventTypes';
import { AMENITIES } from '../../lib/amenities';
import { TRAVEL_PURPOSES } from '../../lib/travelPurposes';
import './FilterPanel.css';

const INITIAL_FILTERS = {
  location: '',
  check_in: '',
  check_out: '',
  guests: '',
  rooms: '',
  min_price: '',
  max_price: '',
  rating: '',
  travel_purpose: '',
  event: '',
  amenity: '',
};

const parseMulti = (val) => (val ? val.split(',').map(s => s.trim()).filter(Boolean) : []);

export default function FilterPanel({ onFilter, initialFilters }) {
  const [filters, setFilters] = useState({ ...INITIAL_FILTERS, ...(initialFilters || {}) });
  const [eventSel, setEventSel] = useState(() => parseMulti(initialFilters?.event));
  const [amenitySel, setAmenitySel] = useState(() => parseMulti(initialFilters?.amenity));

  // Sync local state when URL filters change (back/forward navigation, new search)
  useEffect(() => {
    setFilters({ ...INITIAL_FILTERS, ...(initialFilters || {}) });
    setEventSel(parseMulti(initialFilters?.event));
    setAmenitySel(parseMulti(initialFilters?.amenity));
    setCalOpen(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialFilters)]);

  // Calendar popup state
  const [calOpen, setCalOpen] = useState(null); // 'in' | 'out' | null
  const inFieldRef = useRef(null);
  const outFieldRef = useRef(null);

  useEffect(() => {
    if (!calOpen) return;
    const handleMouseDown = (e) => {
      const field = calOpen === 'in' ? inFieldRef.current : outFieldRef.current;
      if (field && !field.contains(e.target)) setCalOpen(null);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [calOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onFilter({ ...filters, event: eventSel.join(','), amenity: amenitySel.join(',') });
  };

  const handleClear = () => {
    setFilters(INITIAL_FILTERS);
    setEventSel([]);
    setAmenitySel([]);
    setCalOpen(null);
    onFilter(INITIAL_FILTERS);
  };

  const toggleEvent = (t) => setEventSel(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleAmenity = (a) => setAmenitySel(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const activeCount = [filters, { event: eventSel.join(','), amenity: amenitySel.join(',') }]
    .map(f => Object.values(f).filter(Boolean).filter(v => v.length > 0).length)
    .reduce((a, b) => a + b, 0);

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <div className="filter-header-left">
          <svg className="filter-header-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4h14M4.5 9h9M7 14h4" stroke="#155DFC" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <div>
            <h3 className="filter-title">Filters</h3>
            <p className="filter-subtitle">Refine your results</p>
          </div>
        </div>
        {activeCount > 0 && <span className="filter-count">{activeCount} active</span>}
      </div>

      <div className="filter-grid">
        <div className="filter-group filter-group-full">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="City or hotel name"
            value={filters.location}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group fp-date-group">
          <label htmlFor="check_in">Check-in</label>
          <div className="fp-date-field" ref={inFieldRef}>
            <button
              type="button"
              className="fp-cal-trigger"
              onClick={() => setCalOpen(calOpen === 'in' ? null : 'in')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="#2563EB" strokeWidth="1.25" />
                <path d="M4 1v3M12 1v3M1.5 6h13" stroke="#2563EB" strokeWidth="1.25" />
              </svg>
            </button>
            <input
              id="check_in"
              name="check_in"
              type="text"
              readOnly
              placeholder="Select date"
              value={filters.check_in ? formatDisplay(filters.check_in) : ''}
              onClick={() => setCalOpen(calOpen === 'in' ? null : 'in')}
            />
            {calOpen === 'in' && (
              <CalendarPicker
                value={filters.check_in}
                minDate={toDateInput(new Date())}
                onSelect={(d) => {
                  setFilters((prev) => ({
                    ...prev,
                    check_in: d,
                    check_out: prev.check_out && prev.check_out < d ? '' : prev.check_out,
                  }));
                }}
                onClose={() => setCalOpen(null)}
              />
            )}
          </div>
        </div>

        <div className="filter-group fp-date-group">
          <label htmlFor="check_out">Check-out</label>
          <div className="fp-date-field" ref={outFieldRef}>
            <button
              type="button"
              className="fp-cal-trigger"
              onClick={() => setCalOpen(calOpen === 'out' ? null : 'out')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="#2563EB" strokeWidth="1.25" />
                <path d="M4 1v3M12 1v3M1.5 6h13" stroke="#2563EB" strokeWidth="1.25" />
              </svg>
            </button>
            <input
              id="check_out"
              name="check_out"
              type="text"
              readOnly
              placeholder="Select date"
              value={filters.check_out ? formatDisplay(filters.check_out) : ''}
              onClick={() => setCalOpen(calOpen === 'out' ? null : 'out')}
            />
            {calOpen === 'out' && (
              <CalendarPicker
                value={filters.check_out}
                minDate={filters.check_in || toDateInput(new Date())}
                onSelect={(d) => setFilters((prev) => ({ ...prev, check_out: d }))}
                onClose={() => setCalOpen(null)}
                alignRight
              />
            )}
          </div>
        </div>

        <div className="filter-group filter-group-full">
          <label htmlFor="guests">Guests & Rooms</label>
          <div className="fp-gr-row">
            <span className="fp-select-wrap">
              <select id="guests" name="guests" value={filters.guests} onChange={handleChange}>
                <option value="">Any guests</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
              <svg className="fp-select-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="fp-sep">·</span>
            <span className="fp-select-wrap">
              <select id="rooms" name="rooms" value={filters.rooms} onChange={handleChange}>
                <option value="">Any rooms</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>
                ))}
              </select>
              <svg className="fp-select-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="min_price">Min Price</label>
          <input
            id="min_price"
            name="min_price"
            type="number"
            placeholder="0"
            min="0"
            value={filters.min_price}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="max_price">Max Price</label>
          <input
            id="max_price"
            name="max_price"
            type="number"
            placeholder="100000"
            min="0"
            value={filters.max_price}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="rating">Min Rating</label>
          <select id="rating" name="rating" value={filters.rating} onChange={handleChange}>
            <option value="">Any</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="travel_purpose">Travel Purpose</label>
          <select id="travel_purpose" name="travel_purpose" value={filters.travel_purpose} onChange={handleChange}>
            <option value="">Any</option>
            {TRAVEL_PURPOSES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="filter-group filter-group-full">
          <label htmlFor="event">Event</label>
          <div className="fp-ms-labels" id="event">
            {EVENT_TYPES.map(t => (
              <button
                key={t}
                type="button"
                className={`fp-ms-chip ${eventSel.includes(t) ? 'fp-ms-chip-active' : ''}`}
                onClick={() => toggleEvent(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group filter-group-full">
          <label htmlFor="amenity">Amenity</label>
          <div className="fp-ms-labels" id="amenity">
            {AMENITIES.map(a => (
              <button
                key={a}
                type="button"
                className={`fp-ms-chip ${amenitySel.includes(a) ? 'fp-ms-chip-active' : ''}`}
                onClick={() => toggleAmenity(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="filter-actions">
        <button className="filter-btn apply-btn" onClick={handleApply}>Apply Filters</button>
        <button className="filter-btn clear-btn" onClick={handleClear}>Clear Filters</button>
      </div>
    </div>
  );
}