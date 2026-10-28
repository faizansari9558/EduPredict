import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import Button from '../../components/Button';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface flex flex-col transition-colors duration-200">
      <PublicHeader />

      <main className="w-full pt-20 flex-1">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 pt-12 pb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-secondary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>About EduPredict</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black text-primary tracking-tight">
            Smart Student Academic &amp; <br />
            <span className="text-secondary">Placement Prediction System</span>
          </h1>

          <p className="text-base text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
            EduPredict was built for universities and colleges to manage student academic information, validate documents, carry out assessments, analyze performance, and estimate placement readiness using machine learning.
          </p>
        </section>

        {/* Core Mission Cards */}
        <section className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">psychology</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-primary">Machine Learning Prediction</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Trained classification models analyze CGPA, 10th/12th percentages, test scores, backlogs, and projects to give clear placement probability and readiness scores.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">verified_user</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-primary">Faculty Verification</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Teachers verify student marksheets, semester results, projects, and certifications so placement predictions are based only on verified academic records.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">trending_up</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-primary">Actionable Recommendations</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Provides students with specific areas to focus on—such as coding challenge practice, aptitude preparation, or clearing backlogs—to boost placement success.
            </p>
          </div>
        </section>

        {/* System Architecture Pillars */}
        <section className="bg-surface-container-low py-16 border-y border-outline-variant/30">
          <div className="max-w-5xl mx-auto px-6 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="font-headline font-bold text-2xl sm:text-3xl text-primary">
                Core System Components
              </h2>
              <p className="text-xs text-on-surface-variant">Key techniques powering the EduPredict platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-on-surface-variant">
              <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 space-y-2">
                <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">database</span>
                  Centralized MySQL Database
                </h4>
                <p className="leading-relaxed">
                  Stores academic profiles, department structures (CSE, ECE, ME, etc.), assessment submissions, and verification logs in an organized relational database.
                </p>
              </div>

              <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 space-y-2">
                <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">terminal</span>
                  Coding &amp; Aptitude Assessment Engine
                </h4>
                <p className="leading-relaxed">
                  Allows faculty to create and evaluate coding challenges and aptitude tests with automated scoring and published marksheets.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
          <h2 className="font-headline font-bold text-2xl sm:text-3xl text-primary">
            Ready to explore EduPredict?
          </h2>
          <p className="text-sm text-on-surface-variant">
            Sign in with your university account or register a new student or teacher account.
          </p>
          <div className="flex justify-center gap-4">
            <Button to="/login" variant="primary" size="md" icon="login">
              Sign In to Portal
            </Button>
            <Button to="/register" variant="outline" size="md" icon="person_add">
              Register Account
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
