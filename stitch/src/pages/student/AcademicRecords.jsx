import React from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { mockSemesterRecords, mockStudentProfile } from '../../data/mockStudentData';

export default function AcademicRecords() {
  const columns = [
    { key: 'semester', label: 'Semester' },
    { key: 'sgpa', label: 'Semester GPA (SGPA)', align: 'right' },
    { key: 'cgpa', label: 'Cumulative GPA (CGPA)', align: 'right' },
    { key: 'credits', label: 'Total Credits', align: 'right' },
    {
      key: 'status',
      label: 'Exam Cell Status',
      render: (val) => <StatusBadge status="verified" label={val} />
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        eyebrow="Institutional Records"
        title="Academic Records & Transcripts"
        subtitle="Verified semester results, cumulative credit audits, and GPA velocity progression."
        icon="school"
        actions={
          <Button variant="outline" size="sm" icon="download" onClick={() => alert('Exporting Official Academic Transcript PDF...')}>
            Download Official Transcript (PDF)
          </Button>
        }
      />

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm text-center">
          <span className="text-xs font-bold uppercase text-on-surface-variant">Cumulative GPA</span>
          <div className="text-3xl font-extrabold text-secondary font-heading mt-1">{mockStudentProfile.cgpa}</div>
          <span className="text-xs text-emerald-700 font-semibold">Top 15% in Department</span>
        </div>
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm text-center">
          <span className="text-xs font-bold uppercase text-on-surface-variant">Earned Credits</span>
          <div className="text-3xl font-extrabold text-on-surface font-heading mt-1">122 / 160</div>
          <span className="text-xs text-on-surface-variant">Degree on Track</span>
        </div>
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm text-center">
          <span className="text-xs font-bold uppercase text-on-surface-variant">Standing</span>
          <div className="text-3xl font-extrabold text-emerald-700 font-heading mt-1">First Class (Dist.)</div>
          <span className="text-xs text-emerald-700 font-semibold">0 Active Backlogs</span>
        </div>
      </div>

      {/* Tabular Records */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
        <h3 className="font-heading text-base font-bold text-on-surface">Verified Semester Breakdown</h3>
        <DataTable columns={columns} data={mockSemesterRecords} keyField="semester" />
      </div>
    </div>
  );
}
