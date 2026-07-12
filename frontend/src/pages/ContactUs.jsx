import React from 'react';
import { Link } from 'react-router-dom';
import './ContactUs.css';

export default function ContactUs() {
  return (
    <div className="cu-page">

      {/* ===== HERO ===== */}
      <section className="cu-hero">
        <div className="cu-hero-inner">
          <Link to="/home" className="cu-back-link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="#DBEAFE" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Home
          </Link>
          <div className="cu-hero-content">
            <h1 className="cu-hero-title">Contact Us</h1>
            <p className="cu-hero-sub">
              Have a question, need help with a booking, or want to share feedback? Our team is here and happy to help.
            </p>
          </div>
        </div>
      </section>

      {/* ===== CONTACT CARDS ===== */}
      <section className="cu-cards-section">
        <div className="cu-cards-row">
          <div className="cu-card">
            <div className="cu-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="#155DFC" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="cu-card-title">Call Us</h3>
            <p className="cu-card-desc">Speak directly with our support team</p>
            <span className="cu-card-value">+1 (800) 555-0199</span>
            <div className="cu-card-meta">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#99A1AF" strokeWidth="1"/>
                <path d="M6 3v3l2 2" stroke="#99A1AF" strokeWidth="1"/>
              </svg>
              <span>Mon–Fri, 8am–8pm EST</span>
            </div>
          </div>
          <div className="cu-card">
            <div className="cu-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#155DFC" strokeWidth="2" strokeLinecap="round"/>
                <path d="M22 6l-10 7L2 6" stroke="#155DFC" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="cu-card-title">Email Us</h3>
            <p className="cu-card-desc">We'll respond within 24 hours</p>
            <span className="cu-card-value">hello@stayfinder.com</span>
            <div className="cu-card-meta">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#99A1AF" strokeWidth="1"/>
                <path d="M6 3v3l2 2" stroke="#99A1AF" strokeWidth="1"/>
              </svg>
              <span>Available 24/7</span>
            </div>
          </div>
          <div className="cu-card">
            <div className="cu-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#155DFC" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="cu-card-title">Live Chat</h3>
            <p className="cu-card-desc">Chat with us in real time</p>
            <span className="cu-card-value">Start a conversation</span>
            <div className="cu-card-meta">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#99A1AF" strokeWidth="1"/>
                <path d="M6 3v3l2 2" stroke="#99A1AF" strokeWidth="1"/>
              </svg>
              <span>Average wait: 2 minutes</span>
            </div>
          </div>
          <div className="cu-card">
            <div className="cu-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#155DFC" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="10" r="3" stroke="#155DFC" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="cu-card-title">Visit Us</h3>
            <p className="cu-card-desc">Come see us at our HQ</p>
            <span className="cu-card-value">350 5th Avenue, New York, NY</span>
            <div className="cu-card-meta">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#99A1AF" strokeWidth="1"/>
                <path d="M6 3v3l2 2" stroke="#99A1AF" strokeWidth="1"/>
              </svg>
              <span>Mon–Fri, 9am–5pm EST</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FORM + FAQ ===== */}
      <section className="cu-main-section">
        <div className="cu-main-layout">
          {/* LEFT — FORM */}
          <div className="cu-form-col">
            <h2 className="cu-section-title">Send Us a Message</h2>
            <p className="cu-section-desc">Fill out the form and we'll get back to you within one business day.</p>
            <form className="cu-form" onSubmit={(e) => e.preventDefault()}>
              <div className="cu-form-row">
                <div className="cu-form-group">
                  <label>Full Name *</label>
                  <input type="text" placeholder="John Smith" />
                </div>
                <div className="cu-form-group">
                  <label>Email Address *</label>
                  <input type="email" placeholder="john@example.com" />
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
                <input type="text" placeholder="How can we help you?" />
              </div>
              <div className="cu-form-group">
                <label>Message *</label>
                <textarea placeholder="Describe your issue or question in detail..." rows={5} />
              </div>
              <button type="submit" className="cu-submit-btn">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M16.67 3.33L9.17 10.83" stroke="#fff" strokeWidth="1.67" strokeLinecap="round"/>
                  <path d="M16.67 3.33l-5.84 14.17-2.5-5.83-5.83-2.5 14.17-5.84z" stroke="#fff" strokeWidth="1.67" strokeLinecap="round"/>
                </svg>
                Send Message
              </button>
            </form>
          </div>

          {/* RIGHT — FAQ */}
          <div className="cu-faq-col">
            <h2 className="cu-section-title">Common Questions</h2>
            <p className="cu-section-desc">Quick answers to the questions we hear most often.</p>
            <div className="cu-faq-list">
              <div className="cu-faq-item">
                <span>How do I cancel or modify a booking?</span>
                <span className="cu-faq-plus">+</span>
              </div>
              <div className="cu-faq-item">
                <span>What payment methods do you accept?</span>
                <span className="cu-faq-plus">+</span>
              </div>
              <div className="cu-faq-item">
                <span>Is my personal information secure?</span>
                <span className="cu-faq-plus">+</span>
              </div>
              <div className="cu-faq-item">
                <span>Can I book on behalf of someone else?</span>
                <span className="cu-faq-plus">+</span>
              </div>
            </div>

            <div className="cu-hq-card">
              <div className="cu-hq-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M13.33 16.67L10 18.33l-3.33-1.66H3.33V3.33h13.34v13.34h-3.34z" stroke="#fff" strokeWidth="1.67"/>
                  <path d="M7.5 5.83l-2.5 2.5" stroke="#fff" strokeWidth="1.67"/>
                  <path d="M5 5.83l2.5 2.5" stroke="#fff" strokeWidth="1.67"/>
                </svg>
              </div>
              <div>
                <h4>StayFinder Headquarters</h4>
                <p className="cu-hq-address">
                  350 5th Avenue, Suite 4800<br />
                  New York, NY 10118<br />
                  United States
                </p>
                <div className="cu-hq-hours">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6.67" stroke="#6A7282" strokeWidth="1.33"/>
                    <path d="M8 4.67V8l2.67 2.67" stroke="#6A7282" strokeWidth="1.33"/>
                  </svg>
                  <span>Office hours: Mon–Fri, 9am–5pm EST</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
