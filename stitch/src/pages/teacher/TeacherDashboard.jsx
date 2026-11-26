import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
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

function formatValue(value, digits = 1) {
  return value == null || !Number.isFinite(Number(value)) ? '—' : Number(value).toFixed(digits);
}

export default function TeacherDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    teacherApi.getDashboard()
      .then((response) => {
        if (active) setDashboard(response.data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load the teacher dashboard.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const summary = dashboard?.summary || {};
  const hasDashboard = Boolean(dashboard);
  const cgpaByBatch = (dashboard?.charts?.cgpaByBatch || []).map((row) => ({
    ...row,
    average_cgpa: Number(row.average_cgpa)
  }));
  const readinessByBatch = (dashboard?.charts?.readinessByBatch || []).map((row) => ({
    ...row,
    average_readiness: Number(row.average_readiness)
  }));
  const pendingVerifications = dashboard?.pendingVerifications || [];

  const columns = [
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
      key: 'cgpa',
      label: 'CGPA',
      render: (value) => formatValue(value, 2)
    },
    {
      key: 'verification_status',
      label: 'Record status',
      render: (value) => <StatusBadge status={value} />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Faculty & Mentor Portal"
        title="Teacher Dashboard"
        subtitle={dashboard?.teacher
          ? `${dashboard.teacher.department} • ${dashboard.teacher.designation || 'Department roster'}`
          : 'Department-scoped student and assessment overview'}
        actions={
          <Button variant="primary" icon="add" to="/teacher/assessments">
            Manage Assessments
          </Button>
        }
      />

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          label="Assigned Students"
          value={loading ? '…' : (hasDashboard ? (summary.assignedStudents ?? 0) : '—')}
          trend={dashboard?.teacher?.department || (error ? 'Data unavailable' : 'Department roster')}
          trendDirection="neutral"
          icon="group"
          iconColor="text-blue-800"
          iconBg="bg-blue-100"
        />
        <StatCard
          label="Pending Academic Records"
          value={loading ? '…' : (hasDashboard ? (summary.pendingVerifications ?? 0) : '—')}
          trend={error ? 'Data unavailable' : 'Student records awaiting review'}
          trendDirection={summary.pendingVerifications ? 'down' : 'neutral'}
          icon="pending_actions"
          iconColor="text-amber-800"
          iconBg="bg-amber-100"
        />
        <StatCard
          label="Department Average CGPA"
          value={loading ? '…' : (hasDashboard ? formatValue(summary.averageCgpa, 2) : '—')}
          trend={error ? 'Data unavailable' : 'From student academic records'}
          trendDirection="neutral"
          icon="school"
          iconColor="text-emerald-800"
          iconBg="bg-emerald-100"
        />
        <StatCard
          label="Active Assessments"
          value={loading ? '…' : (hasDashboard ? (summary.activeAssessments ?? 0) : '—')}
          trend={error ? 'Data unavailable' : 'Published assessments owned by you'}
          trendDirection="neutral"
          icon="assignment"
          iconColor="text-indigo-800"
          iconBg="bg-indigo-100"
        />
        <StatCard
          label="Students Meeting Readiness"
          value={loading ? '…' : (!hasDashboard || summary.placementReadyPct == null ? '—' : `${formatValue(summary.placementReadyPct)}%`)}
          trend={!hasDashboard && error
            ? 'Data unavailable'
            : summary.analyzedStudents
            ? `${summary.placementReadyStudents} of ${summary.analyzedStudents} assessed`
            : 'No evaluated assessment data yet'}
          trendDirection="neutral"
          icon="psychology"
          iconColor="text-purple-800"
          iconBg="bg-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Academic Performance by Batch"
          subtitle="Average CGPA from active students with submitted academic records"
        >
          {cgpaByBatch.length ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cgpaByBatch} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="batch" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 10]} stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="average_cgpa" name="Average CGPA" fill="#0051d5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-on-surface-variant">
              {error ? 'Academic data is unavailable because the dashboard request failed.' : loading ? 'Loading academic records…' : 'CGPA data will appear when students add academic records.'}
            </p>
          )}
        </ChartCard>

        <ChartCard
          title="Placement Readiness by Batch"
          subtitle="Average readiness score for students with evaluated assessments"
        >
          {readinessByBatch.length ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={readinessByBatch} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="batch" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="average_readiness" name="Readiness score" fill="#14B8A6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-on-surface-variant">
              {error ? 'Readiness data is unavailable because the dashboard request failed.' : loading ? 'Loading assessment outcomes…' : 'Readiness data will appear after students complete evaluated assessments.'}
            </p>
          )}
        </ChartCard>
      </div>

      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading font-bold text-lg text-on-surface">Pending Academic Record Reviews</h2>
            <p className="text-xs text-on-surface-variant">
              {hasDashboard ? (summary.pendingVerifications || 0) : '—'} pending in your department
            </p>
          </div>
          <Button variant="outline" size="sm" icon="fact_check" to="/teacher/verification">
            Review uploaded documents
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={pendingVerifications}
          emptyMessage={error ? 'Pending records are unavailable because the dashboard request failed.' : loading ? 'Loading pending records…' : 'No academic records are waiting for review.'}
        />
      </section>
    </div>
  );
}
