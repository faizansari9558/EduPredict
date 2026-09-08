import React from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function AdminDashboard() {
  const departmentStats = [
    { department: 'Computer Science', students: 480, placed: 442, rate: 92.1 },
    { department: 'Information Tech', students: 240, placed: 215, rate: 89.5 },
    { department: 'Electronics & Comm', students: 320, placed: 268, rate: 83.7 },
    { department: 'Electrical Eng', students: 180, placed: 135, rate: 75.0 },
    { department: 'Mechanical Eng', students: 220, placed: 160, rate: 72.7 }
  ];

  const tierDistribution = [
    { name: 'Tier 1 Dream (> 12 LPA)', value: 310, color: '#0051d5' },
    { name: 'Tier 2 Core (6-12 LPA)', value: 580, color: '#102a43' },
    { name: 'Tier 3 Mass (3.5-6 LPA)', value: 280, color: '#64748B' },
    { name: 'Under Preparation / Interventions', value: 70, color: '#EF4444' }
  ];

  const recentAudits = [
    { id: 1, action: 'Bulk CGPA Ingestion', user: 'Admin (System)', timestamp: 'Today, 11:20 AM', status: 'verified', details: '1,440 student transcripts synchronized with MySQL' },
    { id: 2, action: 'Faculty Assignment Updated', user: 'Dean Academic', timestamp: 'Yesterday', status: 'verified', details: 'Dr. Robert Vance assigned CSE Section A Mentor' },
    { id: 3, action: 'ML Model Retrained', user: 'AI Pipeline Daemon', timestamp: 'Sep 04, 2024', status: 'verified', details: 'XGBoost v4.2 calibrated with 94.8% test accuracy' }
  ];

  const auditColumns = [
    {
      header: 'Operation / Event',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.action}</div>
          <div className="text-xs text-on-surface-variant">{row.details}</div>
        </div>
      )
    },
    {
      header: 'Triggered By',
      accessor: (row) => <span className="text-xs font-medium text-primary">{row.user}</span>
    },
    {
      header: 'Timestamp',
      accessor: (row) => <span className="text-xs text-on-surface-variant">{row.timestamp}</span>
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Institution Leadership"
        title="Admin Executive Console"
        subtitle="Campus-wide student intelligence, faculty coordination, and placement forecasting"
        action={
          <div className="flex gap-2">
            <Button variant="outline" icon="sync">
              Sync SIS Database
            </Button>
            <Button variant="primary" icon="description">
              Generate NAAC Report
            </Button>
          </div>
        }
      />

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enrolled Students"
          value="1,440"
          trend="Across 5 Engineering Branches"
          trendType="neutral"
          icon="school"
          iconBgColor="bg-blue-100 text-blue-800"
        />
        <StatCard
          title="Active Faculty & Mentors"
          value="78"
          trend="100% active assignments"
          trendType="neutral"
          icon="supervisor_account"
          iconBgColor="bg-purple-100 text-purple-800"
        />
        <StatCard
          title="Institution Placement Forecast"
          value="84.7%"
          trend="+3.8% YoY Improvement"
          trendType="up"
          icon="trending_up"
          iconBgColor="bg-emerald-100 text-emerald-800"
        />
        <StatCard
          title="Avg CTC Predicted"
          value="₹9.4 LPA"
          trend="Highest: ₹44.0 LPA"
          trendType="up"
          icon="paid"
          iconBgColor="bg-amber-100 text-amber-800"
        />
      </div>

      {/* Campus Breakdown Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Department Placement Conversion Rate (%)"
            subtitle="Current predicted placement rate by engineering branch"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="department" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis domain={[50, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D233A', color: '#fff', borderRadius: '8px', border: 'none' }}
                  />
                  <Bar dataKey="rate" fill="#0051d5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div>
          <ChartCard
            title="Campus Placement Tier Spread"
            subtitle="Distribution of 1,440 students across compensation tiers"
          >
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierDistribution}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {tierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D233A', color: '#fff', borderRadius: '8px', border: 'none' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* System Governance Audit Logs */}
      <div>
        <h4 className="font-headline font-bold text-base text-on-surface mb-3">
          Institutional Governance & Audit History
        </h4>
        <DataTable
          columns={auditColumns}
          data={recentAudits}
          keyExtractor={(r) => r.id}
        />
      </div>
    </div>
  );
}
