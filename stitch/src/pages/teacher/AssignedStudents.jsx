import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { mockTeacherStudents } from '../../data/mockTeacherData';

export default function AssignedStudents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');

  const students = mockTeacherStudents || [
    {
      id: 1,
      name: 'Faizan Ansari',
      rollNo: '21CS042',
      section: 'CSE-A',
      cgpa: 8.92,
      attendance: '94%',
      tier: 'tier1',
      skillsCount: 12,
      projectsVerified: 3,
      status: 'verified'
    },
    {
      id: 2,
      name: 'Aarav Sharma',
      rollNo: '21CS018',
      section: 'CSE-A',
      cgpa: 8.45,
      attendance: '88%',
      tier: 'tier1',
      skillsCount: 9,
      projectsVerified: 2,
      status: 'verified'
    },
    {
      id: 3,
      name: 'Sneha Patel',
      rollNo: '21CS089',
      section: 'CSE-B',
      cgpa: 7.65,
      attendance: '82%',
      tier: 'tier2',
      skillsCount: 7,
      projectsVerified: 1,
      status: 'pending'
    },
    {
      id: 4,
      name: 'Rohan Verma',
      rollNo: '21CS104',
      section: 'CSE-B',
      cgpa: 6.80,
      attendance: '71%',
      tier: 'at-risk',
      skillsCount: 4,
      projectsVerified: 0,
      status: 'rejected'
    },
    {
      id: 5,
      name: 'Pooja Iyer',
      rollNo: '21CS065',
      section: 'CSE-A',
      cgpa: 9.15,
      attendance: '96%',
      tier: 'tier1',
      skillsCount: 14,
      projectsVerified: 4,
      status: 'verified'
    }
  ];

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || s.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const columns = [
    {
      header: 'Student Name & Roll No',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.name}</div>
          <div className="text-xs font-mono text-on-surface-variant">{row.rollNo} • {row.section}</div>
        </div>
      )
    },
    {
      header: 'CGPA',
      accessor: (row) => <span className="font-mono font-bold text-primary">{row.cgpa}</span>
    },
    {
      header: 'Attendance',
      accessor: (row) => <span className="text-xs font-medium text-on-surface">{row.attendance}</span>
    },
    {
      header: 'Predicted Tier',
      accessor: (row) => <StatusBadge status={row.tier} />
    },
    {
      header: 'Verified Projects',
      accessor: (row) => (
        <span className="text-xs text-on-surface font-medium">
          {row.projectsVerified} Verified
        </span>
      )
    },
    {
      header: 'Record Status',
      accessor: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Action',
      accessor: (row) => (
        <Button variant="outline" size="sm" icon="visibility">
          Profile
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cohort Management"
        title="Assigned Students Directory"
        subtitle="Manage academic progress, verified credentials, and placement readiness across sections"
        action={
          <Button variant="primary" icon="download">
            Export Cohort CSV
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-surface border border-outline-variant/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by student name or roll no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-surface-container/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-on-surface-variant">Prediction Tier:</span>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-3 py-2 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
          >
            <option value="all">All Tiers ({students.length})</option>
            <option value="tier1">Tier 1 Dream</option>
            <option value="tier2">Tier 2 Core</option>
            <option value="at-risk">At-Risk Interventions</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
      />
    </div>
  );
}
