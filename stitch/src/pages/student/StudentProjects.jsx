import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { mockStudentProjects } from '../../data/mockStudentData';

export default function StudentProjects() {
  const [projects, setProjects] = useState(mockStudentProjects || [
    {
      id: 1,
      title: 'EduPredict — AI Academic Predictor',
      description: 'Full-stack machine learning web application predicting student placement and academic trajectories with XGBoost & SHAP explainability.',
      role: 'Full Stack Lead & ML Engineer',
      technologies: ['React', 'Tailwind CSS', 'FastAPI', 'XGBoost', 'MySQL'],
      githubUrl: 'https://github.com/example/edupredict',
      liveUrl: 'https://edupredict.ai',
      status: 'verified',
      verifiedBy: 'Dr. Robert Vance',
      completionDate: 'Aug 2024',
      featured: true
    },
    {
      id: 2,
      title: 'CloudScale Distributed Microservices',
      description: 'High-throughput event-driven microservices architecture handling 15,000 req/sec with Apache Kafka and Redis caching layer.',
      role: 'Backend Developer',
      technologies: ['Node.js', 'Docker', 'Kubernetes', 'Apache Kafka', 'Redis'],
      githubUrl: 'https://github.com/example/cloudscale',
      liveUrl: '',
      status: 'verified',
      verifiedBy: 'Prof. Sarah Jenkins',
      completionDate: 'May 2024',
      featured: false
    },
    {
      id: 3,
      title: 'CryptoSentinel Security Audit Toolkit',
      description: 'Automated static code analyzer detecting smart contract re-entrancy and integer overflow vulnerabilities using AST parsing.',
      role: 'Security Researcher',
      technologies: ['Python', 'Solidity', 'AST', 'Web3.py'],
      githubUrl: 'https://github.com/example/cryptosentinel',
      liveUrl: '',
      status: 'pending',
      verifiedBy: 'Pending Faculty Review',
      completionDate: 'Jul 2024',
      featured: false
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    role: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    description: ''
  });

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.title) return;
    const created = {
      id: Date.now(),
      title: newProject.title,
      role: newProject.role || 'Contributor',
      description: newProject.description,
      technologies: newProject.technologies.split(',').map(t => t.trim()).filter(Boolean),
      githubUrl: newProject.githubUrl,
      liveUrl: newProject.liveUrl,
      status: 'pending',
      verifiedBy: 'Pending Faculty Review',
      completionDate: 'Current',
      featured: false
    };
    setProjects([created, ...projects]);
    setIsModalOpen(false);
    setNewProject({ title: '', role: '', technologies: '', githubUrl: '', liveUrl: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student Portfolio"
        title="Technical Projects"
        subtitle="Manage and showcase verified software engineering, ML, and research projects"
        action={
          <Button variant="primary" icon="add" onClick={() => setIsModalOpen(true)}>
            Add Project
          </Button>
        }
      />

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
                {proj.role} • <span className="text-on-surface-variant/70">{proj.completionDate}</span>
              </p>

              <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-4">
                {proj.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {proj.technologies.map((tech, idx) => (
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
              <div className="text-xs text-on-surface-variant/70 truncate max-w-[140px]">
                {proj.verifiedBy}
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
        onClose={() => setIsModalOpen(false)}
        title="Submit Project for Faculty Review"
        size="md"
      >
        <form onSubmit={handleAddProject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              placeholder="e.g. Distributed Cache Engine"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Your Role
              </label>
              <input
                type="text"
                value={newProject.role}
                onChange={(e) => setNewProject({ ...newProject, role: e.target.value })}
                placeholder="e.g. Lead Backend Engineer"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Tech Stack (comma separated)
              </label>
              <input
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
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                GitHub Repository
              </label>
              <input
                type="url"
                value={newProject.githubUrl}
                onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                placeholder="https://github.com/user/repo"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Live URL (Optional)
              </label>
              <input
                type="url"
                value={newProject.liveUrl}
                onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                placeholder="https://app.domain.com"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Project Summary & Technical Highlights
            </label>
            <textarea
              rows={3}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Describe key architectural decisions, performance metrics, or algorithms utilized..."
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit for Verification</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
