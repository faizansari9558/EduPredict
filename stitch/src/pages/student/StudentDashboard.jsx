import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import { studentApi } from '../../services/studentApi';

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    studentApi.getDashboard()
      .then((data) => {
        if (!data?.student) throw new Error('Your student profile could not be found.');
        if (active) setDashboard(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load your dashboard.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="p-6 text-sm text-on-surface-variant" role="status">Loading your account...</p>;
  }

  if (error || !dashboard) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700" role="alert">
        {error || 'Unable to load your dashboard.'}
      </div>
    );
  }

  const { student, summary } = dashboard;
  const firstName = student.full_name.trim().split(/\s+/)[0];
  const details = [
    ['University ID', student.enrollment_number],
    ['Email', student.email],
    ['Department', student.department],
    ['Academic batch', student.batch]
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <section className="relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-sm">
        <div className="flex flex-col gap-2 max-w-2xl">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-on-surface">
            Welcome Back, {firstName}!
          </h1>
          <p className="text-sm text-on-surface-variant">
            This dashboard shows the academic profile and records for your signed-in account.
          </p>
        </div>
        <div className="flex flex-col px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <span className="text-[11px] font-semibold text-on-surface-variant">Account status</span>
          <span className="text-sm font-bold text-on-surface capitalize">
            {student.verification_status || 'Active'}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Cumulative GPA"
          value={student.cgpa ?? '—'}
          unit="/ 10.0"
          icon="school"
          iconColor="text-secondary"
          iconBg="bg-secondary-fixed"
        />
        <StatCard
          label="Profile Completion"
          value={summary.profileCompletion ?? '—'}
          unit={summary.profileCompletion == null ? '' : '%'}
          trend={`${summary.profileCompletionCompleted ?? 0} of ${summary.profileCompletionTotal ?? 0} profile items`}
          trendDirection="neutral"
          icon="person"
          iconColor="text-secondary"
          iconBg="bg-secondary-fixed"
        />
        <StatCard
          label="Verified Documents"
          value={summary.verifiedDocs ?? 0}
          icon="verified"
          iconColor="text-emerald-700"
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Academic Batch"
          value={student.batch || '—'}
          icon="calendar_month"
          iconColor="text-on-surface"
          iconBg="bg-surface-container"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-on-surface">Your Account</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Personal details associated with the account you used to sign in.
          </p>
          <dl className="mt-5 divide-y divide-outline-variant/30">
            {details.map(([label, value]) => (
              <div key={label} className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3">
                <dt className="text-xs font-semibold text-on-surface-variant">{label}</dt>
                <dd className="text-sm font-medium text-on-surface break-all">{value || 'Not provided'}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-on-surface">Manage Your Profile</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Review or update information and records for your own student account.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <Link to="/student/profile" className="text-sm font-semibold text-secondary hover:underline">
              View your profile
            </Link>
            <Link to="/student/academic-records" className="text-sm font-semibold text-secondary hover:underline">
              View your academic records
            </Link>
            <Link to="/student/assessments" className="text-sm font-semibold text-secondary hover:underline">
              View assessments &amp; your progress
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
