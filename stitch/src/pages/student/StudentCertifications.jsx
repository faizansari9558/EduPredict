import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { studentApi } from '../../services/studentApi';

const emptyCertification = {
  title: '',
  issuer: '',
  credentialId: '',
  issueDate: '',
  expiryDate: '',
  skills: '',
  url: ''
};

export default function StudentCertifications() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCert, setNewCert] = useState(emptyCertification);
  const [certificateFile, setCertificateFile] = useState(null);
  const [inputGeneration, setInputGeneration] = useState(0);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState(null);

  useEffect(() => {
    let active = true;
    studentApi.getCertifications()
      .then((studentCertifications) => {
        if (active) setCertifications(studentCertifications);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load your certifications.');
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

  const handleDownload = async (documentId, fileName) => {
    setDownloadingDocumentId(documentId);
    setError('');
    try {
      const file = await studentApi.downloadDocument(documentId);
      const fileUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    } catch (requestError) {
      setError(requestError.message || 'Unable to download this certificate.');
    } finally {
      setDownloadingDocumentId(null);
    }
  };

  const handleAddCert = async (event) => {
    event.preventDefault();
    setFormError('');
    setError('');
    setSuccess('');

    if (!certificateFile) {
      setFormError('Upload a soft copy of the certificate.');
      return;
    }
    if (certificateFile.size > 5 * 1024 * 1024) {
      setFormError('The certificate must be 5 MB or smaller.');
      return;
    }

    const formData = new FormData();
    formData.append('title', newCert.title.trim());
    formData.append('issuer', newCert.issuer.trim());
    formData.append('credentialId', newCert.credentialId.trim());
    formData.append('issueDate', newCert.issueDate);
    formData.append('expiryDate', newCert.expiryDate);
    formData.append('skills', newCert.skills);
    formData.append('url', newCert.url.trim());
    formData.append('certificate', certificateFile);

    setSaving(true);
    try {
      const savedCertification = await studentApi.addPortfolioItem('certification', formData);
      setCertifications((currentCertifications) => [savedCertification, ...currentCertifications]);
      setIsModalOpen(false);
      setNewCert(emptyCertification);
      setCertificateFile(null);
      setInputGeneration((current) => current + 1);
      setSuccess(`${savedCertification.title} was submitted for faculty review.`);
    } catch (requestError) {
      setFormError(requestError.message || 'Unable to save this certification.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Credentials & Badges"
        title="Industry Certifications"
        subtitle="Add certification details and upload a certificate copy for faculty verification."
        actions={
          <Button variant="primary" icon="workspace_premium" onClick={() => {
            setNewCert(emptyCertification);
            setCertificateFile(null);
            setFormError('');
            setIsModalOpen(true);
          }}>
            Add Certification
          </Button>
        }
      />

      {error && <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm" role="alert">{error}</p>}
      {success && <p className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm" role="status">{success}</p>}
      {loading && <p className="text-sm text-on-surface-variant" role="status">Loading your certifications...</p>}
      {!loading && !error && !certifications.length && (
        <div className="rounded-2xl border border-dashed border-outline-variant/50 bg-surface p-8 text-center">
          <span className="material-symbols-outlined text-3xl text-secondary">workspace_premium</span>
          <h2 className="mt-2 font-heading text-base font-bold text-on-surface">No certifications added yet</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Add a certification and upload its proof to start your record.</p>
        </div>
      )}
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
                {cert.status === 'verified' ? 'Faculty verified' : cert.status === 'rejected' ? 'Review feedback available' : 'Pending faculty review'}
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
            {cert.certificateDocumentId && (
              <button
                type="button"
                onClick={() => handleDownload(cert.certificateDocumentId, cert.certificateFileName || 'certificate')}
                disabled={downloadingDocumentId === cert.certificateDocumentId}
                className="mt-3 inline-flex max-w-full items-center gap-2 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span className="truncate">
                  {downloadingDocumentId === cert.certificateDocumentId ? 'Downloading...' : cert.certificateFileName || 'Download certificate'}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add Certification"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddCert} className="space-y-4">
          <div>
            <label htmlFor="cert-title" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Certification Title *
            </label>
            <input
              id="cert-title"
              type="text"
              required
              maxLength={150}
              value={newCert.title}
              onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
              placeholder="e.g. AWS Solutions Architect"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cert-issuer" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Issuing Organization *
              </label>
              <input
                id="cert-issuer"
                type="text"
                required
                maxLength={150}
                value={newCert.issuer}
                onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                placeholder="e.g. Amazon Web Services"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
            <div>
              <label htmlFor="cert-credential-id" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Credential ID
              </label>
              <input
                id="cert-credential-id"
                type="text"
                maxLength={150}
                value={newCert.credentialId}
                onChange={(e) => setNewCert({ ...newCert, credentialId: e.target.value })}
                placeholder="AWS-SAA-102938"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cert-issue-date" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Issue Date
              </label>
              <input
                id="cert-issue-date"
                type="date"
                value={newCert.issueDate}
                onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
            <div>
              <label htmlFor="cert-expiry-date" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Expiry Date (Optional)
              </label>
              <input
                id="cert-expiry-date"
                type="date"
                value={newCert.expiryDate}
                min={newCert.issueDate || undefined}
                onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cert-verification-url" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Verification URL (Optional)
            </label>
            <input
              id="cert-verification-url"
              type="url"
              value={newCert.url}
              onChange={(e) => setNewCert({ ...newCert, url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
            />
          </div>

          <div>
            <label htmlFor="cert-skills" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Related Skills (comma separated)
            </label>
            <input
              id="cert-skills"
              type="text"
              value={newCert.skills}
              onChange={(e) => setNewCert({ ...newCert, skills: e.target.value })}
              placeholder="Cloud Computing, Microservices, Python"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
            />
          </div>

          <div>
            <label htmlFor={`cert-file-${inputGeneration}`} className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Certificate Soft Copy * (PDF, JPG, or PNG; up to 5 MB)
            </label>
            <input
              key={`cert-file-${inputGeneration}`}
              id={`cert-file-${inputGeneration}`}
              type="file"
              required
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={(event) => setCertificateFile(event.target.files?.[0] || null)}
              className="block w-full text-xs text-on-surface-variant file:mr-3 file:rounded-lg file:border-0 file:bg-surface-container file:px-3 file:py-2 file:text-xs file:font-semibold file:text-on-surface"
            />
          </div>

          {formError && <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm" role="alert">{formError}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" onClick={closeModal} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Certificate'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
