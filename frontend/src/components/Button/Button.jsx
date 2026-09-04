import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

export default function Button({
  to,
  onClick,
  type = 'button',
  variant = 'primary',
  size,
  className,
  arrow,
  children,
  ...rest
}) {
  const classes = [
    'btn',
    variant && `btn-${variant}`,
    size === 'sm' && 'btn-sm',
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {children}
      {arrow && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" />
        </svg>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} {...rest}>
      {content}
    </button>
  );
}
