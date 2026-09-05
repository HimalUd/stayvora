import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar/Navbar';
import logoLight from '../assets/logos/logo-light.png';
import logoDark from '../assets/logos/logo-dark.png';
import { UPLOAD_HOST } from '../utils/api';
import './Landing.css';
import './ContactUs.css';

const contactCards = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    title: 'Call Us',
    desc: 'Speak directly with our support team',
    value: '+94 766576477',
    meta: 'Mon–Fri, 8am–8pm (SL Time)'
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <path d="M22 6l-10 7L2 6" />
      </svg>
    ),
    title: 'Email Us',
    desc: "We'll respond within 24 hours",
    value: 'hello@stayvora.com',
    meta: 'Available 24/7'
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Live Chat',
    desc: 'Chat with us in real time',
    value: 'Start a conversation',
    meta: 'Average wait: 2 minutes'
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Visit Us',
    desc: 'Come see us at our office',
    value: 'Uva wellassa university, Passara road, Badulla, Sri Lanka.',
    meta: 'Mon–Fri, 9am–5pm (SL Time)'
  }
];

const faqs = [
  {
    q: 'How do I cancel or modify a booking?',
    a: 'Head to "My Bookings" in your account, find the booking, and use the cancel or modify options. You can also contact our support team and we will assist you within 24 hours.'
  },
  {
    q: 'How we do the payments?',
    a: 'you can connect with the hotel and you can do the payments at the hotel or other methods that requesting by the hotel side.'
  },
  {
    q: 'Is my personal information secure?',
    a: 'Absolutely. We use industry-leading encryption and partner only with verified hotels to protect your personal and payment information.'
  },
  {
    q: 'Can I book on behalf of someone else?',
    a: 'Yes. You can make a booking for friends or family. Just enter the guest details during the booking process so the hotel can prepare accordingly.'
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

export default function ContactUs() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [sent, setSent] = useState(false);

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
      <section className="cu-hero">
        <div
          className="cu-hero-bg"
          style={{ backgroundImage: `url(${UPLOAD_HOST}/uploads/landing-page-image.jpg)` }}
        />
        <div className="landing-hero-overlay" />
        <div className="cu-hero-content">
          <div className="landing-hero-badge">
            <span className="landing-hero-badge-dot" />
            GET IN TOUCH
          </div>
          <h1 className="cu-hero-title">We'd Love to <span className="landing-hero-gradient">Hear</span> From You</h1>
          <p className="cu-hero-sub">
            Have a question, need help with a booking, or want to share feedback?
            Our team is here and happy to help.
          </p>
          <div className="landing-hero-actions">
            <a href="#cu-contact-form" className="landing-btn-gold landing-btn-hero">
              Send a Message
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <Link to="/home" className="landing-btn-glass landing-btn-hero">Browse Hotels</Link>
          </div>
        </div>
      </section>

      {/* ============ CONTACT CARDS ============ */}
      <section className="landing-section cu-cards-section">
        <div className="landing-container">
          <Reveal>
            <span className="landing-eyebrow">WAYS TO REACH US</span>
            <h2 className="landing-section-title">Choose What Works Best for You</h2>
            <p className="landing-section-subtitle">
              Our support team is ready to help you at every step of your journey
            </p>
          </Reveal>
          <div className="landing-features-grid">
            {contactCards.map((c, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="landing-feature-card cu-card">
                  <div className="landing-feature-icon">
                    <span className="landing-feature-icon-inner">{c.icon}</span>
                  </div>
                  <h3 className="landing-feature-title">{c.title}</h3>
                  <p className="landing-feature-desc">{c.desc}</p>
                  <span className="cu-card-value">{c.value}</span>
                  <div className="cu-card-meta">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span>{c.meta}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FORM + FAQ ============ */}
      <section className="cu-main-section">
        <div className="landing-container cu-main-layout">
          {/* LEFT — FORM */}
          <Reveal className="cu-form-col" delay={0}>
            <span className="landing-eyebrow cu-eyebrow-left">SEND US A MESSAGE</span>
            <h2 className="cu-section-title">We're Here to Help</h2>
            <p className="cu-section-desc">Fill out the form and we'll get back to you within one business day.</p>

            {sent ? (
              <div className="cu-success">
                <div className="cu-success-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form
                className="cu-form"
                id="cu-contact-form"
                onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              >
                <div className="cu-form-row">
                  <div className="cu-form-group">
                    <label>Full Name *</label>
                    <input type="text" placeholder="Nuwan Perera" required />
                  </div>
                  <div className="cu-form-group">
                    <label>Email Address *</label>
                    <input type="email" placeholder="nuwan@example.com" required />
                  </div>
                </div>
                <div className="cu-form-group">
                  <label>Category</label>
                  <select>
                    <option>General Inquiry</option>
                    <option>Booking Support</option>
                    <option>Partnership</option>
                    <option>Feedback</option>
                  </select>
                </div>
                <div className="cu-form-group">
                  <label>Subject *</label>
                  <input type="text" placeholder="How can we help you?" required />
                </div>
                <div className="cu-form-group">
                  <label>Message *</label>
                  <textarea placeholder="Describe your issue or question in detail..." rows={5} required />
                </div>
                <button type="submit" className="landing-btn-gold cu-submit-btn">
                  Send Message
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </form>
            )}
          </Reveal>

          {/* RIGHT — FAQ */}
          <Reveal className="cu-faq-col" delay={120}>
            <span className="landing-eyebrow cu-eyebrow-left">COMMON QUESTIONS</span>
            <h2 className="cu-section-title">Frequently Asked</h2>
            <p className="cu-section-desc">Quick answers to the questions we hear most often.</p>
            <div className="cu-faq-list">
              {faqs.map((f, i) => (
                <div key={i} className={`cu-faq-item ${openFaq === i ? 'cu-faq-item-open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div className="cu-faq-item-head">
                    <span>{f.q}</span>
                    <span className={`cu-faq-plus ${openFaq === i ? 'cu-faq-plus-open' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </div>
                  <div className="cu-faq-answer">
                    <p>{f.a}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="cu-hq-card">
              <div className="cu-hq-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l7-4 7 4v14" />
                  <path d="M9 21v-6h6v6" />
                </svg>
              </div>
              <div>
                <h4>StayVora Headquarters</h4>
                <p className="cu-hq-address">
                  Uva wellassa university, Passara road, Badulla, Sri Lanka.<br />
                  Sri Lanka
                </p>
                <div className="cu-hq-hours">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span>Office hours: Mon–Fri, 9am–5pm (SL Time)</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
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