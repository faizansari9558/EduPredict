import React from 'react';
import './analytics.css';

/**
 * Metric Progress Gauge / Key Performance Indicator Card
 * Pre-engineered for Academic Analysis, Coding Scores, and Placement Predictions
 */
export default function MetricGauge({
  label,
  value,
  max = 100,
  unit = '%',
  tone = 'blue',
  trend = null,
  description = null,
  className = ''
}) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const percentage = Math.min(100, Math.max(0, (numericValue / max) * 100));

  return (
    <div className={`metric-gauge metric-gauge--${tone} ${className}`}>
      <div className="metric-gauge__header">
        <span className="metric-gauge__label">{label}</span>
        {trend && (
          <span className={`metric-gauge__trend metric-gauge__trend--${trend.direction || 'up'}`}>
            {trend.direction === 'down' ? '↓' : '↑'} {trend.label || trend.value}
          </span>
        )}
      </div>

      <div className="metric-gauge__value-wrap">
        <span className="metric-gauge__number">{value}</span>
        {unit && <span className="metric-gauge__unit">{unit}</span>}
      </div>

      <div className="metric-gauge__progress-track">
        <div
          className="metric-gauge__progress-bar"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {description && <p className="metric-gauge__description">{description}</p>}
    </div>
  );
}
