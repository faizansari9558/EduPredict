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
    rate: Number(item.placement_ready_pct || 0),
    students: Number(item.student_count || 0)
  }));
  const readinessTrend = state.readiness.map((item) => ({
    department: item.department,
    ready: Number(item.ready_pct || 0),
    borderline: item.total_students ? Number(item.borderline_count || 0) / Number(item.total_students) * 100 : 0,
    notReady: item.total_students ? Number(item.not_ready_count || 0) / Number(item.total_students) * 100 : 0
  }));
  const tierDistribution = state.tiers.map((item, index) => ({ name: item.tier, value: Number(item.students || 0), color: COLORS[index % COLORS.length] }));
  const auditColumns = [
    { key: 'action', label: 'Operation / Event', render: (_, row) => <div><div className="font-semibold">{row.action}</div><div className="text-xs text-on-surface-variant">{row.entity_type}{row.entity_id ? ` #${row.entity_id}` : ''}</div></div> },
    { key: 'actor', label: 'Triggered By', render: (value) => <span className="text-xs font-medium text-primary">{value}</span> },
    { key: 'created_at', label: 'Timestamp', render: (value) => <span className="text-xs text-on-surface-variant">{new Date(value).toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: () => <StatusBadge status="verified" /> }
  ];

  const hasData = useMemo(() => departmentStats.length > 0 || tierDistribution.length > 0, [departmentStats.length, tierDistribution.length]);
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
        <StatCard title="Total Enrolled Students" value={state.loading ? '…' : String(overview.total_students ?? 0)} trend="From registered student accounts" trendType="neutral" icon="school" iconBgColor="bg-blue-100 text-blue-800" />
        <StatCard title="Active Faculty & Mentors" value={state.loading ? '…' : String(overview.total_teachers ?? 0)} trend="From registered faculty accounts" trendType="neutral" icon="supervisor_account" iconBgColor="bg-purple-100 text-purple-800" />
        <StatCard title="Placement Readiness" value={state.loading ? '…' : `${overview.placement_ready_pct ?? 0}%`} trend="Based on stored student metrics" trendType="neutral" icon="trending_up" iconBgColor="bg-emerald-100 text-emerald-800" />
        <StatCard title="Departments" value={state.loading ? '…' : String(overview.total_departments ?? 0)} trend="Configured institutional departments" trendType="neutral" icon="account_tree" iconBgColor="bg-amber-100 text-amber-800" />
      </div>
      {!state.loading && !hasData && <div className="rounded-lg border border-dashed p-6 text-sm text-on-surface-variant">No placement analytics are available yet. Add verified student metrics and selected applications to populate these charts.</div>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><ChartCard title="Department Placement Conversion Rate (%)" subtitle="Readiness percentage calculated from stored student metrics"><div className="h-72"><ResponsiveContainer><BarChart data={departmentStats}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="department" fontSize={10} /><YAxis domain={[0, 100]} /><Tooltip /><Bar dataKey="rate" name="Ready %" fill="#0051d5" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></ChartCard></div>
        <ChartCard title="Campus Placement Tier Spread" subtitle="Selected applications grouped by configured package"><div className="h-72"><ResponsiveContainer><PieChart><Pie data={tierDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75}>{tierDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></ChartCard>
      </div>
      <ChartCard title="Readiness Composition by Department" subtitle="Ready, borderline, and not-ready proportions from stored metrics"><div className="h-72"><ResponsiveContainer><LineChart data={readinessTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="department" fontSize={10} /><YAxis domain={[0, 100]} /><Tooltip /><Legend /><Line type="monotone" dataKey="ready" name="Ready %" stroke="#10B981" /><Line type="monotone" dataKey="borderline" name="Borderline %" stroke="#F59E0B" /><Line type="monotone" dataKey="notReady" name="Not ready %" stroke="#EF4444" /></LineChart></ResponsiveContainer></div></ChartCard>
      <section><h4 className="font-headline font-bold text-base mb-3">Institutional Governance & Audit History</h4>{state.audits.length ? <DataTable columns={auditColumns} data={state.audits} keyExtractor={(row) => row.id} /> : <div className="rounded-lg border border-dashed p-6 text-sm text-on-surface-variant">No audit events have been recorded.</div>}</section>
    </div>
  );
}
