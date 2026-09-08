import React from 'react';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface flex flex-col">
      <PublicHeader />

      <main className="w-full pt-20 flex-1">
        <section className="max-w-4xl mx-auto px-6 pt-12 pb-10 text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-secondary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">gavel</span>
            <span>Terms of Service</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl font-black text-primary tracking-tight">
            Institutional Terms of Use
          </h1>

          <p className="text-xs text-on-surface-variant">
            Governing academic usage, assessment integrity, and platform access
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="bg-surface-container-lowest p-8 sm:p-10 rounded-3xl border border-outline-variant/30 shadow-sm space-y-8 text-xs text-on-surface-variant leading-relaxed">
            <div className="space-y-2">
              <h2 className="font-headline font-bold text-base text-primary">1. Academic Honesty & Assessment Integrity</h2>
              <p>
                Students taking timed assessments and coding arena challenges must complete evaluations independently. Plagiarism, tab switching violations, or AI automated completion during proctored exams may result in score invalidation.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="font-headline font-bold text-base text-primary">2. Authentic Document Uploads</h2>
              <p>
                All uploaded certificates, project repositories, and internship proofs must be authentic. Submitting falsified documents is grounds for academic disciplinary review by university administration.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="font-headline font-bold text-base text-primary">3. Predictive Modeling Disclaimers</h2>
              <p>
                Placement probabilities and salary tier projections provided by the EduPredict AI engine are statistical forecasts based on historical recruitment benchmarks. Final placement offers depend on corporate employer interview evaluations.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
