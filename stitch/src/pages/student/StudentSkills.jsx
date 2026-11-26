import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { studentApi } from '../../services/studentApi';

const emptySkill = { name: '', category: '' };

export default function StudentSkills() {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState(emptySkill);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    studentApi.getSkills()
      .then((studentSkills) => {
        if (active) setSkills(studentSkills);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load your skills.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setFormError('');
  };

  const handleAddSkill = async (event) => {
    event.preventDefault();
    setFormError('');
    setError('');
    setSuccess('');

    const name = newSkill.name.trim();
    const category = newSkill.category.trim();
    if (!name || !category) {
      setFormError('Enter both a skill name and a category.');
      return;
    }

    const duplicate = skills.some((skill) =>
      skill.name.toLowerCase() === name.toLowerCase() &&
      skill.category.toLowerCase() === category.toLowerCase()
    );
    if (duplicate) {
      setFormError('This skill is already in your list.');
      return;
    }

    setSaving(true);
    try {
      const savedSkill = await studentApi.addSkill({ name, category });
      setSkills((current) => [...current, savedSkill].sort((a, b) => a.name.localeCompare(b.name)));
      setNewSkill(emptySkill);
      setIsModalOpen(false);
      setSuccess(`${savedSkill.name} was added to your skills.`);
    } catch (requestError) {
      setFormError(requestError.message || 'Unable to save this skill.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        eyebrow="Competency & Domain Mastery"
        title="Skills & Technical Inventory"
        subtitle="Add skills to your personal profile. Assessment scores and proficiency are recorded from your results."
        icon="psychology"
        actions={
          <Button
            variant="primary"
            size="sm"
            icon="add"
            onClick={() => {
              setNewSkill(emptySkill);
              setFormError('');
              setIsModalOpen(true);
            }}
          >
            Add Skill
          </Button>
        }
      />

      {error && <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm" role="alert">{error}</p>}
      {success && <p className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm" role="status">{success}</p>}

      {loading && <p className="text-sm text-on-surface-variant" role="status">Loading your skills...</p>}
      {!loading && !error && !skills.length && (
        <div className="rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-lowest p-8 text-center">
          <span className="material-symbols-outlined text-3xl text-secondary">psychology</span>
          <h2 className="mt-2 font-heading text-base font-bold text-on-surface">No skills added yet</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Add a skill to start building your personal competency profile.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {skills.map((skill) => {
          const attempts = Number(skill.attempts || 0);
          const score = Number(skill.score || 0);
          return (
            <article
              key={skill.id}
              className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded">
                    {skill.category}
                  </span>
                  <StatusBadge
                    status={attempts ? 'info' : 'pending'}
                    label={attempts ? 'Assessment tracked' : 'Self reported'}
                  />
                </div>
                <h2 className="font-heading text-base font-bold text-on-surface">{skill.name}</h2>
                <p className="text-xs text-on-surface-variant">
                  Proficiency: <strong className="text-on-surface">{skill.level || 'Not assessed'}</strong>
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-outline-variant/20">
                {attempts > 0 ? (
                  <>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-on-surface-variant">Average assessment score</span>
                      <span className="text-secondary font-bold">{score}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
                    </div>
                    <p className="text-[11px] text-on-surface-variant">{attempts} assessment {attempts === 1 ? 'attempt' : 'attempts'}</p>
                  </>
                ) : (
                  <p className="text-xs text-on-surface-variant">No assessment score recorded yet.</p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add a Skill"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={closeModal} disabled={saving}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" form="add-skill-form" disabled={saving}>
              {saving ? 'Saving...' : 'Save Skill'}
            </Button>
          </>
        }
      >
        <form id="add-skill-form" onSubmit={handleAddSkill} className="space-y-4">
          <div>
            <label htmlFor="skill-name" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Skill name
            </label>
            <input
              id="skill-name"
              type="text"
              required
              maxLength={150}
              value={newSkill.name}
              onChange={(event) => setNewSkill((current) => ({ ...current, name: event.target.value }))}
              placeholder="e.g. JavaScript"
              className="w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="skill-category" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Category
            </label>
            <input
              id="skill-category"
              type="text"
              required
              maxLength={100}
              value={newSkill.category}
              onChange={(event) => setNewSkill((current) => ({ ...current, category: event.target.value }))}
              placeholder="e.g. Programming"
              className="w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <p className="text-xs text-on-surface-variant">
            Skills you add are marked as self-reported. Scores and proficiency levels are based on recorded assessments.
          </p>
          {formError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{formError}</p>}
        </form>
      </Modal>
    </div>
  );
}
