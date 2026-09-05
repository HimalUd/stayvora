import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hotelsAPI } from '../utils/api';
import logoLight from '../assets/logos/logo-light.png';
import logoDark from '../assets/logos/logo-dark.png';
import './Landing.css';

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    title: 'Smart Hotel Search',
    description: 'Find hotels that match your needs with powerful filters for location, dates, budget, guests, and rooms.'
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Travel-Purpose Matching',
    description: 'Choose hotels based on your journey — whether it\'s a business trip, family vacation, couple getaway, honeymoon, or solo adventure.'
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.9 5.7L19.6 10.6l-5.7 1.9L12 18.2l-1.9-5.7L4.4 10.6l5.7-1.9L12 3z" />
        <path d="M19 15l0.9 2.7L22.6 18.6l-2.7 0.9L19 22.2l-0.9-2.7-2.7-0.9 2.7-0.9L19 15z" />
      </svg>
    ),
    title: 'Discover Hotel Experiences',
    description: 'Find hotels with the experiences and events you want, from day and night events to live music, pool parties, and more.'
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Simple & Personalized',
    description: 'Save your favorite stays, manage your bookings, and discover personalized hotel recommendations — all in one place.'
  }
];

const DESTINATION_META = [
  {
    name: 'Sigiriya',
    image: '/uploads/sigiriya.jpg',
    large: true
  },
  {
    name: 'Galle',
    image: '/uploads/galle.jpg',
    large: false
  },
  {
    name: 'Ella',
    image: '/uploads/ella.jpeg',
    large: false
  },
  {
    name: 'Colombo',
    image: '/uploads/colombo.jpg',
    large: false
  },
  {
    name: 'Mirissa',
    image: '/uploads/mirissa.jpg',
    large: false
  }
];

const testimonials = [
  {
    name: 'Nuwan Perera',
    location: 'Colombo, Sri Lanka',
    text: 'Booked a gorgeous boutique hotel in Ella for our anniversary. The filters made it effortless to find a stay that matched our budget and travel purpose. Truly a memorable escape!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop'
  },
  {
    name: 'Chamari Silva',
    location: 'Kandy, Sri Lanka',
    text: 'Found the perfect family hotel in Mirissa for our vacation. Managing bookings online was so simple, and the personalized recommendations were spot on. Highly recommended for local travelers!',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop'
  },
  {
    name: 'Kasun Fernando',
    location: 'Galle, Sri Lanka',
    text: 'As a business traveler, the travel-purpose matching helped me find the ideal hotel in Colombo with all the amenities I needed. Seamless booking and great service from start to finish.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop'
  }
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

function Stars() {
  return (
    <div className="landing-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#F5A624">
          <path d="M8 1l1.91 3.87 4.27.62-3.09 3.01.73 4.25L8 11.42l-3.82 2.01.73-4.25-3.09-3.01 4.27-.62L8 1z" />
        </svg>
      ))}
    </div>
  );
}

export default function Landing() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const [destCounts, setDestCounts] = useState({});

  useEffect(() => {
    const names = DESTINATION_META.map(d => d.name);
    hotelsAPI.destinationCounts(names).then(r => {
      setDestCounts(r.data.counts || {});
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="landing-page">

      {/* ============ NAVBAR ============ */}
      <nav className={`landing-navbar ${scrolled ? 'landing-navbar-scrolled' : ''}`}>
        <div className="landing-navbar-inner">
          <Link to="/" className="landing-logo" onClick={() => setMenuOpen(false)}>
            <img src={scrolled ? logoDark : logoLight} alt="StayVora" className="landing-logo-img" />
          </Link>

          <div className="landing-nav-links">
            {user && <Link to="/home" className="landing-nav-link landing-nav-link-blue">Home</Link>}
            <Link to="/about" className="landing-nav-link landing-nav-link-blue">About Us</Link>
            <Link to="/contact" className="landing-nav-link landing-nav-link-blue">Contact Us</Link>
            <Link to="/hotel-owner-portal" className="landing-nav-link landing-nav-link-purple">Hotel Owner Portal</Link>
          </div>

          <div className="landing-nav-actions">
            {user ? (
              <div className="landing-user-menu" ref={userMenuRef}>
                <button
                  className="landing-user-btn"
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  aria-label="Open user menu"
                >
                  <div className="landing-user-avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                  <span className="landing-user-name">{user.name || 'User'}</span>
                  <svg className="landing-user-chevron" width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="landing-user-dropdown">
                    <div className="landing-user-dropdown-header">
                      <div className="landing-user-dropdown-avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                      <div>
                        <div className="landing-user-dropdown-name">{user.name || 'User'}</div>
                        <div className="landing-user-dropdown-email">{user.email || ''}</div>
                      </div>
                    </div>
                    <div className="landing-user-dropdown-divider" />
                    <Link to="/my-bookings" className="landing-user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 14V5.5L8 1.5L14 5.5V14H10V9H6V14H2Z" stroke="currentColor" strokeWidth="1.33" strokeLinejoin="round"/>
                      </svg>
                      My Bookings
                    </Link>
                    <div className="landing-user-dropdown-divider" />
                    <button className="landing-user-dropdown-item landing-user-dropdown-logout" onClick={() => { setUserMenuOpen(false); logout(); }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 14H2.67C2.3 14 2 13.7 2 13.33V2.67C2 2.3 2.3 2 2.67 2H6" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.67 11.33L14 8L10.67 4.67" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 8H6" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
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
            )}
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
          {user && <Link to="/home" className="landing-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>}
          <Link to="/about" className="landing-mobile-link" onClick={() => setMenuOpen(false)}>About Us</Link>
          <Link to="/contact" className="landing-mobile-link" onClick={() => setMenuOpen(false)}>Contact Us</Link>
          <Link to="/hotel-owner-portal" className="landing-mobile-link" onClick={() => setMenuOpen(false)}>Hotel Owner Portal</Link>
          <div className="landing-mobile-auth">
            {user ? (
              <>
                <div className="landing-mobile-user">
                  <div className="landing-user-avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                  <span>{user.name || 'User'}</span>
                </div>
                <Link to="/my-bookings" className="landing-btn-outline" onClick={() => setMenuOpen(false)}>My Bookings</Link>
                <button className="landing-btn-gold landing-btn-mobile-logout" onClick={() => { setMenuOpen(false); logout(); }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="landing-btn-outline" onClick={() => setMenuOpen(false)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                  </svg>
                  Login
                </Link>
                <Link to="/register" className="landing-btn-gold" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="landing-hero">
        <div
          className="landing-hero-bg"
          style={{ backgroundImage: `url(/uploads/landing-page-image.jpg)` }}
        />
        <div className="landing-hero-overlay" />
        <div className="landing-hero-orb landing-hero-orb-one" />
        <div className="landing-hero-orb landing-hero-orb-two" />

        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <span className="landing-hero-badge-dot" />
            #1 Rated Luxury Hotel Platform
          </div>
          <h1 className="landing-hero-title">
            Find the Stay That Fits Your <span className="landing-hero-gradient">Journey</span>
          </h1>
          <p className="landing-hero-subtitle">
            Discover hotels tailored to your destination, budget, travel purpose, and experiences — all in one place.
          </p>
          <div className="landing-hero-actions">
            {user ? (
              <>
                <Link to="/hotel-owner-portal" className="landing-btn-glass landing-btn-hero">
                  Hotel Owner Portal
                </Link>
                <Link to="/home" className="landing-btn-gold landing-btn-hero">
                  Book Hotels
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="landing-btn-glass landing-btn-hero">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                  </svg>
                  Login
                </Link>
                <Link to="/register" className="landing-btn-gold landing-btn-hero">
                  Sign Up
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </>
            )}
          </div>

          <div className="landing-hero-stats">
            <div className="landing-hero-stat">
              <span className="landing-hero-stat-number">100+</span>
              <span className="landing-hero-stat-label">Luxury Hotels</span>
            </div>
            <span className="landing-hero-stat-sep" />
            <div className="landing-hero-stat">
              <span className="landing-hero-stat-number">1,200+</span>
              <span className="landing-hero-stat-label">Happy Travelers</span>
            </div>
            <span className="landing-hero-stat-sep" />
            <div className="landing-hero-stat">
              <span className="landing-hero-stat-number">4.9/5</span>
              <span className="landing-hero-stat-label">Average Rating</span>
            </div>
          </div>
        </div>

        <div className="landing-scroll-cue">
          <div className="landing-scroll-mouse">
            <span className="landing-scroll-wheel" />
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* ============ WHY CHOOSE ============ */}
      <section className="landing-section landing-why">
        <div className="landing-container">
          <Reveal>
            <span className="landing-eyebrow">WHY STAYVORA</span>
            <h2 className="landing-section-title">Why Choose StayVora</h2>
            <p className="landing-section-subtitle">
              Experience the difference with our premium services tailored for discerning travelers
            </p>
          </Reveal>
          <div className="landing-features-grid">
            {features.map((feat, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="landing-feature-card">
                  <div className="landing-feature-icon">
                    <span className="landing-feature-icon-inner">{feat.icon}</span>
                  </div>
                  <h3 className="landing-feature-title">{feat.title}</h3>
                  <p className="landing-feature-desc">{feat.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EXPERIENCE LUXURY ============ */}
      <section className="landing-section landing-experience">
        <div className="landing-container landing-experience-inner">
          <Reveal className="landing-experience-content">
            <span className="landing-eyebrow">EXPERIENCE LUXURY</span>
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
            <Link to="/home" className="landing-text-link">
              Explore Stays
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </Reveal>

          <Reveal delay={150} className="landing-experience-media-wrap">
            <div className="landing-experience-media">
              <img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
                alt="Luxury hotel experience"
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
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
                </svg>
              </div>
              <div>
                <span className="landing-experience-card-title">5-Star Rated</span>
                <span className="landing-experience-card-sub">Handpicked luxury collection</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ DESTINATIONS ============ */}
      <section className="landing-section landing-destinations">
        <div className="landing-container">
          <Reveal>
            <span className="landing-eyebrow">TOP DESTINATIONS</span>
            <h2 className="landing-section-title">Explore Where Your Journey Takes You</h2>
            <p className="landing-section-subtitle">
              Discover inspiring destinations and find the perfect stay for every kind of journey.
            </p>
          </Reveal>
          <div className="landing-destinations-grid">
            {DESTINATION_META.map((dest, i) => (
              <Reveal key={i} delay={i * 80} className={`landing-dest-reveal ${dest.large ? 'landing-dest-reveal-large' : ''}`}>
                <Link
                  to={`/search?location=${dest.name}`}
                  className={`landing-destination-card ${dest.large ? 'landing-destination-large' : ''}`}
                >
                  <div
                    className="landing-destination-bg"
                    style={{ backgroundImage: `url(${dest.image})` }}
                  />
                  <div className="landing-destination-overlay" />
                  <span className="landing-destination-count-pill">{destCounts[dest.name] ?? 0} Hotel{(destCounts[dest.name] ?? 0) !== 1 ? 's' : ''}</span>
                  <div className="landing-destination-content">
                    <h3 className="landing-destination-name">{dest.name}</h3>
                    <span className="landing-destination-explore">
                      Explore
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="landing-section landing-testimonials">
        <div className="landing-container">
          <Reveal>
            <span className="landing-eyebrow">TRAVELER STORIES</span>
            <h2 className="landing-section-title">Loved by Travelers Islandwide</h2>
            <p className="landing-section-subtitle">
              Real stories from travelers across Sri Lanka who chose StayVora for their journeys
            </p>
          </Reveal>
          <div className="landing-testimonials-grid">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="landing-testimonial-card">
                  <svg className="landing-testimonial-quote" width="36" height="36" viewBox="0 0 24 24" fill="#E2E8F0">
                    <path d="M10 7H6a4 4 0 0 0-4 4v6h6v-6H5a2 2 0 0 1 2-2h3V7zm10 0h-4a4 4 0 0 0-4 4v6h6v-6h-3a2 2 0 0 1 2-2h3V7z" />
                  </svg>
                  <Stars />
                  <p className="landing-testimonial-text">"{t.text}"</p>
                  <div className="landing-testimonial-author">
                    <img src={t.avatar} alt={t.name} className="landing-testimonial-avatar" />
                    <div>
                      <h4 className="landing-testimonial-name">{t.name}</h4>
                      <span className="landing-testimonial-location">{t.location}</span>
                    </div>
                  </div>
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
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920)' }}
        />
        <div className="landing-cta-overlay" />
        <Reveal className="landing-cta-content">
          <span className="landing-cta-badge">START YOUR JOURNEY</span>
          <h2 className="landing-cta-title">Ready to Begin Your Journey?</h2>
          <p className="landing-cta-desc">
            Join thousands of travelers who trust StayVora for their luxury stays
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
        
        <div className="landing-footer-bottom">
          <div className="landing-container">
            <p>&copy; {new Date().getFullYear()} StayVora. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}