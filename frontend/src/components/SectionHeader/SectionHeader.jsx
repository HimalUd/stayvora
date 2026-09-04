import React from 'react';
import './SectionHeader.css';

export default function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <>
      {eyebrow && <span className="section-header-eyebrow">{eyebrow}</span>}
      <h2 className="section-header-title">{title}</h2>
      <p className="section-header-subtitle">{subtitle}</p>
    </>
  );
}