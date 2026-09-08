import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import Button from '../../components/Button';

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(1);

  const faqs = [
    {
      id: 1,
      category: 'student',
      question: 'How does EduPredict predict my placement probability?',
      answer: 'EduPredict analyzes 16 distinct academic and skill features including longitudinal CGPA velocity, performance in proctored coding assessments, verified industrial internships, cloud certifications, and attendance records using a calibrated dual XGBoost & Logistic Regression ensemble.'
    },
    {
      id: 2,
      category: 'student',
      question: 'How do I submit projects and internships for faculty verification?',
      answer: 'Navigate to your Student Dashboard → Technical Projects or Internships section. Click "Add Project" or "Add Internship", enter your repository URL or proof certificate, and submit. Your assigned faculty mentor will review and approve it within 48 hours.'
    },
    {
      id: 3,
      category: 'student',
      question: 'What is the Smart ATS Resume Studio?',
      answer: 'The ATS Resume Studio scans your academic profile, verified skills, and project accomplishments against thousands of Tier-1 job descriptions to give you a match score, suggest missing keywords, and export a clean single-column PDF resume.'
    },
    {
      id: 4,
      category: 'teacher',
      question: 'How do faculty mentors review student submissions?',
      answer: 'Faculty mentors can access the Teacher Portal → Verification Queue to inspect student GitHub links, certificate PDFs, and marksheets. Mentors can approve with 1-click or reject with constructive feedback notes.'
    },
    {
      id: 5,
      category: 'teacher',
      question: 'Can teachers author custom technical assessments and coding questions?',
      answer: 'Yes. In Teacher Portal → Assessment Management, faculty can create MCQ quizzes or sandboxed coding problems specifying testcases, memory bounds, time limits, and passing thresholds.'
    },
    {
      id: 6,
      category: 'admin',
      question: 'How do administrators export NAAC / NIRF accreditation reports?',
      answer: 'Institutional Administrators can visit the Admin Portal → Reports & Compliance section to generate and download Criterion 2.6 attainment spreadsheets, TPO placement dossiers, and historical batch trends in PDF or XLSX format.'
    }
  ];

  const filtered = faqs.filter(f => activeCategory === 'all' || f.category === activeCategory);

  return (
    <div className="min-h-screen bg-background font-body text-on-surface flex flex-col">
      <PublicHeader />

      <main className="w-full pt-20 flex-1">
        <section className="max-w-5xl mx-auto px-6 pt-12 pb-14 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-secondary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">help</span>
            <span>Support & Documentation</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black text-primary tracking-tight">
            Frequently Asked <span className="text-secondary">Questions</span>
          </h1>

          <p className="text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about predictive modeling, document verification, assessments, and campus governance.
          </p>

          {/* Filter Pills */}
          <div className="flex justify-center gap-2 pt-4">
            {[
              { id: 'all', label: 'All Topics' },
              { id: 'student', label: 'For Students' },
              { id: 'teacher', label: 'For Faculty' },
              { id: 'admin', label: 'For Leadership' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === tab.id
                    ? 'bg-secondary text-on-secondary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* FAQs Accordion Grid */}
        <section className="max-w-4xl mx-auto px-6 pb-20 space-y-4">
          {filtered.map(faq => (
            <div
              key={faq.id}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-surface-container-low transition-colors"
              >
                <span className="font-headline font-bold text-sm text-primary">
                  {faq.question}
                </span>
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 transition-transform">
                  {expandedFaq === faq.id ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {expandedFaq === faq.id && (
                <div className="px-6 pb-6 pt-1 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/10">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Still Need Help Box */}
        <section className="max-w-4xl mx-auto px-6 pb-20 text-center">
          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 space-y-3">
            <h3 className="font-headline font-bold text-xl text-primary">Still have questions?</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Our campus academic support coordinators are standing by to assist students, professors, and administrative staff.
            </p>
            <div className="pt-2">
              <Link to="/contact">
                <Button variant="primary" size="sm" icon="mail">
                  Contact Campus Support
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
