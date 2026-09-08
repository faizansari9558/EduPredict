import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';

export default function AdminReports() {
  const [reports, setReports] = useState([
    {
      id: 1,
      title: 'NAAC Accreditation Criterion 2.6 Report',
      description: 'Comprehensive student performance, learning outcomes, and course attainment analytics.',
      generatedDate: 'Sep 05, 2024',
      type: 'Accreditation',
      size: '4.8 MB',
      format: 'PDF / XLSX'
    },
    {
      id: 2,
      title: 'Annual Campus Placement & TPO Dossier 2024',
      description: 'Detailed salary distribution, branch-wise statistics, and recruiter engagement matrices.',
      generatedDate: 'Aug 30, 2024',
      type: 'TPO Placement',
      size: '8.2 MB',
      format: 'PDF'
    },
    {
      id: 3,
      title: 'AI Placement Risk & Intervention Audit',
      description: 'Identification log of at-risk students, remedial mentorship actions, and model performance.',
      generatedDate: 'Aug 15, 2024',
      type: 'AI Governance',
      size: '2.1 MB',
      format: 'CSV / PDF'
    },
    {
      id: 4,
      title: 'Department Faculty Verification Audit Log',
      description: 'Verification throughput, approval turnaround times, and mentor assignment compliance.',
      generatedDate: 'Jul 31, 2024',
      type: 'Faculty Audit',
      size: '1.4 MB',
      format: 'XLSX'
    }
  ]);

  const columns = [
    {
      header: 'Report Title & Details',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.title}</div>
          <div className="text-xs text-on-surface-variant max-w-lg">{row.description}</div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: (row) => (
        <span className="px-2.5 py-1 bg-surface-container rounded-lg text-xs font-medium text-primary">
          {row.type}
        </span>
      )
    },
    {
      header: 'Generated',
      accessor: (row) => <span className="text-xs text-on-surface-variant">{row.generatedDate}</span>
    },
    {
      header: 'Format & Size',
      accessor: (row) => <span className="font-mono text-xs text-on-surface">{row.format} ({row.size})</span>
    },
    {
      header: 'Action',
      accessor: (row) => (
        <Button variant="outline" size="sm" icon="download">
          Export
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compliance & Dossiers"
        title="Institutional Reports & Audit Exports"
        subtitle="Generate, download, and archive official NAAC, NBA, NIRF, and placement dossiers"
        action={
          <Button variant="primary" icon="post_add">
            Compile Custom Dossier
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={reports}
        keyExtractor={(r) => r.id}
      />
    </div>
  );
}
