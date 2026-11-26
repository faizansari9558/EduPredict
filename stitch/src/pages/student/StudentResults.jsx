import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import { studentApi } from '../../services/studentApi';

function formatNumber(value) {
  const number = Number(value);
  if (value === null || value === undefined || !Number.isFinite(number)) return '—';
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

function formatType(type) {
  return String(type || 'Assessment')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    studentApi.getResults()
      .then((data) => {
        if (active) {
          setResults(data.results || []);
          setSummary(data.summary || null);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load your results.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const chartData = useMemo(() => {
    const groups = new Map();
    results.forEach((result) => {
      if (result.score_percent === null || result.score_percent === undefined) return;
      const label = formatType(result.type);
      const group = groups.get(label) || { type: label, total: 0, count: 0 };
      group.total += Number(result.score_percent);
      group.count += 1;
      groups.set(label, group);
    });
    return Array.from(groups.values()).map((group) => ({
      type: group.type,
      score: Math.round((group.total / group.count) * 100) / 100
    }));
  }, [results]);

  if (loading) {
    return <p className="p-6 text-sm text-on-surface-variant" role="status">Loading your assessment results...</p>;
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700" role="alert">{error}</div>;
  }

  const columns = [
    {
      key: 'title',
      label: 'Assessment',
      render: (_, row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.title}</div>
          <div className="text-xs text-on-surface-variant">{formatType(row.type)} · {formatDate(row.submitted_at)}</div>
        </div>
      )
    },
    {
      key: 'score',
      label: 'Score',
      render: (_, row) => (
        <span className="font-mono font-bold text-primary">
          {row.score_percent === null
            ? `${formatNumber(row.score)} points`
            : row.max_score === null
              ? `${formatNumber(row.score_percent)}%`
            : `${formatNumber(row.score)} / ${formatNumber(row.max_score)}${row.score_percent === null ? '' : ` (${formatNumber(row.score_percent)}%)`}`}
        </span>
      )
    },
    {
      key: 'percentile',
      label: 'Percentile',
      render: (_, row) => row.percentile === null ? '—' : `${row.percentile}%`
    },
    {
      key: 'rank',
      label: 'Rank',
      render: (_, row) => row.rank === null ? 'Not enough participants' : `${row.rank} / ${row.cohort_size}`
    }
  ];
  const averageScore = summary?.average_score;
  const bestScore = summary?.best_score;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Evaluation & Benchmarks"
        title="Assessment Results & Rank Card"
        subtitle="Scores and rankings from assessments and coding challenges completed by your account."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completed Assessments" value={summary?.completed_assessments ?? 0} icon="task_alt" />
        <StatCard label="Coding Submissions" value={summary?.coding_submissions ?? 0} icon="terminal" />
        <StatCard
          label="Average Score"
          value={formatNumber(averageScore)}
          unit={averageScore === null || averageScore === undefined ? '' : '%'}
          icon="analytics"
        />
        <StatCard
          label="Best Score"
          value={formatNumber(bestScore)}
          unit={bestScore === null || bestScore === undefined ? '' : '%'}
          icon="military_tech"
        />
      </div>

      {results.length === 0 ? (
        <section className="rounded-2xl border border-outline-variant/30 bg-surface p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">fact_check</span>
          <h2 className="mt-3 font-heading text-lg font-bold text-on-surface">No results yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-on-surface-variant">
            Your results and rank will appear here after you complete and submit an aptitude, coding, or other assessment.
          </p>
        </section>
      ) : (
        <>
          {chartData.length > 0 && (
            <ChartCard title="Your Average Scores" subtitle="Calculated from your completed assessments and graded coding submissions.">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="type" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Average score']} />
                    <Bar dataKey="score" fill="#0051d5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}

          <section>
            <h2 className="mb-4 font-heading text-lg font-bold text-on-surface">Completed Assessment Results</h2>
            <DataTable
              columns={columns}
              data={results}
              keyField="id"
              emptyMessage="No completed assessments or graded coding submissions yet."
            />
          </section>
        </>
      )}
    </div>
  );
}
