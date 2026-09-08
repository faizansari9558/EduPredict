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

export default function TeacherDashboard() {
  const placementDistribution = [
    { name: 'Tier 1 Dream (> 12 LPA)', value: 42, color: '#0051d5' },
    { name: 'Tier 2 Core (6-12 LPA)', value: 68, color: '#102a43' },
    { name: 'Tier 3 Mass (3.5-6 LPA)', value: 34, color: '#64748B' },
    { name: 'At-Risk / Needs Intervention', value: 16, color: '#EF4444' }
  ];

  const classCgpaTrends = [
    { semester: 'Sem 1', avgCgpa: 7.42 },
    { semester: 'Sem 2', avgCgpa: 7.68 },
    { semester: 'Sem 3', avgCgpa: 7.85 },
    { semester: 'Sem 4', avgCgpa: 8.12 },
    { semester: 'Sem 5', avgCgpa: 8.35 },
    { semester: 'Sem 6', avgCgpa: 8.48 }
  ];

  const pendingQueue = [
    {
      id: 1,
      student: 'Faizan Ansari',
      rollNo: '21CS042',
      type: 'Capstone Project',
      title: 'EduPredict — AI Academic Predictor',
      submitted: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      student: 'Aarav Sharma',
      rollNo: '21CS018',
      type: 'Industrial Internship',
      title: 'Goldman Sachs Summer Analyst',
      submitted: '5 hours ago',
      status: 'pending'
    },
    {
      id: 3,
      student: 'Sneha Patel',
      rollNo: '21CS089',
      type: 'Certification',
      title: 'AWS Certified Developer Associate',
      submitted: '1 day ago',
      status: 'pending'
    }
  ];

  const columns = [
    {
      header: 'Student & Roll No',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.student}</div>
          <div className="text-xs font-mono text-on-surface-variant">{row.rollNo}</div>
        </div>
      )
    },
    {
      header: 'Submission Type',
      accessor: (row) => (
        <span className="px-2.5 py-1 bg-surface-container rounded-lg text-xs font-medium text-primary">
          {row.type}
        </span>
      )
    },
    {
      header: 'Item Title',
      accessor: (row) => <span className="text-xs text-on-surface font-medium truncate max-w-[200px] block">{row.title}</span>
    },
    {
      header: 'Submitted',
      accessor: (row) => <span className="text-xs text-on-surface-variant">{row.submitted}</span>
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Action',
      accessor: (row) => (
        <div className="flex gap-1.5">
          <button className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors" title="Approve">
            <span className="material-symbols-outlined text-[16px]">check</span>
          </button>
          <button className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors" title="Reject">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Faculty & Mentor Portal"
        title="Teacher Executive Dashboard"
        subtitle="Department of Computer Science & Engineering • Cohort 2021-2025"
        action={
          <div className="flex gap-2">
            <Button variant="outline" icon="upload_file">
              Batch Upload Marks
            </Button>
            <Button variant="primary" icon="add">
              Create Assessment
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Students"
          value="160"
          trend="Section A & B (Final Year)"
          trendType="neutral"
          icon="group"
          iconBgColor="bg-blue-100 text-blue-800"
        />
        <StatCard
          title="Pending Verifications"
          value="14"
          trend="3 urgent requests"
          trendType="down"
          icon="pending_actions"
          iconBgColor="bg-amber-100 text-amber-800"
        />
        <StatCard
          title="Batch Avg CGPA"
          value="8.48"
          trend="+0.13 vs previous term"
          trendType="up"
          icon="trending_up"
          iconBgColor="bg-emerald-100 text-emerald-800"
        />
        <StatCard
          title="Predicted Placement Rate"
          value="91.2%"
          trend="146 / 160 eligible"
          trendType="up"
          icon="psychology"
          iconBgColor="bg-purple-100 text-purple-800"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Class CGPA Progression"
            subtitle="Semester-by-semester average academic performance for CSE 2021-25"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classCgpaTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="semester" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis domain={[6, 10]} stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D233A', color: '#fff', borderRadius: '8px', border: 'none' }}
                  />
                  <Bar dataKey="avgCgpa" fill="#0051d5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div>
          <ChartCard
            title="AI Placement Readiness"
            subtitle="Cohort tier prediction distribution"
          >
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={placementDistribution}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {placementDistribution.map((entry, index) => (
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

      {/* Pending Verifications Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-lg text-on-surface">
            Pending Student Verifications Queue
          </h3>
          <span className="text-xs text-primary font-semibold hover:underline cursor-pointer">
            View All (14) →
          </span>
        </div>
        <DataTable
          columns={columns}
          data={pendingQueue}
          keyExtractor={(r) => r.id}
        />
      </div>
    </div>
  );
}
