import React from 'react';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface flex flex-col">
      <PublicHeader />

      <main className="w-full pt-20 flex-1">
        <section className="max-w-4xl mx-auto px-6 pt-12 pb-10 text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-secondary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">security</span>
            <span>Security & Compliance</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl font-black text-primary tracking-tight">
            Institutional Privacy Policy
          </h1>

          <p className="text-xs text-on-surface-variant">
            Last Updated: September 2026 • Governed by FERPA, ISO 27001 & AICTE Data Protection Standards
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="bg-surface-container-lowest p-8 sm:p-10 rounded-3xl border border-outline-variant/30 shadow-sm space-y-8 text-xs text-on-surface-variant leading-relaxed">
            <div className="space-y-2">
              <h2 className="font-headline font-bold text-base text-primary">1. Student Academic Data Protection</h2>
              <p>
                EduPredict operates under strict multi-tenant isolation. All academic transcripts, marks, coding submissions, and personal identifiable information (PII) are stored encrypted at rest using AES-256 and in transit via TLS 1.3.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="font-headline font-bold text-base text-primary">2. Role-Based Access Control (RBAC)</h2>
              <p>
                Access to student portfolios is strictly partitioned:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Students</strong> may only access their personal scores, verified records, and placement roadmaps.</li>
                <li><strong>Faculty Mentors</strong> may only audit students enrolled in their assigned academic sections.</li>
                <li><strong>Institutional Administrators</strong> have oversight for aggregate departmental analytics without unauthorized personal data disclosure.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="font-headline font-bold text-base text-primary">3. Machine Learning Ethics & Explainability</h2>
              <p>
                Placement prediction algorithms operate deterministically on validated academic features (CGPA, assessment scores, verified skills). No biometric, socioeconomic, or discriminatory variables are utilized in inference calculations.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="font-headline font-bold text-base text-primary">4. Document & Credential Storage</h2>
              <p>
                Uploaded academic marksheets, degree transcripts, and internship certificates are stored in private S3 buckets with signed URLs expiring after authorized faculty review sessions.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="font-headline font-bold text-base text-primary">5. Contact Data Privacy Officer</h2>
              <p>
                For questions regarding data retention, student right to erasure, or institutional compliance, email our data governance cell at <strong className="text-primary font-mono">privacy@edupredict.edu</strong>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
