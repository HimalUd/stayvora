import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hotelsAPI } from '../utils/api';
import './Landing.css';

const features = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: '24/7 Concierge',
    description: 'Round-the-clock dedicated concierge service to cater to your every need, anytime, anywhere.'
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Best Price Guarantee',
    description: 'We match any price you find elsewhere. Book with confidence knowing you got the best deal.'
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
      </svg>
    ),
    title: 'Curated Luxury',
    description: 'Every property in our collection is hand-selected for its exceptional quality and unique character.'
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: 'Global Network',
    description: 'Access premium accommodations in over 50 countries through our extensive partner network.'
  }
];

const destinationsMeta = [
  { name: 'Sigiriya', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800', large: true, key: 'sigiriya' },
  { name: 'Galle', image: 'https://images.unsplash.com/photo-1572307480816-4ae3267c8c0f?w=600', large: false, key: 'galle' },
  { name: 'Ella', image: 'https://images.unsplash.com/photo-1596397042349-2c0d9a9d4e9a?w=600', large: false, key: 'ella' },
  { name: 'Colombo', image: 'https://images.unsplash.com/photo-1586269648864-47a8b810f2a8?w=600', large: false, key: 'colombo' },
  { name: 'Mirissa', image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600', large: false, key: 'mirissa' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [locationCounts, setLocationCounts] = useState({});

  useEffect(() => {
    hotelsAPI.locationCounts()
      .then(res => setLocationCounts(res.data.locations || {}))
      .catch(() => {});
  }, []);

  const handleDestinationClick = (destName) => {
    const searchUrl = `/search?location=${encodeURIComponent(destName)}`;
    if (user) {
      navigate(searchUrl);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(searchUrl)}`);
    }
  };

  return (
    <div className="landing-page">

      {/* ============ NAVBAR ============ */}
      <nav className="landing-navbar">
        <div className="landing-navbar-inner">
          <Link to="/" className="landing-logo">StayVora</Link>
          <div className="landing-nav-links">
            <Link to="/about" className="landing-nav-link landing-nav-link-blue">About Us</Link>
            <Link to="/contact" className="landing-nav-link landing-nav-link-blue">Contact Us</Link>
            <Link to="/hotel-owner-portal" className="landing-nav-link landing-nav-link-purple">Hotel Owner Portal</Link>
          </div>
          <div className="landing-nav-actions">
            <Link to="/login" className="landing-btn-outline">Login</Link>
            <Link to="/register" className="landing-btn-gold">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="landing-hero">
        <div className="landing-hero-overlay" />
        <div
          className="landing-hero-bg"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1440)' }}
        />
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">Welcome to Extraordinary Experiences</h1>
          <p className="landing-hero-subtitle">Discover handpicked luxury hotels that redefine hospitality</p>
          <div className="landing-hero-actions">
            <Link to="/login" className="landing-btn-outline landing-btn-hero">Login</Link>
            <Link to="/register" className="landing-btn-gold landing-btn-hero">Sign Up</Link>
          </div>
        </div>
      </section>

      {/* ============ WHY CHOOSE ============ */}
      <section className="landing-section landing-why">
        <div className="landing-container">
          <h2 className="landing-section-title">Why Choose Stayvora</h2>
          <p className="landing-section-subtitle">
            Experience the difference with our premium services tailored for discerning travelers
          </p>
          <div className="landing-features-grid">
            {features.map((feat, i) => (
              <div className="landing-feature-card" key={i}>
                <div className="landing-feature-icon">{feat.icon}</div>
                <h3 className="landing-feature-title">{feat.title}</h3>
                <p className="landing-feature-desc">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EXPERIENCE LUXURY ============ */}
      <section className="landing-section landing-experience">
        <div className="landing-container landing-experience-inner">
          <div className="landing-experience-content">
            <span className="landing-experience-label">EXPERIENCE LUXURY</span>
            <h2 className="landing-experience-title">Every Stay Tells a Story</h2>
            <p className="landing-experience-desc">
              From boutique hideaways to grand resorts, each property in our collection offers a
              unique narrative waiting to be discovered. Immerse yourself in unparalleled comfort
              and create memories that will last a lifetime.
            </p>
            <div className="landing-stats">
              <div className="landing-stat">
                <span className="landing-stat-number">100+</span>
                <span className="landing-stat-label">Hotels</span>
              </div>
              <div className="landing-stat">
                <span className="landing-stat-number">1200+</span>
                <span className="landing-stat-label">Customers</span>
              </div>
              <div className="landing-stat">
                <span className="landing-stat-number">50+</span>
                <span className="landing-stat-label">Reviews</span>
              </div>
            </div>
          </div>
          <div className="landing-experience-media">
            <img
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600"
              alt="Luxury hotel experience"
              className="landing-experience-img"
            />
            <div className="landing-play-btn">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ============ DESTINATIONS ============ */}
      <section className="landing-section landing-destinations">
        <div className="landing-container">
          <h2 className="landing-section-title">Destinations That Inspire</h2>
          <p className="landing-section-subtitle">
            From tropical paradises to urban sophistication
          </p>
          <div className="landing-destinations-grid">
            {destinationsMeta.map((dest, i) => {
              const count = locationCounts[dest.key];
              const countText = count !== undefined ? `${count}+ Hotels` : 'Loading...';
              return (
                <div
                  className={`landing-destination-card ${dest.large ? 'landing-destination-large' : ''}`}
                  key={i}
                  onClick={() => handleDestinationClick(dest.name)}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className="landing-destination-bg"
                    style={{ backgroundImage: `url(${dest.image})` }}
                  />
                  <div className="landing-destination-overlay" />
                  <div className="landing-destination-content">
                    <h3 className="landing-destination-name">{dest.name}</h3>
                    <span className="landing-destination-count">{countText}</span>
                    <span className="landing-destination-explore">Explore →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="landing-cta">
        <div
          className="landing-cta-bg"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1440)' }}
        />
        <div className="landing-cta-overlay" />
        <div className="landing-cta-content">
          <h2 className="landing-cta-title">Ready to Begin Your Journey?</h2>
          <p className="landing-cta-desc">
            Join thousands of travelers who trust LuxStay for their luxury stays
          </p>
          <Link to="/home" className="landing-btn-gold landing-btn-cta">Browse Hotels</Link>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div className="landing-footer-brand">
            <Link to="/" className="landing-footer-logo">StayVora</Link>
            <p className="landing-footer-desc">
              Experience luxury travel with StayVora. We connect discerning travelers with the
              world's most exceptional accommodations.
            </p>
            <div className="landing-footer-social">
              <a href="#" className="landing-social-link" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="landing-social-link" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              <a href="#" className="landing-social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="landing-social-link" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
          <div className="landing-footer-col">
            <h4 className="landing-footer-heading">Quick Links</h4>
            <Link to="/about" className="landing-footer-link">About Us</Link>
            <Link to="/home" className="landing-footer-link">Hotels</Link>
            <Link to="/home" className="landing-footer-link">Destinations</Link>
            <span className="landing-footer-link">Blog</span>
          </div>
          <div className="landing-footer-col">
            <h4 className="landing-footer-heading">Support</h4>
            <span className="landing-footer-link">Help Center</span>
            <span className="landing-footer-link">Contact</span>
            <span className="landing-footer-link">FAQs</span>
            <span className="landing-footer-link">Terms of Service</span>
          </div>
          <div className="landing-footer-col landing-footer-newsletter-col">
            <h4 className="landing-footer-heading">Stay Updated</h4>
            <p className="landing-footer-newsletter-text">
              Subscribe to our newsletter for exclusive offers and travel inspiration.
            </p>
            <form className="landing-footer-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="landing-footer-input"
                required
              />
              <button type="submit" className="landing-footer-submit">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="landing-footer-creds">
          <div className="landing-container">
            <span>Admin: <b>admin@stayeasy.com</b> / <b>admin123</b></span>
            <span className="landing-footer-creds-sep">|</span>
            <span>Demo: <b>demo@stayvora.com</b> / <b>demo123</b></span>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <div className="landing-container">
            <p>&copy; {new Date().getFullYear()} StayVora. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
