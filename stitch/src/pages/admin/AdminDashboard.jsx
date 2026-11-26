import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { Link } from 'react-router-dom';
import { analyticsApi, adminApi } from '../../services/adminApi';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const COLORS = ['#0051d5', '#102a43', '#64748B', '#EF4444'];

export default function AdminDashboard() {
  const [state, setState] = useState({ loading: true, error: '', overview: null, departments: [], readiness: [], tiers: [], audits: [] });

  useEffect(() => {
    let active = true;
    Promise.all([
      analyticsApi.getSystemOverview(),
      analyticsApi.getDepartmentComparison(),
      analyticsApi.getPlacementReadiness(),
      analyticsApi.getCompensationTiers(),
      adminApi.getSystemAudits()
    ]).then(([overview, departments, readiness, tiers, audits]) => {
      if (!active) return;
      setState({
        loading: false,
        error: '',
        overview: overview.data || {},
        departments: departments.data?.departments || [],
        readiness: readiness.data?.placement_readiness || [],
        tiers: tiers.data?.tiers || [],
        audits: audits.data || []
      });
    }).catch((error) => {
      if (active) setState((current) => ({ ...current, loading: false, error: error.message || 'Analytics are unavailable.' }));
    });
    return () => { active = false; };
  }, []);

  const overview = state.overview || {};
  const departmentStats = state.departments.map((item) => ({
    department: item.name,
    departmentLabel: item.code || item.name,
    rate: item.placement_ready_pct == null ? null : Number(item.placement_ready_pct),
    students: Number(item.student_count || 0)
  }));
  const readinessTrend = state.readiness.map((item) => ({
    department: item.department,
    ready: item.ready_pct == null ? null : Number(item.ready_pct),
    borderline: item.analyzed_students ? Number(item.borderline_count || 0) / Number(item.analyzed_students) * 100 : null,
    notReady: item.analyzed_students ? Number(item.not_ready_count || 0) / Number(item.analyzed_students) * 100 : null
  }));
  const tierDistribution = state.tiers.map((item, index) => ({ name: item.tier, value: Number(item.students || 0), color: COLORS[index % COLORS.length] }));
  const hasReadinessData = state.readiness.some((item) => Number(item.analyzed_students || 0) > 0);
  const hasTierData = tierDistribution.length > 0;
  const auditColumns = [
    { key: 'action', label: 'Operation / Event', render: (_, row) => <div><div className="font-semibold">{row.action}</div><div className="text-xs text-on-surface-variant">{row.entity_type}{row.entity_id ? ` #${row.entity_id}` : ''}</div></div> },
    { key: 'actor', label: 'Triggered By', render: (value) => <span className="text-xs font-medium text-primary">{value}</span> },
    { key: 'created_at', label: 'Timestamp', render: (value) => <span className="text-xs text-on-surface-variant">{new Date(value).toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: () => <StatusBadge status="verified" /> }
  ];

  const hasData = useMemo(() => hasReadinessData || hasTierData, [hasReadinessData, hasTierData]);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Institution Leadership"
        title="Admin Executive Console"
        subtitle="Campus-wide student intelligence, faculty coordination, and placement forecasting"
        actions={<div className="flex gap-2"><Link to="/admin/departments"><Button variant="outline" icon="account_tree">Manage Departments</Button></Link><Link to="/admin/analytics"><Button variant="primary" icon="analytics">Institutional Analytics</Button></Link></div>}
      />
      {state.error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{state.error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Enrolled Students" value={state.loading ? '…' : String(overview.total_students ?? 0)} trend="Active student accounts" trendDirection="neutral" icon="school" iconBg="bg-blue-100" iconColor="text-blue-800" />
        <StatCard label="Active Faculty & Mentors" value={state.loading ? '…' : String(overview.total_teachers ?? 0)} trend="Active faculty accounts" trendDirection="neutral" icon="supervisor_account" iconBg="bg-purple-100" iconColor="text-purple-800" />
        <StatCard label="Placement Readiness" value={state.loading ? '…' : overview.placement_ready_pct == null ? '—' : `${Number(overview.placement_ready_pct).toFixed(1)}%`} trend={state.loading ? 'Loading metrics' : overview.students_with_metrics ? `${overview.students_with_metrics} students assessed` : 'No assessment metrics yet'} trendDirection="neutral" icon="trending_up" iconBg="bg-emerald-100" iconColor="text-emerald-800" />
        <StatCard label="Departments" value={state.loading ? '…' : String(overview.total_departments ?? 0)} trend="Configured departments" trendDirection="neutral" icon="account_tree" iconBg="bg-amber-100" iconColor="text-amber-800" />
      </div>
      {!state.loading && !hasData && <div className="rounded-lg border border-dashed p-6 text-sm text-on-surface-variant">No placement analytics are available yet. Students need completed assessments, and selected applications are needed for compensation tiers.</div>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><ChartCard title="Department Placement Conversion Rate (%)" subtitle="Readiness percentage calculated from assessed students"><div className="h-80">{hasReadinessData ? <ResponsiveContainer><BarChart data={departmentStats} margin={{ top: 10, right: 12, left: 0, bottom: 58 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="departmentLabel" interval={0} angle={-28} textAnchor="end" height={65} fontSize={10} /><YAxis domain={[0, 100]} /><Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.department || ''} /><Bar dataKey="rate" name="Ready %" fill="#0051d5" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">No completed student assessments yet.</div>}</div></ChartCard></div>
        <ChartCard title="Campus Placement Tier Spread" subtitle="Selected applications grouped by configured package"><div className="h-72">{hasTierData ? <ResponsiveContainer><PieChart><Pie data={tierDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75}>{tierDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">No selected applications have been recorded.</div>}</div></ChartCard>
      </div>
      <ChartCard title="Readiness Composition by Department" subtitle="Ready, borderline, and not-ready proportions from assessed students"><div className="h-80">{hasReadinessData ? <ResponsiveContainer><LineChart data={readinessTrend} margin={{ top: 10, right: 12, left: 0, bottom: 58 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="department" interval={0} angle={-28} textAnchor="end" height={65} fontSize={10} /><YAxis domain={[0, 100]} /><Tooltip /><Legend /><Line type="monotone" dataKey="ready" name="Ready %" stroke="#10B981" /><Line type="monotone" dataKey="borderline" name="Borderline %" stroke="#F59E0B" /><Line type="monotone" dataKey="notReady" name="Not ready %" stroke="#EF4444" /></LineChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">Readiness data will appear after students complete assessments.</div>}</div></ChartCard>
      <section><h4 className="font-headline font-bold text-base mb-3">Institutional Governance & Audit History</h4>{state.audits.length ? <DataTable columns={auditColumns} data={state.audits} keyExtractor={(row) => row.id} /> : <div className="rounded-lg border border-dashed p-6 text-sm text-on-surface-variant">No audit events have been recorded.</div>}</section>
    </div>
  );
}
