import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import ChartCard from '../../components/ChartCard';
import { teacherApi } from '../../services/teacherApi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

function percentage(result) {
  if (result.score == null || result.total_marks == null) return null;
  const maximum = Number(result.total_marks);
  const score = Number(result.score);
  return maximum > 0 && Number.isFinite(score) ? Math.max(0, Math.min(100, (score / maximum) * 100)) : null;
}

function formatValue(value, digits = 1) {
  return value == null || !Number.isFinite(Number(value)) ? '—' : Number(value).toFixed(digits);
}

export default function TeacherResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedAssessment = searchParams.get('assessmentId') || '';
  const [assessments, setAssessments] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(requestedAssessment);
  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    teacherApi.getAssessments()
      .then((response) => {
        if (!active) return;
        const rows = response.data || [];
        setAssessments(rows);
        const requestedExists = rows.some((row) => String(row.id) === requestedAssessment);
        const nextId = requestedExists ? requestedAssessment : (rows[0] ? String(rows[0].id) : '');
        setSelectedAssessmentId(nextId);
        if (nextId !== requestedAssessment) {
          setSearchParams(nextId ? { assessmentId: nextId } : {}, { replace: true });
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load teacher assessments.');
      })
      .finally(() => {
        if (active) setLoadingAssessments(false);
      });
    return () => {
      active = false;
    };
  }, [requestedAssessment, setSearchParams]);

  useEffect(() => {
    if (!selectedAssessmentId) {
      setResults([]);
      return undefined;
    }

    let active = true;
    setLoadingResults(true);
    setError('');
    teacherApi.getAssessmentResults(selectedAssessmentId)
      .then((response) => {
        if (active) setResults(response.data || []);
      })
      .catch((requestError) => {
        if (active) {
          setResults([]);
          setError(requestError.message || 'Unable to load assessment results.');
        }
      })
      .finally(() => {
        if (active) setLoadingResults(false);
      });
    return () => {
      active = false;
    };
  }, [selectedAssessmentId]);

  const evaluatedResults = useMemo(() => results
    .map((row, index) => ({ ...row, rank: index + 1, normalizedScore: percentage(row) }))
    .filter((row) => row.status === 'evaluated' && row.normalizedScore != null), [results]);

  const scoreBrackets = useMemo(() => {
    const bands = [
      { range: '0-39%', minimum: 0, maximum: 40, count: 0 },
      { range: '40-59%', minimum: 40, maximum: 60, count: 0 },
      { range: '60-79%', minimum: 60, maximum: 80, count: 0 },
      { range: '80-100%', minimum: 80, maximum: 101, count: 0 }
    ];
    evaluatedResults.forEach((result) => {
      const band = bands.find((item) => result.normalizedScore >= item.minimum && result.normalizedScore < item.maximum);
      if (band) band.count += 1;
    });
    return bands;
  }, [evaluatedResults]);

  const metrics = useMemo(() => {
    const scores = evaluatedResults.map((row) => row.normalizedScore);
    if (!scores.length) return null;
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + ((score - average) ** 2), 0) / scores.length;
    return {
      average,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      standardDeviation: Math.sqrt(variance)
    };
  }, [evaluatedResults]);

  const selectedAssessment = assessments.find((row) => String(row.id) === selectedAssessmentId);
  const columns = [
    {
      key: 'rank',
      label: 'Rank',
      render: (value) => <span className="font-mono font-bold text-primary">#{value}</span>
    },
    {
      key: 'student',
      label: 'Student',
      render: (_, row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.full_name}</div>
          <div className="text-xs font-mono text-on-surface-variant">{row.enrollment_number}</div>
        </div>
      )
    },
    {
      key: 'score',
      label: 'Score',
      render: (value, row) => `${formatValue(value, 2)} / ${formatValue(row.total_marks, 2)}`
    },
    {
      key: 'normalizedScore',
      label: 'Percentage',
      render: (value) => `${formatValue(value)}%`
    },
    {
      key: 'submitted_at',
      label: 'Submitted',
      render: (value) => value ? new Date(value).toLocaleString() : '—'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Evaluation Matrix"
        title="Assessment Results"
        subtitle="Rankings and score distributions are calculated only from evaluated attempts by active students in your department."
      />

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4">
        <label htmlFor="teacher-assessment-select" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
          Assessment
        </label>
        <select
          id="teacher-assessment-select"
          value={selectedAssessmentId}
          onChange={(event) => {
            const nextId = event.target.value;
            setSelectedAssessmentId(nextId);
            setSearchParams(nextId ? { assessmentId: nextId } : {});
          }}
          disabled={loadingAssessments || !assessments.length}
          className="w-full sm:max-w-xl rounded-xl border border-outline-variant/50 bg-surface px-4 py-2.5 text-sm"
        >
          <option value="">{loadingAssessments ? 'Loading assessments…' : 'No assessments available'}</option>
          {assessments.map((assessment) => (
            <option key={assessment.id} value={assessment.id}>{assessment.title}</option>
          ))}
        </select>
        {selectedAssessment && (
          <p className="mt-2 text-xs text-on-surface-variant">
            {selectedAssessment.assessment_type} · {selectedAssessment.evaluated_attempts || 0} evaluated attempts
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Evaluated Score Distribution"
            subtitle="Student count grouped by normalized score percentage"
          >
            {evaluatedResults.length ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreBrackets} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="range" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis allowDecimals={false} stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Students" fill="#0051d5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-on-surface-variant">
                {loadingResults ? 'Loading evaluated attempts…' : 'No evaluated attempts are available for this assessment.'}
              </p>
            )}
          </ChartCard>
        </div>

        <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <h2 className="font-heading font-bold text-base text-on-surface mb-3">Assessment Metrics</h2>
          {metrics ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between rounded-xl bg-surface-container-low p-3">
                <span className="text-on-surface-variant">Average</span>
                <strong>{formatValue(metrics.average)}%</strong>
              </div>
              <div className="flex justify-between rounded-xl bg-surface-container-low p-3">
                <span className="text-on-surface-variant">Highest</span>
                <strong className="text-emerald-700">{formatValue(metrics.highest)}%</strong>
              </div>
              <div className="flex justify-between rounded-xl bg-surface-container-low p-3">
                <span className="text-on-surface-variant">Lowest</span>
                <strong className="text-amber-700">{formatValue(metrics.lowest)}%</strong>
              </div>
              <div className="flex justify-between rounded-xl bg-surface-container-low p-3">
                <span className="text-on-surface-variant">Standard deviation</span>
                <strong>±{formatValue(metrics.standardDeviation)}</strong>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-on-surface-variant">
              {loadingResults ? 'Calculating results…' : 'Metrics appear after attempts have been evaluated.'}
            </p>
          )}
          <p className="mt-4 border-t border-outline-variant/20 pt-3 text-center text-xs text-on-surface-variant">
            {evaluatedResults.length} evaluated students
          </p>
        </section>
      </div>

      <section>
        <h2 className="font-heading font-bold text-lg text-on-surface mb-3">Student Leaderboard</h2>
        <DataTable
          columns={columns}
          data={evaluatedResults}
          emptyMessage={loadingResults ? 'Loading evaluated results…' : 'No evaluated results to rank.'}
        />
      </section>
    </div>
  );
}
