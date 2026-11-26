import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { analyticsApi } from '../../services/adminApi';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const COLORS = ['#1D4ED8', '#0F766E', '#7C3AED', '#D97706', '#DB2777', '#64748B'];
const TREND_SERIES = [
  { key: 'Aptitude', color: '#1D4ED8' },
  { key: 'Coding', color: '#0F766E' },
  { key: 'General', color: '#7C3AED' }
];
const PERFORMANCE_BANDS = ['0-39', '40-59', '60-79', '80-100'];

function ChartEmptyState({ children }) {
  return (
    <div className="flex h-full min-h-[220px] items-center justify-center rounded-lg border border-dashed border-outline-variant/50 px-6 text-center text-sm text-on-surface-variant">
      {children}
    </div>
  );
}

function formatMonth(period) {
  const [year, month] = String(period).split('-').map(Number);
  if (!year || !month) return period;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export default function InstitutionalAnalytics() {
  const [state, setState] = useState({
    loading: true,
    error: '',
    overview: null,
    departments: [],
    readiness: [],
    performance: { students_analyzed: 0, bands: [] },
    assessmentResults: { passed_attempts: 0, needs_support_attempts: 0, evaluated_attempts: 0 },
    academicTrends: [],
    skills: []
  });

  useEffect(() => {
    let active = true;
    Promise.all([
      analyticsApi.getSystemOverview(),
      analyticsApi.getDepartmentComparison(),
      analyticsApi.getPlacementReadiness(),
      analyticsApi.getStudentPerformance(),
      analyticsApi.getAssessmentResults(),
      analyticsApi.getAcademicTrends(),
      analyticsApi.getSkillsComparison()
    ]).then(([overview, departments, readiness, performance, assessmentResults, academicTrends, skills]) => {
      if (!active) return;
      setState({
        loading: false,
        error: '',
        overview: overview.data || {},
        departments: departments.data?.departments || [],
        readiness: readiness.data?.placement_readiness || [],
        performance: performance.data || { students_analyzed: 0, bands: [] },
        assessmentResults: assessmentResults.data || { passed_attempts: 0, needs_support_attempts: 0, evaluated_attempts: 0 },
        academicTrends: academicTrends.data?.monthly_trends || [],
        skills: skills.data?.categories || []
      });
    }).catch((error) => {
      if (!active) return;
      setState((current) => ({
        ...current,
        loading: false,
        error: error.message || 'Analytics are unavailable.'
      }));
    });

    return () => { active = false; };
  }, []);

  const overview = state.overview || {};
  const departments = useMemo(() => state.departments.map((item) => ({
    id: item.id,
    name: item.name,
    students: Number(item.student_count || 0)
  })), [state.departments]);
  const performanceBands = useMemo(() => {
    if (Number(state.performance.students_analyzed || 0) === 0) return [];
    const counts = new Map(state.performance.bands.map((item) => [item.band, Number(item.students || 0)]));
    return PERFORMANCE_BANDS.map((band) => ({ band, students: counts.get(band) || 0 }));
  }, [state.performance]);
  const departmentDistribution = departments.filter((item) => item.students > 0);
  const assessmentResults = [
    { name: 'Passed (60%+)', value: Number(state.assessmentResults.passed_attempts || 0), color: '#16A34A' },
    { name: 'Needs support (<60%)', value: Number(state.assessmentResults.needs_support_attempts || 0), color: '#DC2626' }
  ].filter((item) => item.value > 0);
  const academicTrends = useMemo(() => {
    const byPeriod = new Map();
    state.academicTrends.forEach((item) => {
      const period = String(item.period);
      if (!byPeriod.has(period)) {
        byPeriod.set(period, {
          period,
          month: formatMonth(period),
          evaluatedAttempts: 0
        });
      }
      const point = byPeriod.get(period);
      const key = item.assessment_type
        ? `${item.assessment_type.charAt(0).toUpperCase()}${item.assessment_type.slice(1).toLowerCase()}`
        : 'General';
      point[key] = Number(item.average_score);
      point.evaluatedAttempts += Number(item.evaluated_attempts || 0);
    });
    return Array.from(byPeriod.values()).sort((a, b) => a.period.localeCompare(b.period));
  }, [state.academicTrends]);
  const activeTrendSeries = TREND_SERIES.filter((series) =>
    academicTrends.some((period) => period[series.key] != null)
  );
  const skills = useMemo(() => state.skills.map((item) => ({
    category: item.category,
    proficiency: Number(item.average_proficiency),
    studentsAssessed: Number(item.students_assessed || 0),
    attempts: Number(item.skill_attempts || 0)
  })), [state.skills]);
  const placementReadiness = state.readiness
    .filter((item) => Number(item.analyzed_students || 0) > 0 && item.ready_pct != null)
    .map((item) => ({
      department: item.department,
      ready: Number(item.ready_pct),
      readyCount: Number(item.ready_count || 0),
      analyzed: Number(item.analyzed_students || 0)
    }));

  const totalStudents = Number(overview.total_students || 0);
  const assessedStudents = Number(state.performance.students_analyzed || 0);
  const assessmentCoverage = totalStudents > 0 ? assessedStudents / totalStudents * 100 : null;
  const evaluatedAttempts = Number(state.assessmentResults.evaluated_attempts || 0);
  const passedAttempts = Number(state.assessmentResults.passed_attempts || 0);
  const passRate = evaluatedAttempts > 0 ? passedAttempts / evaluatedAttempts * 100 : null;
  const hasPerformanceData = assessedStudents > 0;
  const hasDepartmentDistribution = departmentDistribution.length > 0;
  const hasAssessmentResults = evaluatedAttempts > 0;
  const hasAcademicTrends = academicTrends.length > 0;
  const hasSkillsRadar = skills.length >= 3;
  const hasPlacementData = placementReadiness.length > 0;
  const reportError = state.error ? 'Analytics could not be loaded. Please try again later.' : null;
  const displayMetric = (value, formatter = String) => (
    state.loading ? '…' : state.error ? '—' : value == null ? '—' : formatter(value)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Institutional Intelligence"
        title="Campus Analytics"
        subtitle="Six evidence-based views of student performance, assessment outcomes, academic progress, skills, and placement readiness."
        actions={<span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${state.error ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}><span className={`h-2 w-2 rounded-full ${state.error ? 'bg-rose-500' : 'bg-emerald-500'}`} />{state.error ? 'Data unavailable' : state.loading ? 'Loading database' : 'Live database analysis'}</span>}
      />

      {state.error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{state.error}</div>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Active students" value={displayMetric(overview.total_students)} trend={state.error ? 'Data unavailable' : 'Active student accounts'} trendDirection="neutral" icon="school" iconBg="bg-blue-100" iconColor="text-blue-800" />
        <StatCard label="Assessments configured" value={displayMetric(overview.total_assessments)} trend={state.error ? 'Data unavailable' : 'Assessment records'} trendDirection="neutral" icon="assignment" iconBg="bg-violet-100" iconColor="text-violet-800" />
        <StatCard label="Assessment coverage" value={displayMetric(assessmentCoverage, (value) => `${value.toFixed(1)}%`)} trend={state.error ? 'Data unavailable' : state.loading ? 'Loading data' : `${assessedStudents} of ${totalStudents} students assessed`} trendDirection="neutral" icon="fact_check" iconBg="bg-cyan-100" iconColor="text-cyan-800" />
        <StatCard label="Assessment pass rate" value={displayMetric(passRate, (value) => `${value.toFixed(1)}%`)} trend={state.error ? 'Data unavailable' : `${evaluatedAttempts} evaluated attempts`} trendDirection="neutral" icon="task_alt" iconBg="bg-emerald-100" iconColor="text-emerald-800" />
        <StatCard label="Placement readiness" value={displayMetric(overview.placement_ready_pct, (value) => `${Number(value).toFixed(1)}%`)} trend={state.error ? 'Data unavailable' : `${Number(overview.placement_ready_students || 0)} assessed students ready`} trendDirection="neutral" icon="trending_up" iconBg="bg-amber-100" iconColor="text-amber-800" />
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
        <ChartCard title="Student Performance" subtitle="Students grouped by their average evaluated assessment score">
          <div className="h-[320px]">
            {state.loading ? <ChartEmptyState>Loading student performance…</ChartEmptyState> : reportError ? <ChartEmptyState>{reportError}</ChartEmptyState> : !hasPerformanceData ? <ChartEmptyState>No evaluated assessment scores are available yet.</ChartEmptyState> : (
              <ResponsiveContainer>
                <BarChart data={performanceBands} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="band" width={76} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [`${Number(value)} students`, 'Student count']} />
                  <Bar dataKey="students" name="Students" fill={COLORS[0]} radius={[0, 6, 6, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Department Distribution" subtitle="Active student accounts with department profiles">
          <div className="h-[320px]">
            {state.loading ? <ChartEmptyState>Loading department distribution…</ChartEmptyState> : reportError ? <ChartEmptyState>{reportError}</ChartEmptyState> : !hasDepartmentDistribution ? <ChartEmptyState>No active students are assigned to departments yet.</ChartEmptyState> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={departmentDistribution} dataKey="students" nameKey="name" innerRadius="55%" outerRadius="82%" paddingAngle={3} stroke="none">
                    {departmentDistribution.map((item, index) => <Cell key={item.id} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Number(value)} students`, 'Enrollment']} />
                  <Legend verticalAlign="bottom" height={40} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Assessment Results" subtitle="Evaluated attempts: passing is 60% or more of maximum marks">
          <div className="h-[320px]">
            {state.loading ? <ChartEmptyState>Loading assessment results…</ChartEmptyState> : reportError ? <ChartEmptyState>{reportError}</ChartEmptyState> : !hasAssessmentResults ? <ChartEmptyState>No evaluated assessment attempts are available yet.</ChartEmptyState> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={assessmentResults} dataKey="value" nameKey="name" outerRadius="78%" paddingAngle={3} stroke="none">
                    {assessmentResults.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Number(value)} attempts`, 'Results']} />
                  <Legend verticalAlign="bottom" height={40} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Academic Trends" subtitle="Monthly average score by assessment type, normalized to 0-100">
          <div className="h-[320px]">
            {state.loading ? <ChartEmptyState>Loading academic trends…</ChartEmptyState> : reportError ? <ChartEmptyState>{reportError}</ChartEmptyState> : !hasAcademicTrends ? <ChartEmptyState>No evaluated assessment history is available for the last 12 months.</ChartEmptyState> : (
              <ResponsiveContainer>
                <LineChart data={academicTrends} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                  <Tooltip
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.evaluatedAttempts ? `${label} · ${payload[0].payload.evaluatedAttempts} evaluated attempts` : label}
                    formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
                  />
                  <Legend />
                  {activeTrendSeries.map((series) => (
                    <Line key={series.key} type="monotone" dataKey={series.key} name={series.key} stroke={series.color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Skills Comparison" subtitle="Average proficiency by assessed skill category">
          <div className="h-[320px]">
            {state.loading ? <ChartEmptyState>Loading skills comparison…</ChartEmptyState> : reportError ? <ChartEmptyState>{reportError}</ChartEmptyState> : !hasSkillsRadar ? <ChartEmptyState>{skills.length ? `A radar comparison needs at least 3 assessed skill categories; ${skills.length} are available.` : 'No assessed skill categories are available yet.'}</ChartEmptyState> : (
              <ResponsiveContainer>
                <RadarChart data={skills} outerRadius="72%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={5} />
                  <Radar name="Average proficiency" dataKey="proficiency" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.28} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} / 100`, 'Average proficiency']} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Placement Readiness" subtitle="Share of students with stored readiness metrics who meet the 60-point threshold">
          <div className="h-[320px]">
            {state.loading ? <ChartEmptyState>Loading placement readiness…</ChartEmptyState> : reportError ? <ChartEmptyState>{reportError}</ChartEmptyState> : !hasPlacementData ? <ChartEmptyState>No placement-readiness metrics are available yet.</ChartEmptyState> : (
              <ResponsiveContainer>
                <BarChart data={placementReadiness} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="department" width={112} tickLine={false} axisLine={false} />
                  <Tooltip
                    labelFormatter={(name, payload) => payload?.[0]?.payload?.analyzed ? `${name} · ${payload[0].payload.analyzed} assessed` : name}
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Placement ready']}
                  />
                  <Bar dataKey="ready" name="Ready" fill={COLORS[1]} radius={[0, 6, 6, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </section>

      <p className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-xs leading-5 text-on-surface-variant">
        Results use active student accounts. Assessment scores are normalized by each assessment's maximum marks; only evaluated attempts count. Skills radar excludes unassessed skills, and placement readiness uses students with stored readiness metrics.
      </p>
    </div>
  );
}
