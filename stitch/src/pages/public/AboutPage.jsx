import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import Button from '../../components/Button';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface flex flex-col">
      <PublicHeader />

      <main className="w-full pt-20 flex-1">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 pt-12 pb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-secondary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>About EduPredict</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black text-primary tracking-tight">
            Pioneering Explainable AI in <br />
            <span className="text-secondary">Higher Education & Campus Hiring</span>
          </h1>

          <p className="text-base text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
            EduPredict was founded to replace guesswork and fragmented spreadsheets with rigorous machine learning, real-time proctored evaluation, and transparent academic analytics for modern universities.
          </p>
        </section>

        {/* Core Mission Cards */}
        <section className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">psychology</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-primary">Explainable Intelligence</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              We leverage SHAP (SHapley Additive exPlanations) and dual XGBoost/Logistic Regression pipelines so students understand exactly which skills boost their placement probability.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">verified_user</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-primary">Verified Trust</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Faculty mentors audit 10th/12th marksheets, semester SGPA/CGPA transcripts, GitHub projects, and corporate internships with cryptographically signed digital seals.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">trending_up</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-primary">Early Remediation</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Automated early warning algorithms flag students with academic slippage or missing skill benchmarks months before campus recruitment drives commence.
            </p>
          </div>
        </section>

        {/* System Architecture Pillars */}
        <section className="bg-surface-container-low py-16 border-y border-outline-variant/30">
          <div className="max-w-5xl mx-auto px-6 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="font-headline font-bold text-2xl sm:text-3xl text-primary">
                Built for Institutional Excellence
              </h2>
              <p className="text-xs text-on-surface-variant">Three core pillars that power the EduPredict platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-on-surface-variant">
              <div className="p-6 bg-surface rounded-2xl border border-outline-variant/30 space-y-2">
                <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">database</span>
                  Institutional SIS Sync
                </h4>
                <p className="leading-relaxed">
                  Seamlessly connects with existing Student Information Systems (SIS) and relational databases (MySQL, MariaDB) to sync student records without manual overhead.
                </p>
              </div>

              <div className="p-6 bg-surface rounded-2xl border border-outline-variant/30 space-y-2">
                <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">terminal</span>
                  Sandboxed Autograding Arena
                </h4>
                <p className="leading-relaxed">
                  Multi-language code execution engine evaluating syntax correctness, algorithmic time complexity, and edge cases across Python, JavaScript, C++, and Java.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
          <h2 className="font-headline font-bold text-2xl sm:text-3xl text-primary">
            Ready to experience EduPredict?
          </h2>
          <p className="text-sm text-on-surface-variant">
            Sign in with your university credentials or register a new student or faculty account.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login">
              <Button variant="primary" size="md" icon="login">
                Sign In to Portal
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="md" icon="person_add">
                Register Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
