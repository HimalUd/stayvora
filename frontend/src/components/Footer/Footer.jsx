import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">StayVora</Link>
          <p className="footer-desc">
            Experience luxury travel with StayVora. We connect discerning travelers with the world's most exceptional accommodations.
          </p>
          <div className="footer-social">
            <a href="#" className="footer-social-link" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="#" className="footer-social-link" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
              </svg>
            </a>
            <a href="#" className="footer-social-link" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="#" className="footer-social-link" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>
        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <Link to="/home" className="footer-link">Home</Link>
          <Link to="/home" className="footer-link">Hotels</Link>
          <Link to="/about" className="footer-link">About Us</Link>
          <Link to="/contact" className="footer-link">Contact Us</Link>
        </div>
        <div className="footer-col">
          <h4 className="footer-heading">Support</h4>
          <span className="footer-link">Help Center</span>
          <span className="footer-link">Contact</span>
          <span className="footer-link">FAQs</span>
          <span className="footer-link">Terms of Service</span>
        </div>
        <div className="footer-col footer-newsletter-col">
          <h4 className="footer-heading">Stay Updated</h4>
          <p className="footer-newsletter-text">
            Subscribe to our newsletter for exclusive offers and travel inspiration.
          </p>
          <form className="footer-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="footer-input"
              required
            />
            <button type="submit" className="footer-submit">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} StayVora. All rights reserved.</p>
      </div>
    </footer>
  );
}
