import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HotelCard.css';

function StarRating({ rating }) {
  const stars = Math.round(rating);
  return (
    <span className="hotel-card-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= stars ? 'star-filled' : 'star-empty'}>
          ★
        </span>
      ))}
      <span className="hotel-card-rating-num">{rating}</span>
    </span>
  );
}

export default function HotelCard({ hotel }) {
  const navigate = useNavigate();
  const { id, name, location, price_range, rating, description, images } = hotel;

  const imageUrl = images && images.length > 0
    ? images[0]
    : 'https://via.placeholder.com/400x250?text=No+Image';

  return (
    <div className="hotel-card" onClick={() => navigate(`/hotel/${id}`)}>
      <div className="hotel-card-image">
        <img src={imageUrl} alt={name} />
      </div>
      <div className="hotel-card-body">
        <h3 className="hotel-card-name">{name}</h3>
        <p className="hotel-card-location">{location}</p>
        {rating && <StarRating rating={rating} />}
        <p className="hotel-card-price">{price_range}</p>
        <p className="hotel-card-desc">{description}</p>
      </div>
    </div>
  );
}
