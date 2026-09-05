import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminAnalytics from './AdminAnalytics';

const statCards = [
  { label: 'Registered Students', value: '1,284', tone: 'blue' },
  { label: 'Faculty Members', value: '118', tone: 'green' },
  { label: 'Departments', value: '12', tone: 'purple' },
  { label: 'Pending Reviews', value: '23', tone: 'amber' }
];

const recentAlerts = [
  'Student document verification pending for 8 records.',
  'Assessment results for Batch 2025-A are ready to publish.',
  '2 teacher assignments need department approval.'
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'departments') {
      fetchDepartments();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setUsers(data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStudents(data.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('edupredict-token');
      const response = await fetch('http://localhost:5000/api/admin/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setDepartments(data.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-dashboard">
      <div className="page-header">
        <div>
          <span className="eyebrow">Admin Console</span>
          <h1>Institution Overview</h1>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((card) => (
          <div className={`stat-card ${card.tone}`} key={card.label}>
            <p>{card.label}</p>
            <h3>{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics & Rankings
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Students
        </button>
        <button
          className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          Departments
        </button>
      </div>

      {activeTab === 'analytics' && <AdminAnalytics />}

      {activeTab === 'overview' && (
        <div className="panel-grid">
          <div className="info-panel">
            <h2>Recent Alerts</h2>
            <ul>
              {recentAlerts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="info-panel">
            <h2>Quick Actions</h2>
            <div className="action-stack">
              <button type="button" onClick={() => setActiveTab('analytics')}>📊 View Institutional Analytics</button>
              <button type="button" onClick={() => setActiveTab('users')}>Manage User Roles</button>
              <button type="button" onClick={() => setActiveTab('students')}>Verify Student Records</button>
              <button type="button" onClick={() => setActiveTab('departments')}>View Department Metrics</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="data-panel">
          <h2>User Management</h2>
          {loading ? (
            <p>Loading users...</p>
          ) : users.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.full_name}</td>
                    <td>{u.role}</td>
                    <td><span className={`badge ${u.status}`}>{u.status}</span></td>
                    <td>{u.phone_number || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No users found.</p>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="data-panel">
          <h2>Student Management</h2>
          {loading ? (
            <p>Loading students...</p>
          ) : students.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Enrollment</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Verification</th>
                  <th>CGPA</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.enrollment_number}</td>
                    <td>{s.full_name}</td>
                    <td>{s.email}</td>
                    <td>{s.department}</td>
                    <td><span className={`badge ${s.verification_status}`}>{s.verification_status}</span></td>
                    <td>{s.cgpa || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No students found.</p>
          )}
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="data-panel">
          <h2>Department Management</h2>
          {loading ? (
            <p>Loading departments...</p>
          ) : departments.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Head ID</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.code}</td>
                    <td>{d.head_user_id || '—'}</td>
                    <td>{new Date(d.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No departments found.</p>
          )}
        </div>
      )}
    </section>
  );
}
