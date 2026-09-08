import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { mockStudentProfile, mockPlacementDrivers } from '../../data/mockStudentData';

/**
 * Stitch Official Placement Analysis AI Screen
 * Reproduces the machine learning placement prediction, explainability engine,
 * interactive What-If scenario simulator, and prescriptive roadmap.
 */
export default function PlacementAnalysis() {
  const student = mockStudentProfile;
  const { positiveDrivers, riskBlockers, prescriptiveActions } = mockPlacementDrivers;

  // Interactive What-If Scenario State
  const [simCgpa, setSimCgpa] = useState(8.2);
  const [simCodingProblems, setSimCodingProblems] = useState(140);
  const [simCertifications, setSimCertifications] = useState(2);
  const [hasInternship, setHasInternship] = useState(true);

  // Dynamic simulation formula simulating XGBoost weights
  const calculateSimulatedProbability = () => {
    let prob = 40; // baseline
    prob += (simCgpa - 6.0) * 8.5; // CGPA weight
    prob += (simCodingProblems / 200) * 16.0; // Coding problems weight
    prob += simCertifications * 3.5; // Certifications weight
    if (hasInternship) prob += 12.0; // Internship weight
    return Math.min(99, Math.max(20, Math.round(prob)));
  };

  const simulatedProb = calculateSimulatedProbability();
  const simulatedTier = simulatedProb >= 85 ? 'Tier-1 Dream (> 12 LPA)' : simulatedProb >= 65 ? 'Tier-2 Core (6-12 LPA)' : 'Tier-3 Mass / Preparation';

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        eyebrow="Predictive Intelligence & Explainability"
        title="Placement Forecast & Career Analytics"
        subtitle="Empowered by Scikit-Learn XGBoost ensemble analyzing 16 engineered features with 89.8% ROC-AUC accuracy."
        icon="model_training"
        actions={
          <Button variant="secondary" size="sm" icon="sync">
            Recalculate Model
          </Button>
        }
      />

      {/* Model Overview Banner */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-primary-container text-on-primary shadow-sm border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed uppercase">
              Ensemble Active
            </span>
            <span className="text-xs text-on-primary-container">Trained on 5,000+ historical records</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-on-primary">
            Placement Probability: <span className="text-tertiary-fixed">{student.placement_probability}%</span>
          </h2>
          <p className="text-xs text-on-primary-container leading-relaxed">
            Candidate is positioned in <strong>{student.predicted_tier}</strong> bracket. Expected compensation range is projected at <strong>{student.expected_package}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-4 z-10">
          <div className="text-center p-4 rounded-xl bg-white/10 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-on-primary-container">Confidence</span>
            <div className="text-2xl font-extrabold text-tertiary-fixed font-heading">89.8%</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/10 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-on-primary-container">Risk Tier</span>
            <div className="text-2xl font-extrabold text-emerald-400 font-heading">Low</div>
          </div>
        </div>
      </section>

      {/* Feature Breakdown KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Academic Trajectory"
          value="9.1 / 10"
          unit="Weighted"
          icon="trending_up"
          iconColor="text-emerald-700"
          iconBg="bg-emerald-50"
          trend="Top 15% in CSE"
          trendDirection="up"
        />
        <StatCard
          label="Coding Benchmarks"
          value="88%"
          unit="Score"
          icon="terminal"
          iconColor="text-secondary"
          iconBg="bg-secondary-fixed"
          trend="140+ Problems Solved"
          trendDirection="up"
        />
        <StatCard
          label="Aptitude & Logic"
          value="82%"
          unit="Score"
          icon="psychology"
          iconColor="text-secondary"
          iconBg="bg-secondary-fixed"
          trend="Proficient"
          trendDirection="up"
        />
        <StatCard
          label="Industry Experience"
          value="Verified"
          unit="Internship"
          icon="work"
          iconColor="text-emerald-700"
          iconBg="bg-emerald-50"
          trend="3 Mo. Tier-1 Experience"
          trendDirection="up"
        />
      </section>

      {/* What-If Scenario Simulator */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-container text-tertiary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </span>
            <div>
              <h3 className="font-heading text-base font-bold text-on-surface">
                Interactive "What-If" Placement Simulator
              </h3>
              <p className="text-xs text-on-surface-variant">Adjust your hypothetical profile metrics to see real-time model forecast recalculations</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-3 py-1 rounded-lg">
            Real-Time Inference
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Controls Column */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-bold text-on-surface mb-1.5">
                <span>Target CGPA: <strong className="text-primary font-mono">{simCgpa.toFixed(2)}</strong></span>
                <span className="text-on-surface-variant">Scale: 6.0 — 10.0</span>
              </div>
              <input
                type="range"
                min="6.0"
                max="10.0"
                step="0.05"
                value={simCgpa}
                onChange={(e) => setSimCgpa(parseFloat(e.target.value))}
                className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-on-surface mb-1.5">
                <span>Algorithmic Problems Solved: <strong className="text-primary font-mono">{simCodingProblems}</strong></span>
                <span className="text-on-surface-variant">Target: 200+</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="5"
                value={simCodingProblems}
                onChange={(e) => setSimCodingProblems(parseInt(e.target.value))}
                className="w-full accent-secondary h-2 bg-surface-container rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Verified Certifications
                </label>
                <select
                  value={simCertifications}
                  onChange={(e) => setSimCertifications(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 text-xs bg-surface"
                >
                  <option value="0">0 Badges</option>
                  <option value="1">1 Badge (e.g. AWS Cloud)</option>
                  <option value="2">2 Badges (AWS + Meta FE)</option>
                  <option value="3">3+ Badges (Advanced)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Internship Completed
                </label>
                <div className="flex items-center gap-2 pt-1.5">
                  <input
                    type="checkbox"
                    id="internship-toggle"
                    checked={hasInternship}
                    onChange={(e) => setHasInternship(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <label htmlFor="internship-toggle" className="text-xs text-on-surface font-medium cursor-pointer">
                    Verified Industry Internship
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Forecast Badge */}
          <div className="bg-gradient-to-br from-primary-container to-slate-900 text-white p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
              Simulated Forecast
            </span>
            <div className="font-heading font-black text-5xl text-tertiary-fixed">
              {simulatedProb}%
            </div>
            <div className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-full">
              {simulatedTier}
            </div>
            <p className="text-[11px] text-slate-400">
              {simulatedProb > student.placement_probability
                ? `+${simulatedProb - student.placement_probability}% boost over your current profile`
                : 'Matches your current baseline trajectory'}
            </p>
          </div>
        </div>
      </section>

      {/* Explainability Engine: Drivers & Blockers */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Positive Drivers */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
            </span>
            <h3 className="font-heading text-base font-bold text-on-surface">
              Positive Placement Drivers (+Impact)
            </h3>
          </div>

          <div className="space-y-3">
            {positiveDrivers.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-1"
              >
                <div className="flex justify-between items-center text-xs">
                  <strong className="text-emerald-900 font-bold">{item.title}</strong>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {item.impact}
                  </span>
                </div>
                <p className="text-xs text-emerald-800/80">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factors / Blockers */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </span>
            <h3 className="font-heading text-base font-bold text-on-surface">
              Risk Factors &amp; Areas for Improvement (-Impact)
            </h3>
          </div>

          <div className="space-y-3">
            {riskBlockers.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-1"
              >
                <div className="flex justify-between items-center text-xs">
                  <strong className="text-amber-900 font-bold">{item.title}</strong>
                  <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {item.impact}
                  </span>
                </div>
                <p className="text-xs text-amber-800/80">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prescriptive Action Roadmap */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">checklist</span>
            </span>
            <h3 className="font-heading text-base font-bold text-on-surface">
              Prescriptive AI Skill Improvement Roadmap
            </h3>
          </div>
          <StatusBadge status="info" label="Target: +12% Probability Boost" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {prescriptiveActions.map((act, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3"
            >
              <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs text-on-surface leading-relaxed">{act}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
