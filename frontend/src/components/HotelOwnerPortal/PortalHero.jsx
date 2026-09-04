import React from 'react';
import Button from '../Button/Button';
import StarRow from '../StarRow/StarRow';
import PortalNav from './PortalNav';
import { CheckIcon } from './icons';
import { heroStats } from './data';

const checkmarks = ['No Setup Fees', 'Instant Activation', '24/7 Support'];

export default function PortalHero() {
  return (
    <section className="hop-hero">
      <PortalNav />
      <div className="hop-hero-body">
        <div className="hop-hero-text">
          <div className="hop-badge">For Hotel Owners</div>
          <h1 className="hop-hero-title">Reach Hundreds of <span className="hop-hero-accent">Travelers Islandwide</span></h1>
          <p className="hop-hero-desc">
            Join our platform and transform your hotel business. Get instant access to a global
            network of travelers, manage bookings effortlessly, and grow your revenue.
          </p>
          <div className="hop-hero-actions">
            <Button to="/hotel-owner-register" variant="primary" arrow>Get Started Free</Button>
            <Button to="/hotel-owner-login" variant="outline">Sign In</Button>
          </div>
          <div className="hop-hero-checkmarks">
            {checkmarks.map(c => (
              <div key={c} className="hop-check-item"><CheckIcon /> {c}</div>
            ))}
          </div>
        </div>
        <div className="hop-hero-stats-card">
          {heroStats.map(s => (
            <div key={s.label} className={`hop-stat-box ${s.boxClass}`}>
              <div className="hop-stat-info">
                <div className="hop-stat-label">{s.label}</div>
                <div className={s.stars ? 'hop-stat-row-value' : ''}>
                  <span className={`hop-stat-value ${s.valueClass}`}>{s.value}</span>
                  {s.stars && <StarRow />}
                </div>
              </div>
              <s.icon />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
