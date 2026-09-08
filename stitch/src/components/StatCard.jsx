import React from 'react';

/**
 * Stitch Metric KPI Card
 * @param {Object} props
 * @param {string} props.label
 * @param {string | number} props.value
 * @param {string} [props.unit]
 * @param {string} [props.icon] Material Symbols icon name
 * @param {string} [props.iconColor] Tailwind color classes
 * @param {string} [props.iconBg] Tailwind background class
 * @param {string} [props.trend] Trend text (e.g. "+0.4 vs Sem 5")
 * @param {'up' | 'down' | 'neutral'} [props.trendDirection='up']
 * @param {string} [props.badge] Contextual pill badge text
 * @param {string} [props.badgeType] Contextual pill tone
 */
export default function StatCard({
  label,
  value,
  unit,
  icon = 'school',
  iconColor = 'text-secondary',
  iconBg = 'bg-secondary-fixed',
  trend,
  trendDirection = 'up',
  badge,
  badgeType = 'info',
  className = ''
}) {
  return (
    <div
      className={`flex flex-col justify-between p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </span>
        <div
          className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}`}
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>

      <div className="my-3 flex items-baseline gap-1.5">
        <span className="font-heading text-3xl font-bold text-on-surface">{value}</span>
        {unit && (
          <span className="text-xs font-medium text-on-surface-variant">{unit}</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendDirection === 'up'
                ? 'text-emerald-700 bg-emerald-50'
                : trendDirection === 'down'
                ? 'text-rose-700 bg-rose-50'
                : 'text-slate-700 bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {trendDirection === 'up' ? 'trending_up' : trendDirection === 'down' ? 'trending_down' : 'remove'}
            </span>
            <span>{trend}</span>
          </div>
        )}

        {badge && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
