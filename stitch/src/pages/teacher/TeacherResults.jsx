import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import ChartCard from '../../components/ChartCard';
import Button from '../../components/Button';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function TeacherResults() {
  const [selectedAssessment, setSelectedAssessment] = useState('National Mock Placement Exam – Stage 2');

  const scoreBrackets = [
    { range: '90-100%', count: 38 },
    { range: '80-89%', count: 64 },
    { range: '70-79%', count: 32 },
    { range: '60-69%', count: 18 },
    { range: '< 60%', count: 8 }
  ];

  const studentResults = [
    { id: 1, name: 'Faizan Ansari', rollNo: '21CS042', score: 92, percentile: '98.4th', rank: 1, timeTaken: '58 mins' },
    { id: 2, name: 'Pooja Iyer', rollNo: '21CS065', score: 90, percentile: '97.2th', rank: 2, timeTaken: '62 mins' },
    { id: 3, name: 'Aarav Sharma', rollNo: '21CS018', score: 86, percentile: '92.0th', rank: 5, timeTaken: '70 mins' },
    { id: 4, name: 'Sneha Patel', rollNo: '21CS089', score: 78, percentile: '81.5th', rank: 14, timeTaken: '85 mins' },
    { id: 5, name: 'Rohan Verma', rollNo: '21CS104', score: 62, percentile: '58.0th', rank: 45, timeTaken: '89 mins' }
  ];

  const columns = [
    {
      header: 'Rank',
      accessor: (row) => <span className="font-mono font-bold text-xs text-primary">#{row.rank}</span>
    },
    {
      header: 'Student Name',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.name}</div>
          <div className="text-xs font-mono text-on-surface-variant">{row.rollNo}</div>
        </div>
      )
    },
    {
      header: 'Score',
      accessor: (row) => <span className="font-mono font-bold text-xs text-on-surface">{row.score} / 100</span>
    },
    {
      header: 'Percentile',
      accessor: (row) => (
        <span className="font-mono font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">
          {row.percentile}
        </span>
      )
    },
    {
      header: 'Time Taken',
      accessor: (row) => <span className="text-xs text-on-surface-variant">{row.timeTaken}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Evaluation Matrix"
        title="Assessment Scorecards & Analytics"
        subtitle="Batch score distributions, percentile benchmarking, and ranking breakdowns"
        action={
          <Button variant="primary" icon="download">
            Export Gradebook
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Score Distribution Bell Curve"
            subtitle="Student count categorized by performance brackets"
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreBrackets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="range" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D233A', color: '#fff', borderRadius: '8px', border: 'none' }}
                  />
                  <Bar dataKey="count" fill="#0051d5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-headline font-bold text-base text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">analytics</span>
              Assessment Metrics
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 bg-surface-container rounded-xl">
                <span className="text-on-surface-variant font-medium">Batch Average:</span>
                <span className="font-bold text-on-surface">81.4%</span>
              </div>
              <div className="flex justify-between p-2.5 bg-surface-container rounded-xl">
                <span className="text-on-surface-variant font-medium">Highest Score:</span>
                <span className="font-bold text-green-600">98 / 100</span>
              </div>
              <div className="flex justify-between p-2.5 bg-surface-container rounded-xl">
                <span className="text-on-surface-variant font-medium">Lowest Score:</span>
                <span className="font-bold text-amber-700">44 / 100</span>
              </div>
              <div className="flex justify-between p-2.5 bg-surface-container rounded-xl">
                <span className="text-on-surface-variant font-medium">Standard Deviation:</span>
                <span className="font-mono font-bold text-on-surface">±8.2</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/20 text-center">
            <span className="text-[11px] text-on-surface-variant/70">
              Total 160 Students Assessed
            </span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-headline font-bold text-base text-on-surface mb-4">
          Individual Student Leaderboard
        </h4>
        <DataTable
          columns={columns}
          data={studentResults}
          keyExtractor={(r) => r.id}
        />
      </div>
    </div>
  );
}
