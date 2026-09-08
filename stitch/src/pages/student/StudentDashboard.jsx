import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import {
  mockStudentProfile,
  mockSemesterRecords,
  mockSkills,
  mockPlacementDrivers
} from '../../data/mockStudentData';
import { mockAssessmentsList } from '../../data/mockAssessments';

/**
 * Stitch Official Student Dashboard Screen
 * High-fidelity recreation of Desktop & Mobile Stitch designs
 */
export default function StudentDashboard() {
  const [metricView, setMetricView] = useState('cgpa'); // 'cgpa' | 'percentage'
  const student = mockStudentProfile;

  // Chart data formatted for Recharts
  const chartData = mockSemesterRecords.map((rec) => ({
    name: rec.semester,
    score: metricView === 'cgpa' ? rec.cgpa : Math.round(rec.cgpa * 9.5),
    isPredicted: rec.semester === 'Sem 6'
  }));

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* 1. Welcome & Profile Readiness Banner */}
      <section className="relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-sm">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-secondary-fixed text-secondary">
              <span className="material-symbols-outlined text-[20px]">waving_hand</span>
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-on-surface">
              Welcome Back, {student.name.split(' ')[0]}!
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant">
            Track your academic progress, improve targeted skills, and achieve your career placement goals with real-time AI forecasts.
          </p>

          {/* Micro Progress Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Readiness Score:
              </span>
              <span className="text-sm font-bold text-secondary">
                {student.readiness_score}% Complete
              </span>
            </div>
            <div className="w-full sm:w-48 h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary rounded-full transition-all duration-500"
                style={{ width: `${student.readiness_score}%` }}
              />
            </div>
            <span className="text-xs text-on-surface-variant">
              3 micro-credentials left
            </span>
          </div>
        </div>

        {/* Academic Cohort Meta Pill Array */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 z-10">
          <div className="flex flex-col px-4 py-2 bg-surface-container-low rounded-xl border border-outline-variant/20">
            <span className="text-[11px] font-semibold text-on-surface-variant">
              Academic Session
            </span>
            <span className="text-sm font-bold text-on-surface">
              {student.academic_year}
            </span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-primary-container text-on-primary rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">
              school
            </span>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-on-primary">
                Sem {student.current_semester} • B.Tech
              </span>
              <span className="text-[10px] text-on-primary-container truncate max-w-[140px]">
                {student.department}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4-Column Metric KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Cumulative GPA"
          value={student.cgpa}
          unit="/ 10.0"
          icon="school"
          iconColor="text-secondary"
          iconBg="bg-secondary-fixed"
          trend="+0.4 vs Sem 5"
          trendDirection="up"
        />
        <StatCard
          label="Attendance Rate"
          value={`${student.attendance_pct}%`}
          unit="Aggregate"
          icon="calendar_month"
          iconColor="text-on-surface"
          iconBg="bg-surface-container"
          trend="Safe Zone (>75%)"
          trendDirection="up"
        />
        <StatCard
          label="Active Backlogs"
          value={student.active_backlogs}
          unit="Backlogs"
          icon="fact_check"
          iconColor="text-emerald-700"
          iconBg="bg-emerald-50"
          trend="All Cleared (100%)"
          trendDirection="up"
        />
        <StatCard
          label="Placement Probability"
          value={`${student.placement_probability}%`}
          unit="AI Predicted"
          icon="insights"
          iconColor="text-on-tertiary-fixed"
          iconBg="bg-tertiary-fixed"
          trend={student.predicted_tier.split(' (')[0]}
          trendDirection="up"
        />
      </section>

      {/* 3. Analytics Row: Academic Trajectory & AI Placement Predictor */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Academic Performance Trend Chart (2 cols) */}
        <ChartCard
          title="Academic Performance Trajectory"
          subtitle="Semester-by-semester trajectory with AI Sem 6 projection"
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/30">
              <button
                onClick={() => setMetricView('cgpa')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  metricView === 'cgpa'
                    ? 'bg-surface-container-lowest shadow-sm text-on-surface'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                CGPA
              </button>
              <button
                onClick={() => setMetricView('percentage')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  metricView === 'percentage'
                    ? 'bg-surface-container-lowest shadow-sm text-on-surface'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Percentage %
              </button>
            </div>
          }
        >
          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="cgpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0051d5" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0051d5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" vertical={false} />
                <XAxis dataKey="name" stroke="#74777e" fontSize={11} tickLine={false} />
                <YAxis
                  domain={metricView === 'cgpa' ? [6, 10] : [60, 100]}
                  stroke="#74777e"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#102a43',
                    borderColor: '#102a43',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#6ffbbe' }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  name={metricView === 'cgpa' ? 'CGPA' : 'Score %'}
                  stroke="#0051d5"
                  strokeWidth={3}
                  fill="url(#cgpaGrad)"
                  dot={{ r: 4, fill: '#0051d5', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* AI Placement Forecast Card (1 col) */}
        <div className="flex flex-col justify-between bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                Machine Learning Forecast
              </span>
              <StatusBadge status="verified" label="89.8% Confident" />
            </div>
            <h3 className="font-heading text-lg font-bold text-on-surface">
              Placement Readiness
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Ensemble XGBoost + Logistic Regression Model
            </p>

            <div className="my-5 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-center text-center">
              <div className="text-4xl font-extrabold font-heading text-secondary">
                {student.placement_probability}%
              </div>
              <span className="text-xs font-bold text-on-surface mt-1">
                {student.predicted_tier}
              </span>
              <span className="text-[11px] text-on-surface-variant mt-0.5">
                Expected CTC: <strong className="text-emerald-700">{student.expected_package}</strong>
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-on-surface">Top Positive Driver:</div>
              <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200/50 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 mt-0.5">
                  trending_up
                </span>
                <span>{mockPlacementDrivers.positiveDrivers[0].title}</span>
              </div>
            </div>
          </div>

          <Link to="/student/placement-analysis" className="mt-4">
            <Button variant="outline" size="sm" className="w-full justify-between" icon="arrow_forward">
              View Detailed AI Explainability
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. Bottom Grid: Upcoming Assessments & Verified Skills */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming Assessments */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-on-surface">
                  Assessments &amp; Coding Arenas
                </h3>
                <p className="text-xs text-on-surface-variant">Scheduled academic and aptitude evaluation benchmarks</p>
              </div>
              <Link to="/student/assessments">
                <span className="text-xs font-bold text-secondary hover:underline">View All</span>
              </Link>
            </div>

            <div className="space-y-3">
              {mockAssessmentsList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-[20px]">
                        {item.type.includes('Coding') ? 'terminal' : 'assignment'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{item.title}</h4>
                      <p className="text-[11px] text-on-surface-variant">
                        {item.type} • {item.duration_minutes} Mins • Due {item.deadline}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    status={item.status === 'Completed' ? 'completed' : 'pending'}
                    label={item.status === 'Completed' ? `${item.score}% Scored` : 'Upcoming'}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verified Technical Mastery */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-on-surface">
                  Verified Skill Proficiencies
                </h3>
                <p className="text-xs text-on-surface-variant">Evaluated through assessments and faculty reviews</p>
              </div>
              <Link to="/student/skills">
                <span className="text-xs font-bold text-secondary hover:underline">Manage Skills</span>
              </Link>
            </div>

            <div className="space-y-3">
              {mockSkills.slice(0, 4).map((sk) => (
                <div key={sk.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-on-surface">{sk.name}</span>
                    <span className="text-secondary font-bold">{sk.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full"
                      style={{ width: `${sk.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
            <span>5 Skills Verified by Faculty</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span> Credential Active
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
