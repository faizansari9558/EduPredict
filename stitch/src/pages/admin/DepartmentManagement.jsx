import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Computer Science & Engineering', code: 'CSE', hod: 'Dr. Robert Vance', totalStudents: 480, facultyCount: 24, placementRate: '92.1%', status: 'verified' },
    { id: 2, name: 'Information Technology', code: 'IT', hod: 'Prof. Sarah Jenkins', totalStudents: 240, facultyCount: 14, placementRate: '89.5%', status: 'verified' },
    { id: 3, name: 'Electronics & Communication', code: 'ECE', hod: 'Dr. Ananya Roy', totalStudents: 320, facultyCount: 18, placementRate: '83.7%', status: 'verified' },
    { id: 4, name: 'Electrical & Electronics', code: 'EEE', hod: 'Dr. Vikram Seth', totalStudents: 180, facultyCount: 12, placementRate: '75.0%', status: 'verified' },
    { id: 5, name: 'Mechanical Engineering', code: 'MECH', hod: 'Prof. Rajesh Khanna', totalStudents: 220, facultyCount: 10, placementRate: '72.7%', status: 'verified' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '', hod: '', totalStudents: 120, facultyCount: 8 });

  const handleAddDept = (e) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) return;
    const dept = {
      id: Date.now(),
      name: newDept.name,
      code: newDept.code.toUpperCase(),
      hod: newDept.hod || 'Unassigned',
      totalStudents: Number(newDept.totalStudents) || 120,
      facultyCount: Number(newDept.facultyCount) || 8,
      placementRate: 'N/A',
      status: 'verified'
    };
    setDepartments([...departments, dept]);
    setIsModalOpen(false);
    setNewDept({ name: '', code: '', hod: '', totalStudents: 120, facultyCount: 8 });
  };

  const columns = [
    {
      header: 'Department & Code',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.name}</div>
          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
            {row.code}
          </span>
        </div>
      )
    },
    {
      header: 'Head of Department',
      accessor: (row) => <span className="text-xs font-medium text-on-surface">{row.hod}</span>
    },
    {
      header: 'Enrolled Students',
      accessor: (row) => <span className="font-mono text-xs font-bold text-on-surface">{row.totalStudents}</span>
    },
    {
      header: 'Faculty Count',
      accessor: (row) => <span className="text-xs text-on-surface font-medium">{row.facultyCount} Faculty</span>
    },
    {
      header: 'Placement Rate',
      accessor: (row) => (
        <span className="font-mono font-bold text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-md">
          {row.placementRate}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: (row) => (
        <Button variant="outline" size="sm" icon="tune">
          Configure
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Academic Structure"
        title="Department & Curriculum Governance"
        subtitle="Manage academic departments, student cohort allocations, and faculty leadership"
        action={
          <Button variant="primary" icon="add_business" onClick={() => setIsModalOpen(true)}>
            Add Department
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={departments}
        keyExtractor={(r) => r.id}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Academic Department"
        size="md"
      >
        <form onSubmit={handleAddDept} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={newDept.name}
              onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
              placeholder="e.g. Artificial Intelligence & Data Science"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Department Code *
              </label>
              <input
                type="text"
                required
                value={newDept.code}
                onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                placeholder="e.g. AI-DS"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Head of Department (HOD)
              </label>
              <input
                type="text"
                value={newDept.hod}
                onChange={(e) => setNewDept({ ...newDept, hod: e.target.value })}
                placeholder="e.g. Dr. Priya Nair"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Department</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
