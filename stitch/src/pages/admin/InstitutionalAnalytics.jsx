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
  LineChart,
  Line,
  Legend
} from 'recharts';

export default function InstitutionalAnalytics() {
  const yoyPlacementTrend = [
    { year: '2021', placedRate: 74.2, avgPackage: 6.8 },
    { year: '2022', placedRate: 78.5, avgPackage: 7.4 },
    { year: '2023', placedRate: 81.9, avgPackage: 8.2 },
    { year: '2024', placedRate: 84.7, avgPackage: 9.4 },
    { year: '2025 (Pred)', placedRate: 89.2, avgPackage: 10.8 }
  ];

  const branchComparisons = [
    { branch: 'CSE', codingAvg: 91, aptitudeAvg: 88, placementProb: 92.1 },
    { branch: 'IT', codingAvg: 88, aptitudeAvg: 85, placementProb: 89.5 },
    { branch: 'ECE', codingAvg: 79, aptitudeAvg: 84, placementProb: 83.7 },
    { branch: 'EEE', codingAvg: 72, aptitudeAvg: 80, placementProb: 75.0 },
    { branch: 'MECH', codingAvg: 68, aptitudeAvg: 78, placementProb: 72.7 }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Enterprise Intelligence"
        title="Campus Institutional Analytics"
        subtitle="Cross-departmental comparisons, historical YoY hiring trends, and compensation distributions"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Placement Rate"
          value="84.7%"
          trend="+3.8% YoY"
          trendType="up"
          icon="trending_up"
          iconBgColor="bg-emerald-100 text-emerald-800"
        />
        <StatCard
          title="Average CTC"
          value="₹9.4 LPA"
          trend="+14.6% vs 2023"
          trendType="up"
          icon="paid"
          iconBgColor="bg-blue-100 text-blue-800"
        />
        <StatCard
          title="Partner Companies"
          value="184"
          trend="42 Tier-1 Dream"
          trendType="up"
          icon="corporate_fare"
          iconBgColor="bg-purple-100 text-purple-800"
        />
        <StatCard
          title="Offers Made"
          value="1,220"
          trend="1.18 offers / student"
          trendType="up"
          icon="workspace_premium"
          iconBgColor="bg-amber-100 text-amber-800"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Year-over-Year Placement & CTC Progression"
          subtitle="Placement percentage and average compensation growth over 5 years"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yoyPlacementTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="year" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D233A', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="placedRate" name="Placement Rate (%)" stroke="#0051d5" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="avgPackage" name="Avg CTC (LPA)" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Department Technical Competency Benchmark"
          subtitle="Coding proficiency vs aptitude scores by engineering branch"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchComparisons} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="branch" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D233A', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="codingAvg" name="Coding Score (%)" fill="#0051d5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aptitudeAvg" name="Aptitude Score (%)" fill="#102a43" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
