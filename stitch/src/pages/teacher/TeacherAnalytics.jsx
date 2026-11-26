import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import ChartCard from '../../components/ChartCard';
import StatCard from '../../components/StatCard';
import { teacherApi } from '../../services/teacherApi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

function formatValue(value, digits = 1) {
  return value == null || !Number.isFinite(Number(value)) ? '—' : Number(value).toFixed(digits);
}

export default function TeacherAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    teacherApi.getAnalytics()
      .then((response) => {
        if (active) setAnalytics(response.data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load departmental analytics.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const summary = analytics?.summary || {};
  const skills = analytics?.skillCategories || [];
  const atRiskStudents = analytics?.atRiskStudents || [];
  const distribution = useMemo(() => {
    const counts = new Map((analytics?.readinessDistribution || []).map((row) => [row.band, Number(row.students) || 0]));
    return [
      { band: '0-59', students: counts.get('0-59') || 0 },
      { band: '60-79', students: counts.get('60-79') || 0 },
      { band: '80-100', students: counts.get('80-100') || 0 }
    ];
  }, [analytics]);

  const lowestSkill = skills.reduce((lowest, skill) => (
    !lowest || Number(skill.average_proficiency) < Number(lowest.average_proficiency) ? skill : lowest
  ), null);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Department Analytics"
        title="Academic & Placement Analytics"
        subtitle="Measured student outcomes from departmental academic records, evaluated assessments, skills, and verified projects."
      />

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Average Placement Readiness"
          value={loading ? '…' : (summary.averageReadiness == null ? '—' : formatValue(summary.averageReadiness))}
          unit={summary.averageReadiness == null ? '' : '/ 100'}
          trend={summary.analyzedStudents ? `${summary.analyzedStudents} assessed students` : 'No evaluated assessment data'}
          trendDirection="neutral"
          icon="insights"
          iconColor="text-blue-800"
          iconBg="bg-blue-100"
        />
        <StatCard
          label="Lowest Assessed Skill"
          value={loading ? '…' : (lowestSkill?.category || '—')}
          trend={lowestSkill ? `${formatValue(lowestSkill.average_proficiency)}% average proficiency` : 'No measured skills yet'}
          trendDirection="neutral"
          icon="warning"
          iconColor="text-amber-800"
          iconBg="bg-amber-100"
        />
        <StatCard
          label="Below Readiness Threshold"
          value={loading ? '…' : (summary.belowReadinessCount ?? 0)}
          trend="Assessed students below 60%"
          trendDirection={summary.belowReadinessCount ? 'down' : 'neutral'}
          icon="contact_support"
          iconColor="text-red-800"
          iconBg="bg-red-100"
        />
        <StatCard
          label="Verified Projects per Student"
          value={loading ? '…' : formatValue(summary.verifiedProjectsPerStudent)}
          trend="Verified departmental portfolio projects"
          trendDirection="neutral"
          icon="code"
          iconColor="text-emerald-800"
          iconBg="bg-emerald-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Assessed Skill Proficiency"
          subtitle="Average score normalized to 100 for skills with completed attempts"
        >
          {skills.length ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skills.map((skill) => ({
                  ...skill,
                  average_proficiency: Number(skill.average_proficiency)
                }))}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="category" stroke="#64748B" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#CBD5E1" fontSize={10} />
                  <Radar
                    name="Department proficiency"
                    dataKey="average_proficiency"
                    stroke="#0051d5"
                    fill="#0051d5"
                    fillOpacity={0.35}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-on-surface-variant">
              {loading ? 'Loading skill assessment data…' : 'Skill comparisons appear after students complete skill-based assessments.'}
            </p>
          )}
        </ChartCard>

        <ChartCard
          title="Placement Readiness Distribution"
          subtitle="Students with at least one evaluated assessment; readiness score bands"
        >
          {summary.analyzedStudents ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="band" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis allowDecimals={false} stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="students" name="Students" fill="#14B8A6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-on-surface-variant">
              {loading ? 'Loading readiness data…' : 'No assessed students are available for this distribution.'}
            </p>
          )}
        </ChartCard>
      </div>

      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-heading font-bold text-lg text-on-surface">Students Below Readiness Threshold</h2>
            <p className="text-xs text-on-surface-variant">Based only on current evaluated placement-readiness data.</p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            {summary.belowReadinessCount || 0} students
          </span>
        </div>
        {atRiskStudents.length ? (
          <div className="space-y-2">
            {atRiskStudents.map((student) => (
              <div key={student.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low p-3">
                <div>
                  <div className="font-semibold text-sm text-on-surface">{student.full_name}</div>
                  <div className="text-xs text-on-surface-variant">{student.enrollment_number}</div>
                </div>
                {Number(summary.belowReadinessCount) > atRiskStudents.length && (
                  <p className="mt-3 text-xs text-on-surface-variant">
                    Showing the first {atRiskStudents.length} students by lowest readiness score.
                  </p>
                )}
                <div className="text-right text-xs text-on-surface-variant">
                  <div>Readiness: <strong className="text-amber-800">{formatValue(student.placement_ready_score)}%</strong></div>
                  <div>CGPA: {formatValue(student.cgpa, 2)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-on-surface-variant">
            {loading ? 'Loading student outcomes…' : 'No assessed students currently fall below the readiness threshold.'}
          </p>
        )}
      </section>
    </div>
  );
}
