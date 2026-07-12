import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const stats = [
  { value: '10,000+', label: 'Hotels Worldwide' },
  { value: '2M+', label: 'Happy Guests' },
  { value: '85+', label: 'Countries' },
  { value: '15+', label: 'Years of Service' },
];

const values = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20 18H4V6h16v12z" stroke="#155DFC" strokeWidth="2"/>
      </svg>
    ),
    title: 'Guest-First Approach',
    desc: 'Every decision we make starts with our guests in mind. Your comfort, safety, and satisfaction are our top priorities from search to checkout.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M16 20H8V4h8v16z" stroke="#155DFC" strokeWidth="2"/>
      </svg>
    ),
    title: 'Trusted & Secure',
    desc: 'We partner only with verified hotels and use industry-leading encryption to protect your personal and payment information.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20 19.07L12 13l-8 6.07V5a2 2 0 012-2h12a2 2 0 012 2v14.07z" stroke="#155DFC" strokeWidth="2"/>
      </svg>
    ),
    title: 'Curated Excellence',
    desc: 'Our team personally vets every property on our platform, ensuring only high-quality accommodations make it to your search results.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#155DFC" strokeWidth="2"/>
        <circle cx="12" cy="9" r="3" stroke="#155DFC" strokeWidth="2"/>
      </svg>
    ),
    title: 'Global Reach',
    desc: 'From boutique city hotels to tropical beach resorts, we offer an expansive selection across 85+ countries and growing.',
  },
];

const team = [
  { initials: 'SM', name: 'Sofia Martínez', role: 'Chief Executive Officer', bio: 'Former hospitality executive with 20 years of experience building travel platforms across Europe and the Americas.' },
  { initials: 'JO', name: 'James Okafor', role: 'Chief Technology Officer', bio: 'Tech veteran who previously led engineering at two leading OTAs. Passionate about making travel booking seamless.' },
  { initials: 'PN', name: 'Priya Nair', role: 'Head of Hotel Partnerships', bio: 'Built our global network of 10,000+ hotels over 8 years, focusing on quality, diversity, and fair pricing.' },
  { initials: 'LC', name: 'Lucas Chen', role: 'Head of Customer Experience', bio: 'Dedicated to ensuring every guest has an exceptional journey, from the first search to their safe return home.' },
];

export default function About() {
  return (
    <div className="ab-page">

      {/* ===== HERO ===== */}
      <section className="ab-hero">
        <div className="ab-hero-inner">
          <Link to="/home" className="ab-back-link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="#DBEAFE" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Home
          </Link>
          <div className="ab-hero-content">
            <h1 className="ab-hero-title">About Stayvora</h1>
            <p className="ab-hero-sub">
              We believe everyone deserves a perfect place to stay. Since 2010, we've been connecting travelers with exceptional hotels around the world — making every journey more comfortable, memorable, and stress-free.
            </p>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="ab-stats-section">
        <div className="ab-stats-row">
          {stats.map((s, i) => (
            <div key={i} className="ab-stat">
              <div className="ab-stat-icon">
                <div className="ab-stat-icon-circle">
                  {i === 0 && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20 18H4V6h16v12z" stroke="#fff" strokeWidth="2"/>
                      <path d="M8 18v2h8v-2" stroke="#fff" strokeWidth="2"/>
                    </svg>
                  )}
                  {i === 1 && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M14 6H6v8h8V6z" stroke="#fff" strokeWidth="2"/>
                      <path d="M10 6V4h10v10h-2" stroke="#fff" strokeWidth="2"/>
                      <path d="M3 8h2v4H3V8z" stroke="#fff" strokeWidth="2"/>
                      <path d="M4 8H3v5h1V8z" stroke="#fff" strokeWidth="2"/>
                    </svg>
                  )}
                  {i === 2 && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M16 20H8V4h8v16z" stroke="#fff" strokeWidth="2"/>
                    </svg>
                  )}
                  {i === 3 && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/>
                      <path d="M12 6v6l4 2" stroke="#fff" strokeWidth="2"/>
                    </svg>
                  )}
                </div>
              </div>
              <div className="ab-stat-value">{s.value}</div>
              <div className="ab-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== OUR STORY ===== */}
      <section className="ab-story-section">
        <div className="ab-story-inner">
          <h2 className="ab-section-title-left">Our Story</h2>
          <p className="ab-story-p">
            StayFinder was founded in 2010 by a group of seasoned travelers who were frustrated with the complexity and hidden costs of booking hotels online. We set out to build a platform that was transparent, easy to use, and genuinely focused on the traveler's needs.
          </p>
          <p className="ab-story-p">
            What started as a small startup with a handful of partner hotels in Western Europe has grown into a global platform trusted by over 2 million guests annually. We've expanded to 85+ countries while staying true to our founding principle: every guest deserves a great experience, from the moment they search to the moment they check out.
          </p>
          <p className="ab-story-p">
            Today, our team of over 300 passionate travel enthusiasts works around the clock to curate the best hotels, negotiate fair prices, and provide 24/7 support to guests around the globe. We're proud of how far we've come, and even more excited about where we're going.
          </p>
        </div>
      </section>

      {/* ===== WHAT WE STAND FOR ===== */}
      <section className="ab-values-section">
        <div className="ab-values-inner">
          <h2 className="ab-section-title-center">What We Stand For</h2>
          <p className="ab-values-sub">Our values guide every product decision, partnership, and customer interaction.</p>
          <div className="ab-values-grid">
            {values.map((v, i) => (
              <div key={i} className="ab-value-card">
                <div className="ab-value-icon">{v.icon}</div>
                <h3 className="ab-value-title">{v.title}</h3>
                <p className="ab-value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MEET THE TEAM ===== */}
      <section className="ab-team-section">
        <div className="ab-team-inner">
          <h2 className="ab-section-title-center">Meet the Team</h2>
          <p className="ab-team-sub">The people behind your perfect stay.</p>
          <div className="ab-team-grid">
            {team.map((t, i) => (
              <div key={i} className="ab-team-card">
                <div className="ab-team-avatar">{t.initials}</div>
                <div>
                  <h4 className="ab-team-name">{t.name}</h4>
                  <div className="ab-team-role">{t.role}</div>
                  <p className="ab-team-bio">{t.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
