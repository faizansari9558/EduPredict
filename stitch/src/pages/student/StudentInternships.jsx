import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { studentApi } from '../../services/studentApi';

const emptyInternship = {
  company: '',
  role: '',
  duration: '',
  type: 'Summer Internship',
  stipend: '',
  location: '',
  description: '',
  skills: '',
  startDate: '',
  endDate: ''
};

export default function StudentInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInternship, setNewInternship] = useState(emptyInternship);
  const [certificateFile, setCertificateFile] = useState(null);
  const [inputGeneration, setInputGeneration] = useState(0);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState(null);

  useEffect(() => {
    let active = true;
    studentApi.getPortfolio('internship')
      .then((studentInternships) => {
        if (active) setInternships(studentInternships);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load your internships.');
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
      setError(requestError.message || 'Unable to download this internship certificate.');
    } finally {
      setDownloadingDocumentId(null);
    }
  };

  const handleAddInternship = async (event) => {
    event.preventDefault();
    setFormError('');
    setError('');
    setSuccess('');

    if (!certificateFile) {
      setFormError('Upload a soft copy of the internship certificate.');
      return;
    }
    if (certificateFile.size > 5 * 1024 * 1024) {
      setFormError('The certificate must be 5 MB or smaller.');
      return;
    }
    if (newInternship.endDate && newInternship.endDate < newInternship.startDate) {
      setFormError('The end date must be on or after the start date.');
      return;
    }

    const formData = new FormData();
    Object.entries(newInternship).forEach(([key, value]) => formData.append(key, value.trim()));
    formData.append('certificate', certificateFile);

    setSaving(true);
    try {
      const savedInternship = await studentApi.addPortfolioItem('internship', formData);
      setInternships((currentInternships) => [savedInternship, ...currentInternships]);
      setIsModalOpen(false);
      setNewInternship(emptyInternship);
      setCertificateFile(null);
      setInputGeneration((current) => current + 1);
      setSuccess(`${savedInternship.company} internship was submitted for faculty review.`);
    } catch (requestError) {
      setFormError(requestError.message || 'Unable to save this internship.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Industry Experience"
        title="Internships & Work History"
        subtitle="Add your internship dates and upload the experience certificate for faculty verification."
        actions={
          <Button variant="primary" icon="business_center" onClick={() => {
            setNewInternship(emptyInternship);
            setCertificateFile(null);
            setFormError('');
            setIsModalOpen(true);
          }}>
            Add Internship Record
          </Button>
        }
      />

      {error && <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm" role="alert">{error}</p>}
      {success && <p className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm" role="status">{success}</p>}
      {loading && <p className="text-sm text-on-surface-variant" role="status">Loading your internships...</p>}
      {!loading && !error && !internships.length && (
        <div className="rounded-2xl border border-dashed border-outline-variant/50 bg-surface p-8 text-center">
          <span className="material-symbols-outlined text-3xl text-secondary">business_center</span>
          <h2 className="mt-2 font-heading text-base font-bold text-on-surface">No internships added yet</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Add your experience and upload its certificate to start your record.</p>
        </div>
      )}
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
                <span className="font-medium text-on-surface">{intern.duration || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-on-surface-variant/70 block">Dates</span>
                <span className="font-medium text-on-surface">
                  {intern.startDate || 'Not provided'} – {intern.endDate || 'Present'}
                </span>
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
                {intern.status === 'verified' ? 'Faculty verified' : intern.status === 'rejected' ? 'Review feedback available' : 'Pending faculty review'}
              </div>
              {intern.certificateDocumentId && (
                <button
                  type="button"
                  onClick={() => handleDownload(intern.certificateDocumentId, intern.certificateFileName || 'internship-certificate')}
                  disabled={downloadingDocumentId === intern.certificateDocumentId}
                  className="inline-flex max-w-full items-center gap-2 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span className="truncate">
                    {downloadingDocumentId === intern.certificateDocumentId ? 'Downloading...' : intern.certificateFileName || 'Download certificate'}
                  </span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Submit Internship Record"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddInternship} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="internship-company" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Company Name *
              </label>
              <input
                id="internship-company"
                type="text"
                required
                maxLength={150}
                value={newInternship.company}
                onChange={(e) => setNewInternship({ ...newInternship, company: e.target.value })}
                placeholder="e.g. Google India"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
            <div>
              <label htmlFor="internship-role" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Role / Title *
              </label>
              <input
                id="internship-role"
                type="text"
                required
                maxLength={150}
                value={newInternship.role}
                onChange={(e) => setNewInternship({ ...newInternship, role: e.target.value })}
                placeholder="e.g. SDE Intern"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="internship-location" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Location & Mode
              </label>
              <input
                id="internship-location"
                type="text"
                maxLength={150}
                value={newInternship.location}
                onChange={(e) => setNewInternship({ ...newInternship, location: e.target.value })}
                placeholder="e.g. Bengaluru (Hybrid)"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
            <div>
              <label htmlFor="internship-duration" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Duration
              </label>
              <input
                id="internship-duration"
                type="text"
                maxLength={80}
                value={newInternship.duration}
                onChange={(e) => setNewInternship({ ...newInternship, duration: e.target.value })}
                placeholder="e.g. 3 months"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="internship-start-date" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Start Date *
              </label>
              <input
                id="internship-start-date"
                type="date"
                required
                value={newInternship.startDate}
                onChange={(e) => setNewInternship({ ...newInternship, startDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
            <div>
              <label htmlFor="internship-end-date" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                End Date (leave blank if ongoing)
              </label>
              <input
                id="internship-end-date"
                type="date"
                min={newInternship.startDate || undefined}
                value={newInternship.endDate}
                onChange={(e) => setNewInternship({ ...newInternship, endDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="internship-type" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Internship Type
              </label>
              <select
                id="internship-type"
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
              <label htmlFor="internship-stipend" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Monthly Stipend
              </label>
              <input
                id="internship-stipend"
                type="text"
                maxLength={80}
                value={newInternship.stipend}
                onChange={(e) => setNewInternship({ ...newInternship, stipend: e.target.value })}
                placeholder="₹50,000 / mo"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
              />
            </div>
          </div>

          <div>
            <label htmlFor="internship-skills" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Skills (comma separated)
            </label>
            <input
              id="internship-skills"
              type="text"
              value={newInternship.skills}
              onChange={(e) => setNewInternship({ ...newInternship, skills: e.target.value })}
              placeholder="JavaScript, API development"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface"
            />
          </div>

          <div>
            <label htmlFor="internship-description" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Key Contributions & Learnings
            </label>
            <textarea
              id="internship-description"
              rows={3}
              maxLength={2000}
              value={newInternship.description}
              onChange={(e) => setNewInternship({ ...newInternship, description: e.target.value })}
              placeholder="Highlight measurable outcomes (e.g. improved throughput by 20%, engineered REST services...)"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-surface resize-none"
            />
          </div>

          <div>
            <label htmlFor={`internship-certificate-${inputGeneration}`} className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Internship Certificate Soft Copy * (PDF, JPG, or PNG; up to 5 MB)
            </label>
            <input
              key={`internship-certificate-${inputGeneration}`}
              id={`internship-certificate-${inputGeneration}`}
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
              {saving ? 'Submitting...' : 'Submit Record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
