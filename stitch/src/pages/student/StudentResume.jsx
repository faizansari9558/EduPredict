import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';

export default function StudentResume() {
  const [atsScore, setAtsScore] = useState(88);
  const [activeTab, setActiveTab] = useState('preview');

  const resumeKeywords = [
    { word: 'Distributed Systems', found: true, category: 'Backend' },
    { word: 'FastAPI / Python', found: true, category: 'Backend' },
    { word: 'React / Tailwind', found: true, category: 'Frontend' },
    { word: 'Machine Learning / XGBoost', found: true, category: 'AI/ML' },
    { word: 'Docker / Kubernetes', found: false, category: 'DevOps' },
    { word: 'GraphQL API', found: false, category: 'Backend' },
    { word: 'CI/CD Pipelines', found: true, category: 'DevOps' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Career Assets"
        title="Smart ATS Resume Studio"
        subtitle="AI-analyzed, ATS-optimized curriculum vitae verified against tier-1 job descriptions"
        action={
          <div className="flex gap-2">
            <Button variant="outline" icon="refresh">
              Re-scan ATS
            </Button>
            <Button variant="primary" icon="download">
              Export PDF
            </Button>
          </div>
        }
      />

      {/* ATS Score Overview Banner */}
      <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-primary-container text-tertiary-fixed font-headline font-black text-2xl shadow-inner border-4 border-tertiary-fixed/30">
              {atsScore}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  ATS Match Score: Excellent
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-tertiary-container/30 text-on-tertiary-container">
                  Tier-1 Ready
                </span>
              </div>
              <p className="text-sm text-on-surface-variant max-w-xl mt-1">
                Your resume satisfies 88% of target keywords for <strong>Software Engineer (L4)</strong> roles at Google, Microsoft, and Amazon.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="bg-surface-container px-3.5 py-2 rounded-xl border border-outline-variant/20">
              <span className="text-on-surface-variant block">Format Compatibility</span>
              <span className="font-bold text-green-600">100% (Single Column)</span>
            </div>
            <div className="bg-surface-container px-3.5 py-2 rounded-xl border border-outline-variant/20">
              <span className="text-on-surface-variant block">Action Verbs Ratio</span>
              <span className="font-bold text-primary">94% Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Preview */}
        <div className="lg:col-span-2 bg-surface border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
            <h4 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              Generated Academic CV Preview
            </h4>
            <span className="text-xs text-on-surface-variant font-medium">Standard Academic Template v3.2</span>
          </div>

          {/* Rendered CV Document Simulation */}
          <div className="bg-white text-slate-900 p-8 rounded-xl border border-slate-200 shadow-inner font-sans space-y-5 text-sm">
            <div className="text-center border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FAIZAN ANSARI</h1>
              <p className="text-xs text-slate-600 mt-1">
                B.Tech Computer Science & Engineering | CGPA: 8.92/10
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                faizan@example.com • +91 98765 43210 • github.com/faizansari9558 • linkedin.com/in/faizansari
              </p>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                Education
              </h2>
              <div className="flex justify-between font-semibold text-xs text-slate-800">
                <span>Institute of Engineering & Technology</span>
                <span>2021 – 2025</span>
              </div>
              <p className="text-xs text-slate-600">Bachelor of Technology in Computer Science & Engineering (CGPA: 8.92)</p>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                Technical Skills
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>Languages:</strong> Python, C++, JavaScript (ES6+), SQL, Go<br/>
                <strong>Frameworks & Tools:</strong> React.js, FastAPI, Node.js, Express, Docker, Tailwind CSS, Git<br/>
                <strong>Machine Learning:</strong> PyTorch, Scikit-Learn, XGBoost, Pandas, NumPy
              </p>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                Industry Experience
              </h2>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>Microsoft India — Software Engineering Intern</span>
                    <span>May 2024 – Jul 2024</span>
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5">
                    • Architected asynchronous telemetry collection pipeline reducing pipeline overhead by 18%.<br/>
                    • Engineered unit tests achieving 95% branch coverage on Azure Cognitive SDK.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                Key Projects
              </h2>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>EduPredict — AI Academic & Placement Prediction System</span>
                    <span>2024</span>
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5">
                    • Built dual-tier machine learning pipeline predicting placement probabilities with 93.4% precision.<br/>
                    • Integrated SHAP explainability visualizations with responsive Tailwind CSS frontend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Feedback & Keywords Analysis */}
        <div className="space-y-6">
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h4 className="font-headline font-bold text-base text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">psychology</span>
              AI Keyword Analysis
            </h4>

            <p className="text-xs text-on-surface-variant mb-4">
              Missing keywords prioritized by recruiter search algorithms:
            </p>

            <div className="space-y-2">
              {resumeKeywords.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container/50 border border-outline-variant/20 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${item.found ? 'text-green-500' : 'text-amber-500'}`}>
                      {item.found ? 'check_circle' : 'error'}
                    </span>
                    <span className="font-medium text-on-surface">{item.word}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant/70">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h4 className="font-headline font-bold text-base text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-fixed">tips_and_updates</span>
              Recommendations
            </h4>
            <ul className="space-y-2.5 text-xs text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">arrow_right</span>
                <span>Add <strong>Docker</strong> or <strong>Kubernetes</strong> containerization experience to bolster DevOps alignment.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">arrow_right</span>
                <span>Include quantifiable metric impact in the CloudScale project bullet points.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
