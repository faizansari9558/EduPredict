import React from 'react';
import './analytics.css';

/**
 * Reusable Analytics Card Container
 * Used for encapsulating charts, metrics, and data visualizations
 */
export default function AnalyticsCard({
  title,
  subtitle,
  badge,
  icon,
  action,
  loading = false,
  error = null,
  className = '',
  children
}) {
  return (
    <div className={`analytics-card ${className}`}>
      {(title || subtitle || badge || icon || action) && (
        <div className="analytics-card__header">
          <div className="analytics-card__title-group">
            {icon && <span className="analytics-card__icon">{icon}</span>}
            <div>
              {title && <h3 className="analytics-card__title">{title}</h3>}
              {subtitle && <p className="analytics-card__subtitle">{subtitle}</p>}
            </div>
          </div>
          <div className="analytics-card__actions">
            {badge && <span className={`analytics-card__badge ${badge.tone ? `analytics-card__badge--${badge.tone}` : ''}`}>{badge.label || badge}</span>}
            {action}
          </div>
        </div>
      )}

      <div className="analytics-card__body">
        {loading ? (
          <div className="analytics-card__loader">
            <div className="analytics-card__spinner" />
            <span>Loading analytics data...</span>
          </div>
        ) : error ? (
          <div className="analytics-card__error">
            <span className="error-icon">⚠️</span>
            <p>{typeof error === 'string' ? error : 'Failed to load chart data'}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
