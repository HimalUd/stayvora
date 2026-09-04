import React, { useState } from 'react';
import './StarRating.css';

const starPath = 'M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L10 1z';

export default function StarRating({ value = 0, onChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="sr-stars" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          className={`sr-star ${i <= active ? 'sr-star-active' : ''}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange && onChange(i)}
        >
          <svg width={size} height={size} viewBox="0 0 20 20" fill={i <= active ? '#FDC700' : '#D3D7DE'}>
            <path d={starPath} />
          </svg>
        </button>
      ))}
    </div>
  );
}