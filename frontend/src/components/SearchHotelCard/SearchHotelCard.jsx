import React from 'react';
import { Link } from 'react-router-dom';
import { formatLKRFixed } from '../../utils/currency';
import './SearchHotelCard.css';

export default function SearchHotelCard({ hotel }) {
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
            <span className="sr-price-amount">{formatLKRFixed(hotel.price)}<span className="sr-price-night">/night</span></span>
          </div>
        </div>
        <Link to={`/hotel/${hotel.id}`} className="sr-view-btn">View Details</Link>
      </div>
    </div>
  );
}
