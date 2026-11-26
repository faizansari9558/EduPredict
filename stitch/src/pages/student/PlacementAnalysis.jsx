import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { studentApi } from '../../services/studentApi';

function formatScore(value, digits = 1) {
  const score = Number(value);
  return Number.isFinite(score) ? score.toFixed(digits) : '—';
}

function DriverList({ title, items, tone, emptyMessage }) {
  const colors = tone === 'positive'
    ? 'border-emerald-200/60 bg-emerald-50/50 text-emerald-900'
    : 'border-amber-200/60 bg-amber-50/50 text-amber-900';

  return (
    <section className="space-y-4 rounded-xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
      <h2 className="border-b border-outline-variant/20 pb-3 font-heading text-base font-bold text-on-surface">{title}</h2>
      {items.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <article key={`${item.feature || item.category}-${index}`} className={`space-y-1 rounded-xl border p-4 ${colors}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <strong className="font-bold">{item.feature || item.category}</strong>
                <span className="font-mono font-bold">{item.value || item.impact || item.priority}</span>
              </div>
              <p className="text-xs opacity-80">{item.detail || item.action}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant">{emptyMessage}</p>
      )}
    </section>
  );
}

export default function PlacementAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    studentApi.getPlacementPrediction()
      .then((data) => {
        if (active) setAnalysis(data);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.message?.startsWith('Complete verified academic records')) {
          setUnavailable(requestError.message);
        } else {
          setError(requestError.message || 'Unable to load your placement analysis.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="p-6 text-sm text-on-surface-variant" role="status">Loading your placement analysis...</p>;
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700" role="alert">{error}</div>;
  }

  if (unavailable || !analysis) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <PageHeader
          eyebrow="Predictive Intelligence"
          title="Placement Analysis"
          subtitle="A forecast is shown only when it can be calculated from your own verified records and completed assessments."
          icon="model_training"
        />
        <section className="rounded-2xl border border-outline-variant/30 bg-surface p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">query_stats</span>
          <h2 className="mt-3 font-heading text-lg font-bold text-on-surface">Placement analysis is not available yet</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
            {unavailable || 'Your account does not yet have enough verified assessment data for a placement analysis.'}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to="/student/assessments" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
              View assessments
            </Link>
            <Link to="/student/academic-records" className="rounded-lg border border-outline-variant/50 px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container">
              Review academic records
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const { prediction = {}, explanation = {}, features_evaluated: features = {} } = analysis;
  const riskLevel = explanation.risk_level || 'Not available';
  const packageValue = Number(prediction.estimated_package_lpa) > 0
    ? `${formatScore(prediction.estimated_package_lpa)} LPA`
    : 'Not projected';

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        eyebrow="Predictive Intelligence"
        title="Placement Analysis"
        subtitle="A personalized forecast calculated from your verified academic profile, completed tests, and verified portfolio."
        icon="model_training"
      />

      <section className="flex flex-col justify-between gap-6 rounded-2xl border border-outline-variant/30 bg-primary-container p-6 text-on-primary shadow-sm sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-on-primary-container">Your model forecast</p>
          <h2 className="mt-2 font-heading text-3xl font-black text-on-primary">
            {formatScore(prediction.placement_probability_pct, 1)}% placement probability
          </h2>
          <p className="mt-2 text-sm text-on-primary-container">
            {prediction.placement_tier || 'Tier not available'} · {prediction.readiness_status || 'Readiness not available'}
          </p>
          <p className="mt-1 text-xs text-on-primary-container">
            Estimated package: {packageValue} · Model: {prediction.model_used || 'Not available'}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/10 p-4 text-center">
          <span className="text-[10px] font-bold uppercase text-on-primary-container">Risk level</span>
          <div className="mt-1 text-xl font-extrabold text-on-primary">{riskLevel}</div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cumulative GPA" value={formatScore(features.cgpa, 2)} unit="/ 10" icon="school" />
        <StatCard label="Aptitude Score" value={formatScore(features.aptitude_score)} unit="%" icon="psychology" />
        <StatCard label="Coding Score" value={formatScore(features.coding_score)} unit="%" icon="terminal" />
        <StatCard label="Verified Projects" value={features.num_projects ?? 0} icon="work" />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DriverList
          title="Positive Placement Drivers"
          items={explanation.positive_drivers || []}
          tone="positive"
          emptyMessage="No positive drivers were returned for your current data."
        />
        <DriverList
          title="Risks & Areas to Improve"
          items={explanation.risk_blockers || []}
          tone="risk"
          emptyMessage="No risk blockers were returned for your current data."
        />
      </section>

      <section className="space-y-4 rounded-xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
        <h2 className="border-b border-outline-variant/20 pb-3 font-heading text-base font-bold text-on-surface">
          Recommendations for your profile
        </h2>
        {explanation.actionable_recommendations?.length ? (
          <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {explanation.actionable_recommendations.map((item, index) => (
              <li key={`${item.category}-${index}`} className="flex items-start gap-3 rounded-xl bg-surface-container-low p-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-on-secondary">{index + 1}</span>
                <div>
                  <p className="text-xs font-bold text-on-surface">{item.category} · {item.priority}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{item.action}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-on-surface-variant">No recommendations are available for the current model output.</p>
        )}
      </section>

      <p className="text-xs text-on-surface-variant">
        This is an estimate based on available verified records and completed assessments, not a guarantee of placement.
      </p>
    </div>
  );
}
