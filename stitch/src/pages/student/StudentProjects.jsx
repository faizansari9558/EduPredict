import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { studentApi } from '../../services/studentApi';

const emptyProject = {
  title: '',
  role: '',
  technologies: '',
  githubUrl: '',
  liveUrl: '',
  description: ''
};

export default function StudentProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState(emptyProject);

  useEffect(() => {
    let active = true;
    studentApi.getProjects()
      .then((studentProjects) => {
        if (active) setProjects(studentProjects);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load your projects.');
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

  const handleAddProject = async (event) => {
    event.preventDefault();
    setFormError('');
    setError('');
    setSuccess('');

    const title = newProject.title.trim();
    const technologies = newProject.technologies.split(',').map((technology) => technology.trim()).filter(Boolean);
    if (!title) {
      setFormError('Enter a project title.');
      return;
    }
    if (technologies.length > 20 || technologies.some((technology) => technology.length > 50)) {
      setFormError('Add up to 20 technologies, with no more than 50 characters each.');
      return;
    }

    setSaving(true);
    try {
      const savedProject = await studentApi.addPortfolioItem('project', {
        title,
        role: newProject.role.trim(),
        description: newProject.description.trim(),
        technologies,
        githubUrl: newProject.githubUrl.trim(),
        liveUrl: newProject.liveUrl.trim()
      });
      setProjects((currentProjects) => [savedProject, ...currentProjects]);
      setIsModalOpen(false);
      setNewProject(emptyProject);
      setSuccess(`${savedProject.title} was added and is pending faculty review.`);
    } catch (requestError) {
      setFormError(requestError.message || 'Unable to save this project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student Portfolio"
        title="Technical Projects"
        subtitle="Add projects to your portfolio and share a GitHub repository, live demo, or project details."
        actions={
          <Button variant="primary" icon="add" onClick={() => {
            setNewProject(emptyProject);
            setFormError('');
            setIsModalOpen(true);
          }}>
            Add Project
          </Button>
        }
      />

      {error && <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm" role="alert">{error}</p>}
      {success && <p className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm" role="status">{success}</p>}
      {loading && <p className="text-sm text-on-surface-variant" role="status">Loading your projects...</p>}
      {!loading && !error && !projects.length && (
        <div className="rounded-2xl border border-dashed border-outline-variant/50 bg-surface p-8 text-center">
          <span className="material-symbols-outlined text-3xl text-secondary">terminal</span>
          <h2 className="mt-2 font-heading text-base font-bold text-on-surface">No projects added yet</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Add a project to showcase your work and submit it for faculty review.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-surface border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg hover:border-primary/30 transition-all duration-300 relative group"
          >
            {proj.featured && (
              <span className="absolute -top-3 left-6 bg-secondary text-on-secondary text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                ★ Featured Capstone
              </span>
            )}

            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                  {proj.title}
                </h3>
                <StatusBadge status={proj.status} />
              </div>

              <p className="text-xs font-semibold text-primary mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">badge</span>
                {proj.role || 'Contributor'} • <span className="text-on-surface-variant/70">{proj.completionDate || 'Project'}</span>
              </p>

              <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-4">
                {proj.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {(Array.isArray(proj.technologies) ? proj.technologies : []).map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-surface-container text-primary font-medium text-xs rounded-lg border border-outline-variant/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
              <div className="text-xs text-on-surface-variant/70 truncate max-w-[180px]">
                {proj.status === 'verified' ? 'Faculty verified' : proj.status === 'rejected' ? 'Review feedback available' : 'Pending faculty review'}
              </div>
              <div className="flex items-center gap-2">
                {proj.githubUrl && (
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                    title="GitHub Repository"
                  >
                    <span className="material-symbols-outlined text-[18px]">code</span>
                  </a>
                )}
                {proj.liveUrl && (
                  <a
                    href={proj.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-secondary hover:bg-secondary/10 transition-colors"
                    title="Live Demo"
                  >
                    <span className="material-symbols-outlined text-[18px]">launch</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add a Project"
        maxWidth="max-w-2xl"
      >
        <form id="add-project-form" onSubmit={handleAddProject} className="space-y-4">
          <div>
            <label htmlFor="project-title" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Project Title *
            </label>
            <input
              id="project-title"
              type="text"
              required
              maxLength={150}
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              placeholder="e.g. Distributed Cache Engine"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="project-role" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Your Role
              </label>
              <input
                id="project-role"
                type="text"
                maxLength={120}
                value={newProject.role}
                onChange={(e) => setNewProject({ ...newProject, role: e.target.value })}
                placeholder="e.g. Lead Backend Engineer"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
            <div>
              <label htmlFor="project-technologies" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Tech Stack (comma separated)
              </label>
              <input
                id="project-technologies"
                type="text"
                value={newProject.technologies}
                onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                placeholder="React, Go, PostgreSQL"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="project-github-url" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                GitHub Repository URL
              </label>
              <input
                id="project-github-url"
                type="url"
                value={newProject.githubUrl}
                onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                placeholder="https://github.com/user/repo"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
            <div>
              <label htmlFor="project-live-url" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Live Demo / Other Project URL
              </label>
              <input
                id="project-live-url"
                type="url"
                value={newProject.liveUrl}
                onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                placeholder="https://app.domain.com"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
          </div>

          <div>
            <label htmlFor="project-description" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Project Summary & Technical Highlights
            </label>
            <textarea
              id="project-description"
              rows={3}
              maxLength={2000}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Describe key architectural decisions, performance metrics, or algorithms utilized..."
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface resize-none"
            />
          </div>

          <p className="text-xs text-on-surface-variant">Projects are added to your account as pending until reviewed by faculty.</p>
          {formError && <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm" role="alert">{formError}</p>}
        </form>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <Button variant="outline" onClick={closeModal} disabled={saving}>Cancel</Button>
          <Button type="submit" form="add-project-form" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Project'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
