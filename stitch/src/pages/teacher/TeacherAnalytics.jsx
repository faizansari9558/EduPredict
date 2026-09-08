import React from 'react';
import PageHeader from '../../components/PageHeader';
import ChartCard from '../../components/ChartCard';
import StatCard from '../../components/StatCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export default function TeacherAnalytics() {
  const skillGapData = [
    { subject: 'DSA & Algorithmic Design', batchScore: 84, industryBenchmark: 90 },
    { subject: 'System Architecture', batchScore: 68, industryBenchmark: 85 },
    { subject: 'SQL & Database Indexing', batchScore: 88, industryBenchmark: 80 },
    { subject: 'Cloud & Containerization', batchScore: 62, industryBenchmark: 80 },
    { subject: 'Full Stack Frameworks', batchScore: 82, industryBenchmark: 85 },
    { subject: 'Quantitative Aptitude', batchScore: 89, industryBenchmark: 85 }
  ];

  const atRiskStudents = [
    { rollNo: '21CS104', name: 'Rohan Verma', cgpa: 6.80, attendance: '71%', missingCriteria: 'Zero verified projects, low coding attendance' },
    { rollNo: '21CS112', name: 'Kunal Sen', cgpa: 6.95, attendance: '68%', missingCriteria: 'Failed mock placement round 1' },
    { rollNo: '21CS145', name: 'Divya Nair', cgpa: 7.10, attendance: '74%', missingCriteria: 'Awaiting internship certificate verification' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cohort Intelligence"
        title="Departmental Academic & Placement Analytics"
        subtitle="AI-driven competency gap identification, placement risk forecasting, and curriculum benchmarks"
      />

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Placement Readiness Index"
          value="88.2 / 100"
          trend="+5.4 pts vs 2023 Cohort"
          trendType="up"
          icon="insights"
          iconBgColor="bg-blue-100 text-blue-800"
        />
        <StatCard
          title="Critical Skill Gap"
          value="System Design"
          trend="17% below Tier-1 benchmark"
          trendType="down"
          icon="warning"
          iconBgColor="bg-amber-100 text-amber-800"
        />
        <StatCard
          title="At-Risk Interventions"
          value="3 Students"
          trend="Personalized roadmaps active"
          trendType="neutral"
          icon="contact_support"
          iconBgColor="bg-red-100 text-red-800"
        />
        <StatCard
          title="Verified Project Density"
          value="2.4 / Student"
          trend="Target: 2.0"
          trendType="up"
          icon="code"
          iconBgColor="bg-emerald-100 text-emerald-800"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Cohort Competency vs Industry Benchmarks"
          subtitle="Radar assessment comparing current batch mean to Tier-1 hiring expectations"
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillGapData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" stroke="#64748B" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#CBD5E1" fontSize={10} />
                <Radar name="Current Batch" dataKey="batchScore" stroke="#0051d5" fill="#0051d5" fillOpacity={0.4} />
                <Radar name="Tier-1 Benchmark" dataKey="industryBenchmark" stroke="#102a43" fill="#102a43" fillOpacity={0.15} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D233A', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* At-Risk Intervention Watchlist */}
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">warning</span>
                At-Risk Student Intervention Watchlist
              </h4>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                3 Action Items
              </span>
            </div>

            <div className="space-y-3">
              {atRiskStudents.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-surface-container/50 border border-outline-variant/20 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-on-surface">{s.name} ({s.rollNo})</span>
                    <span className="font-mono text-xs font-bold text-amber-700">CGPA: {s.cgpa} • Att: {s.attendance}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    <strong className="text-primary">Trigger:</strong> {s.missingCriteria}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/20 mt-4">
            <span className="text-xs text-on-surface-variant font-medium">
              Automated remedial assignments dispatched via EduPredict Mentorship Router.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
