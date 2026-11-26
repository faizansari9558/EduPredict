import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { studentApi } from '../../services/studentApi';

const targetRoles = [
  'Software Development',
  'Data Science & AI',
  'Web Development',
  'Core Computer Science'
];

const sectionLabels = {
  contact_info: 'Contact information',
  education: 'Education',
  experience_or_projects: 'Experience or projects',
  technical_skills: 'Technical skills',
  certifications: 'Certifications or achievements'
};

function saveBlob(blob, fileName) {
  const fileUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
}

export default function StudentResume() {
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState(targetRoles[0]);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [extractionWarning, setExtractionWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError('');
    setAnalysis(null);
    setUploadedResume(null);
    setExtractionWarning('');

    if (!resumeText.trim() && !resumeFile) {
      setError('Paste resume text, upload a resume file, or provide both.');
      return;
    }
    if (resumeText.length > 100000) {
      setError('Resume text must be 100,000 characters or fewer.');
      return;
    }
    if (jobDescription.length > 20000) {
      setError('Job description must be 20,000 characters or fewer.');
      return;
    }
    if (resumeFile && resumeFile.size > 5 * 1024 * 1024) {
      setError('Resume file must be 5 MB or smaller.');
      return;
    }

    const formData = new FormData();
    formData.append('resume_text', resumeText);
    formData.append('target_role', targetRole);
    formData.append('job_description', jobDescription);
    if (resumeFile) formData.append('resume_file', resumeFile);

    setLoading(true);
    try {
      const result = await studentApi.analyzeResume(formData);
      setAnalysis(result);
      setUploadedResume(result.uploaded_resume);
      setExtractionWarning(result.extraction_warning || '');
    } catch (requestError) {
      setError(requestError.message || 'Unable to analyze this resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!uploadedResume?.document_id) return;
    setDownloading(true);
    setError('');
    try {
      const file = await studentApi.downloadDocument(uploadedResume.document_id);
      saveBlob(file, uploadedResume.file_name || 'resume');
    } catch (requestError) {
      setError(requestError.message || 'Unable to download your uploaded resume.');
    } finally {
      setDownloading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setUploadedResume(null);
    setExtractionWarning('');
    setError('');
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        eyebrow="Career Assets"
        title="Resume ATS Analyzer"
        subtitle="Paste your resume, upload its soft copy, or provide both to analyze it for a target role."
        icon="description"
      />

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

      <form onSubmit={handleAnalyze} className="rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <label htmlFor="resume-target-role" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Target role
            </label>
            <select
              id="resume-target-role"
              value={targetRole}
              onChange={(event) => {
                setTargetRole(event.target.value);
                clearAnalysis();
              }}
              className="w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {targetRoles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="resume-file" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Resume soft copy (PDF, DOCX, or TXT; up to 5 MB)
            </label>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={(event) => {
                setResumeFile(event.target.files?.[0] || null);
                clearAnalysis();
              }}
              className="block w-full text-xs text-on-surface-variant file:mr-3 file:rounded-lg file:border-0 file:bg-surface-container file:px-3 file:py-2 file:text-xs file:font-semibold file:text-on-surface"
            />
            {resumeFile && <p className="mt-1 text-xs text-on-surface-variant">Selected: {resumeFile.name}</p>}
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="resume-text" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Resume text
          </label>
          <textarea
            id="resume-text"
            rows={10}
            maxLength={100000}
            value={resumeText}
            onChange={(event) => {
              setResumeText(event.target.value);
              clearAnalysis();
            }}
            placeholder="Paste your resume text here. You can also upload a PDF, DOCX, or TXT file above."
            className="w-full resize-y rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-right text-xs text-on-surface-variant">{resumeText.length.toLocaleString()} / 100,000 characters</p>
        </div>

        <div className="mt-4">
          <label htmlFor="resume-job-description" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Job description (optional)
          </label>
          <textarea
            id="resume-job-description"
            rows={4}
            maxLength={20000}
            value={jobDescription}
            onChange={(event) => {
              setJobDescription(event.target.value);
              clearAnalysis();
            }}
            placeholder="Paste a job description to compare its technical keywords with your resume."
            className="w-full resize-y rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-outline-variant/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-xs text-on-surface-variant">
            Uploads are stored in your account. ATS scores are estimates based on readable text, role keywords, resume sections, impact evidence, and length—not a guarantee from a specific employer’s ATS.
          </p>
          <Button type="submit" variant="primary" icon="manage_search" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </Button>
        </div>
      </form>

      {extractionWarning && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800" role="status">{extractionWarning}</p>}

      {analysis && (
        <div className="space-y-6">
          <section className="flex flex-col gap-5 rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-sm md:flex-row md:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-secondary/20 bg-primary-container font-heading text-3xl font-black text-secondary">
              {analysis.ats_score}%
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">ATS estimate for {analysis.target_role}</p>
              <h2 className="mt-1 font-heading text-xl font-bold text-on-surface">{analysis.ats_grade}</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Analyzed {analysis.word_count} words across your submitted resume content.
              </p>
              {uploadedResume && (
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  {downloading ? 'Downloading...' : `Download uploaded copy: ${uploadedResume.file_name}`}
                </button>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
              <h2 className="font-heading text-base font-bold text-on-surface">Score breakdown</h2>
              <div className="mt-4 space-y-4">
                {Object.entries(analysis.score_breakdown).map(([key, result]) => (
                  <div key={key}>
                    <div className="mb-1 flex justify-between gap-3 text-xs">
                      <span className="text-on-surface-variant">{key.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-on-surface">{result.score} / {result.maximum}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                      <div className="h-full rounded-full bg-secondary" style={{ width: `${(result.score / result.maximum) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-on-surface-variant">
                Keyword coverage: {analysis.keyword_analysis.coverage_percent}% · {analysis.action_verbs_detected.length} distinct action verbs · {analysis.has_quantifiable_metrics ? 'quantified impact found' : 'no quantified impact found'}
              </p>
            </section>

            <section className="rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
              <h2 className="font-heading text-base font-bold text-on-surface">Resume sections</h2>
              <ul className="mt-4 space-y-2">
                {Object.entries(analysis.sections_detected).map(([key, found]) => (
                  <li key={key} className="flex items-center gap-2 text-sm">
                    <span className={`material-symbols-outlined text-[18px] ${found ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {found ? 'check_circle' : 'error'}
                    </span>
                    <span className="text-on-surface">{sectionLabels[key] || key}</span>
                    <span className="ml-auto text-xs text-on-surface-variant">{found ? 'Found' : 'Not detected'}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
              <h2 className="font-heading text-base font-bold text-on-surface">Matched keywords</h2>
              <p className="mt-1 text-xs text-on-surface-variant">
                {analysis.keyword_analysis.source === 'job_description' ? 'Extracted from the job description' : 'Based on the selected role'} · {analysis.keyword_analysis.matched_keywords.length} matched · {analysis.keyword_analysis.missing_keywords.length} not found
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.keyword_analysis.matched_keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{keyword}</span>
                ))}
                {analysis.keyword_analysis.missing_keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{keyword}</span>
                ))}
                {!analysis.keyword_analysis.matched_keywords.length && !analysis.keyword_analysis.missing_keywords.length && (
                  <p className="text-xs text-on-surface-variant">No role keywords were analyzed.</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
              <h2 className="font-heading text-base font-bold text-on-surface">Suggestions</h2>
              {analysis.improvement_suggestions.length ? (
                <ul className="mt-3 space-y-3">
                  {analysis.improvement_suggestions.map((suggestion, index) => (
                    <li key={`${suggestion.type}-${index}`} className="flex gap-2 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined mt-0.5 text-[16px] text-secondary">arrow_right</span>
                      <span>{suggestion.tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-on-surface-variant">No improvement suggestions from these checks.</p>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
