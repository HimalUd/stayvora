import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar/Navbar';
import logoLight from '../assets/logos/logo-light.png';
import logoDark from '../assets/logos/logo-dark.png';
import './Landing.css';
import './About.css';

const UPLOAD_HOST = `http://${window.location.hostname || 'localhost'}:8090`;

const stats = [
  { value: '100+', label: 'Curated Hotels' },
  { value: '1,200+', label: 'Happy Travelers' },
  { value: '50+', label: 'Destinations' },
  { value: '4.9/5', label: 'Average Rating' },
];

const values = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 18H4V6h16v12z" />
        <path d="M8 18v2h8v-2" />
      </svg>
    ),
    title: 'Guest-First Approach',
    desc: 'Every decision we make starts with our guests in mind. Your comfort, safety, and satisfaction are our top priorities from search to checkout.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'Trusted & Secure',
    desc: 'We partner only with verified hotels and use industry-leading encryption to protect your personal and payment information.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.9 5.7L19.6 10.6l-5.7 1.9L12 18.2l-1.9-5.7L4.4 10.6l5.7-1.9L12 3z" />
      </svg>
    ),
    title: 'Curated Excellence',
    desc: 'Our team personally vets every property on our platform, ensuring only high-quality accommodations make it to your search results.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Island-Wide Reach',
    desc: 'From the beaches of Mirissa to the hills of Ella, we offer a handpicked selection of stays across every corner of Sri Lanka.',
  },
];

const team = [
  { initials: 'IC', name: 'Isuru Chathuranga', role: 'Leader', bio: 'Manages hotel details, room availability, pricing, and bookings with real-time updates to prevent double bookings..' },
  { initials: 'HU', name: 'Himal Udaayanga', role: 'The designer', bio: 'Designed and developed the user experience of Stayvora, including the modern UI, location-based hotel search, and tourist attraction and event integration, while supporting security, testing, and evaluation..' },
  { initials: 'RS', name: 'Rameshini Shashikala', bio: 'Developed the admin dashboard for managing customer accounts, bookings, and trip-planning features, while supporting system testing and evaluation.' },
  { initials: 'AL', name: 'Ayandi Lohansa',  bio: 'Developed secure user authentication, booking and cancellation features, with booking records and confirmation management, while supporting system testing and evaluation.' },
];

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`landing-reveal ${visible ? 'landing-reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function About() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing-page">

      {/* ============ NAVBAR ============ */}
      {user && <Navbar />}
      {!user && (
      <nav className={`landing-navbar ${scrolled ? 'landing-navbar-scrolled' : ''}`}>
        <div className="landing-navbar-inner">
          <Link to="/" className="landing-logo" onClick={() => setMenuOpen(false)}>
            <img src={scrolled ? logoDark : logoLight} alt="StayVora" className="landing-logo-img" />
          </Link>

          <div className="landing-nav-links">
            <Link to="/about" className="landing-nav-link landing-nav-link-blue">About Us</Link>
            <Link to="/contact" className="landing-nav-link landing-nav-link-blue">Contact Us</Link>
            <Link to="/hotel-owner-portal" className="landing-nav-link landing-nav-link-purple">Hotel Owner Portal</Link>
          </div>

          <div className="landing-nav-actions">
            <>
              <Link to="/login" className="landing-btn-nav-ghost">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                </svg>
                Login
              </Link>
              <Link to="/register" className="landing-btn-gold">Sign Up</Link>
            </>
            <button
              className={`landing-menu-toggle ${menuOpen ? 'landing-menu-toggle-open' : ''}`}
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        <div className={`landing-mobile-menu ${menuOpen ? 'landing-mobile-menu-open' : ''}`}>
          <Link to="/about" className="landing-mobile-link" onClick={() => setMenuOpen(false)}>About Us</Link>
          <Link to="/contact" className="landing-mobile-link" onClick={() => setMenuOpen(false)}>Contact Us</Link>
          <Link to="/hotel-owner-portal" className="landing-mobile-link" onClick={() => setMenuOpen(false)}>Hotel Owner Portal</Link>
          <div className="landing-mobile-auth">
            <Link to="/login" className="landing-btn-outline" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="landing-btn-gold" onClick={() => setMenuOpen(false)}>Sign Up</Link>
          </div>
        </div>
      </nav>
      )}

      {/* ============ HERO ============ */}
      <section className="ab-hero">
        <div
          className="ab-hero-bg"
          style={{ backgroundImage: `url(${UPLOAD_HOST}/uploads/landing-page-image.jpg)` }}
        />
        <div className="landing-hero-overlay" />
        <div className="ab-hero-content">
          <div className="landing-hero-badge">
            <span className="landing-hero-badge-dot" />
            ABOUT STAYVORA
          </div>
          <h1 className="ab-hero-title">Our Story, <span className="landing-hero-gradient">Your</span> Perfect Stay</h1>
          <p className="ab-hero-sub">
            We believe every traveler deserves a place that fits their journey. Since our beginnings,
            we've been connecting explorers with Sri Lanka's finest hotels — making every trip more
            comfortable, memorable, and stress-free.
          </p>
          <div className="landing-hero-actions">
            <Link to="/home" className="landing-btn-gold landing-btn-hero">
              Browse Hotels
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/contact" className="landing-btn-glass landing-btn-hero">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="landing-section ab-stats-section">
        <div className="landing-container">
          <Reveal>
            <span className="landing-eyebrow">STAYVORA AT A GLANCE</span>
            <h2 className="landing-section-title">Numbers That Speak for Themselves</h2>
            <p className="landing-section-subtitle">
              A platform built by travelers, for travelers across Sri Lanka
            </p>
          </Reveal>
          <div className="ab-stats-row">
            {stats.map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="landing-stat">
                  <span className="landing-stat-number">{s.value}</span>
                  <span className="landing-stat-label">{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ OUR STORY ============ */}
      <section className="landing-section ab-story-section">
        <div className="landing-container landing-experience-inner">
          <Reveal className="landing-experience-content">
            <span className="landing-eyebrow">OUR STORY</span>
            <h2 className="landing-experience-title">Born in Sri Lanka, Built for Every Journey</h2>
            <p className="landing-experience-desc">
              StayVora was founded by a group of Sri Lankan travelers who were tired of complex booking
              processes and hidden costs. We set out to build a platform that was transparent, easy to use,
              and genuinely focused on the traveler's needs.
            </p>
            <p className="landing-experience-desc">
              What started with a handful of partner hotels has grown into a trusted platform connecting
              travelers with handpicked stays across the island — from beachfront escapes in Mirissa to
              hillside retreats in Ella.
            </p>
            <p className="landing-experience-desc">
              Today our team works around the clock to curate the best hotels, negotiate fair prices, and
              provide 24/7 support to every guest who chooses StayVora for their journey.
            </p>
            <div className="landing-stats">
              <div className="landing-stat">
                <span className="landing-stat-number">100+</span>
                <span className="landing-stat-label">Island Destinations</span>
              </div>
              <div className="landing-stat">
                <span className="landing-stat-number">24/7</span>
                <span className="landing-stat-label">Guest Support</span>
              </div>
              <div className="landing-stat">
                <span className="landing-stat-number">100%</span>
                <span className="landing-stat-label">Local & Verified</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150} className="landing-experience-media-wrap">
            <div className="landing-experience-media">
              <img
                src={`${UPLOAD_HOST}/uploads/sigiriya.jpg`}
                alt="StayVora story"
                className="landing-experience-img"
              />
              <div className="landing-play-btn">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>
            <div className="landing-experience-card">
              <div className="landing-experience-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <span className="landing-experience-card-title">Made in Sri Lanka</span>
                <span className="landing-experience-card-sub">Proudly local, globally inspired</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ WHAT WE STAND FOR ============ */}
      <section className="landing-section ab-values-section">
        <div className="landing-container">
          <Reveal>
            <span className="landing-eyebrow">WHAT WE STAND FOR</span>
            <h2 className="landing-section-title">Our Values</h2>
            <p className="landing-section-subtitle">
              Our values guide every product decision, partnership, and customer interaction.
            </p>
          </Reveal>
          <div className="landing-features-grid">
            {values.map((v, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="landing-feature-card">
                  <div className="landing-feature-icon">
                    <span className="landing-feature-icon-inner">{v.icon}</span>
                  </div>
                  <h3 className="landing-feature-title">{v.title}</h3>
                  <p className="landing-feature-desc">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MEET THE TEAM ============ */}
      <section className="landing-section ab-team-section">
        <div className="landing-container">
          <Reveal>
            <span className="landing-eyebrow">MEET THE TEAM</span>
            <h2 className="landing-section-title">The People Behind Your Perfect Stay</h2>
            <p className="landing-section-subtitle">
              A passionate team of travelers and technologists across Sri Lanka
            </p>
          </Reveal>
          <div className="ab-team-grid">
            {team.map((t, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="ab-team-card">
                  <div className="ab-team-avatar">{t.initials}</div>
                  <h4 className="ab-team-name">{t.name}</h4>
                  <div className="ab-team-role">{t.role}</div>
                  <p className="ab-team-bio">{t.bio}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="landing-cta">
        <div
          className="landing-cta-bg"
          style={{ backgroundImage: `url(${UPLOAD_HOST}/uploads/mirissa.jpg)` }}
        />
        <div className="landing-cta-overlay" />
        <Reveal className="landing-cta-content">
          <span className="landing-cta-badge">LET'S TRAVEL</span>
          <h2 className="landing-cta-title">Ready to Find Your Perfect Stay?</h2>
          <p className="landing-cta-desc">
            Join travelers across Sri Lanka who trust StayVora for their journeys
          </p>
          <div className="landing-cta-actions">
            <Link to="/home" className="landing-btn-gold landing-btn-cta">
              Browse Hotels
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/hotel-owner-portal" className="landing-btn-glass landing-btn-cta">Hotel Owner Portal</Link>
          </div>
        </Reveal>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div className="landing-footer-brand">
            <Link to="/" className="landing-footer-logo">
              <img src={logoLight} alt="StayVora" className="landing-footer-logo-img" />
            </Link>
            <p className="landing-footer-desc">
              Experience luxury travel with StayVora. We connect discerning travelers with the
              world's most exceptional accommodations.
            </p>
            <div className="landing-footer-social">
              <a href="#" className="landing-social-link" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="landing-social-link" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              <a href="#" className="landing-social-link" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="landing-social-link" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
            <Link to="/contact" className="landing-footer-link">Contact</Link>
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
        
        <div className="landing-footer-bottom">
          <div className="landing-container">
            <p>&copy; {new Date().getFullYear()} StayVora. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}