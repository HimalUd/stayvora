import React from 'react';
import SectionHeader from '../SectionHeader/SectionHeader';
import StarRow from '../StarRow/StarRow';
import { PersonIcon } from './icons';
import { testimonials } from './data';

export default function TestimonialsSection() {
  return (
    <section className="hop-testimonials">
      <div className="hop-section-container">
        <SectionHeader eyebrow="Partner Stories" title="What Hotel Owners Say" subtitle="Join thousands of successful hotel partners" />
        <div className="hop-testimonials-grid">
          {testimonials.map(t => (
            <div key={t.name} className="hop-testimonial-card">
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
  );
}
