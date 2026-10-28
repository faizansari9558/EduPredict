import React from 'react';
import {
  GraduationCap,
  Globe,
  CheckCircle2,
  Sparkles,
  GitFork,
  Target,
  Terminal,
  Code,
  FileCheck,
  Compass,
  TrendingUp,
  Shield,
  Lock,
  Network,
  Layers
} from 'lucide-react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface antialiased flex flex-col selection:bg-secondary/20 selection:text-secondary transition-colors duration-200">
      {/* 1. STICKY TOPBAR HEADER */}
      <PublicHeader />

      <main className="w-full pt-16 sm:pt-20 flex-1 flex flex-col justify-start relative">
        {/* Animated Background Container (Electric-Blue Dark Mode / Soft Blue Light Mode) */}
        <div className="relative w-full overflow-hidden flex-1 py-12 sm:py-16 lg:py-20">
          {/* Animated Atmospheric Electric-Blue Glow Engine */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 select-none">
            {/* Subtle atmospheric dot grid pattern */}
            <div className="electric-dot-grid absolute inset-0 opacity-30 dark:opacity-20" />

            {/* Central Electric-Blue Hero Spotlight (Matches CloudPeak Reference) */}
            <div className="electric-glow-center absolute -top-20 sm:-top-28 left-1/2 -translate-x-1/2 w-[850px] sm:w-[1250px] lg:w-[1500px] h-[520px] sm:h-[650px] lg:h-[750px] rounded-[100%] blur-[80px] sm:blur-[120px] lg:blur-[140px] animate-electric-pulse" />

            {/* Drifting Electric Blue Orb (Left) */}
            <div className="electric-orb-left absolute top-16 sm:top-24 left-[5%] sm:left-[15%] w-[380px] sm:w-[540px] h-[380px] sm:h-[540px] rounded-full blur-[80px] sm:blur-[115px] animate-electric-drift-1" />

            {/* Drifting Sapphire / Cyan Orb (Right) */}
            <div className="electric-orb-right absolute top-28 sm:top-36 right-[5%] sm:right-[15%] w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full blur-[80px] sm:blur-[115px] animate-electric-drift-2" />

            {/* Lower Ambient Diffusion Glow behind Cards */}
            <div className="electric-glow-bottom absolute top-[540px] sm:top-[660px] left-1/2 -translate-x-1/2 w-[950px] sm:w-[1350px] h-[450px] rounded-[100%] blur-[90px] sm:blur-[130px]" />
          </div>

          {/* 1. HERO SECTION */}
          <section id="overview" className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center w-full relative z-10">
            <div className="flex flex-col items-center max-w-4xl mx-auto">
              {/* Announcement Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-sky-50/80 dark:bg-slate-900/80 border border-sky-200/90 dark:border-sky-500/40 shadow-[0_1px_4px_rgba(0,0,0,0.03)] dark:shadow-[0_0_25px_rgba(37,99,235,0.25)] mb-6 sm:mb-8 transition-transform hover:scale-[1.02]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-sky-100">
                  SMART STUDENT ACADEMIC &amp; PLACEMENT PREDICTION SYSTEM
                </span>
                <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight leading-[1.18] mb-6 text-slate-900 dark:text-white">
                Predict Placement Outcomes. <br />
                <span className="bg-gradient-to-r from-sky-500 via-sky-600 to-emerald-500 dark:from-sky-300 dark:via-blue-300 dark:to-emerald-300 bg-clip-text text-transparent">
                  Improve Student Academic &amp; Career Readiness.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-200/90 max-w-3xl mx-auto leading-relaxed font-normal">
                A complete system for colleges and universities to manage academic records, verify documents, conduct coding and aptitude tests, and predict placement readiness using machine learning.
              </p>
            </div>
          </section>

          {/* 2. SPECIALIZED PORTALS SECTION */}
          <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center w-full mt-16 sm:mt-20 relative z-10">
            {/* Overline / Badge */}
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-3">
              <Globe className="w-4 h-4 text-sky-500" />
              <span>UNIFIED MULTI-ROLE ARCHITECTURE</span>
            </div>

            {/* Section Title */}
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              Specialized Portals for Every Stakeholder
            </h2>

            {/* Section Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-12">
              Designed specifically to keep students ahead of recruitment requirements, empower faculty with verification queues, and provide admins with macro-level insights.
            </p>

            {/* 3 Portal Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto text-left">

              {/* CARD 1: Student Portal */}
              <div className="bg-white/85 dark:bg-[#070e1e]/85 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-500">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-700/50 text-[11px] font-bold tracking-wider uppercase">
                      CANDIDATE VIEW
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-5 mb-2.5">
                    Student Portal
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Empowers candidates with end-to-end performance tracking, hands-on coding sandboxes, and actionable gap analysis prior to campus placement season.
                  </p>

                  {/* Bullet Points */}
                  <ul className="space-y-3.5">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-[13px] leading-snug">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Academic Profile:</span>{' '}
                        <span className="text-slate-600 dark:text-slate-300">Real-time CGPA, verified credits &amp; backlog tracking</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-[13px] leading-snug">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">2 Coding Tests &amp; 1 Aptitude Test:</span>{' '}
                        <span className="text-slate-600 dark:text-slate-300">Proctored runtime execution assessments</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-[13px] leading-snug">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Verified Results:</span>{' '}
                        <span className="text-slate-600 dark:text-slate-300">Instant scorecards with test case pass-rate telemetry</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-[13px] leading-snug">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Placement Probability &amp; Improvement Tips:</span>{' '}
                        <span className="text-slate-600 dark:text-slate-300">SHAP-guided personalized guidance</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* CARD 2: Teacher Portal */}
              <div className="bg-white/85 dark:bg-[#070e1e]/85 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-500">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="3" />
                        <circle cx="8.5" cy="8.5" r="2.5" />
                        <path d="M14 15.5a4 4 0 0 0-8 0" />
                        <line x1="15" y1="8" x2="18.5" y2="8" />
                        <line x1="15" y1="12" x2="18.5" y2="12" />
                      </svg>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-700/50 text-[11px] font-bold tracking-wider uppercase">
                      FACULTY &amp; MENTOR
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-5 mb-2.5">
                    Teacher Portal
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Provides educators and career counselors with intuitive auditing queues, automated assessment generators, and longitudinal cohort tracking.
                  </p>

                  {/* Bullet Points */}
                  <ul className="space-y-3.5">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-[13px] leading-snug">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Document Verification Queue:</span>{' '}
                        <span className="text-slate-600 dark:text-slate-300">Instant audit for marksheets, IDs &amp; certificates</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-[13px] leading-snug">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Assessment Builder:</span>{' '}
                        <span className="text-slate-600 dark:text-slate-300">Custom testcase creation, MCQ bank &amp; coding problems</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-[13px] leading-snug">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Faculty Evaluation Scoring:</span>{' '}
                        <span className="text-slate-600 dark:text-slate-300">Subjective review rubrics and proctoring audit logs</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-[13px] leading-snug">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Skill-Gap Analytics:</span>{' '}
                        <span className="text-slate-600 dark:text-slate-300">Cohort radar comparisons to pinpoint weak subject areas</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* CARD 3: Admin Portal */}
              <div className="bg-white/85 dark:bg-[#070e1e]/85 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <rect width="6" height="5" x="9" y="11" rx="1" />
                        <path d="M10 11V9a2 2 0 1 1 4 0v2" />
                      </svg>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-700/50 text-[11px] font-bold tracking-wider uppercase">
                      INSTITUTION ADMIN
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-5 mb-2.5">
                    Admin Portal
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Institutional governance suite for Heads of Dept, Deans, and Training &amp; Placement Officers (TPO) to manage academic structures and forecasts.
                  </p>

                  {/* Bullet Points */}
                  <ul className="space-y-3.5">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-[13px] leading-snug">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Department &amp; Course Setup:</span>{' '}
                        <span className="text-slate-600 dark:text-slate-300">Seamless taxonomy for CSE, ECE, ME, Civil &amp; IT</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-[13px] leading-snug">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">User &amp; Batch Management:</span>{' '}
                        <span className="text-slate-600 dark:text-slate-300">Role-based provisioning for faculty, staff, and students</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-[13px] leading-snug">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">CSV Bulk Import:</span>{' '}
                        <span className="text-slate-600 dark:text-slate-300">1-click batch onboarding with automatic column mapping &amp; validation</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-[13px] leading-snug">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">College-Wide Placement Forecasts:</span>{' '}
                        <span className="text-slate-600 dark:text-slate-300">Institutional NIRF/NAAC compliant export tables</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </section>

          {/* 3. CORE PLATFORM TECHNIQUES SECTION */}
          <section id="capabilities" className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full mt-20 sm:mt-28 relative z-10">
            {/* Header: Title on Left, Subtext on Right */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 sm:mb-12">
              <div className="text-left">
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-2">
                  PLATFORM CAPABILITIES
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Core Platform Techniques
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md leading-relaxed text-left md:text-right">
                Engineered with mathematical precision and institutional security protocols to power transparent academic velocity.
              </p>
            </div>

            {/* 6 Capabilities Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto text-left">

              {/* CARD 1: Machine Learning Placement Prediction */}
              <div className="bg-white/85 dark:bg-[#070e1e]/85 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-500">
                    <GitFork className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2.5">
                    1. Machine Learning Placement Prediction
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Logistic Regression &amp; Decision Trees paired with SHAP explainability. Computes individual feature contribution percentages so forecasts are completely transparent.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 mt-auto pt-2">
                  <Target className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>SHAP Explainable Inference</span>
                </div>
              </div>

              {/* CARD 2: Coding & Aptitude Assessment Engine */}
              <div className="bg-white/85 dark:bg-[#070e1e]/85 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2.5">
                    2. Coding &amp; Aptitude Assessment Engine
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Automated scoring &amp; testcases with real-time runtime execution. Runs memory consumption, time complexity, and edge-case testing under strict sandbox constraints.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-auto pt-2">
                  <Code className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Proctored Sandboxed Compilers</span>
                </div>
              </div>

              {/* CARD 3: Teacher Document Verification */}
              <div className="bg-white/85 dark:bg-[#070e1e]/85 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-500">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2.5">
                    3. Teacher Document Verification
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Audit marksheets, conduct identity verification, and validate credentials against university SIS registrar standards to eradicate forged resumes before recruiters arrive.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-auto pt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Registrar Cryptographic Seal</span>
                </div>
              </div>

              {/* CARD 4: Strengths & Weakness Analysis */}
              <div className="bg-white/85 dark:bg-[#070e1e]/85 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2.5">
                    4. Strengths &amp; Weakness Analysis
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Actionable recommendations, radar comparison &amp; gap remediation. Pinpoints whether students lag in data structures, quantitative aptitude, or industry certifications.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mt-auto pt-2">
                  <TrendingUp className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Targeted Skill Remediation</span>
                </div>
              </div>

              {/* CARD 5: Role-Based Access Control */}
              <div className="bg-white/85 dark:bg-[#070e1e]/85 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-500">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2.5">
                    5. Role-Based Access Control
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    FERPA compliant RBAC &amp; institutional email verification. Guaranteed multi-tenant campus boundary isolation, mentor permissions, and encrypted personal records.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mt-auto pt-2">
                  <Lock className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>FERPA &amp; ISO 27001 Certified</span>
                </div>
              </div>

              {/* CARD 6: Academic Structure & Batch Management */}
              <div className="bg-white/85 dark:bg-[#070e1e]/85 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-500">
                    <Network className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2.5">
                    6. Academic Structure &amp; Batch Management
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Departments, semesters, cohorts &amp; student lifecycle tracking. Seamlessly handle graduation batches from matriculation to Day-Zero campus recruitment drives.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 mt-auto pt-2">
                  <Layers className="w-4 h-4 text-teal-500 shrink-0" />
                  <span>Full Lifecycle Cohort Sync</span>
                </div>
              </div>

            </div>
          </section>
        </div>
      </main>

      {/* 3. PUBLIC FOOTER */}
      <PublicFooter />
    </div>
  );
}
