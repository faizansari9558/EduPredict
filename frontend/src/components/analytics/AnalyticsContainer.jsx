import React from 'react';
import './analytics.css';

/**
 * Responsive Grid Layout Container for Analytics Dashboards
 */
export default function AnalyticsContainer({
  columns = 2,
  gap = '20px',
  className = '',
  children
}) {
  return (
    <div
      className={`analytics-container analytics-container--cols-${columns} ${className}`}
      style={{ gap }}
    >
      {children}
    </div>
  );
}
