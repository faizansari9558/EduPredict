import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

export default function TeacherAssessments() {
  const [assessments, setAssessments] = useState([
    {
      id: 1,
      title: 'National Mock Placement Exam – Stage 3',
      category: 'Mock Placement Drive',
      duration: '90 Mins',
      totalQuestions: 60,
      submissions: '142 / 160',
      avgScore: '78.4%',
      status: 'active',
      scheduledDate: 'Sep 12, 2024'
    },
    {
      id: 2,
      title: 'Advanced Data Structures Coding Challenge',
      category: 'Coding Assessment',
      duration: '120 Mins',
      totalQuestions: 4,
      submissions: '158 / 160',
      avgScore: '84.2%',
      status: 'completed',
      scheduledDate: 'Aug 28, 2024'
    },
    {
      id: 3,
      title: 'Operating Systems & System Architecture Quiz',
      category: 'Core CS Domain',
      duration: '45 Mins',
      totalQuestions: 30,
      submissions: '155 / 160',
      avgScore: '81.0%',
      status: 'completed',
      scheduledDate: 'Aug 14, 2024'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTest, setNewTest] = useState({
    title: '',
    category: 'Coding Assessment',
    duration: '60 Mins',
    totalQuestions: 30,
    scheduledDate: ''
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTest.title) return;
    const item = {
      id: Date.now(),
      title: newTest.title,
      category: newTest.category,
      duration: newTest.duration,
      totalQuestions: Number(newTest.totalQuestions) || 30,
      submissions: '0 / 160',
      avgScore: 'N/A',
      status: 'active',
      scheduledDate: newTest.scheduledDate || 'Upcoming'
    };
    setAssessments([item, ...assessments]);
    setIsModalOpen(false);
    setNewTest({ title: '', category: 'Coding Assessment', duration: '60 Mins', totalQuestions: 30, scheduledDate: '' });
  };

  const columns = [
    {
      header: 'Assessment Title & Domain',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.title}</div>
          <div className="text-xs text-on-surface-variant">{row.category} • Scheduled: {row.scheduledDate}</div>
        </div>
      )
    },
    {
      header: 'Duration / Questions',
      accessor: (row) => (
        <span className="text-xs text-on-surface font-medium">
          {row.duration} • {row.totalQuestions} Qs
        </span>
      )
    },
    {
      header: 'Submissions',
      accessor: (row) => (
        <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
          {row.submissions}
        </span>
      )
    },
    {
      header: 'Batch Avg Score',
      accessor: (row) => <span className="font-mono font-bold text-xs text-on-surface">{row.avgScore}</span>
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}`}>
          {row.status.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: (row) => (
        <Button variant="outline" size="sm" icon="monitoring">
          Analytics
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Faculty Assessment Suite"
        title="Assessment Management"
        subtitle="Author, configure, and monitor technical assessments and mock placement drives"
        action={
          <Button variant="primary" icon="add_task" onClick={() => setIsModalOpen(true)}>
            Create Assessment
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={assessments}
        keyExtractor={(r) => r.id}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Technical Assessment"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Assessment Title *
            </label>
            <input
              type="text"
              required
              value={newTest.title}
              onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
              placeholder="e.g. Full Stack & API Architecture Challenge"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={newTest.category}
                onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
              >
                <option value="Coding Assessment">Coding Assessment</option>
                <option value="Aptitude & Logic">Aptitude & Logic</option>
                <option value="Core CS Domain">Core CS Domain</option>
                <option value="Mock Placement Drive">Mock Placement Drive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Duration
              </label>
              <input
                type="text"
                value={newTest.duration}
                onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })}
                placeholder="60 Mins"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Total Questions
              </label>
              <input
                type="number"
                value={newTest.totalQuestions}
                onChange={(e) => setNewTest({ ...newTest, totalQuestions: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Scheduled Date
              </label>
              <input
                type="date"
                value={newTest.scheduledDate}
                onChange={(e) => setNewTest({ ...newTest, scheduledDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Schedule Test</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
