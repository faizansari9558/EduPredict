import React, { useState } from 'react';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import Button from '../../components/Button';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', institution: '', role: 'Student', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background font-body text-on-surface flex flex-col">
      <PublicHeader />

      <main className="w-full pt-20 flex-1">
        <section className="max-w-5xl mx-auto px-6 pt-12 pb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-secondary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">mail</span>
            <span>Get in Touch</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black text-primary tracking-tight">
            Contact the <span className="text-secondary">EduPredict Team</span>
          </h1>

          <p className="text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Have questions about institutional licensing, faculty onboarding, or student account verification? We're here to help.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
              <h3 className="font-headline font-bold text-lg text-primary">Campus & Support Coordinates</h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                  </div>
                  <div>
                    <strong className="text-on-surface block text-sm">Main Campus Headquarters</strong>
                    <span className="text-on-surface-variant">EduPredict Innovation Center, Block 4, Tech University Campus, India</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                  </div>
                  <div>
                    <strong className="text-on-surface block text-sm">Direct Email</strong>
                    <span className="text-on-surface-variant">support@edupredict.edu • info@edupredict.edu</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">support_agent</span>
                  </div>
                  <div>
                    <strong className="text-on-surface block text-sm">Support Hours</strong>
                    <span className="text-on-surface-variant">Monday – Friday: 9:00 AM – 6:00 PM IST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-3xl">check_circle</span>
                  </div>
                  <h3 className="font-headline font-bold text-2xl text-primary">Message Received!</h3>
                  <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                    Thank you for reaching out, <strong>{form.name}</strong>. Our academic coordinator will respond within 24 hours.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-headline font-bold text-lg text-primary mb-4">Send Us a Message</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Dr. Anand Sharma"
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary text-xs bg-surface"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="sharma@university.edu"
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary text-xs bg-surface"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Institution / University
                      </label>
                      <input
                        type="text"
                        value={form.institution}
                        onChange={(e) => setForm({ ...form, institution: e.target.value })}
                        placeholder="Institute of Technology"
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary text-xs bg-surface"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Your Role
                      </label>
                      <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary text-xs bg-surface"
                      >
                        <option value="Student">Student</option>
                        <option value="Faculty / Mentor">Faculty / Mentor</option>
                        <option value="Placement Officer (TPO)">Placement Officer (TPO)</option>
                        <option value="Dean / University Admin">Dean / University Admin</option>
                        <option value="Corporate Recruiter">Corporate Recruiter</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Message / Inquiry Details *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your campus deployment requirements, question, or verification inquiry..."
                      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary text-xs bg-surface resize-none"
                    />
                  </div>

                  <Button type="submit" variant="primary" size="md" className="w-full" icon="send">
                    Submit Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
