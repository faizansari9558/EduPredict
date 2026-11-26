import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { teacherApi } from '../../services/teacherApi';

const assessmentTypes = [
  { value: 'coding', label: 'Coding Assessment' },
  { value: 'aptitude', label: 'Aptitude & Logic' },
  { value: 'general', label: 'General Assessment' }
];

function getAssessmentLabel(type) {
  return assessmentTypes.find((option) => option.value === type)?.label || type;
}

function formatAverage(assessment) {
  const maximum = Number(assessment.total_marks);
  const score = Number(assessment.average_score);
  if (!Number(assessment.evaluated_attempts) || maximum <= 0 || !Number.isFinite(score)) return '—';
  return `${((score / maximum) * 100).toFixed(1)}%`;
}

export default function TeacherAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishingId, setPublishingId] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    description: '',
    assessment_type: 'coding'
  });

  useEffect(() => {
    let active = true;
    teacherApi.getAssessments()
      .then((response) => {
        if (active) setAssessments(response.data || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load your assessments.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    const title = newAssessment.title.trim();
    if (!title) return;

    setSaving(true);
    setError('');
    try {
      const response = await teacherApi.createAssessment({
        title,
        description: newAssessment.description.trim(),
        assessment_type: newAssessment.assessment_type
      });
      setAssessments((current) => [{
        ...response.data,
        total_marks: 100,
        total_questions: 0,
        submissions: 0,
        evaluated_attempts: 0,
        average_score: null,
        published_at: null,
        created_at: new Date().toISOString()
      }, ...current]);
      setNewAssessment({ title: '', description: '', assessment_type: 'coding' });
      setIsModalOpen(false);
    } catch (requestError) {
      setError(requestError.message || 'Unable to create the assessment.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (assessment) => {
    setPublishingId(assessment.id);
    setError('');
    try {
      await teacherApi.publishAssessment(assessment.id);
      setAssessments((current) => current.map((item) => item.id === assessment.id
        ? { ...item, published_at: new Date().toISOString() }
        : item));
    } catch (requestError) {
      setError(requestError.message || 'Unable to publish the assessment.');
    } finally {
      setPublishingId(null);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Assessment',
      render: (value, row) => (
        <div>
          <div className="font-semibold text-on-surface">{value}</div>
          <div className="text-xs text-on-surface-variant">
            {getAssessmentLabel(row.assessment_type)} · {row.description || 'No description'}
          </div>
        </div>
      )
    },
    {
      key: 'total_questions',
      label: 'Questions',
      render: (value, row) => `${Number(value) || 0} · ${row.total_marks ?? '—'} marks`
    },
    {
      key: 'submissions',
      label: 'Submissions',
      render: (value) => Number(value) || 0
    },
    {
      key: 'average_score',
      label: 'Evaluated average',
      render: (_, row) => formatAverage(row)
    },
    {
      key: 'published_at',
      label: 'Status',
      render: (value) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          value ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'
        }`}>
          {value ? 'Published' : 'Draft'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex flex-wrap gap-2">
          {!row.published_at && (
            <Button
              variant="outline"
              size="sm"
              icon="publish"
              loading={publishingId === row.id}
              disabled={Boolean(publishingId)}
              onClick={() => handlePublish(row)}
            >
              Publish
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon="analytics"
            to={`/teacher/results?assessmentId=${row.id}`}
          >
            Results
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Faculty Assessment Suite"
        title="Assessment Management"
        subtitle="Assessments, submissions, and evaluated scores are fetched from your teacher account."
        actions={
          <Button variant="primary" icon="add_task" onClick={() => setIsModalOpen(true)}>
            Create Assessment
          </Button>
        }
      />

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={assessments}
        emptyMessage={loading ? 'Loading your assessments…' : 'No assessments have been created by this teacher account.'}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Assessment"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="assessment-title" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Assessment title
            </label>
            <input
              id="assessment-title"
              type="text"
              required
              maxLength={255}
              value={newAssessment.title}
              onChange={(event) => setNewAssessment((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-2.5 text-sm"
              placeholder="e.g. Data Structures Midterm"
            />
          </div>

          <div>
            <label htmlFor="assessment-description" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Description
            </label>
            <textarea
              id="assessment-description"
              rows={3}
              value={newAssessment.description}
              onChange={(event) => setNewAssessment((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-2.5 text-sm"
              placeholder="What should students know about this assessment?"
            />
          </div>

          <div>
            <label htmlFor="assessment-type" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Assessment type
            </label>
            <select
              id="assessment-type"
              value={newAssessment.assessment_type}
              onChange={(event) => setNewAssessment((current) => ({ ...current, assessment_type: event.target.value }))}
              className="w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-2.5 text-sm"
            >
              {assessmentTypes.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t border-outline-variant/20 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
