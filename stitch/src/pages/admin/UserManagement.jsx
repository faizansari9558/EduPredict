import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { adminApi } from '../../services/api';

export default function UserManagement() {
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [directoryLoading, setDirectoryLoading] = useState(true);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    userIdNumber: '',
    role: 'student',
    departmentId: '',
    batchId: ''
  });

  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkFile, setBulkFile] = useState(null);

  const loadUsers = async () => {
    let loaded = false;
    try {
      const res = await adminApi.getUsers();
      const records = Array.isArray(res?.data) ? res.data : [];
      setUsers(records.map((user) => ({
        id: user.id,
        name: user.full_name || user.name || 'User',
        email: user.email,
        userIdNumber: user.user_id_number || user.userIdNumber || `ID-${user.id}`,
        role: user.role || 'student',
        department: user.department || '—',
        batch: user.batch || '',
        status: user.status || 'unknown',
        recordStatus: user.record_status,
        joined: user.record_status === 'preauthorized' ? 'Awaiting registration' : 'Registered'
      })));
      loaded = true;
    } catch (err) {
      setNotification({ message: `Unable to load university records: ${err.message}`, type: 'error' });
    } finally {
      setDirectoryLoading(false);
    }
    return loaded;
  };

  const loadDepartments = async () => {
    try {
      const response = await adminApi.getDepartments();
      setDepartments(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setNotification({ message: `Unable to load departments: ${err.message}`, type: 'error' });
    }
  };

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (newUser.role !== 'student' || !newUser.departmentId) {
      setBatches([]);
      setBatchesLoading(false);
      return;
    }

    let active = true;
    setBatchesLoading(true);
    adminApi.getBatches(newUser.departmentId)
      .then((response) => {
        if (active) setBatches(Array.isArray(response?.data) ? response.data : []);
      })
      .catch((err) => {
        if (active) {
          setBatches([]);
          setNotification({ message: `Unable to load batches: ${err.message}`, type: 'error' });
        }
      })
      .finally(() => {
        if (active) setBatchesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [newUser.role, newUser.departmentId]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.userIdNumber || !newUser.departmentId ||
        (newUser.role === 'student' && !newUser.batchId)) {
      setNotification({ message: 'Complete the identity, department, and required batch fields.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await adminApi.createUser({
        fullName: newUser.name,
        email: newUser.email,
        userIdNumber: newUser.userIdNumber,
        role: newUser.role,
        departmentId: Number(newUser.departmentId),
        batchId: newUser.role === 'student' ? Number(newUser.batchId) : null
      });
      const directoryLoaded = await loadUsers();
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', userIdNumber: '', role: 'student', departmentId: '', batchId: '' });
      setNotification({
        message: directoryLoaded
          ? response.message || 'Official identity record created. The user can now complete email OTP registration.'
          : 'Identity record created, but the directory could not refresh. Reload the page to confirm it.',
        type: directoryLoaded ? 'success' : 'error'
      });
    } catch (err) {
      setNotification({ message: `Failed to provision identity: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkFile && !bulkCsvText.trim()) {
      setNotification({ message: 'Choose a CSV/XLSX file or paste identity rows first.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const parsedUsers = [];
      if (!bulkFile) {
        const lines = bulkCsvText.trim().split(/\r?\n/);
        for (const [index, line] of lines.entries()) {
          if (!line.trim() || (index === 0 && line.toLowerCase().includes('email'))) continue;
          const parts = line.split(',').map((part) => part.trim());
          parsedUsers.push({
            fullName: parts[0],
            email: parts[1],
            userIdNumber: parts[2],
            role: parts[3] || 'student',
            department: parts[4] || '',
            batch: parts[5] || ''
          });
        }
      }

      const result = await adminApi.bulkImportUsers(bulkFile || parsedUsers);
      const directoryLoaded = await loadUsers();
      setIsBulkModalOpen(false);
      setBulkFile(null);
      setBulkCsvText('');
      const rejectedCount = result.rejected?.length || 0;
      const firstRejection = result.rejected?.[0];
      setNotification({
        message: `${result.importedCount || 0} identity record(s) created; ${rejectedCount} row(s) rejected.${firstRejection ? ` First issue: row ${firstRejection.row}: ${firstRejection.reason}` : ''}${directoryLoaded ? '' : ' The directory could not refresh; reload the page to confirm.'}`,
        type: directoryLoaded && result.importedCount ? 'success' : 'error'
      });
    } catch (err) {
      setNotification({ message: 'Bulk import failed: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.userIdNumber && u.userIdNumber.toLowerCase().includes(term));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      key: 'name',
      label: 'Full Name & Email',
      render: (_, row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.name}</div>
          <div className="text-xs text-on-surface-variant font-mono">{row.email}</div>
        </div>
      )
    },
    {
      key: 'userIdNumber',
      label: 'University User ID',
      render: (_, row) => (
        <span className="font-mono text-xs font-bold text-primary px-2 py-1 bg-surface-container rounded-lg border border-outline-variant/40">
          {row.userIdNumber}
        </span>
      )
    },
    {
      key: 'role',
      label: 'Assigned Role',
      render: (_, row) => (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
          row.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' :
          row.role === 'teacher' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' :
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
        }`}>
          {row.role}
        </span>
      )
    },
    {
      key: 'department',
      label: 'Department / Batch',
      render: (_, row) => (
        <div className="text-xs text-on-surface font-medium">
          <div>{row.department || '—'}</div>
          {row.batch && <div className="text-on-surface-variant">{row.batch}</div>}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Account Status',
      render: (_, row) => row.recordStatus === 'preauthorized'
        ? <StatusBadge status="pending" label="Awaiting registration" />
        : <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System Directory &amp; Admission Records"
        title="University Identity &amp; User Governance"
        subtitle="Manage official student and faculty identity records used during account registration"
        actions={
          <div className="flex gap-2.5">
            <Button variant="outline" icon="upload_file" onClick={() => setIsBulkModalOpen(true)}>
              Bulk Upload Records
            </Button>
            <Button variant="primary" icon="person_add" onClick={() => setIsModalOpen(true)}>
              Add Single Record
            </Button>
          </div>
        }
      />

      {/* Notification Banner */}
      {notification.message && (
        <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between ${
          notification.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              {notification.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ message: '', type: '' })} className="hover:opacity-75">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Filter & Search Controls */}
      <div className="bg-surface border border-outline-variant/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by Name, Email, or University ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface-container/30 text-on-surface"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-on-surface-variant">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface text-on-surface"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="student">Students</option>
            <option value="teacher">Faculty Mentors</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {directoryLoading
        ? <div className="rounded-2xl border border-outline-variant/30 bg-surface p-8 text-center text-sm text-on-surface-variant">Loading university records…</div>
        : <DataTable columns={columns} data={filtered} keyExtractor={(r) => r.id} />}

      {/* SINGLE RECORD MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision University Identity Record"
        size="md"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Dr. Jane Smith or Faizan Ansari"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface text-on-surface"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Official Email Address *
              </label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="e.g. j.smith@university.edu"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                University User ID / Roll No *
              </label>
              <input
                type="text"
                required
                value={newUser.userIdNumber}
                onChange={(e) => setNewUser({ ...newUser, userIdNumber: e.target.value })}
                placeholder="e.g. 21CS042 or EMP-9021"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Assigned Role
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value, batchId: '' })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface text-on-surface"
              >
                <option value="student">Student</option>
                <option value="teacher">Faculty Mentor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Department *
              </label>
              <select
                required
                value={newUser.departmentId}
                onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value, batchId: '' })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface text-on-surface"
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
            </div>
          </div>

          {newUser.role === 'student' && (
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Student Batch *
              </label>
              <select
                required
                value={newUser.batchId}
                onChange={(e) => setNewUser({ ...newUser, batchId: e.target.value })}
                disabled={!newUser.departmentId || batchesLoading || !batches.length}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface text-on-surface disabled:opacity-60"
              >
                <option value="">
                  {!newUser.departmentId ? 'Select a department first' : batchesLoading ? 'Loading batches…' : 'Select batch'}
                </option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>{batch.name}</option>
                ))}
              </select>
              {newUser.departmentId && !batchesLoading && !batches.length && (
                <p className="mt-1 text-[11px] text-rose-600">No batches are configured for this department.</p>
              )}
            </div>
          )}

          <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-[11px] text-on-surface-variant">
            <strong>Note:</strong> The person can use their official email and university ID to complete OTP registration after this record is provisioned. This does not create a login account or password.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Provisioning...' : 'Provision User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* BULK UPLOAD MODAL */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="⚡ Bulk Upload Admission Records (CSV)"
        size="lg"
      >
        <form onSubmit={handleBulkImport} className="space-y-4">
          <p className="text-xs text-on-surface-variant">
            Upload an Excel workbook (.xlsx) or CSV with columns: <code>Full Name, Official Email, University User ID, Role, Department, Batch</code>. Students require a department and batch; teachers require a department. You may also paste CSV rows below.
          </p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
            className="w-full text-xs"
          />

          <div>
            <textarea
              rows={8}
              value={bulkCsvText}
              onChange={(e) => setBulkCsvText(e.target.value)}
              className="w-full p-3.5 font-mono text-xs rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-on-surface"
            />
          </div>

          <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-[11px] text-on-surface-variant">
            <strong>Import behavior:</strong> Each row creates a validated institutional identity record. Existing or invalid rows are reported without overwriting existing records.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" type="button" onClick={() => setIsBulkModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" icon="upload_file" disabled={loading}>
              {loading ? 'Importing Batch...' : 'Import Records Now'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
