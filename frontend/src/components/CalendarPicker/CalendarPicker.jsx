import React, { useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import './CalendarPicker.css';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const POPUP_WIDTH = 264;
const POPUP_HEIGHT = 272;

export function toDateInput(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CalendarPicker({ value, minDate, onSelect, onClose, alignRight, anchorRef }) {
  const anchor = value || minDate || toDateInput(new Date());
  const [view, setView] = useState(() => {
    const [y, m] = anchor.split('-').map(Number);
    return { y, m: m - 1 };
  });

  const [pos, setPos] = useState(null);

  const portalMode = !!anchorRef;

  useLayoutEffect(() => {
    if (!portalMode || !anchorRef?.current) return;
    const compute = () => {
      const r = anchorRef.current.getBoundingClientRect();
      let top = r.bottom + 8;
      if (top + POPUP_HEIGHT > window.innerHeight - 16) {
        top = r.top - POPUP_HEIGHT - 8;
      }
      let left = null;
      let right = null;
      if (alignRight) {
        right = Math.max(16, window.innerWidth - r.right);
      } else {
        left = Math.min(Math.max(16, r.left), Math.max(16, window.innerWidth - POPUP_WIDTH - 16));
      }
      setPos({ top, left, right });
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [portalMode, anchorRef, alignRight]);

  const today = toDateInput(new Date());
  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();

  const shift = (delta) =>
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const body = (
    <>
      <div className="cal-popup-header">
        <button type="button" className="cal-popup-nav" onClick={() => shift(-1)} aria-label="Previous month">‹</button>
        <span className="cal-popup-title">{MONTH_NAMES[view.m]} {view.y}</span>
        <button type="button" className="cal-popup-nav" onClick={() => shift(1)} aria-label="Next month">›</button>
      </div>
      <div className="cal-popup-grid">
        {WEEKDAYS.map((d) => (
          <span key={d} className="cal-popup-weekday">{d}</span>
        ))}
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <span key={`empty-${i}`} className="cal-popup-empty" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = dateStr === value;
          const isToday = dateStr === today;
          const isDisabled = minDate && dateStr < minDate;
          return (
            <button
              key={dateStr}
              type="button"
              className={`cal-popup-day${isSelected ? ' cal-popup-day-selected' : ''}${isToday ? ' cal-popup-day-today' : ''}`}
              disabled={isDisabled}
              onClick={() => {
                onSelect(dateStr);
                onClose();
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </>
  );

  if (portalMode && anchorRef?.current && pos) {
    return createPortal(
      <div
        className={`cal-popup cal-popup-fixed${alignRight ? ' cal-popup-right' : ''}`}
        style={{ top: pos.top, left: pos.left ?? undefined, right: pos.right ?? undefined }}
      >
        {body}
      </div>,
      document.body
    );
  }

  return (
    <div className={`cal-popup${alignRight ? ' cal-popup-right' : ''}`}>
      {body}
    </div>
  );
}