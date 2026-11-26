import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { teacherApi } from '../../services/teacherApi';

const PAGE_SIZE = 500;

function displayNumber(value, digits = 2) {
  return value == null || !Number.isFinite(Number(value)) ? '—' : Number(value).toFixed(digits);
}

function statusLabel(status) {
  return ({
    not_started: 'Not started',
    pending: 'Pending',
    verified: 'Verified',
    rejected: 'Rejected'
  })[status] || status || 'Unknown';
}

function getSafeExternalUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function AcademicValue({ label, value, suffix = '' }) {
  return (
    <div className="rounded-xl bg-surface-container-low p-3">
      <div className="text-[11px] uppercase tracking-wide text-on-surface-variant">{label}</div>
      <div className="mt-1 font-semibold text-on-surface">{value == null || value === '—' ? '—' : `${value}${suffix}`}</div>
    </div>
  );
}

export default function AssignedStudents() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ limit: PAGE_SIZE, offset: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  useEffect(() => {
    let active = true;
    teacherApi.getAssignedStudents({ limit: PAGE_SIZE, offset: 0 })
      .then((response) => {
        if (!active) return;
        setStudents(response.data || []);
        setPagination(response.pagination || { limit: PAGE_SIZE, offset: 0, total: 0 });
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load your department roster.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    setError('');
    try {
      const nextOffset = students.length;
      const response = await teacherApi.getAssignedStudents({ limit: PAGE_SIZE, offset: nextOffset });
      setStudents((current) => [...current, ...(response.data || [])]);
      setPagination(response.pagination || pagination);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load more students.');
    } finally {
      setLoadingMore(false);
    }
  };

  const openStudent = async (student) => {
    setSelectedStudent(student);
    setStudentDetails(null);
    setDetailsError('');
    setDetailsLoading(true);
    try {
      const response = await teacherApi.getStudentDetails(student.id);
      setStudentDetails(response.data);
    } catch (requestError) {
      setDetailsError(requestError.message || 'Unable to load this student record.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch = !search ||
        [student.full_name, student.enrollment_number, student.email, student.batch]
          .some((value) => String(value || '').toLowerCase().includes(search));
      const matchesStatus = filterStatus === 'all' || student.verification_status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, filterStatus]);

  const columns = [
    {
      key: 'student',
      label: 'Student',
      render: (_, row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.full_name}</div>
          <div className="text-xs font-mono text-on-surface-variant">{row.enrollment_number}</div>
          <div className="text-xs text-on-surface-variant">{row.email}</div>
        </div>
      )
    },
    { key: 'batch', label: 'Batch' },
    {
      key: 'cgpa',
      label: 'CGPA',
      render: (value) => displayNumber(value)
    },
    {
      key: 'skills_count',
      label: 'Skills',
      render: (value) => Number(value) || 0
    },
    {
      key: 'projects_count',
      label: 'Projects',
      render: (_, row) => `${Number(row.verified_projects_count) || 0} / ${Number(row.projects_count) || 0} verified`
    },
    {
      key: 'placement_ready_score',
      label: 'Readiness',
      render: (value, row) => Number(row.assessment_attempts) > 0 && value != null
        ? `${displayNumber(value, 1)}%`
        : 'Not assessed'
    },
    {
      key: 'verification_status',
      label: 'Record status',
      render: (value) => <StatusBadge status={value} label={statusLabel(value)} />
    },
    {
      key: 'actions',
      label: 'Profile',
      render: (_, row) => (
        <Button variant="outline" size="sm" icon="visibility" onClick={() => openStudent(row)}>
          View
        </Button>
      )
    }
  ];

  const detailTitle = selectedStudent?.full_name || 'Student Profile';
  const portfolioItems = studentDetails?.portfolio || [];
  const skills = studentDetails?.skills || [];
  const documents = studentDetails?.documents || [];
  const assessmentResults = studentDetails?.assessmentResults || [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Department Roster"
        title="Assigned Students"
        subtitle="Students are included automatically from your verified department. Student records and assessment data are read from the database."
      />

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="search"
            placeholder="Search name, university ID, email, or batch"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label htmlFor="student-status-filter" className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">
            Record status
          </label>
          <select
            id="student-status-filter"
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl border border-outline-variant/50 text-sm bg-surface"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="not_started">Not started</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-on-surface-variant">
        <span>
          {loading ? 'Loading department roster…' : `${filteredStudents.length} shown • ${students.length} loaded of ${pagination.total} students`}
        </span>
      </div>

      <DataTable
        columns={columns}
        data={filteredStudents}
        keyField="id"
        emptyMessage={loading ? 'Loading department roster…' : 'No students match this search or status filter.'}
      />

      {students.length < pagination.total && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} loading={loadingMore} disabled={loadingMore}>
            Load more students
          </Button>
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedStudent)}
        onClose={() => {
          setSelectedStudent(null);
          setStudentDetails(null);
        }}
        title={detailTitle}
        maxWidth="max-w-4xl"
      >
        {detailsLoading && <p className="text-sm text-on-surface-variant">Loading student records…</p>}
        {detailsError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {detailsError}
          </div>
        )}
        {studentDetails && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-on-surface">{studentDetails.enrollment_number} · {studentDetails.batch}</p>
                <p className="text-sm text-on-surface-variant">{studentDetails.email} · {studentDetails.department}</p>
              </div>
              <StatusBadge
                status={studentDetails.verification_status}
                label={statusLabel(studentDetails.verification_status)}
              />
            </div>

            <section>
              <h3 className="font-semibold text-on-surface mb-3">Academic Records</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <AcademicValue label="Cumulative GPA" value={displayNumber(studentDetails.cgpa)} />
                <AcademicValue label="10th" value={studentDetails.tenth_percentage} suffix="%" />
                <AcademicValue label="12th" value={studentDetails.twelfth_percentage} suffix="%" />
                <AcademicValue label="Graduation" value={studentDetails.graduation_percentage} suffix="%" />
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-on-surface mb-3">Assessment Summary</h3>
              {studentDetails.metrics ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <AcademicValue label="Evaluated attempts" value={studentDetails.metrics.assessment_attempts} />
                  <AcademicValue label="Average score" value={displayNumber(studentDetails.metrics.assessment_avg_score, 1)} suffix="%" />
                  <AcademicValue label="Aptitude score" value={displayNumber(studentDetails.metrics.aptitude_score, 1)} suffix="%" />
                  <AcademicValue label="Coding score" value={displayNumber(studentDetails.metrics.coding_score, 1)} suffix="%" />
                  <AcademicValue label="Overall score" value={displayNumber(studentDetails.metrics.overall_score, 1)} suffix="%" />
                  <AcademicValue label="Placement readiness" value={displayNumber(studentDetails.metrics.placement_ready_score, 1)} suffix="%" />
                  <AcademicValue label="Profile completion" value={studentDetails.metrics.profile_completion_pct} suffix="%" />
                  <AcademicValue label="Cohort percentile" value={studentDetails.metrics.cohort_percentile} suffix="%" />
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">No evaluated assessment data is available yet.</p>
              )}
            </section>

            <section>
              <h3 className="font-semibold text-on-surface mb-3">Skills ({skills.length})</h3>
              {skills.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {skills.map((skill) => (
                    <div key={`${skill.skill_category}-${skill.skill_name}`} className="rounded-xl border border-outline-variant/30 p-3">
                      <div className="font-medium text-sm text-on-surface">{skill.skill_name}</div>
                      <div className="text-xs text-on-surface-variant">
                        {skill.skill_category} · {skill.attempts} attempts
                        {Number(skill.max_score) > 0
                          ? ` · ${displayNumber((Number(skill.avg_score) / Number(skill.max_score)) * 100, 1)}%`
                          : ' · Not assessed'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">No skills have been added.</p>
              )}
            </section>

            <section>
              <h3 className="font-semibold text-on-surface mb-3">Projects, Certifications & Internships ({portfolioItems.length})</h3>
              {portfolioItems.length ? (
                <div className="space-y-2">
                  {portfolioItems.map((item) => {
                    const payload = item.payload || {};
                    const title = payload.title || payload.company || payload.projectName ||
                      payload.certificateName || payload.issuer || payload.organization || item.item_type;
                    const organization = payload.company || payload.issuer || payload.organization;
                    const projectUrl = getSafeExternalUrl(payload.githubUrl);
                    const liveUrl = getSafeExternalUrl(payload.liveUrl || payload.url);
                    const hiddenFields = new Set([
                      'title', 'company', 'projectName', 'certificateName', 'issuer', 'organization',
                      'description', 'githubUrl', 'liveUrl', 'url', 'certificateDocumentId', 'certificateFileName'
                    ]);
                    const details = Object.entries(payload).filter(([key, value]) => (
                      !hiddenFields.has(key) && value !== '' && value != null
                    ));
                    return (
                      <div key={item.id} className="rounded-xl border border-outline-variant/30 p-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-sm text-on-surface">{title}</div>
                          <div className="text-xs text-on-surface-variant capitalize">
                            {item.item_type}
                            {organization ? ` · ${organization}` : ''}
                          </div>
                          {payload.description && <p className="text-xs text-on-surface-variant mt-1">{payload.description}</p>}
                          {details.length > 0 && (
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-on-surface-variant">
                              {details.map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                                  {Array.isArray(value) ? value.join(', ') : String(value)}
                                </div>
                              ))}
                            </div>
                          )}
                          {(projectUrl || liveUrl) && (
                            <div className="flex flex-wrap gap-3 mt-2 text-xs">
                              {projectUrl && <a className="text-primary underline" href={projectUrl} target="_blank" rel="noreferrer">Repository / Credential</a>}
                              {liveUrl && <a className="text-primary underline" href={liveUrl} target="_blank" rel="noreferrer">Project link</a>}
                            </div>
                          )}
                        </div>
                        <StatusBadge status={item.verification_status} label={statusLabel(item.verification_status)} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">No portfolio items have been added.</p>
              )}
            </section>

            <section>
              <h3 className="font-semibold text-on-surface mb-3">Evaluated Assessment Results ({assessmentResults.length})</h3>
              {assessmentResults.length ? (
                <div className="space-y-2">
                  {assessmentResults.map((result, index) => {
                    const totalMarks = Number(result.total_marks);
                    const score = Number(result.score);
                    const percentage = totalMarks > 0 && Number.isFinite(score) ? ((score / totalMarks) * 100).toFixed(1) : '—';
                    return (
                      <div key={`${result.title}-${result.submitted_at}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant/30 p-3">
                        <div>
                          <div className="font-medium text-sm text-on-surface">{result.title}</div>
                          <div className="text-xs text-on-surface-variant capitalize">
                            {result.assessment_type} · {result.submitted_at ? new Date(result.submitted_at).toLocaleDateString() : 'Date unavailable'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm text-on-surface">
                            {displayNumber(result.score)} / {displayNumber(result.total_marks)}
                          </div>
                          <div className="text-xs text-on-surface-variant">{percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">No evaluated assessment results are available.</p>
              )}
            </section>

            <section>
              <h3 className="font-semibold text-on-surface mb-3">Uploaded Documents ({documents.length})</h3>
              {documents.length ? (
                <div className="space-y-2">
                  {documents.map((document, index) => (
                    <div key={`${document.document_type}-${document.file_name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/30 p-3">
                      <div>
                        <div className="font-medium text-sm text-on-surface">{document.file_name}</div>
                        <div className="text-xs text-on-surface-variant">{document.document_type}</div>
                      </div>
                      <StatusBadge status={document.verification_status} label={statusLabel(document.verification_status)} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">No documents have been uploaded.</p>
              )}
            </section>
          </div>
        )}
      </Modal>
    </div>
  );
}
