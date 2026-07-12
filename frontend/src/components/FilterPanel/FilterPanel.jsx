import React, { useState } from 'react';
import './FilterPanel.css';

const INITIAL_FILTERS = {
  location: '',
  check_in: '',
  check_out: '',
  rooms: 1,
  min_price: '',
  max_price: '',
  min_rating: '',
  travel_purpose: '',
  event: '',
};

export default function FilterPanel({ onFilter }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onFilter(filters);
  };

  const handleClear = () => {
    setFilters(INITIAL_FILTERS);
    onFilter(INITIAL_FILTERS);
  };

  return (
    <div className="filter-panel">
      <h3 className="filter-title">Filters</h3>

      <div className="filter-grid">
        <div className="filter-group">
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

        <div className="filter-group">
          <label htmlFor="check_in">Check-in</label>
          <input
            id="check_in"
            name="check_in"
            type="date"
            value={filters.check_in}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="check_out">Check-out</label>
          <input
            id="check_out"
            name="check_out"
            type="date"
            value={filters.check_out}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="rooms">Rooms</label>
          <select id="rooms" name="rooms" value={filters.rooms} onChange={handleChange}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="min_price">Min Price</label>
          <input
            id="min_price"
            name="min_price"
            type="number"
            placeholder="$0"
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
            placeholder="$1000"
            min="0"
            value={filters.max_price}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="min_rating">Min Rating</label>
          <select id="min_rating" name="min_rating" value={filters.min_rating} onChange={handleChange}>
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
            <option value="Business">Business</option>
            <option value="Leisure">Leisure</option>
            <option value="Adventure">Adventure</option>
            <option value="Family">Family</option>
          </select>
        </div>

        <div className="filter-group filter-group-full">
          <label htmlFor="event">Event</label>
          <input
            id="event"
            name="event"
            type="text"
            placeholder="Concert, conference, etc."
            value={filters.event}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="filter-actions">
        <button className="filter-btn apply-btn" onClick={handleApply}>Apply Filters</button>
        <button className="filter-btn clear-btn" onClick={handleClear}>Clear Filters</button>
      </div>
    </div>
  );
}
