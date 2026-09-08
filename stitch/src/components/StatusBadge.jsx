import React from 'react';

/**
 * Stitch-Exact Status Badge & Academic Pill
 * @param {Object} props
 * @param {'verified' | 'pending' | 'rejected' | 'at-risk' | 'info' | 'tier1' | 'tier2' | 'tier3'} [props.status='info']
 * @param {string} [props.label]
 * @param {string} [props.className]
 */
export default function StatusBadge({ status = 'info', label, className = '' }) {
  const styles = {
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    passed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
    'in-review': 'bg-amber-50 text-amber-700 border-amber-200/60',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200/60',
    'at-risk': 'bg-rose-50 text-rose-700 border-rose-200/60',
    info: 'bg-blue-50 text-blue-700 border-blue-200/60',
    tier1: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    tier2: 'bg-blue-100 text-blue-800 border-blue-300',
    tier3: 'bg-amber-100 text-amber-800 border-amber-300'
  };

  const currentStyle = styles[status?.toLowerCase()] || styles.info;
  const displayLabel = label || status;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle} ${className}`}
    >
      {displayLabel}
    </span>
  );
}
