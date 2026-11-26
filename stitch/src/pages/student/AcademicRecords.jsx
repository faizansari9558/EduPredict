import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { studentApi } from '../../services/studentApi';

const academicFields = [
  { key: 'cgpa', label: 'Cumulative GPA', max: 10, step: '0.01', fileKey: 'cgpa_document', documentType: 'Academic Record - Cumulative GPA' },
  { key: 'tenth_percentage', label: '10th Percentage', max: 100, step: '0.01', fileKey: 'tenth_document', documentType: 'Academic Record - 10th Percentage' },
  { key: 'twelfth_percentage', label: '12th Percentage', max: 100, step: '0.01', fileKey: 'twelfth_document', documentType: 'Academic Record - 12th Percentage' },
  { key: 'graduation_percentage', label: 'Graduation Percentage', max: 100, step: '0.01', fileKey: 'graduation_document', documentType: 'Academic Record - Graduation Percentage' }
];

function getProfileValues(profile) {
  return academicFields.reduce((values, field) => ({
    ...values,
    [field.key]: profile[field.key] == null ? '' : String(profile[field.key])
  }), {});
}

export default function AcademicRecords() {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [inputGeneration, setInputGeneration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([studentApi.getProfile(), studentApi.getDocuments()])
      .then(([studentProfile, studentDocuments]) => {
        if (!active) return;
        setProfile(studentProfile);
        setDocuments(studentDocuments);
        setValues(getProfileValues(studentProfile));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load your academic record.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    let hasChanges = false;
    for (const field of academicFields) {
      const value = String(values[field.key] || '').trim();
      const currentValue = profile[field.key] == null ? '' : String(profile[field.key]);
      const file = files[field.fileKey];

      if (!value) {
        if (file || currentValue) {
          setError(`Enter a value for ${field.label} before uploading or saving it.`);
          return;
        }
        continue;
      }

      if (!/^\d{1,3}(?:\.\d{1,2})?$/.test(value) || Number(value) < 0 || Number(value) > field.max) {
        setError(`${field.label} must be between 0 and ${field.max}, with up to two decimal places.`);
        return;
      }

      const changed = currentValue === '' || Number(value) !== Number(currentValue);
      if (changed && !file) {
        setError(`Upload a supporting document for ${field.label}.`);
        return;
      }
      if (file && file.size > 5 * 1024 * 1024) {
        setError(`${field.label} document must be 5 MB or smaller.`);
        return;
      }

      if (changed || file) {
        formData.append(field.key, value);
        formData.append(field.fileKey, file);
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      setError('Change an academic value and attach its document before submitting.');
      return;
    }

    setSaving(true);
    try {
      const response = await studentApi.updateAcademicRecords(formData);
      const submittedValues = response.data.values;
      setProfile((current) => ({ ...current, ...submittedValues, verification_status: 'pending' }));
      setValues((current) => ({
        ...current,
        ...Object.fromEntries(Object.entries(submittedValues).map(([key, value]) => [key, String(value)]))
      }));
      setDocuments((current) => [...response.data.documents, ...current]);
      setFiles({});
      setInputGeneration((current) => current + 1);
      setSuccess(response.message || 'Academic values and documents submitted for verification.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to save academic values and documents.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-on-surface-variant" role="status">Loading your academic record...</p>;
  if (!profile) {
    return <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm" role="alert">{error || 'Your academic record is unavailable.'}</p>;
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        eyebrow="Institutional Records"
        title="Academic Records & Transcripts"
        subtitle="Enter your academic results and upload the matching proof for verification."
        icon="school"
      />

      {error && <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm" role="alert">{error}</p>}
      {success && <p className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm" role="status">{success}</p>}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {academicFields.map((field) => (
          <div key={field.key} className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
            <span className="text-xs font-bold uppercase text-on-surface-variant">{field.label}</span>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-2xl font-extrabold text-on-surface font-heading">
                {profile[field.key] == null ? 'Not recorded' : profile[field.key]}
              </span>
              <span className="material-symbols-outlined text-secondary">school</span>
            </div>
          </div>
        ))}
      </section>

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
        <div className="mb-5">
          <h2 className="font-heading text-base font-bold text-on-surface">Add or Update Academic Results</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Every new or changed result must include its matching marksheet or transcript. Accepted files: PDF, JPG, or PNG, up to 5 MB each.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {academicFields.map((field) => {
            const latestDocument = documents.find((document) => document.document_type === field.documentType);
            return (
              <fieldset key={field.key} className="rounded-xl border border-outline-variant/30 p-4">
                <label htmlFor={field.key} className="block text-sm font-bold text-on-surface">{field.label}</label>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Enter a value from 0 to {field.max}{field.key === 'cgpa' ? ' GPA points' : '%'}.
                </p>
                <input
                  id={field.key}
                  type="number"
                  min="0"
                  max={field.max}
                  step={field.step}
                  value={values[field.key] || ''}
                  onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                  className="mt-3 w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <label htmlFor={`${field.fileKey}-${inputGeneration}`} className="block mt-4 text-xs font-semibold text-on-surface-variant">
                  Supporting document
                </label>
                <input
                  key={`${field.fileKey}-${inputGeneration}`}
                  id={`${field.fileKey}-${inputGeneration}`}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={(event) => setFiles((current) => ({ ...current, [field.fileKey]: event.target.files?.[0] || null }))}
                  className="mt-1 block w-full text-xs text-on-surface-variant file:mr-3 file:rounded-lg file:border-0 file:bg-surface-container file:px-3 file:py-2 file:text-xs file:font-semibold file:text-on-surface"
                />
                {latestDocument ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-on-surface-variant">{latestDocument.file_name}</span>
                    <StatusBadge status={latestDocument.verification_status} label={latestDocument.verification_status} />
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-on-surface-variant">No supporting document uploaded yet.</p>
                )}
              </fieldset>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-on-surface-variant">
            Submitting new results sets your academic verification to pending review.
          </p>
          <Button type="submit" variant="primary" icon="cloud_upload" disabled={saving}>
            {saving ? 'Submitting...' : 'Save Results & Upload Documents'}
          </Button>
        </div>
      </form>

      <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
        <h2 className="font-heading text-base font-bold text-on-surface">Your Student Record</h2>
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            ['Student', profile.full_name],
            ['University ID', profile.enrollment_number],
            ['Department', profile.department],
            ['Academic batch', profile.batch]
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-semibold text-on-surface-variant">{label}</dt>
              <dd className="mt-1 font-medium text-on-surface">{value || 'Not provided'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
        <h2 className="font-heading text-base font-bold text-on-surface">Semester Transcripts</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Semester-wise grades and credit totals are not available in your account yet. This page shows the academic values and supporting documents you submit.
        </p>
      </section>
    </div>
  );
}
