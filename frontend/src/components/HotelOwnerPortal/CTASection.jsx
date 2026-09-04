import React from 'react';
import Button from '../Button/Button';

export default function CTASection() {
  return (
    <section className="hop-cta">
      <div className="hop-section-container">
        <h2 className="hop-cta-title">Ready to Grow Your Hotel Business?</h2>
        <p className="hop-cta-desc">
          Join our platform today and start receiving bookings from travelers worldwide
        </p>
        <div className="hop-cta-actions">
          <Button to="/hotel-owner-register" variant="white" arrow>Register Your Hotel</Button>
          <Button to="/hotel-owner-login" variant="white-outline">Sign In</Button>
        </div>
        <p className="hop-cta-footnote">No credit card required • Free to get started • Cancel anytime</p>
      </div>
    </section>
  );
}
