import React from 'react';

export function LogoIcon({ width = 32, height = 32 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <rect x="8" y="2.67" width="16" height="26.67" rx="2" stroke="#2563EB" strokeWidth="2.67"/>
      <rect x="2.67" y="16" width="5.33" height="13.33" rx="1.33" stroke="#2563EB" strokeWidth="2.67"/>
      <rect x="24" y="12" width="5.33" height="17.33" rx="1.33" stroke="#2563EB" strokeWidth="2.67"/>
    </svg>
  );
}

export function CheckIcon({ width = 20, height = 20 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <rect x="1.67" y="1.66" width="16.67" height="16.67" rx="8.33" stroke="#00A63E" strokeWidth="1.67"/>
      <path d="M6.67 10l2.5 2.5 4.16-4.17" stroke="#00A63E" strokeWidth="1.67" strokeLinecap="round"/>
    </svg>
  );
}

export function PersonIcon({ bg, color }) {
  return (
    <div className="hop-person-icon" style={{ background: bg }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 10a4.17 4.17 0 100-8.33A4.17 4.17 0 0010 10z" stroke={color} strokeWidth="1.67"/>
        <path d="M2.5 18.33v-1.66a5 5 0 015-5h5a5 5 0 015 5v1.66" stroke={color} strokeWidth="1.67"/>
      </svg>
    </div>
  );
}

export function AnalyticsIcon({ width = 24, height = 24 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#9810FA" strokeWidth="2"/>
    </svg>
  );
}

export function GlobeIcon({ width = 24, height = 24 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="2" stroke="#155DFC" strokeWidth="2"/>
      <rect x="8" y="2" width="8" height="20" stroke="#155DFC" strokeWidth="2"/>
    </svg>
  );
}

export function CalendarIcon({ width = 24, height = 24 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <path d="M3 4h18v16H3V4z" stroke="#00A63E" strokeWidth="2"/>
      <path d="M3 8h18" stroke="#00A63E" strokeWidth="2"/>
    </svg>
  );
}

export function RevenueIcon({ width = 24, height = 24 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <rect x="6" y="5" width="12" height="14" rx="2" stroke="#F54900" strokeWidth="2"/>
    </svg>
  );
}

export function ShieldIcon({ width = 24, height = 24 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="#E60076" strokeWidth="2"/>
    </svg>
  );
}

export function BellIcon({ width = 24, height = 24 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="2" width="18" height="20" rx="2" stroke="#4F39F6" strokeWidth="2"/>
    </svg>
  );
}

export function StatRevenueIcon({ width = 48, height = 48 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="14" width="40" height="20" rx="2" stroke="#2563EB" strokeWidth="4"/>
      <rect x="32" y="14" width="12" height="20" stroke="#2563EB" strokeWidth="4"/>
    </svg>
  );
}

export function StatBookingsIcon({ width = 48, height = 48 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="8" width="36" height="36" rx="4" stroke="#F5A623" strokeWidth="4"/>
    </svg>
  );
}

export function StatRatingIcon({ width = 48, height = 48 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="38" rx="4" stroke="#155DFC" strokeWidth="4"/>
    </svg>
  );
}
