import React from 'react';

/**
 * Stitch Page Header Component
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.eyebrow]
 * @param {string} [props.icon]
 * @param {React.ReactNode} [props.actions]
 */
export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  icon,
  actions,
  className = ''
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-outline-variant/30 ${className}`}
    >
      <div>
        {eyebrow && (
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
            {eyebrow}
          </span>
        )}
        <div className="flex items-center gap-2">
          {icon && (
            <span className="material-symbols-outlined text-secondary text-2xl">
              {icon}
            </span>
          )}
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-on-surface">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">{subtitle}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </div>
  );
}
