import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import { adminApi, analyticsApi } from '../../services/adminApi';

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const [state, setState] = useState({ loading: true, error: '', departments: [], tiers: [], audits: [] });

  useEffect(() => {
    Promise.all([
      analyticsApi.getDepartmentComparison(),
      analyticsApi.getPlacementReadiness(),
      analyticsApi.getCompensationTiers(),
      adminApi.getSystemAudits()
    ]).then(([departments, readiness, tiers, audits]) => {
      const readinessByDepartment = new Map((readiness.data?.placement_readiness || []).map((item) => [item.department, item]));
      const departmentRows = (departments.data?.departments || []).map((item) => {
        const readinessItem = readinessByDepartment.get(item.name) || {};
        return {
          id: item.id,
          name: item.name,
          code: item.code || '—',
          students: item.student_count || 0,
          averageScore: item.avg_score ?? '—',
          placementReady: readinessItem.ready_pct ?? item.placement_ready_pct ?? '—',
          readyCount: readinessItem.ready_count ?? 0
        };
      });
      setState({ loading: false, error: '', departments: departmentRows, tiers: tiers.data?.tiers || [], audits: audits.data || [] });
    }).catch((error) => setState({ loading: false, error: error.message || 'Reports are unavailable.', departments: [], tiers: [], audits: [] }));
  }, []);

  const exportDepartments = () => downloadCsv('department-analytics-report.csv', [
    ['Department', 'Code', 'Students', 'Average Score', 'Placement Ready %', 'Ready Students'],
    ...state.departments.map((row) => [row.name, row.code, row.students, row.averageScore, row.placementReady, row.readyCount])
  ]);
  const exportTiers = () => downloadCsv('placement-tier-report.csv', [
    ['Compensation Tier', 'Selected Students'],
    ...state.tiers.map((row) => [row.tier, row.students])
  ]);
  const exportAudits = () => downloadCsv('governance-audit-report.csv', [
    ['Action', 'Entity', 'Actor', 'Timestamp'],
    ...state.audits.map((row) => [row.action, row.entity_type, row.actor, row.created_at])
  ]);

  const columns = [
    { key: 'name', label: 'Department', render: (_, row) => <div><div className="font-semibold">{row.name}</div><span className="font-mono text-xs text-primary">{row.code}</span></div> },
    { key: 'students', label: 'Students' },
    { key: 'averageScore', label: 'Average Score' },
    { key: 'placementReady', label: 'Placement Ready', render: (value) => <span className="font-mono text-xs">{value === '—' ? value : `${value}%`}</span> },
    { key: 'readyCount', label: 'Ready Students' }
  ];
  const tierColumns = [
    { key: 'tier', label: 'Compensation Tier' },
    { key: 'students', label: 'Selected Students' }
  ];
  const auditColumns = [
    { key: 'action', label: 'Action' },
    { key: 'entity_type', label: 'Entity' },
    { key: 'actor', label: 'Actor' },
    { key: 'created_at', label: 'Timestamp', render: (value) => new Date(value).toLocaleString() }
  ];
  const totalStudents = useMemo(() => state.departments.reduce((sum, row) => sum + Number(row.students || 0), 0), [state.departments]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Compliance & Dossiers" title="Institutional Reports & Audit Exports" subtitle="Generate current reports from stored institutional analytics, placement records, and audit history" actions={<Button variant="primary" icon="download" onClick={exportDepartments} disabled={!state.departments.length}>Export Department CSV</Button>} />
      {state.error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{state.error}</div>}
      {state.loading ? <div className="p-6 text-sm text-on-surface-variant">Loading reports…</div> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border p-4"><div className="text-xs uppercase text-on-surface-variant">Departments</div><div className="text-2xl font-bold">{state.departments.length}</div><div className="text-xs text-on-surface-variant">{totalStudents} linked students</div></div>
            <div className="rounded-xl border p-4"><div className="text-xs uppercase text-on-surface-variant">Placement tiers</div><div className="text-2xl font-bold">{state.tiers.length}</div><div className="text-xs text-on-surface-variant">From selected applications</div></div>
            <div className="rounded-xl border p-4"><div className="text-xs uppercase text-on-surface-variant">Audit events</div><div className="text-2xl font-bold">{state.audits.length}</div><div className="text-xs text-on-surface-variant">Recorded governance events</div></div>
          </div>
          <section><div className="flex items-center justify-between mb-3"><h2 className="font-headline font-bold">Department Analytics Report</h2><Button variant="outline" size="sm" icon="download" onClick={exportDepartments}>CSV</Button></div><DataTable columns={columns} data={state.departments} keyField="id" emptyMessage="No department analytics are available." /></section>
          <section><div className="flex items-center justify-between mb-3"><h2 className="font-headline font-bold">Placement Tier Report</h2><Button variant="outline" size="sm" icon="download" onClick={exportTiers}>CSV</Button></div><DataTable columns={tierColumns} data={state.tiers} emptyMessage="No selected placement applications are available." /></section>
          <section><div className="flex items-center justify-between mb-3"><h2 className="font-headline font-bold">Governance Audit Report</h2><Button variant="outline" size="sm" icon="download" onClick={exportAudits}>CSV</Button></div><DataTable columns={auditColumns} data={state.audits} keyField="id" emptyMessage="No audit events have been recorded." /></section>
        </>
      )}
    </div>
  );
}
