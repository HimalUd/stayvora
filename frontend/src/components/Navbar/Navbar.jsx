import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/home" className="navbar-logo">StayVora</Link>
        <div className="navbar-links">
          <NavLink to="/home" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/home" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Hotels</NavLink>
          <NavLink to="/about" className="navbar-link">About Us</NavLink>
          <NavLink to="/contact" className="navbar-link">Contact Us</NavLink>
          <NavLink to="/hotel-owner-portal" className="navbar-link">Hotel Owner Portal</NavLink>
        </div>
        <div className="navbar-right">
          <span className="navbar-username">{user?.name || 'User'}</span>
          <div className="navbar-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <button className="navbar-logout" onClick={logout} title="Logout">Logout</button>
        </div>
      </div>
    </nav>
  );
}
