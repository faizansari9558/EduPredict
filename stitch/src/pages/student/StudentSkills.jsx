import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import apiClient from '../../services/api';

export default function StudentSkills() {
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { apiClient('/student/skills').then((response) => setSkills(response.data || [])).catch((err) => setError(err.message)); }, []);
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        eyebrow="Competency & Domain Mastery"
        title="Skills & Technical Inventory"
        subtitle="Track technical skills, quantitative aptitude, and verified competency levels."
        icon="psychology"
        actions={
          <Button variant="primary" size="sm" icon="add" onClick={async () => {
            const name = window.prompt('Skill name');
            if (!name) return;
            try {
              const response = await apiClient('/student/skills', { body: { name, category: 'Technical' } });
              setSkills((current) => [response.data, ...current]);
            } catch (err) {
              setError(err.message);
            }
          }}>
            Add Verified Skill
          </Button>
        }
      />

      {error && <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {!skills.length && <p className="text-sm text-on-surface-variant">No skills have been recorded.</p>}
        {skills.map((sk) => (
          <div
            key={sk.id}
            className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded">
                  {sk.category}
                </span>
                <StatusBadge
                  status={sk.verified ? 'verified' : 'pending'}
                  label={sk.verified ? 'Faculty Verified' : 'Self Claimed'}
                />
              </div>
              <h3 className="font-heading text-base font-bold text-on-surface">{sk.name}</h3>
              <p className="text-xs text-on-surface-variant">Proficiency: <strong className="text-on-surface">{sk.level}</strong></p>
            </div>

            <div className="space-y-1 pt-2 border-t border-outline-variant/20">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface-variant">Assessment Score</span>
                <span className="text-secondary font-bold">{sk.score}%</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: `${sk.score}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
