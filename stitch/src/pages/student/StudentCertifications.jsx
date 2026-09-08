import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { mockStudentCertifications } from '../../data/mockStudentData';

export default function StudentCertifications() {
  const [certifications, setCertifications] = useState(mockStudentCertifications || [
    {
      id: 1,
      title: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      issueDate: 'Jun 2024',
      expiryDate: 'Jun 2027',
      credentialId: 'AWS-SAA-8849201',
      status: 'verified',
      verifiedBy: 'Dr. Robert Vance',
      skills: ['Cloud Architecture', 'S3', 'EC2', 'IAM', 'DynamoDB'],
      url: 'https://aws.amazon.com/verification'
    },
    {
      id: 2,
      title: 'Deep Learning Specialization',
      issuer: 'DeepLearning.AI / Coursera',
      issueDate: 'Mar 2024',
      expiryDate: 'No Expiration',
      credentialId: 'COURSERA-DL-99382',
      status: 'verified',
      verifiedBy: 'Prof. Sarah Jenkins',
      skills: ['Neural Networks', 'PyTorch', 'TensorFlow', 'Transformers'],
      url: 'https://coursera.org/verify/COURSERA-DL-99382'
    },
    {
      id: 3,
      title: 'Meta Certified Front-End Developer',
      issuer: 'Meta',
      issueDate: 'Jul 2024',
      expiryDate: 'No Expiration',
      credentialId: 'META-FE-10294',
      status: 'pending',
      verifiedBy: 'Pending Faculty Review',
      skills: ['React', 'JavaScript (ES6+)', 'UI/UX', 'Jest'],
      url: 'https://coursera.org/verify/META-FE-10294'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    credentialId: '',
    issueDate: '',
    skills: '',
    url: ''
  });

  const handleAddCert = (e) => {
    e.preventDefault();
    if (!newCert.title || !newCert.issuer) return;
    const item = {
      id: Date.now(),
      title: newCert.title,
      issuer: newCert.issuer,
      issueDate: newCert.issueDate || 'Current',
      expiryDate: 'No Expiration',
      credentialId: newCert.credentialId || 'N/A',
      status: 'pending',
      verifiedBy: 'Pending Faculty Review',
      skills: newCert.skills.split(',').map(s => s.trim()).filter(Boolean),
      url: newCert.url
    };
    setCertifications([item, ...certifications]);
    setIsModalOpen(false);
    setNewCert({ title: '', issuer: '', credentialId: '', issueDate: '', skills: '', url: '' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Credentials & Badges"
        title="Industry Certifications"
        subtitle="Verified professional certifications, cloud accreditations, and specializations"
        action={
          <Button variant="primary" icon="workspace_premium" onClick={() => setIsModalOpen(true)}>
            Add Certification
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="bg-surface border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg hover:border-primary/30 transition-all duration-300"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-2xl">verified</span>
                </div>
                <StatusBadge status={cert.status} />
              </div>

              <h3 className="font-headline font-bold text-base text-on-surface mb-1">
                {cert.title}
              </h3>
              <p className="text-sm font-semibold text-primary mb-3">
                {cert.issuer}
              </p>

              <div className="space-y-1.5 text-xs text-on-surface-variant mb-4 bg-surface-container/50 p-3 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/70">Credential ID:</span>
                  <span className="font-mono font-medium">{cert.credentialId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/70">Issue Date:</span>
                  <span>{cert.issueDate}</span>
                </div>
                {cert.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant/70">Expires:</span>
                    <span>{cert.expiryDate}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {cert.skills?.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-surface-container text-xs text-on-surface-variant rounded-md border border-outline-variant/20"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant/70 truncate">
                {cert.verifiedBy}
              </span>
              {cert.url && (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
                >
                  Verify <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Certification for Faculty Approval"
        size="md"
      >
        <form onSubmit={handleAddCert} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Certification Title *
            </label>
            <input
              type="text"
              required
              value={newCert.title}
              onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
              placeholder="e.g. AWS Solutions Architect"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Issuing Organization *
              </label>
              <input
                type="text"
                required
                value={newCert.issuer}
                onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                placeholder="e.g. Amazon Web Services"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Credential ID
              </label>
              <input
                type="text"
                value={newCert.credentialId}
                onChange={(e) => setNewCert({ ...newCert, credentialId: e.target.value })}
                placeholder="AWS-SAA-102938"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Issue Date
              </label>
              <input
                type="month"
                value={newCert.issueDate}
                onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Verification URL
              </label>
              <input
                type="url"
                value={newCert.url}
                onChange={(e) => setNewCert({ ...newCert, url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Related Skills (comma separated)
            </label>
            <input
              type="text"
              value={newCert.skills}
              onChange={(e) => setNewCert({ ...newCert, skills: e.target.value })}
              placeholder="Cloud Computing, Microservices, Python"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Certificate</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
