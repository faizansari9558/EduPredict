import React from 'react';

/**
 * Stitch Reusable Chart & Analytics Panel Card
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.action]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export default function ChartCard({
  title,
  subtitle,
  action,
  children,
  className = ''
}) {
  return (
    <div
      className={`flex flex-col justify-between bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            {title && (
              <h2 className="font-heading text-lg font-bold text-on-surface">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className="w-full flex-1 flex flex-col justify-center min-h-[220px]">
        {children}
      </div>
    </div>
  );
}
