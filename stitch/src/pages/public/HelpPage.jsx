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
      question: 'How does EduPredict calculate my placement prediction?',
      answer: 'The system uses machine learning classification models trained on academic features (CGPA, 10th and 12th percentages, active backlogs), performance in Coding Tests 1 & 2, Aptitude scores, verified projects, and certifications to determine your placement readiness and probability percentage.'
    },
    {
      id: 2,
      category: 'student',
      question: 'How do I submit marksheets and certificates for teacher verification?',
      answer: 'Log in to the Student Portal, go to Academic Records, Certifications, or Projects, and upload your marksheets or completion certificates. Your assigned faculty teacher will review the document and mark it as Verified or Rejected with specific feedback.'
    },
    {
      id: 3,
      category: 'student',
      question: 'When can I see my placement prediction results?',
      answer: 'Placement predictions are generated once your assigned teacher verifies your academic records and publishes your assessment scores. You can then view your readiness tier (Standard, Dream, Super Dream), strengths, and recommended improvements.'
    },
    {
      id: 4,
      category: 'teacher',
      question: 'How do teachers verify student documents?',
      answer: 'Teachers can open the Teacher Portal → Document Verification section to review pending student submissions. Teachers can approve verified documents or reject invalid submissions with feedback notes.'
    },
    {
      id: 5,
      category: 'teacher',
      question: 'How are assessments created and published by teachers?',
      answer: 'In Teacher Portal → Assessments, faculty can set up Coding Test 1, Coding Test 2, and Aptitude tests with scoring criteria. Once evaluation is complete, teachers publish the results for students to view.'
    },
    {
      id: 6,
      category: 'admin',
      question: 'How do administrators manage departments, courses, and batches?',
      answer: 'Administrators use the Admin Portal → Department & Batch Management section to set up academic years, configure departments (CSE, ECE, ME, etc.), assign teachers to student cohorts, and export placement readiness reports in CSV format.'
    }
  ];

  const filtered = faqs.filter(f => activeCategory === 'all' || f.category === activeCategory);

  return (
    <div className="min-h-screen bg-background font-body text-on-surface flex flex-col transition-colors duration-200">
      <PublicHeader />

      <main className="w-full pt-20 flex-1">
        <section className="max-w-5xl mx-auto px-6 pt-12 pb-14 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-secondary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">help</span>
            <span>Support &amp; FAQ</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black text-primary tracking-tight">
            Frequently Asked <span className="text-secondary">Questions</span>
          </h1>

          <p className="text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Find simple answers to common questions about student profiles, teacher document verification, assessments, and placement predictions.
          </p>

          {/* Filter Pills */}
          <div className="flex justify-center gap-2 pt-4">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'student', label: 'For Students' },
              { id: 'teacher', label: 'For Teachers' },
              { id: 'admin', label: 'For Administrators' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === tab.id
                    ? 'bg-secondary text-on-secondary shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
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
            <h3 className="font-headline font-bold text-xl text-primary">Need more help?</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Contact our college coordinator team for assistance with login, verification, or assessment issues.
            </p>
            <div className="pt-2">
              <Button to="/contact" variant="primary" size="sm" icon="mail">
                Contact Support
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
