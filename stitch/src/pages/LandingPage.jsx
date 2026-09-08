import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import Button from '../components/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface antialiased flex flex-col selection:bg-secondary/20 selection:text-secondary">
      {/* 1. STICKY TOPBAR HEADER - Compact h-16 & 100% Window Fit */}
      <PublicHeader />

      <main className="w-full pt-16 flex-1">
        {/* Top Ambient Glow */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[480px] bg-gradient-to-tr from-secondary/15 via-secondary-container/10 to-tertiary-fixed-dim/20 blur-3xl pointer-events-none -z-10 rounded-full" />

          {/* 2. HERO SECTION */}
          <section id="overview" className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-16 pb-20 text-center">
            <div className="flex flex-col items-center max-w-4xl mx-auto">
              {/* Super Title Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-secondary shadow-sm mb-6 transition-transform hover:scale-105">
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  AI-Powered University Placement Intelligence Platform
                </span>
                <span className="material-symbols-outlined text-[16px] text-secondary">auto_awesome</span>
              </div>

              {/* Main Headline with 100% Solid & Visible Text */}
              <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-primary font-black tracking-tight leading-[1.15] mb-6">
                Predict Placement Outcomes. <br className="hidden sm:block" />
                <span className="text-secondary font-black">
                  Elevate Student Career Trajectories.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-on-surface-variant max-w-3xl mb-10 leading-relaxed">
                A unified predictive engine for engineering institutions to monitor academic velocity, evaluate proctored technical sandboxes, verify registrar credentials, and deliver explainable ML placement forecasts well before campus drives begin.
              </p>

              {/* CTAs - Requires Authentication */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 w-full sm:w-auto">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full px-8 py-3.5" icon="login">
                    Sign In to Portal
                  </Button>
                </Link>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full px-8 py-3.5" icon="person_add">
                    Register Account
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* 3. THREE TAILORED ECOSYSTEM PORTALS (Info Only - No Direct Bypass Buttons) */}
        <section id="portals" className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16 w-full">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-secondary text-xs font-bold uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[18px]">hub</span>
              <span>Tailored Ecosystem Portals</span>
            </div>
            <h2 className="font-headline font-bold text-3xl sm:text-4xl text-primary mb-3">
              Three Tailored Interfaces. One Unified Truth.
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Eliminate disconnected spreadsheets and last-minute panic. EduPredict synchronizes students, counselors, and leadership around real-time predictive milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Portal 1: Students */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center mb-6 text-on-secondary-fixed-variant">
                  <span className="material-symbols-outlined text-[28px]">school</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">Student Experience</span>
                <h3 className="font-headline font-bold text-xl text-primary mt-1 mb-3">Empowerment & Preparation</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                  Proctored full-stack & algorithmic sandboxes, ATS-ready cryptographically verified dossiers, longitudinal CGPA forecasting, and clear path guidance.
                </p>
                <ul className="flex flex-col gap-2.5 text-xs text-on-surface">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                    <span>Proctored IDE supporting Python, C++, Java</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                    <span>Visual Weakness Breakdown & Remediation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                    <span>Corporate Eligibility Pre-Screening Badges</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Portal 2: Teachers & Mentors */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6 text-primary">
                  <span className="material-symbols-outlined text-[28px]">co_present</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">Mentors & Counselors</span>
                <h3 className="font-headline font-bold text-xl text-primary mt-1 mb-3">Auditing & 1:1 Intervention</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                  Streamlined verification pipelines for marksheets, attendance audits, early warning triggers for at-risk backlogs, and direct intervention tools.
                </p>
                <ul className="flex flex-col gap-2.5 text-xs text-on-surface">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                    <span>Batch Credential Approval & Audit Logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                    <span>Early Warning System for CGPA slippage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                    <span>Assigned Cohort Placement Velocity Radar</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Portal 3: Deans & Admins */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-tertiary-container flex items-center justify-center mb-6 text-on-tertiary-container">
                  <span className="material-symbols-outlined text-[28px]">account_balance</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Institutional Leadership</span>
                <h3 className="font-headline font-bold text-xl text-primary mt-1 mb-3">Dean & TPO Cockpit</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                  Macro-level cohort analytics across departments (CSE, ECE, ME), recruiter pipeline forecasting, automated NAAC/NIRF compliance data exports.
                </p>
                <ul className="flex flex-col gap-2.5 text-xs text-on-surface">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-600 text-[18px]">check_circle</span>
                    <span>Departmental Head-to-Head Comparisons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-600 text-[18px]">check_circle</span>
                    <span>Drive Matching & Day-Zero Pre-Screening</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-600 text-[18px]">check_circle</span>
                    <span>1-Click Accreditation Table Generation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CORE PLATFORM CAPABILITIES (6 Bento Cards) */}
        <section id="features" className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">Precision Architecture</span>
              <h2 className="font-headline font-bold text-3xl text-primary mt-1">
                Engineered for Rigorous Academic Verification
              </h2>
            </div>
            <p className="text-sm text-on-surface-variant max-w-md">
              Designed from the ground up to eliminate transcript fraud, reduce mentor evaluation friction, and prepare students for competitive corporate evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary mb-4">
                <span className="material-symbols-outlined text-[24px]">model_training</span>
              </div>
              <h3 className="font-headline font-bold text-base text-primary mb-2">Dual-Ensemble ML Models</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                XGBoost decision trees combined with calibrated Logistic Regression, trained and validated against 4,800+ historical campus recruitment profiles.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary mb-4">
                <span className="material-symbols-outlined text-[24px]">terminal</span>
              </div>
              <h3 className="font-headline font-bold text-base text-primary mb-2">Proctored Cloud IDE Sandbox</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Built-in code compiler running 50+ algorithm patterns with memory allocation and Big-O runtime checks, preventing plagiarism via tab-lock proctoring.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary mb-4">
                <span className="material-symbols-outlined text-[24px]">encrypted</span>
              </div>
              <h3 className="font-headline font-bold text-base text-primary mb-2">Registrar Verification Seal</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Tamper-proof digital credential signatures ensuring student 10th/12th marksheets, CGPA transcripts, and internship certificates are 100% verified.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary mb-4">
                <span className="material-symbols-outlined text-[24px]">troubleshoot</span>
              </div>
              <h3 className="font-headline font-bold text-base text-primary mb-2">Explainable Gap Remediation</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                No cryptic scorecards. The AI outlines exact weaknesses—such as low LeetCode-style tree traversal or missing cloud certificates—to lift eligibility.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary mb-4">
                <span className="material-symbols-outlined text-[24px]">corporate_fare</span>
              </div>
              <h3 className="font-headline font-bold text-base text-primary mb-2">Automated Recruiter Filtering</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Companies can upload custom cutoff matrices (CGPA ≥ 7.5, zero active backlogs, Python proficiency) and generate verified student rosters in seconds.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary mb-4">
                <span className="material-symbols-outlined text-[24px]">security</span>
              </div>
              <h3 className="font-headline font-bold text-base text-primary mb-2">FERPA & Multi-Tenant RBAC</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Strict institutional isolation, mentor role-based access restrictions, and end-to-end encrypted storage safeguard sensitive academic data.
              </p>
            </div>
          </div>
        </section>

        {/* 5. LIFECYCLE VELOCITY WORKFLOW */}
        <section id="workflow" className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16 w-full">
          <div className="bg-surface-container-low rounded-3xl p-8 md:p-12 border border-outline-variant/20">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">Lifecycle Velocity</span>
              <h2 className="font-headline font-bold text-3xl text-primary mt-1 mb-2">From Enrollment to Offer Letter</h2>
              <p className="text-xs text-on-surface-variant">
                A continuous, 5-stage verification and forecasting methodology that guarantees zero surprise failures during campus hiring season.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col border border-outline-variant/20">
                <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary font-bold text-sm flex items-center justify-center mb-3">1</div>
                <h4 className="font-bold text-sm text-primary mb-1">Data Intake</h4>
                <p className="text-xs text-on-surface-variant">Registrar SIS sync & historical semester grade intake.</p>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col border border-outline-variant/20">
                <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary font-bold text-sm flex items-center justify-center mb-3">2</div>
                <h4 className="font-bold text-sm text-primary mb-1">Verification</h4>
                <p className="text-xs text-on-surface-variant">Faculty audit of internships, certificates, and credentials.</p>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col border border-outline-variant/20">
                <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary font-bold text-sm flex items-center justify-center mb-3">3</div>
                <h4 className="font-bold text-sm text-primary mb-1">Assessments</h4>
                <p className="text-xs text-on-surface-variant">Live proctored coding and aptitude speed tests.</p>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col border border-outline-variant/20">
                <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary font-bold text-sm flex items-center justify-center mb-3">4</div>
                <h4 className="font-bold text-sm text-primary mb-1">ML Forecast</h4>
                <p className="text-xs text-on-surface-variant">SHAP inference engine computes placement probability.</p>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col border border-outline-variant/20">
                <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary font-bold text-sm flex items-center justify-center mb-3">5</div>
                <h4 className="font-bold text-sm text-primary mb-1">Offer Letter</h4>
                <p className="text-xs text-on-surface-variant">Seamless Day-Zero matching and employer dispatch.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. RICH 100% FIT FOOTER */}
      <PublicFooter />
    </div>
  );
}
