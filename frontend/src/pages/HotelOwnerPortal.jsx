import React from 'react';
import { Link } from 'react-router-dom';
import './HotelOwnerPortal.css';

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#9810FA" strokeWidth="2"/>
      </svg>
    ),
    bg: '#F3E8FF',
    title: 'Real-Time Analytics',
    desc: 'Track bookings, revenue, and performance metrics in real-time with detailed analytics dashboard',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="2" stroke="#155DFC" strokeWidth="2"/>
        <rect x="8" y="2" width="8" height="20" stroke="#155DFC" strokeWidth="2"/>
      </svg>
    ),
    bg: '#DBEAFE',
    title: 'Global Reach',
    desc: 'Connect with travelers from around the world and expand your customer base instantly',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 4h18v16H3V4z" stroke="#00A63E" strokeWidth="2"/>
        <path d="M3 8h18" stroke="#00A63E" strokeWidth="2"/>
      </svg>
    ),
    bg: '#DCFCE7',
    title: 'Booking Management',
    desc: 'Manage all your reservations in one place with powerful filtering and search capabilities',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="5" width="12" height="14" rx="2" stroke="#F54900" strokeWidth="2"/>
      </svg>
    ),
    bg: '#FFEDD4',
    title: 'Revenue Tracking',
    desc: 'Monitor your earnings, track payment status, and generate financial reports effortlessly',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="2" width="16" height="20" rx="2" stroke="#E60076" strokeWidth="2"/>
      </svg>
    ),
    bg: '#FCE7F3',
    title: 'Secure Platform',
    desc: 'Bank-level security to protect your data and your guests\' information',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="2" width="18" height="20" rx="2" stroke="#4F39F6" strokeWidth="2"/>
      </svg>
    ),
    bg: '#E0E7FF',
    title: 'Instant Notifications',
    desc: 'Get notified immediately when new bookings arrive or guests check in',
  },
];

const steps = [
  {
    num: '1',
    bg: '#F5A623',
    title: 'Register Your Hotel',
    desc: 'Fill in your hotel details, amenities, and upload photos. Takes less than 10 minutes.',
  },
  {
    num: '2',
    bg: '#155DFC',
    title: 'Get Discovered',
    desc: 'Your hotel appears in search results for travelers looking in your area.',
  },
  {
    num: '3',
    bg: '#00A63E',
    title: 'Manage & Grow',
    desc: 'Receive bookings, manage reservations, and watch your business grow.',
  },
];

const testimonials = [
  {
    text: '"Since joining this platform, our bookings have increased by 150%. The dashboard makes it so easy to manage everything in one place."',
    name: 'Sarah Johnson',
    hotel: 'Grand Plaza Hotel',
    iconBg: '#F3E8FF',
    iconColor: '#9810FA',
  },
  {
    text: '"The real-time analytics help us make better business decisions. We can track everything from revenue to guest satisfaction effortlessly."',
    name: 'Michael Chen',
    hotel: 'Oceanview Resort',
    iconBg: '#DBEAFE',
    iconColor: '#155DFC',
  },
  {
    text: '"Simple to use, powerful features, and excellent support. This platform has transformed how we manage our hotel business."',
    name: 'Emily Rodriguez',
    hotel: 'Mountain View Inn',
    iconBg: '#DCFCE7',
    iconColor: '#00A63E',
  },
];

function StarRow() {
  return (
    <div className="hop-star-row">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#FDC700">
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L10 1z" />
        </svg>
      ))}
    </div>
  );
}

function PersonIcon({ bg, color }) {
  return (
    <div className="hop-person-icon" style={{ background: bg }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 10a4.17 4.17 0 100-8.33A4.17 4.17 0 0010 10z" stroke={color} strokeWidth="1.67"/>
        <path d="M2.5 18.33v-1.66a5 5 0 015-5h5a5 5 0 015 5v1.66" stroke={color} strokeWidth="1.67"/>
      </svg>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1.67" y="1.66" width="16.67" height="16.67" rx="8.33" stroke="#00A63E" strokeWidth="1.67"/>
      <path d="M6.67 10l2.5 2.5 4.16-4.17" stroke="#00A63E" strokeWidth="1.67" strokeLinecap="round"/>
    </svg>
  );
}

export default function HotelOwnerPortal() {
  return (
    <div className="hop-page">

      {/* ===== HERO ===== */}
      <section className="hop-hero">
        <div className="hop-hero-nav">
          <div className="hop-nav-left">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="8" y="2.67" width="16" height="26.67" rx="2" stroke="#2563EB" strokeWidth="2.67"/>
              <rect x="2.67" y="16" width="5.33" height="13.33" rx="1.33" stroke="#2563EB" strokeWidth="2.67"/>
              <rect x="24" y="12" width="5.33" height="17.33" rx="1.33" stroke="#2563EB" strokeWidth="2.67"/>
            </svg>
            <div className="hop-nav-title">Hotel Partner Portal</div>
            <div className="hop-nav-subtitle">Grow your business with us</div>
          </div>
          <div className="hop-nav-right">
            <Link to="/" className="hop-nav-link">Customer Site</Link>
            <Link to="/hotel-owner-login" className="hop-nav-btn hop-nav-btn-outline">Login</Link>
            <Link to="/hotel-owner-register" className="hop-nav-btn hop-nav-btn-primary">Register Your Hotel</Link>
          </div>
        </div>
        <div className="hop-hero-body">
          <div className="hop-hero-text">
            <div className="hop-badge">For Hotel Owners</div>
            <h1 className="hop-hero-title">Reach Thousands of Travelers Worldwide</h1>
            <p className="hop-hero-desc">Join our platform and transform your hotel business. Get instant access to a global network of travelers, manage bookings effortlessly, and grow your revenue.</p>
            <div className="hop-hero-actions">
              <Link to="/hotel-owner-register" className="hop-btn hop-btn-primary">
                Get Started Free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="white" strokeWidth="1.33" strokeLinecap="round"/>
                </svg>
              </Link>
              <Link to="/hotel-owner-login" className="hop-btn hop-btn-outline">Sign In</Link>
            </div>
            <div className="hop-hero-checkmarks">
              <div className="hop-check-item"><CheckIcon /> No Setup Fees</div>
              <div className="hop-check-item"><CheckIcon /> Instant Activation</div>
              <div className="hop-check-item"><CheckIcon /> 24/7 Support</div>
            </div>
          </div>
          <div className="hop-hero-stats-card">
            <div className="hop-stat-box hop-stat-purple">
              <div className="hop-stat-info">
                <div className="hop-stat-label">Monthly Revenue</div>
                <div className="hop-stat-value hop-stat-value-blue">$45,280</div>
              </div>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="14" width="40" height="20" rx="2" stroke="#2563EB" strokeWidth="4"/>
                <rect x="32" y="14" width="12" height="20" stroke="#2563EB" strokeWidth="4"/>
              </svg>
            </div>
            <div className="hop-stat-box hop-stat-yellow">
              <div className="hop-stat-info">
                <div className="hop-stat-label">Total Bookings</div>
                <div className="hop-stat-value hop-stat-value-gold">187</div>
              </div>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="6" y="8" width="36" height="36" rx="4" stroke="#F5A623" strokeWidth="4"/>
              </svg>
            </div>
            <div className="hop-stat-box hop-stat-blue">
              <div className="hop-stat-info">
                <div className="hop-stat-label">Guest Satisfaction</div>
                <div className="hop-stat-row-value">
                  <span className="hop-stat-value hop-stat-value-blue">4.8</span>
                  <StarRow />
                </div>
              </div>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="4" width="40" height="38" rx="4" stroke="#155DFC" strokeWidth="4"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="hop-features">
        <div className="hop-section-container">
          <h2 className="hop-section-title">Everything You Need to Succeed</h2>
          <p className="hop-section-subtitle">Powerful tools and features designed specifically for hotel owners</p>
          <div className="hop-features-grid">
            {features.map((f, i) => (
              <div key={i} className="hop-feature-card">
                <div className="hop-feature-icon" style={{ background: f.bg }}>{f.icon}</div>
                <h3 className="hop-feature-title">{f.title}</h3>
                <p className="hop-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="hop-steps">
        <div className="hop-section-container">
          <h2 className="hop-section-title">How It Works</h2>
          <p className="hop-section-subtitle">Get started in just 3 simple steps</p>
          <div className="hop-steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="hop-step-card">
                <div className="hop-step-circle" style={{ background: s.bg }}>{s.num}</div>
                <h3 className="hop-step-title">{s.title}</h3>
                <p className="hop-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="hop-stats-bar">
        <div className="hop-section-container">
          <div className="hop-stats-grid">
            <div className="hop-stat">
              <div className="hop-stat-number">500+</div>
              <div className="hop-stat-label-light">Partner Hotels</div>
            </div>
            <div className="hop-stat">
              <div className="hop-stat-number">50K+</div>
              <div className="hop-stat-label-light">Bookings Monthly</div>
            </div>
            <div className="hop-stat">
              <div className="hop-stat-number">$2M+</div>
              <div className="hop-stat-label-light">Revenue Generated</div>
            </div>
            <div className="hop-stat">
              <div className="hop-stat-number">4.9★</div>
              <div className="hop-stat-label-light">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="hop-testimonials">
        <div className="hop-section-container">
          <h2 className="hop-section-title">What Hotel Owners Say</h2>
          <p className="hop-section-subtitle">Join thousands of successful hotel partners</p>
          <div className="hop-testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="hop-testimonial-card">
                <StarRow />
                <p className="hop-testimonial-text">{t.text}</p>
                <div className="hop-testimonial-author">
                  <PersonIcon bg={t.iconBg} color={t.iconColor} />
                  <div>
                    <div className="hop-author-name">{t.name}</div>
                    <div className="hop-author-hotel">{t.hotel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="hop-cta">
        <div className="hop-section-container">
          <h2 className="hop-cta-title">Ready to Grow Your Hotel Business?</h2>
          <p className="hop-cta-desc">Join our platform today and start receiving bookings from travelers worldwide</p>
          <div className="hop-cta-actions">
            <Link to="/hotel-owner-register" className="hop-btn hop-btn-white">
              Register Your Hotel
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="#1447E6" strokeWidth="1.33" strokeLinecap="round"/>
              </svg>
            </Link>
            <Link to="/hotel-owner-login" className="hop-btn hop-btn-white-outline">Sign In</Link>
          </div>
          <p className="hop-cta-footnote">No credit card required • Free to get started • Cancel anytime</p>
        </div>
      </section>

    </div>
  );
}
