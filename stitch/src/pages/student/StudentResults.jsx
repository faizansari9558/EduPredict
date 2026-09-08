import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function StudentResults() {
  const resultHistory = [
    {
      id: 1,
      title: 'National Mock Placement Exam – Stage 2',
      date: 'Aug 24, 2024',
      type: 'Mock Drive',
      score: '92 / 100',
      percentile: '98.4th',
      rank: '12 / 850',
      status: 'verified'
    },
    {
      id: 2,
      title: 'Data Structures & Algorithms Mastery Final',
      date: 'Aug 10, 2024',
      type: 'Domain Test',
      score: '88 / 100',
      percentile: '94.2th',
      rank: '48 / 850',
      status: 'verified'
    },
    {
      id: 3,
      title: 'Quantitative & Logical Aptitude Sprint',
      date: 'Jul 28, 2024',
      type: 'Aptitude Sprint',
      score: '95 / 100',
      percentile: '99.1th',
      rank: '8 / 850',
      status: 'verified'
    },
    {
      id: 4,
      title: 'Operating Systems & System Design Quiz',
      date: 'Jul 14, 2024',
      type: 'Core CS',
      score: '82 / 100',
      percentile: '89.0th',
      rank: '92 / 850',
      status: 'verified'
    }
  ];

  const domainScores = [
    { domain: 'DSA & Coding', score: 92 },
    { domain: 'Aptitude & Logic', score: 95 },
    { domain: 'System Design', score: 78 },
    { domain: 'Database & SQL', score: 88 },
    { domain: 'Core CS (OS/CN)', score: 82 },
    { domain: 'Verbal Ability', score: 90 }
  ];

  const columns = [
    {
      header: 'Assessment Title',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.title}</div>
          <div className="text-xs text-on-surface-variant">{row.type} • {row.date}</div>
        </div>
      )
    },
    {
      header: 'Score',
      accessor: (row) => <span className="font-mono font-bold text-primary">{row.score}</span>
    },
    {
      header: 'Percentile',
      accessor: (row) => (
        <span className="font-mono font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md text-xs">
          {row.percentile}
        </span>
      )
    },
    {
      header: 'Institutional Rank',
      accessor: (row) => <span className="font-mono text-xs text-on-surface-variant font-medium">{row.rank}</span>
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Evaluation & Benchmarks"
        title="Assessment Results & Rank Card"
        subtitle="Institutional assessment history, domain proficiency scores, and percentile standing"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Percentile"
          value="98.4th"
          trend="Top 2% of batch"
          trendType="up"
          icon="military_tech"
          iconBgColor="bg-amber-100 text-amber-800"
        />
        <StatCard
          title="Average Assessment Score"
          value="89.3%"
          trend="+4.2% vs last term"
          trendType="up"
          icon="analytics"
          iconBgColor="bg-blue-100 text-blue-800"
        />
        <StatCard
          title="Tests Completed"
          value="18"
          trend="100% compliance"
          trendType="neutral"
          icon="task_alt"
          iconBgColor="bg-emerald-100 text-emerald-800"
        />
        <StatCard
          title="Institutional Standing"
          value="#12 / 850"
          trend="Department Rank #3"
          trendType="up"
          icon="leaderboard"
          iconBgColor="bg-indigo-100 text-indigo-800"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Domain-Wise Proficiency Breakdown"
            subtitle="Normalized percentage scored across technical assessment modules"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={domainScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="domain" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D233A', color: '#fff', borderRadius: '8px', border: 'none' }}
                  />
                  <Bar dataKey="score" fill="#0051d5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-headline font-bold text-base text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">insights</span>
              Performance Summary
            </h4>
            <div className="space-y-4 text-xs text-on-surface-variant">
              <div className="p-3 bg-surface-container rounded-xl">
                <span className="font-bold text-primary block mb-1">Strongest Core Area</span>
                <span>Quantitative & Logical Aptitude (95%) demonstrates top-tier analytical thinking and algorithmic formulation speed.</span>
              </div>
              <div className="p-3 bg-surface-container rounded-xl">
                <span className="font-bold text-amber-700 block mb-1">Recommended Focus</span>
                <span>System Design & Distributed Patterns (78%) — practice high-level component diagrams and cache invalidation strategies.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/20 text-center">
            <span className="text-[11px] text-on-surface-variant/70">
              Evaluated by EduPredict Academic Core Engine
            </span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-headline font-bold text-lg text-on-surface mb-4">
          Detailed Assessment Transcripts
        </h4>
        <DataTable
          columns={columns}
          data={resultHistory}
          keyExtractor={(r) => r.id}
        />
      </div>
    </div>
  );
}
