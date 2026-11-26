const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');
const teacherController = require('../controllers/teacherController');

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

test('teacher dashboard aggregates only active students in the teacher department', async () => {
  const originalQuery = db.query;
  const queries = [];
  db.query = async (sql, params) => {
    queries.push({ sql, params });
    if (sql.includes('FROM teachers t')) {
      return [[{ id: 3, department_id: 7, department: 'Computing' }]];
    }
    if (sql.includes('AS assigned_students')) {
      return [[{
        assigned_students: 4,
        pending_verifications: 1,
        average_cgpa: '8.25',
        analyzed_students: 2,
        placement_ready_students: 1,
        active_assessments: 3
      }]];
    }
    if (sql.includes('INNER JOIN batches b')) {
      return [[{ batch: '2022-2026', student_count: 4, average_cgpa: '8.25' }]];
    }
    if (sql.includes('FROM student_metrics sm')) {
      return [[{ batch: '2022-2026', analyzed_students: 2, average_readiness: '71.5', ready_students: 1 }]];
    }
    if (sql.includes("verification_status = 'pending'")) {
      return [[{ id: 9, full_name: 'Student Example', enrollment_number: 'STU009' }]];
    }
    throw new Error(`Unexpected dashboard query: ${sql}`);
  };

  const response = createResponse();
  try {
    await teacherController.getTeacherDashboard({ user: { id: 15 } }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.data.summary.assignedStudents, 4);
  assert.equal(response.payload.data.summary.placementReadyPct, 50);
  assert.equal(response.payload.data.teacher.department, 'Computing');
  assert.equal(response.payload.data.pendingVerifications.length, 1);
  const aggregate = queries.find(({ sql }) => sql.includes('AS assigned_students'));
  assert.match(aggregate.sql, /u\.status = 'active'/i);
  assert.deepEqual(aggregate.params, [15, 7]);
});

test('teacher roster is paginated and scoped to the authenticated teacher department', async () => {
  const originalQuery = db.query;
  let rosterQuery = '';
  let rosterParams = [];
  db.query = async (sql, params) => {
    if (sql.startsWith('SELECT department_id FROM teachers')) return [[{ department_id: 7 }]];
    if (sql.startsWith('SELECT COUNT(*) AS total')) return [[{ total: 1 }]];
    rosterQuery = sql;
    rosterParams = params;
    return [[{
      id: 2,
      full_name: 'Student Example',
      enrollment_number: 'STU002',
      skills_count: 3,
      projects_count: 1
    }]];
  };

  const response = createResponse();
  try {
    await teacherController.getTeacherStudents({
      user: { id: 15 },
      query: { limit: '9999', offset: '-1' }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.pagination.total, 1);
  assert.equal(response.payload.pagination.limit, 500);
  assert.equal(response.payload.pagination.offset, 0);
  assert.match(rosterQuery, /s\.department_id = \(SELECT department_id FROM teachers WHERE user_id = \?\)/i);
  assert.match(rosterQuery, /u\.status = 'active'/i);
  assert.deepEqual(rosterParams, [15, 500, 0]);
});

test('teacher result queries include only evaluated attempts from the teacher department', async () => {
  const originalQuery = db.query;
  const queries = [];
  db.query = async (sql, params) => {
    queries.push({ sql, params });
    if (sql.includes('FROM assessments a') && sql.includes('INNER JOIN teachers')) {
      return [[{ id: 4, total_marks: 50, department_id: 7 }]];
    }
    if (sql.includes('FROM assessment_attempts a')) {
      return [[{
        id: 10,
        enrollment_number: 'STU001',
        full_name: 'Student Example',
        score: 45,
        total_marks: 50,
        status: 'evaluated'
      }]];
    }
    throw new Error(`Unexpected result query: ${sql}`);
  };

  const response = createResponse();
  try {
    await teacherController.getAssessmentResults({
      user: { id: 15 },
      params: { assessmentId: '4' }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.data[0].score, 45);
  const resultsQuery = queries.find(({ sql }) => sql.includes('FROM assessment_attempts a'));
  assert.match(resultsQuery.sql, /s\.department_id = \?/i);
  assert.match(resultsQuery.sql, /a\.status = 'evaluated'/i);
  assert.deepEqual(resultsQuery.params, [50, '4', 7]);
});
