import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

export default function UserManagement() {
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [users, setUsers] = useState([
    { id: 1, name: 'Faizan Ansari', email: 'faizan@example.com', role: 'student', department: 'Computer Science', status: 'verified', joined: 'Aug 2021' },
    { id: 2, name: 'Dr. Robert Vance', email: 'r.vance@university.edu', role: 'teacher', department: 'Computer Science', status: 'verified', joined: 'Jan 2018' },
    { id: 3, name: 'Prof. Sarah Jenkins', email: 's.jenkins@university.edu', role: 'teacher', department: 'Information Tech', status: 'verified', joined: 'Jul 2019' },
    { id: 4, name: 'Aarav Sharma', email: 'aarav@example.com', role: 'student', department: 'Computer Science', status: 'verified', joined: 'Aug 2021' },
    { id: 5, name: 'Dean Mark Davis', email: 'm.davis@university.edu', role: 'admin', department: 'Institutional Dean', status: 'verified', joined: 'Aug 2015' },
    { id: 6, name: 'Rohan Verma', email: 'rohan@example.com', role: 'student', department: 'Computer Science', status: 'pending', joined: 'Aug 2021' }
  ]);

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student', department: 'Computer Science' });

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    const user = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      status: 'verified',
      joined: 'Current'
    };
    setUsers([user, ...users]);
    setIsModalOpen(false);
    setNewUser({ name: '', email: '', role: 'student', department: 'Computer Science' });
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      header: 'Full Name & Email',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.name}</div>
          <div className="text-xs text-on-surface-variant font-mono">{row.email}</div>
        </div>
      )
    },
    {
      header: 'Assigned Role',
      accessor: (row) => (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
          row.role === 'admin' ? 'bg-purple-100 text-purple-800' :
          row.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
          'bg-slate-100 text-slate-800'
        }`}>
          {row.role}
        </span>
      )
    },
    {
      header: 'Department',
      accessor: (row) => <span className="text-xs text-on-surface font-medium">{row.department}</span>
    },
    {
      header: 'Joined Date',
      accessor: (row) => <span className="text-xs text-on-surface-variant">{row.joined}</span>
    },
    {
      header: 'Account Status',
      accessor: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <button className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Edit Permissions">
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors" title="Deactivate">
            <span className="material-symbols-outlined text-[16px]">block</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System Directory"
        title="User & Identity Governance"
        subtitle="Manage student, faculty mentor, and administrative accounts with RBAC controls"
        action={
          <Button variant="primary" icon="person_add" onClick={() => setIsModalOpen(true)}>
            Add New User
          </Button>
        }
      />

      {/* Filter Controls */}
      <div className="bg-surface border border-outline-variant/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface-container/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-on-surface-variant">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="student">Students</option>
            <option value="teacher">Faculty Mentors</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision New User Account"
        size="md"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Dr. Jane Smith"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="e.g. j.smith@university.edu"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Role
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
              >
                <option value="student">Student</option>
                <option value="teacher">Faculty Mentor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Department
              </label>
              <select
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Tech">Information Tech</option>
                <option value="Electronics & Comm">Electronics & Comm</option>
                <option value="Institutional Dean">Institutional Dean</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Provision User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
