import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Stitch Design System Button Component
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'outline' | 'outline-light' | 'outline-white' | 'white' | 'danger' | 'ghost'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {string} [props.icon] Material Symbols icon name
 * @param {boolean} [props.loading]
 * @param {string} [props.to] React Router route destination
 * @param {string} [props.href] Anchor tag destination
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  to,
  href,
  onClick,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variants = {
    primary:
      'bg-secondary text-on-secondary hover:bg-secondary/90 focus:ring-secondary/50 shadow-sm',
    secondary:
      'bg-primary-container text-on-primary hover:bg-primary-container/90 focus:ring-primary/50 shadow-sm',
    outline:
      'bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container-low focus:ring-secondary/30',
    'outline-light':
      'bg-white/10 text-white border border-white/40 hover:bg-white/20 focus:ring-white/50 backdrop-blur-sm shadow-sm',
    'outline-white':
      'bg-transparent text-white border border-white/60 hover:bg-white/10 focus:ring-white/50 shadow-sm',
    white:
      'bg-white text-primary hover:bg-slate-100 focus:ring-white/50 shadow-md font-bold',
    danger:
      'bg-error text-on-error hover:bg-error/90 focus:ring-error/50 shadow-sm',
    ghost:
      'bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  };

  const combinedClasses = `${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  const content = (
    <>
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClasses} onClick={onClick} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} onClick={onClick} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={props.type || 'button'}
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
}
