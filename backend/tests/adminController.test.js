const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');
const { createUser, getAllUsers, getDashboardOverview } = require('../controllers/adminController');

function createResponse() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
}

test('admin dashboard overview reads its summary from database aggregates', async () => {
  const originalQuery = db.query;
  let dashboardQuery = '';
  db.query = async (query) => {
    dashboardQuery = query;
    return [[{
      total_students: 2,
      total_teachers: 0,
      total_departments: 6,
      pending_verifications: 1,
      total_assessments: 0,
      students_with_metrics: 0,
      placement_ready_students: 0
    }]];
  };
  const req = { user: { role: 'admin' } };
  const res = {
    json(payload) {
      return payload;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };

  let payload;
  try {
    payload = await getDashboardOverview(req, res);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(payload.success, true);
  assert.match(dashboardQuery, /FROM departments/i);
  assert.match(dashboardQuery, /FROM students WHERE verification_status = 'pending'/i);
  assert.doesNotMatch(dashboardQuery, /CROSS JOIN/i);
  assert.equal(payload.data.summary.totalStudents, 2);
  assert.equal(payload.data.summary.totalTeachers, 0);
  assert.equal(payload.data.summary.totalDepartments, 6);
  assert.equal(payload.data.summary.pendingVerifications, 1);
  assert.equal(payload.data.summary.placementReadyPct, null);
  assert.ok(Array.isArray(payload.data.alerts));
});

test('admin directory returns registered accounts and only unconsumed identity records', async () => {
  const originalQuery = db.query;
  const queries = [];
  db.query = async (query) => {
    queries.push(query);
    if (query.includes('FROM users u')) {
      return [[{
        id: 1,
        email: 'registered@university.example',
        full_name: 'Registered User',
        user_id_number: 'STU-1',
        role: 'student',
        status: 'active',
        record_status: 'registered'
      }]];
    }
    if (query.includes('FROM institutional_identity_records i')) {
      return [[{
        id: 'identity-2',
        email: 'pending@university.example',
        full_name: 'Pending User',
        user_id_number: 'STU-2',
        role: 'student',
        status: 'preauthorized',
        record_status: 'preauthorized'
      }]];
    }
    throw new Error(`Unexpected query: ${query}`);
  };
  const res = createResponse();

  try {
    await getAllUsers({ query: {} }, res);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(res.payload.success, true);
  assert.equal(res.payload.data.length, 2);
  assert.ok(queries.some((query) => /WHERE i\.consumed_user_id IS NULL/i.test(query)));
});

test('admin provisions a student identity only when the department and batch match', async () => {
  const originalGetConnection = db.getConnection;
  const queries = [];
  let committed = false;
  let rolledBack = false;
  db.getConnection = async () => ({
    async beginTransaction() {},
    async commit() { committed = true; },
    async rollback() { rolledBack = true; },
    release() {},
    async query(sql) {
      queries.push(sql);
      if (sql.includes('FROM users')) return [[], []];
      if (sql.includes('FROM institutional_identity_records')) return [[], []];
      if (sql.includes('FROM departments')) return [[{ id: 7, name: 'Computer Science' }], []];
      if (sql.includes('FROM batches')) return [[{ id: 2, name: '2025' }], []];
      if (sql.includes('INSERT INTO institutional_identity_records')) return [{ insertId: 42 }, []];
      if (sql.includes('INSERT INTO audit_logs')) return [{ affectedRows: 1 }, []];
      throw new Error(`Unexpected query: ${sql}`);
    }
  });
  const req = {
    user: { id: 1 },
    body: {
      fullName: 'A Student',
      email: 'student@university.example',
      userIdNumber: 'STU-42',
      role: 'student',
      departmentId: 7,
      batchId: 2
    }
  };
  const res = createResponse();

  try {
    await createUser(req, res);
  } finally {
    db.getConnection = originalGetConnection;
  }

  assert.equal(res.statusCode, 201);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.data.id, 42);
  assert.equal(committed, true);
  assert.equal(rolledBack, false);
  assert.ok(queries.some((sql) => sql.includes('INSERT INTO audit_logs')));
});

test('admin rejects a student batch that belongs to another department', async () => {
  const originalGetConnection = db.getConnection;
  let rolledBack = false;
  db.getConnection = async () => ({
    async beginTransaction() {},
    async commit() {},
    async rollback() { rolledBack = true; },
    release() {},
    async query(sql) {
      if (sql.includes('FROM users')) return [[], []];
      if (sql.includes('FROM institutional_identity_records')) return [[], []];
      if (sql.includes('FROM departments')) return [[{ id: 7, name: 'Computer Science' }], []];
      if (sql.includes('FROM batches')) return [[], []];
      throw new Error(`Unexpected query: ${sql}`);
    }
  });
  const res = createResponse();

  try {
    await createUser({
      user: { id: 1 },
      body: {
        fullName: 'A Student',
        email: 'student@university.example',
        userIdNumber: 'STU-42',
        role: 'student',
        departmentId: 7,
        batchId: 8
      }
    }, res);
  } finally {
    db.getConnection = originalGetConnection;
  }

  assert.equal(res.statusCode, 400);
  assert.match(res.payload.message, /batch does not belong/i);
  assert.equal(rolledBack, true);
});

test('admin rejects a duplicate institutional identity', async () => {
  const originalGetConnection = db.getConnection;
  db.getConnection = async () => ({
    async beginTransaction() {},
    async commit() {},
    async rollback() {},
    release() {},
    async query(sql) {
      if (sql.includes('FROM users')) return [[], []];
      if (sql.includes('FROM institutional_identity_records')) return [[{ id: 9 }], []];
      throw new Error(`Unexpected query: ${sql}`);
    }
  });
  const res = createResponse();

  try {
    await createUser({
      user: { id: 1 },
      body: {
        fullName: 'A Student',
        email: 'student@university.example',
        userIdNumber: 'STU-42',
        role: 'student',
        departmentId: 7,
        batchId: 2
      }
    }, res);
  } finally {
    db.getConnection = originalGetConnection;
  }

  assert.equal(res.statusCode, 409);
  assert.match(res.payload.message, /already exists/i);
});
