import React from 'react';
import { stats } from './data';

export default function StatsBarSection() {
  return (
    <section className="hop-stats-bar">
      <div className="hop-section-container">
        <div className="hop-stats-grid">
          {stats.map(s => (
            <div key={s.label} className="hop-stat">
              <div className="hop-stat-number">{s.value}</div>
              <div className="hop-stat-label-light">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
