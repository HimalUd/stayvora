import React from 'react';
import SectionHeader from '../SectionHeader/SectionHeader';
import { steps } from './data';

export default function HowItWorksSection() {
  return (
    <section className="hop-steps">
      <div className="hop-section-container">
        <SectionHeader eyebrow="Simple Setup" title="How It Works" subtitle="Get started in just 3 simple steps" />
        <div className="hop-steps-grid">
          {steps.map(s => (
            <div key={s.num} className="hop-step-card">
              <div className="hop-step-circle" style={{ background: s.bg }}>{s.num}</div>
              <h3 className="hop-step-title">{s.title}</h3>
              <p className="hop-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
