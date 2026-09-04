import React from 'react';
import SectionHeader from '../SectionHeader/SectionHeader';
import { features, growthPoints } from './data';
import { CheckIcon } from './icons';

export default function FeaturesSection() {
  return (
    <section className="hop-features">
      <div className="hop-section-container">
        <SectionHeader
          eyebrow="Owner Tools"
          title="Grow Your Sales Across Sri Lanka"
          subtitle="Built for Sri Lankan hotels and homestays — powerful tools that help you win more bookings, all year round"
        />
        <div className="hop-features-grid">
          {features.map(f => (
            <div key={f.title} className="hop-feature-card">
              <div className="hop-feature-icon" style={{ background: f.bg }}><f.icon /></div>
              <h3 className="hop-feature-title">{f.title}</h3>
              <p className="hop-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="hop-growth">
          <h3 className="hop-growth-title">How owners grow with StayVora</h3>
          <div className="hop-growth-grid">
            {growthPoints.map(g => (
              <div key={g.title} className="hop-growth-item">
                <div className="hop-growth-check"><CheckIcon /></div>
                <div>
                  <h4 className="hop-growth-name">{g.title}</h4>
                  <p className="hop-growth-desc">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}