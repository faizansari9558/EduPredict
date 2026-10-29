import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import ChartCard from '../../components/ChartCard';
import { analyticsApi } from '../../services/adminApi';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function InstitutionalAnalytics() {
  const [state, setState] = useState({ loading: true, error: '', departments: [], readiness: [] });
  useEffect(() => {
    Promise.all([analyticsApi.getDepartmentComparison(), analyticsApi.getPlacementReadiness()])
      .then(([departments, readiness]) => setState({ loading: false, error: '', departments: departments.data?.departments || [], readiness: readiness.data?.placement_readiness || [] }))
      .catch((error) => setState({ loading: false, error: error.message || 'Analytics are unavailable.', departments: [], readiness: [] }));
  }, []);

  const departments = state.departments.map((item) => ({ name: item.name, label: item.code || item.name, students: Number(item.student_count || 0), score: Number(item.avg_score || 0), placement: Number(item.placement_ready_pct || 0) }));
  const readiness = state.readiness.map((item) => ({ name: item.department, ready: Number(item.ready_pct || 0), borderline: item.total_students ? Number(item.borderline_count || 0) / item.total_students * 100 : 0, notReady: item.total_students ? Number(item.not_ready_count || 0) / item.total_students * 100 : 0 }));
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Institutional Intelligence" title="Campus Institutional Analytics" subtitle="Evidence-based comparisons from registered students and stored assessment metrics" />
      {state.error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{state.error}</div>}
      {!state.loading && !departments.length && <div className="rounded-lg border border-dashed p-6 text-sm text-on-surface-variant">No analytics data is available yet.</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Department Placement Readiness" subtitle="Comparison of readiness percentages"><div className="h-96"><ResponsiveContainer><BarChart data={departments} margin={{ top: 10, right: 12, left: 0, bottom: 58 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" interval={0} angle={-28} textAnchor="end" height={65} fontSize={10} /><YAxis domain={[0, 100]} /><Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''} /><Bar dataKey="placement" name="Ready %" fill="#0051d5" /></BarChart></ResponsiveContainer></div></ChartCard>
        <ChartCard title="Average Assessment Score" subtitle="Stored student metric averages by department"><div className="h-96"><ResponsiveContainer><LineChart data={departments} margin={{ top: 10, right: 12, left: 0, bottom: 58 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" interval={0} angle={-28} textAnchor="end" height={65} fontSize={10} /><YAxis domain={[0, 100]} /><Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''} /><Line type="monotone" dataKey="score" name="Average score" stroke="#10B981" strokeWidth={3} /></LineChart></ResponsiveContainer></div></ChartCard>
        <ChartCard title="Readiness Composition" subtitle="Ready, borderline, and not-ready proportions"><div className="h-96"><ResponsiveContainer><AreaChart data={readiness} margin={{ top: 10, right: 12, left: 0, bottom: 58 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" interval={0} angle={-28} textAnchor="end" height={65} fontSize={10} /><YAxis domain={[0, 100]} /><Tooltip /><Legend /><Area type="monotone" dataKey="ready" stackId="1" stroke="#10B981" fill="#10B981" name="Ready %" /><Area type="monotone" dataKey="borderline" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Borderline %" /><Area type="monotone" dataKey="notReady" stackId="1" stroke="#EF4444" fill="#EF4444" name="Not ready %" /></AreaChart></ResponsiveContainer></div></ChartCard>
        <ChartCard title="Department Capability Profile" subtitle="Assessment score and readiness comparison"><div className="h-80"><ResponsiveContainer><RadarChart data={departments}><PolarGrid /><PolarAngleAxis dataKey="name" fontSize={10} /><Radar name="Assessment score" dataKey="score" stroke="#0051d5" fill="#0051d5" fillOpacity={0.45} /><Radar name="Placement readiness" dataKey="placement" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.25} /><Legend /><Tooltip /></RadarChart></ResponsiveContainer></div></ChartCard>
      </div>
    </div>
  );
}
