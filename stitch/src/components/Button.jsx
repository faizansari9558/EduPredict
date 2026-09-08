import React from 'react';

/**
 * Stitch Design System Button Component
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {string} [props.icon] Material Symbols icon name
 * @param {boolean} [props.loading]
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-secondary text-on-secondary hover:bg-secondary/90 focus:ring-secondary/50 shadow-sm',
    secondary:
      'bg-primary-container text-on-primary hover:bg-primary-container/90 focus:ring-primary/50 shadow-sm',
    outline:
      'bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container-low focus:ring-secondary/30',
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

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
