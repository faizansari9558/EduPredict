import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

export default function StudentInternships() {
  const [internships, setInternships] = useState([
    {
      id: 1,
      company: 'Microsoft India (R&D)',
      role: 'Software Engineering Intern',
      location: 'Hyderabad, India (Hybrid)',
      duration: 'May 2024 – Jul 2024 (3 Months)',
      type: 'Summer Internship',
      stipend: '₹1,25,000 / mo',
      status: 'verified',
      verifiedBy: 'Dr. Robert Vance (Head of TPO)',
      description: 'Worked on Azure Cognitive Services SDK. Optimized JSON deserialization pipeline reducing latency by 18% in high-frequency batch requests.',
      skills: ['C#', '.NET Core', 'Azure', 'Distributed Systems'],
      certificateUrl: 'https://example.com/certificate.pdf'
    },
    {
      id: 2,
      company: 'Razorpay Payments',
      role: 'Backend Engineering Intern',
      location: 'Bengaluru, India (On-site)',
      duration: 'Dec 2023 – Jan 2024 (2 Months)',
      type: 'Winter Internship',
      stipend: '₹45,000 / mo',
      status: 'verified',
      verifiedBy: 'Prof. Sarah Jenkins',
      description: 'Built idempotent webhook delivery worker queue processing 50k transaction notifications daily with Redis & Go.',
      skills: ['Go', 'Redis', 'PostgreSQL', 'Docker'],
      certificateUrl: 'https://example.com/certificate2.pdf'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInternship, setNewInternship] = useState({
    company: '',
    role: '',
    duration: '',
    type: 'Summer Internship',
    stipend: '',
    location: '',
    description: '',
    skills: ''
  });

  const handleAddInternship = (e) => {
    e.preventDefault();
    if (!newInternship.company || !newInternship.role) return;
    const item = {
      id: Date.now(),
      company: newInternship.company,
      role: newInternship.role,
      location: newInternship.location || 'Remote',
      duration: newInternship.duration || '3 Months',
      type: newInternship.type,
      stipend: newInternship.stipend || 'Unpaid',
      status: 'pending',
      verifiedBy: 'Pending Faculty Review',
      description: newInternship.description,
      skills: newInternship.skills.split(',').map(s => s.trim()).filter(Boolean),
      certificateUrl: ''
    };
    setInternships([item, ...internships]);
    setIsModalOpen(false);
    setNewInternship({ company: '', role: '', duration: '', type: 'Summer Internship', stipend: '', location: '', description: '', skills: '' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Industry Experience"
        title="Internships & Work History"
        subtitle="Verified work experience, corporate mentorships, and summer training logs"
        action={
          <Button variant="primary" icon="business_center" onClick={() => setIsModalOpen(true)}>
            Add Internship Record
          </Button>
        }
      />

      <div className="space-y-4">
        {internships.map((intern) => (
          <div
            key={intern.id}
            className="bg-surface border border-outline-variant/30 rounded-2xl p-6 hover:shadow-md transition-all duration-300 relative"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-2xl">apartment</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    {intern.role}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-primary font-semibold mt-0.5">
                    <span>{intern.company}</span>
                    <span className="text-on-surface-variant/40">•</span>
                    <span className="text-on-surface-variant font-normal text-xs">{intern.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={intern.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-surface-container/40 rounded-xl mb-4 text-xs">
              <div>
                <span className="text-on-surface-variant/70 block">Duration</span>
                <span className="font-medium text-on-surface">{intern.duration}</span>
              </div>
              <div>
                <span className="text-on-surface-variant/70 block">Internship Type</span>
                <span className="font-medium text-on-surface">{intern.type}</span>
              </div>
              <div>
                <span className="text-on-surface-variant/70 block">Stipend</span>
                <span className="font-medium text-on-surface">{intern.stipend}</span>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
              {intern.description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-outline-variant/20">
              <div className="flex flex-wrap gap-1.5">
                {intern.skills?.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-surface-container text-xs text-primary font-medium rounded-lg border border-outline-variant/20"
                  >
                    {sk}
                  </span>
                ))}
              </div>

              <div className="text-xs text-on-surface-variant/70">
                Verified: <span className="font-medium text-on-surface">{intern.verifiedBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Internship Record"
        size="md"
      >
        <form onSubmit={handleAddInternship} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={newInternship.company}
                onChange={(e) => setNewInternship({ ...newInternship, company: e.target.value })}
                placeholder="e.g. Google India"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Role / Title *
              </label>
              <input
                type="text"
                required
                value={newInternship.role}
                onChange={(e) => setNewInternship({ ...newInternship, role: e.target.value })}
                placeholder="e.g. SDE Intern"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Location & Mode
              </label>
              <input
                type="text"
                value={newInternship.location}
                onChange={(e) => setNewInternship({ ...newInternship, location: e.target.value })}
                placeholder="e.g. Bengaluru (Hybrid)"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Duration (e.g. Jun–Aug 2024)
              </label>
              <input
                type="text"
                value={newInternship.duration}
                onChange={(e) => setNewInternship({ ...newInternship, duration: e.target.value })}
                placeholder="3 Months"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Internship Type
              </label>
              <select
                value={newInternship.type}
                onChange={(e) => setNewInternship({ ...newInternship, type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              >
                <option value="Summer Internship">Summer Internship</option>
                <option value="Winter Internship">Winter Internship</option>
                <option value="Full Semester Co-op">Full Semester Co-op</option>
                <option value="Part-time Industrial">Part-time Industrial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Monthly Stipend
              </label>
              <input
                type="text"
                value={newInternship.stipend}
                onChange={(e) => setNewInternship({ ...newInternship, stipend: e.target.value })}
                placeholder="₹50,000 / mo"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Key Contributions & Learnings
            </label>
            <textarea
              rows={3}
              value={newInternship.description}
              onChange={(e) => setNewInternship({ ...newInternship, description: e.target.value })}
              placeholder="Highlight measurable outcomes (e.g. improved throughput by 20%, engineered REST services...)"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
