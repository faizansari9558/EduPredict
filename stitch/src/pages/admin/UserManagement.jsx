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

  const [users, setUsers] = useState([
    { id: 1, name: 'Admin User', email: 'admin@edupredict.local', userIdNumber: 'ADMIN001', role: 'admin', department: 'Institutional Administration', status: 'active', joined: 'Aug 2021' },
    { id: 2, name: 'Dr. Sharma', email: 'sharma@edupredict.local', userIdNumber: 'PROF001', role: 'teacher', department: 'Computer Science', status: 'active', joined: 'Jan 2018' },
    { id: 3, name: 'Prof. Patel', email: 'patel@edupredict.local', userIdNumber: 'PROF002', role: 'teacher', department: 'Information Tech', status: 'active', joined: 'Jul 2019' },
    { id: 4, name: 'Prof. Gupta', email: 'gupta@edupredict.local', userIdNumber: 'PROF003', role: 'teacher', department: 'Electronics & Comm', status: 'active', joined: 'Sep 2020' },
    { id: 5, name: 'Aisha Khan', email: 'aisha.khan@edupredict.local', userIdNumber: 'STU001', role: 'student', department: 'Computer Science', status: 'active', joined: 'Aug 2021' },
    { id: 6, name: 'Raj Patel', email: 'raj.patel@edupredict.local', userIdNumber: 'STU002', role: 'student', department: 'Computer Science', status: 'active', joined: 'Aug 2021' },
    { id: 7, name: 'Priya Sharma', email: 'priya.sharma@edupredict.local', userIdNumber: 'STU003', role: 'student', department: 'Information Tech', status: 'active', joined: 'Aug 2022' },
    { id: 8, name: 'Arjun Gupta', email: 'arjun.gupta@edupredict.local', userIdNumber: 'STU004', role: 'student', department: 'Electronics & Comm', status: 'active', joined: 'Aug 2022' },
    { id: 9, name: 'Neha Singh', email: 'neha.singh@edupredict.local', userIdNumber: 'STU005', role: 'student', department: 'Computer Science', status: 'active', joined: 'Aug 2023' }
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    userIdNumber: '',
    role: 'student',
    department: 'Computer Science',
    phoneNumber: ''
  });

  const [bulkCsvText, setBulkCsvText] = useState(
`Full Name,Official Email,University User ID,Role,Department
Faizan Ansari,faizan.ansari@university.edu,21CS042,student,Computer Science
Dr. Rajesh Sharma,faculty.sharma@university.edu,EMP-9021,teacher,Computer Science
Ananya Roy,ananya.roy@university.edu,21IT089,student,Information Tech
Prof. Meera Kulkarni,m.kulkarni@university.edu,EMP-7714,teacher,Information Tech
Rohan Gupta,rohan.gupta@university.edu,21EC015,student,Electronics & Comm`
  );
  const [bulkFile, setBulkFile] = useState(null);

  // Fetch users on load
  const loadUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map(u => ({
          id: u.id,
          name: u.full_name || u.name || 'User',
          email: u.email,
          userIdNumber: u.user_id_number || u.userIdNumber || `ID-${u.id}`,
          role: u.role || 'student',
          department: u.department || 'Computer Science',
          status: u.status || 'active',
          joined: 'Active Record'
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.warn('Using seeded user directory:', err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.userIdNumber) return;

    setLoading(true);
    try {
      await adminApi.createUser({
        fullName: newUser.name,
        email: newUser.email,
        userIdNumber: newUser.userIdNumber,
        role: newUser.role,
        department: newUser.department,
        phoneNumber: newUser.phoneNumber
      });

      const user = {
        id: Date.now(),
        name: newUser.name,
        email: newUser.email,
        userIdNumber: newUser.userIdNumber,
        role: newUser.role,
        department: newUser.department,
        status: 'active',
        joined: 'Just now'
      };

      setUsers([user, ...users]);
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', userIdNumber: '', role: 'student', department: 'Computer Science', phoneNumber: '' });
      setNotification({ message: `Record created! ${newUser.name} (${newUser.userIdNumber}) is now eligible to register or login.`, type: 'success' });
    } catch (err) {
      setNotification({ message: 'Failed to provision user: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkCsvText.trim()) return;

    setLoading(true);
    try {
      const lines = bulkCsvText.trim().split('\n');
      const parsedUsers = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || (i === 0 && line.toLowerCase().includes('email'))) continue; // skip header
        const parts = line.split(',').map(s => s.trim());
        if (parts.length >= 3) {
          parsedUsers.push({
            fullName: parts[0],
            email: parts[1],
            userIdNumber: parts[2],
            role: parts[3] ? parts[3].toLowerCase() : 'student',
            department: parts[4] || 'Computer Science'
          });
        }
      }

      if (!parsedUsers.length) {
        alert('No valid rows found in CSV data.');
        setLoading(false);
        return;
      }

      if (bulkFile) {
        await adminApi.bulkImportUsers(bulkFile);
      } else {
        await adminApi.bulkImportUsers(parsedUsers);
      }

      const newRecords = parsedUsers.map((u, idx) => ({
        id: Date.now() + idx,
        name: u.fullName,
        email: u.email,
        userIdNumber: u.userIdNumber,
        role: u.role,
        department: u.department,
        status: 'active',
        joined: 'Imported Batch'
      }));

      setUsers([...newRecords, ...users]);
      setIsBulkModalOpen(false);
      setBulkFile(null);
      setNotification({ message: `Successfully imported ${parsedUsers.length} student and faculty admission records into the database!`, type: 'success' });
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
      label: 'Department',
      render: (_, row) => <span className="text-xs text-on-surface font-medium">{row.department || '—'}</span>
    },
    {
      key: 'status',
      label: 'Account Status',
      render: (_, row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System Directory &amp; Admission Records"
        title="University Identity &amp; User Governance"
        subtitle="Manage pre-authorized university records for students, faculty mentors, and administrators"
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

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
      />

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
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface text-on-surface"
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
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface text-on-surface"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Tech">Information Tech</option>
                <option value="Electronics & Comm">Electronics &amp; Comm</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-[11px] text-on-surface-variant">
            💡 <strong>Note:</strong> Once provisioned, the user can verify their Official Email &amp; University ID on the <a href="/register" target="_blank" rel="noreferrer" className="text-primary font-bold underline">Registration Page</a> or sign in directly with their credentials.
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
            Upload an Excel workbook (.xlsx) or CSV with columns: <code>Full Name, Official Email, University User ID, Role, Department</code>. You may also paste CSV rows below.
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
            ✅ <strong>Direct Database Integration:</strong> All imported student and faculty records are immediately registered in MySQL and enabled for Phase 1 verification (Email + ID &rarr; OTP &rarr; Password).
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
