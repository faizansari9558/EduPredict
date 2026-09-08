import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import {
  mockStudentProfile,
  mockSemesterRecords,
  mockSkills,
  mockProjects,
  mockCertifications,
  mockInternships
} from '../../data/mockStudentData';

/**
 * Stitch Official Student Profile Screen
 * Encompasses Academic Records, Skills, Projects, Certifications, and Internships
 */
export default function StudentProfile() {
  const [activeTab, setActiveTab] = useState('overview');
  const student = mockStudentProfile;

  const tabs = [
    { id: 'overview', label: 'Overview & Bio', icon: 'person' },
    { id: 'academic', label: 'Academic Records', icon: 'school' },
    { id: 'skills', label: 'Skills Mastery', icon: 'psychology' },
    { id: 'projects', label: 'Verified Projects', icon: 'terminal' },
    { id: 'certifications', label: 'Certifications', icon: 'verified' },
    { id: 'internships', label: 'Internships', icon: 'work' }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        eyebrow="Student Identity & Portfolio"
        title="Student Profile"
        subtitle="Comprehensive verification portfolio, academic milestones, and career credentials."
        icon="badge"
        actions={
          <Button variant="outline" size="sm" icon="print" onClick={() => window.print()}>
            Print Scorecard
          </Button>
        }
      />

      {/* Profile Header Identity Card */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={student.avatar_url}
            alt={student.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-secondary/20 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-on-surface">
                {student.name}
              </h2>
              <StatusBadge status="verified" label="Verified Student" />
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Roll No: <span className="font-mono font-semibold text-on-surface">{student.enrollment_number}</span> • {student.department}
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Cohort Batch {student.batch} • Semester {student.current_semester}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-outline-variant/20">
          <div className="text-center px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase">Cumulative GPA</span>
            <div className="text-xl font-extrabold text-secondary font-heading">{student.cgpa}</div>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase">Attendance</span>
            <div className="text-xl font-extrabold text-emerald-700 font-heading">{student.attendance_pct}%</div>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase">Readiness</span>
            <div className="text-xl font-extrabold text-tertiary-fixed-dim font-heading">{student.readiness_score}%</div>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 overflow-x-auto pb-1">
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
      </div>

      {/* Tab Content */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-sm">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-heading text-base font-bold text-on-surface border-b pb-2 border-outline-variant/20">
                Contact &amp; University Verification Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-on-surface-variant font-semibold">Institutional Email:</span>
                  <p className="font-medium text-on-surface mt-0.5">{student.email}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant font-semibold">Primary Contact:</span>
                  <p className="font-medium text-on-surface mt-0.5">{student.phone}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant font-semibold">Department &amp; Program:</span>
                  <p className="font-medium text-on-surface mt-0.5">{student.department}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant font-semibold">Graduation Year:</span>
                  <p className="font-medium text-on-surface mt-0.5">{student.batch.split('-')[1]}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading text-base font-bold text-on-surface border-b pb-2 border-outline-variant/20">
                Placement Forecast Highlights
              </h3>
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Predicted Target Tier:</span>
                  <span className="font-bold text-on-surface">{student.predicted_tier}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Estimated CTC Range:</span>
                  <span className="font-bold text-emerald-700">{student.expected_package}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Probability Confidence:</span>
                  <span className="font-bold text-secondary">{student.placement_probability}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="space-y-4">
            <h3 className="font-heading text-base font-bold text-on-surface">Semester Grade History</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockSemesterRecords.map((sem) => (
                <div key={sem.semester} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-heading font-bold text-sm text-on-surface">{sem.semester}</span>
                    <StatusBadge status="verified" label={sem.status} />
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-on-surface-variant">SGPA: <strong className="text-on-surface">{sem.sgpa}</strong></span>
                    <span className="text-on-surface-variant">Cumulative: <strong className="text-secondary">{sem.cgpa}</strong></span>
                    <span className="text-on-surface-variant">Credits: <strong className="text-on-surface">{sem.credits}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockSkills.map((sk) => (
              <div key={sk.id} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-on-surface">{sk.name}</span>
                  <StatusBadge status={sk.verified ? 'verified' : 'pending'} label={sk.level} />
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${sk.score}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-on-surface-variant">
                  <span>Category: {sk.category}</span>
                  <span className="font-bold text-secondary">{sk.score}% Score</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4">
            {mockProjects.map((proj) => (
              <div key={proj.id} className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-heading font-bold text-base text-on-surface">{proj.title}</h4>
                    <span className="text-xs text-secondary font-semibold">{proj.category} • {proj.completion_date}</span>
                  </div>
                  <StatusBadge status="verified" label={proj.status} />
                </div>
                <p className="text-xs text-on-surface-variant">{proj.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.technologies.map((t) => (
                    <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'certifications' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockCertifications.map((cert) => (
              <div key={cert.id} className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-heading font-bold text-sm text-on-surface">{cert.title}</h4>
                  <StatusBadge status="verified" label={cert.status} />
                </div>
                <p className="text-xs text-on-surface-variant">Issuer: <strong>{cert.issuer}</strong> • Issued {cert.issue_date}</p>
                <p className="text-[11px] font-mono text-outline">ID: {cert.credential_id}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'internships' && (
          <div className="space-y-4">
            {mockInternships.map((intern) => (
              <div key={intern.id} className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-heading font-bold text-base text-on-surface">{intern.company}</h4>
                    <span className="text-xs text-secondary font-semibold">{intern.role} • {intern.duration}</span>
                  </div>
                  <StatusBadge status="verified" label={intern.status} />
                </div>
                <p className="text-xs text-on-surface-variant">{intern.responsibilities}</p>
                <div className="p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 border border-emerald-200/50">
                  <strong>Mentor Appraisal:</strong> "{intern.mentor_feedback}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
