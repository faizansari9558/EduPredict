import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { adminApi } from '../../services/adminApi';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newDept, setNewDept] = useState({ name: '', code: '' });

  useEffect(() => {
    adminApi.getDepartments()
      .then((response) => setDepartments(response.data || []))
      .catch((err) => setError(err.message || 'Unable to load departments.'))
      .finally(() => setLoading(false));
  }, []);

  const handleAddDept = (event) => {
    event.preventDefault();
    setError('');
    adminApi.createDepartment({ name: newDept.name.trim(), code: newDept.code.trim().toUpperCase() })
      .then((response) => {
        setDepartments((current) => [...current, response.data]);
        setNewDept({ name: '', code: '' });
        setIsModalOpen(false);
      })
      .catch((err) => setError(err.message || 'Unable to create department.'));
  };

  const columns = [
    { key: 'name', label: 'Department & Code', render: (_, row) => <div><div className="font-semibold">{row.name}</div><span className="font-mono text-xs font-bold text-primary">{row.code}</span></div> },
    { key: 'head_user_id', label: 'Department Head', render: (_, row) => <span className="text-xs">{row.head_user_id || 'Unassigned'}</span> },
    { key: 'student_count', label: 'Enrolled Students', render: (value) => <span className="font-mono text-xs">{value ?? 0}</span> },
    { key: 'created_at', label: 'Created', render: (value) => <span className="text-xs">{value ? new Date(value).toLocaleDateString() : '—'}</span> }
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Academic Structure" title="Department & Curriculum Governance" subtitle="Manage academic departments and cohort allocations" actions={<Button variant="primary" icon="add_business" onClick={() => setIsModalOpen(true)}>Add Department</Button>} />
      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <div className="p-6 text-sm text-on-surface-variant">Loading departments…</div> : <DataTable columns={columns} data={departments} keyExtractor={(row) => row.id} />}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Academic Department" size="md">
        <form onSubmit={handleAddDept} className="space-y-4">
          <input required value={newDept.name} onChange={(event) => setNewDept({ ...newDept, name: event.target.value })} placeholder="Department name" className="w-full px-4 py-2.5 rounded-xl border text-xs" />
          <input required value={newDept.code} onChange={(event) => setNewDept({ ...newDept, code: event.target.value })} placeholder="Department code" className="w-full px-4 py-2.5 rounded-xl border text-xs" />
          <div className="flex justify-end gap-3"><Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button type="submit" variant="primary">Create Department</Button></div>
        </form>
      </Modal>
    </div>
  );
}
