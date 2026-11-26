import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { studentApi } from '../../services/studentApi';

const tabs = [
  { id: 'overview', label: 'Overview & Bio', icon: 'person' },
  { id: 'academic', label: 'Academic Records', icon: 'school' },
  { id: 'skills', label: 'Skills Mastery', icon: 'psychology' },
  { id: 'projects', label: 'Verified Projects', icon: 'terminal' },
  { id: 'certifications', label: 'Certifications', icon: 'verified' },
  { id: 'internships', label: 'Internships', icon: 'work' }
];

function displayValue(value) {
  if (Array.isArray(value)) return value.join(', ');
  return value == null || value === '' ? 'Not provided' : value;
}

export default function StudentProfile() {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [sectionError, setSectionError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      studentApi.getProfile(),
      studentApi.getSkills(),
      studentApi.getPortfolio('project'),
      studentApi.getPortfolio('certification'),
      studentApi.getPortfolio('internship')
    ]).then(([profileResult, skillResult, projectResult, certificationResult, internshipResult]) => {
      if (!active) return;
      if (profileResult.status === 'rejected') throw profileResult.reason;

      setProfile(profileResult.value);
      const failures = [];
      const sectionData = (result, label) => {
        if (result.status === 'fulfilled') return result.value;
        failures.push(`${label}: ${result.reason.message || 'Unable to load records.'}`);
        return [];
      };
      setSkills(sectionData(skillResult, 'Skills'));
      setProjects(sectionData(projectResult, 'Projects'));
      setCertifications(sectionData(certificationResult, 'Certifications'));
      setInternships(sectionData(internshipResult, 'Internships'));
      setSectionError(failures.join(' '));
    })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load your profile.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p className="text-sm text-on-surface-variant" role="status">Loading your profile...</p>;
  if (error || !profile) {
    return <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm" role="alert">{error || 'Your profile is unavailable.'}</p>;
  }

  const initials = (profile.full_name || profile.email || 'Student')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
  const portfolioItems = {
    projects: {
      items: projects,
      title: (item) => item.title,
      details: (item) => [
        ['Role', item.role],
        ['Completion date', item.completionDate],
        ['Technologies', item.technologies],
        ['Description', item.description]
      ]
    },
    certifications: {
      items: certifications,
      title: (item) => item.title,
      details: (item) => [
        ['Issuer', item.issuer],
        ['Credential ID', item.credentialId],
        ['Issue date', item.issueDate],
        ['Skills', item.skills]
      ]
    },
    internships: {
      items: internships,
      title: (item) => item.role || item.company,
      details: (item) => [
        ['Company', item.company],
        ['Duration', item.duration],
        ['Location', item.location],
        ['Description', item.description],
        ['Skills', item.skills]
      ]
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        eyebrow="Student Identity & Portfolio"
        title="Student Profile"
        subtitle="Your account details, academic information, and personal portfolio."
        icon="badge"
        actions={
          <Button variant="outline" size="sm" icon="print" onClick={() => window.print()}>
            Print Scorecard
          </Button>
        }
      />

      <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center text-2xl font-bold">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-on-surface">{profile.full_name}</h2>
              <StatusBadge status={profile.verification_status || 'pending'} label={profile.verification_status || 'Active'} />
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              University ID: <span className="font-mono font-semibold text-on-surface">{profile.enrollment_number || 'Not provided'}</span>
              {' • '}{profile.department}
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">Academic batch: {profile.batch}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-outline-variant/20">
          <div className="text-center px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase">Cumulative GPA</span>
            <div className="text-xl font-extrabold text-secondary font-heading">{profile.cgpa ?? '—'}</div>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase">Verification</span>
            <div className="text-sm font-extrabold text-on-surface font-heading capitalize">{profile.verification_status || 'Pending'}</div>
          </div>
        </div>
      </section>

      <nav className="flex items-center gap-2 border-b border-outline-variant/30 overflow-x-auto pb-1" aria-label="Profile sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-secondary text-secondary bg-surface-container-low'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {sectionError && <p className="p-3 rounded-xl bg-amber-50 text-amber-800 text-sm" role="status">{sectionError}</p>}

      <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-sm">
        {activeTab === 'overview' && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            {[
              ['Full name', profile.full_name],
              ['Email', profile.email],
              ['Phone', profile.phone_number],
              ['University ID', profile.enrollment_number],
              ['Department', profile.department],
              ['Academic batch', profile.batch]
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold text-on-surface-variant">{label}</dt>
                <dd className="mt-1 font-medium text-on-surface break-all">{displayValue(value)}</dd>
              </div>
            ))}
          </dl>
        )}

        {activeTab === 'academic' && (
          <div>
            <h3 className="font-heading text-base font-bold text-on-surface">Your Academic Information</h3>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                ['Cumulative GPA', profile.cgpa],
                ['10th percentage', profile.tenth_percentage],
                ['12th percentage', profile.twelfth_percentage],
                ['Graduation percentage', profile.graduation_percentage]
              ].map(([label, value]) => (
                <div key={label} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <dt className="text-xs font-semibold text-on-surface-variant">{label}</dt>
                  <dd className="mt-2 text-lg font-bold text-on-surface">{value == null ? 'Not recorded' : value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm text-on-surface-variant">
              Semester-by-semester transcript entries are not available in this account yet.
            </p>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!skills.length && <p className="text-sm text-on-surface-variant">No skills are recorded for your account.</p>}
            {skills.map((skill) => (
              <div key={skill.id} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <div className="flex justify-between gap-3">
                  <h3 className="font-bold text-sm text-on-surface">{skill.name}</h3>
                  <span className="text-xs font-semibold text-secondary">{skill.level}</span>
                </div>
                <p className="mt-1 text-xs text-on-surface-variant">{skill.category}</p>
                <div className="mt-3 flex justify-between text-xs">
                  <span className="text-on-surface-variant">Score</span>
                  <span className="font-bold text-secondary">{skill.score == null ? 'Not assessed' : `${skill.score}%`}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {['projects', 'certifications', 'internships'].includes(activeTab) && (() => {
          const section = portfolioItems[activeTab];
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!section.items.length && <p className="text-sm text-on-surface-variant">No {activeTab} are recorded for your account.</p>}
              {section.items.map((item) => (
                <article key={item.id} className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-heading font-bold text-base text-on-surface">{section.title(item) || 'Untitled record'}</h3>
                    <StatusBadge status={item.status || 'pending'} />
                  </div>
                  <dl className="mt-3 space-y-2">
                    {section.details(item).filter(([, value]) => value != null && value !== '').map(([label, value]) => (
                      <div key={label} className="text-xs">
                        <dt className="inline font-semibold text-on-surface-variant">{label}: </dt>
                        <dd className="inline text-on-surface">{displayValue(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
          );
        })()}
      </section>
    </div>
  );
}
