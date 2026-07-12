import React, { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, placeholder = 'Search hotels...' }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <form className="searchbar" onSubmit={handleSubmit}>
      <span className="searchbar-icon">&#128269;</span>
      <input
        type="text"
        className="searchbar-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className="searchbar-btn">Search</button>
    </form>
  );
}
