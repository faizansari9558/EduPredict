const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');
const { hashPassword } = require('../utils/password');
const authController = require('../controllers/authController');

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

function createConnection(identityRecord, calls) {
  return {
    async beginTransaction() {},
    async commit() {},
    async rollback() {},
    release() {},
    async query(sql, params) {
      calls.push({ sql, params });
      if (sql.includes('FROM institutional_identity_records i')) return [[identityRecord]];
      if (sql.includes('FROM auth_otp_challenges')) return [[{ id: 8 }]];
      if (sql.includes('INSERT INTO users')) return [{ insertId: 42 }];
      if (sql.includes('INSERT INTO teachers')) return [{ insertId: 5 }];
      return [{ affectedRows: 1 }];
    }
  };
}

test('teacher registration creates the department profile from the institutional record', async () => {
  const originalGetConnection = db.getConnection;
  const calls = [];
  const identityRecord = {
    id: 3,
    role_id: 2,
    role_name: 'teacher',
    email: 'faculty@university.example',
    user_id_number: 'EMP-12',
    full_name: 'Faculty Member',
    department_id: 7,
    batch_id: null
  };
  db.getConnection = async () => createConnection(identityRecord, calls);
  const response = createResponse();

  try {
    await authController.register({
      body: {
        email: identityRecord.email,
        userIdNumber: identityRecord.user_id_number,
        fullName: identityRecord.full_name,
        password: 'valid-password',
        verificationToken: 'verified-token',
        role: 'admin',
        department: 'Untrusted department'
      }
    }, response);
  } finally {
    db.getConnection = originalGetConnection;
  }

  const teacherInsert = calls.find(({ sql }) => sql.includes('INSERT INTO teachers'));
  assert.equal(response.statusCode, 201);
  assert.deepEqual(teacherInsert.params, [42, 7, 'EMP-12']);
});

test('teacher registration rejects institutional identities without a department', async () => {
  const originalGetConnection = db.getConnection;
  const calls = [];
  const identityRecord = {
    id: 3,
    role_id: 2,
    role_name: 'teacher',
    email: 'faculty@university.example',
    user_id_number: 'EMP-12',
    full_name: 'Faculty Member',
    department_id: null,
    batch_id: null
  };
  db.getConnection = async () => createConnection(identityRecord, calls);
  const response = createResponse();

  try {
    await authController.register({
      body: {
        email: identityRecord.email,
        userIdNumber: identityRecord.user_id_number,
        fullName: identityRecord.full_name,
        password: 'valid-password',
        verificationToken: 'verified-token'
      }
    }, response);
  } finally {
    db.getConnection = originalGetConnection;
  }

  assert.equal(response.statusCode, 409);
  assert.equal(calls.some(({ sql }) => sql.includes('INSERT INTO users')), false);
  assert.equal(calls.some(({ sql }) => sql.includes('INSERT INTO teachers')), false);
});

test('legacy teacher login repairs its missing profile from the consumed institutional record', async () => {
  const originalQuery = db.query;
  const originalSecret = process.env.JWT_SECRET;
  const calls = [];
  const passwordHash = await hashPassword('valid-password');
  process.env.JWT_SECRET = 'test-only-secret';
  db.query = async (sql, params) => {
    calls.push({ sql, params });
    if (sql.includes('FROM users u JOIN roles r')) {
      return [[{ id: 42, email: 'faculty@university.example', password_hash: passwordHash, role_name: 'teacher' }]];
    }
    if (sql.includes('SELECT id FROM teachers WHERE user_id = ?')) return [[]];
    if (sql.includes('FROM institutional_identity_records')) {
      return [[{ department_id: 7, user_id_number: 'EMP-12' }]];
    }
    if (sql.includes('INSERT INTO teachers')) return [{ insertId: 5 }];
    throw new Error(`Unexpected login query: ${sql}`);
  };
  const response = createResponse();

  try {
    await authController.login({
      body: { email: 'faculty@university.example', password: 'valid-password' }
    }, response);
  } finally {
    db.query = originalQuery;
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  }

  const teacherInsert = calls.find(({ sql }) => sql.includes('INSERT INTO teachers'));
  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.user.role, 'teacher');
  assert.deepEqual(teacherInsert.params, [42, 7, 'EMP-12']);
});

test('legacy teacher login fails clearly when the institutional record has no department', async () => {
  const originalQuery = db.query;
  const originalSecret = process.env.JWT_SECRET;
  const passwordHash = await hashPassword('valid-password');
  process.env.JWT_SECRET = 'test-only-secret';
  db.query = async (sql) => {
    if (sql.includes('FROM users u JOIN roles r')) {
      return [[{ id: 42, email: 'faculty@university.example', password_hash: passwordHash, role_name: 'teacher' }]];
    }
    if (sql.includes('SELECT id FROM teachers WHERE user_id = ?')) return [[]];
    if (sql.includes('FROM institutional_identity_records')) return [[]];
    throw new Error(`Unexpected login query: ${sql}`);
  };
  const response = createResponse();

  try {
    await authController.login({
      body: { email: 'faculty@university.example', password: 'valid-password' }
    }, response);
  } finally {
    db.query = originalQuery;
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  }

  assert.equal(response.statusCode, 409);
  assert.match(response.payload.message, /official department assignment/i);
});
