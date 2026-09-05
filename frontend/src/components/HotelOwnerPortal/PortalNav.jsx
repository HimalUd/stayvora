import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../Button/Button';
import logoLight from '../../assets/logos/badge-light.png';

export default function PortalNav() {
  return (
    <div className="hop-hero-nav">
      <div className="hop-nav-left">
        <img src={logoLight} alt="StayVora" className="hop-nav-logo" />
        <div>
          <div className="hop-nav-title">Hotel Owner Portal</div>
          <div className="hop-nav-subtitle">Grow your business with us</div>
        </div>
      </div>
      <div className="hop-nav-right">
        <Link to="/" className="hop-nav-link">Customer Site</Link>
        <Button to="/hotel-owner-login" variant="outline" size="sm">Login</Button>
        <Button to="/hotel-owner-register" variant="primary" size="sm">Register Your Hotel</Button>
      </div>
    </div>
  );
}
