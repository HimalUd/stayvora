import React from 'react';
import './StarRow.css';

export default function StarRow() {
  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#F5A624">
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L10 1z" />
        </svg>
      ))}
    </div>
  );
}
