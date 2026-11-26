const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const controllerSource = fs.readFileSync(
  path.join(__dirname, '../controllers/studentController.js'),
  'utf8'
);

function loadController(db, fileSystem) {
  const module = { exports: {} };
  vm.runInNewContext(controllerSource, {
    module,
    exports: module.exports,
    __dirname: path.join(__dirname, '../controllers'),
    Buffer,
    URL,
    console: { error() {} },
    require(name) {
      if (name === 'path') return path;
      if (name === 'fs/promises') return fileSystem;
      if (name === 'crypto') return crypto;
      if (name === '../config/db') return db;
      throw new Error(`Unexpected dependency: ${name}`);
    }
  });
  return module.exports;
}

function createResponse() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

function createFileSystem() {
  const operations = [];
  return {
    operations,
    async readFile() {
      return Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    },
    async mkdir(...args) {
      operations.push(['mkdir', ...args]);
    },
    async rename(...args) {
      operations.push(['rename', ...args]);
    },
    async unlink(...args) {
      operations.push(['unlink', ...args]);
    }
  };
}

function createDatabase() {
  const queries = [];
  const transaction = { committed: false, rolledBack: false, released: false };
  const connection = {
    async beginTransaction() {},
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.startsWith('SELECT id FROM students')) return [[{ id: 8 }]];
      if (sql.startsWith('INSERT INTO documents')) return [{ insertId: 99 }];
      return [{ affectedRows: 1 }];
    },
    async commit() {
      transaction.committed = true;
    },
    async rollback() {
      transaction.rolledBack = true;
    },
    release() {
      transaction.released = true;
    }
  };
  return {
    queries,
    transaction,
    async getConnection() {
      return connection;
    }
  };
}

function createSkillDatabase(existingRows = []) {
  const queries = [];
  return {
    queries,
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.startsWith('SELECT id FROM skill_proficiency')) return [existingRows];
      if (sql.startsWith('INSERT INTO skill_proficiency')) return [{ insertId: 17 }];
      return [[{
        id: 17,
        category: 'Programming',
        name: 'Python',
        score: 0,
        attempts: 0,
        level: 'Not assessed'
      }]];
    }
  };
}

function createPortfolioDatabase() {
  const queries = [];
  const transaction = { committed: false, rolledBack: false, released: false };
  const query = async (sql, params) => {
    queries.push({ sql, params });
    if (sql.startsWith('INSERT INTO documents')) return [{ insertId: 99 }];
    return [{ insertId: 55 }];
  };
  const connection = {
    beginTransaction: async () => {},
    query,
    async commit() {
      transaction.committed = true;
    },
    async rollback() {
      transaction.rolledBack = true;
    },
    release() {
      transaction.released = true;
    }
  };
  return {
    queries,
    transaction,
    query,
    async getConnection() {
      return connection;
    }
  };
}

function createDashboardDatabase({ student, counts, verifiedDocs = 0, assessments = [] }) {
  const queries = [];
  return {
    queries,
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('FROM students s')) return [[student]];
      if (sql.includes('AS skill_count')) return [[counts]];
      if (sql.includes('AS verified_count')) return [[{ verified_count: verifiedDocs }]];
      if (sql.includes('FROM assessments')) return [assessments];
      throw new Error(`Unexpected dashboard query: ${sql}`);
    }
  };
}

test('academic scores above their allowed range are rejected without database changes', async () => {
  const fileSystem = createFileSystem();
  const db = createDatabase();
  const controller = loadController(db, fileSystem);
  const file = { path: 'temp-score.png', originalname: 'score.png', mimetype: 'image/png' };
  const response = createResponse();

  await controller.updateAcademicRecords({
    user: { id: 41 },
    body: { cgpa: '10.01' },
    files: { cgpa_document: [file] }
  }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(db.queries.length, 0);
  assert.deepEqual(fileSystem.operations, [['unlink', 'temp-score.png']]);
});

test('academic values cannot be submitted without their matching document', async () => {
  const fileSystem = createFileSystem();
  const db = createDatabase();
  const controller = loadController(db, fileSystem);
  const response = createResponse();

  await controller.updateAcademicRecords({
    user: { id: 41 },
    body: { tenth_percentage: '92.5' },
    files: {}
  }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(db.queries.length, 0);
});

test('academic values and documents are stored for the authenticated student', async () => {
  const fileSystem = createFileSystem();
  const db = createDatabase();
  const controller = loadController(db, fileSystem);
  const response = createResponse();

  await controller.updateAcademicRecords({
    user: { id: 41 },
    body: { cgpa: '9.25' },
    files: {
      cgpa_document: [{
        path: 'temp-score.png',
        originalname: 'score.png',
        mimetype: 'image/png'
      }]
    }
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.values.cgpa, 9.25);
  assert.equal(db.queries[0].params[0], 41);
  assert.equal(db.queries[1].params[db.queries[1].params.length - 1], 41);
  assert.equal(db.queries[2].params[0], 41);
  assert.equal(db.queries[2].params[1], 'Academic Record - Cumulative GPA');
  assert.equal(db.transaction.committed, true);
  assert.equal(db.transaction.released, true);
  assert.equal(fileSystem.operations.some(([operation]) => operation === 'rename'), true);
});

test('new skills are stored only as unassessed data for the signed-in student', async () => {
  const db = createSkillDatabase();
  const controller = loadController(db, createFileSystem());
  const response = createResponse();

  await controller.createSkill({
    user: { id: 41 },
    body: { name: ' Python ', category: ' Programming ', score: 95, verified: true }
  }, response);

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.data.name, 'Python');
  assert.equal(response.body.data.score, 0);
  assert.equal(response.body.data.level, 'Not assessed');
  assert.deepEqual(Array.from(db.queries[0].params), [41, 'Programming', 'Python']);
  assert.deepEqual(Array.from(db.queries[1].params), [41, 'Programming', 'Python']);
});

test('duplicate skills return a conflict instead of adding a duplicate card', async () => {
  const db = createSkillDatabase([{ id: 17 }]);
  const controller = loadController(db, createFileSystem());
  const response = createResponse();

  await controller.createSkill({
    user: { id: 41 },
    body: { name: 'Python', category: 'Programming' }
  }, response);

  assert.equal(response.statusCode, 409);
  assert.equal(db.queries.length, 1);
});

test('overlong skill names and categories are rejected', async () => {
  const db = createSkillDatabase();
  const controller = loadController(db, createFileSystem());
  const nameResponse = createResponse();

  await controller.createSkill({
    user: { id: 41 },
    body: { name: 'x'.repeat(151), category: 'Programming' }
  }, nameResponse);

  assert.equal(nameResponse.statusCode, 400);
  assert.equal(db.queries.length, 0);

  const categoryResponse = createResponse();
  await controller.createSkill({
    user: { id: 41 },
    body: { name: 'Python', category: 'x'.repeat(101) }
  }, categoryResponse);

  assert.equal(categoryResponse.statusCode, 400);
  assert.equal(db.queries.length, 0);
});

test('projects are saved for the signed-in student with only approved project fields', async () => {
  const db = createPortfolioDatabase();
  const controller = loadController(db, createFileSystem());
  const response = createResponse();

  await controller.createPortfolioItem({
    user: { id: 41 },
    params: { itemType: 'project' },
    body: {
      title: ' Student Portal ',
      role: 'Developer',
      description: 'Built a portal.',
      technologies: [' React ', 'Node.js'],
      githubUrl: 'https://github.com/student/portal',
      liveUrl: 'https://portal.example.com',
      status: 'verified',
      student_id: 999
    }
  }, response);

  assert.equal(response.statusCode, 201);
  assert.equal(db.queries.length, 1);
  assert.equal(db.queries[0].params[0], 41);
  assert.equal(db.queries[0].params[1], 'project');
  assert.deepEqual(JSON.parse(db.queries[0].params[2]), {
    title: 'Student Portal',
    role: 'Developer',
    description: 'Built a portal.',
    technologies: ['React', 'Node.js'],
    githubUrl: 'https://github.com/student/portal',
    liveUrl: 'https://portal.example.com/'
  });
  assert.equal(response.body.data.status, 'pending');
});

test('projects reject unsafe links and invalid required details', async () => {
  const db = createPortfolioDatabase();
  const controller = loadController(db, createFileSystem());

  const unsafeLinkResponse = createResponse();
  await controller.createPortfolioItem({
    user: { id: 41 },
    params: { itemType: 'project' },
    body: { title: 'Portal', githubUrl: 'javascript:alert(1)' }
  }, unsafeLinkResponse);

  assert.equal(unsafeLinkResponse.statusCode, 400);
  assert.equal(db.queries.length, 0);

  const missingTitleResponse = createResponse();
  await controller.createPortfolioItem({
    user: { id: 41 },
    params: { itemType: 'project' },
    body: { githubUrl: 'https://github.com/student/portal' }
  }, missingTitleResponse);

  assert.equal(missingTitleResponse.statusCode, 400);
  assert.equal(db.queries.length, 0);
});

test('certifications and internships store their proof documents with the authenticated portfolio record', async () => {
  const submissions = [
    {
      itemType: 'certification',
      body: {
        title: 'Cloud Fundamentals',
        issuer: 'Cloud Academy',
        credentialId: 'CERT-2025',
        issueDate: '2025-01-15',
        expiryDate: '2027-01-15',
        skills: 'Cloud, Security',
        url: 'https://certs.example.com/verify/1',
        status: 'verified'
      },
      expectedPayload: {
        title: 'Cloud Fundamentals',
        issuer: 'Cloud Academy',
        credentialId: 'CERT-2025',
        issueDate: '2025-01-15',
        expiryDate: '2027-01-15',
        skills: ['Cloud', 'Security'],
        url: 'https://certs.example.com/verify/1'
      }
    },
    {
      itemType: 'internship',
      body: {
        company: 'Example Labs',
        role: 'Software Intern',
        location: 'Remote',
        duration: '3 months',
        type: 'Summer Internship',
        stipend: 'Paid',
        description: 'Built an internal dashboard.',
        skills: 'React, APIs',
        startDate: '2025-06-01',
        endDate: '2025-08-31'
      },
      expectedPayload: {
        company: 'Example Labs',
        role: 'Software Intern',
        location: 'Remote',
        duration: '3 months',
        type: 'Summer Internship',
        stipend: 'Paid',
        description: 'Built an internal dashboard.',
        skills: ['React', 'APIs'],
        startDate: '2025-06-01',
        endDate: '2025-08-31'
      }
    }
  ];

  for (const submission of submissions) {
    const db = createPortfolioDatabase();
    const fileSystem = createFileSystem();
    const controller = loadController(db, fileSystem);
    const response = createResponse();

    await controller.createPortfolioItem({
      user: { id: 41 },
      params: { itemType: submission.itemType },
      body: submission.body,
      file: {
        path: `temp-${submission.itemType}.png`,
        originalname: 'certificate.png',
        mimetype: 'image/png'
      }
    }, response);

    assert.equal(response.statusCode, 201);
    assert.equal(db.queries.length, 2);
    assert.equal(db.queries[0].sql.startsWith('INSERT INTO documents'), true);
    assert.equal(db.queries[0].params[0], 41);
    assert.equal(db.queries[1].params[0], 41);
    assert.equal(db.queries[1].params[1], submission.itemType);
    assert.deepEqual(JSON.parse(db.queries[1].params[2]), {
      ...submission.expectedPayload,
      certificateDocumentId: 99,
      certificateFileName: 'certificate.png'
    });
    assert.equal(response.body.data.status, 'pending');
    assert.equal(db.transaction.committed, true);
    assert.equal(db.transaction.released, true);
    assert.equal(fileSystem.operations.some(([operation]) => operation === 'rename'), true);
  }
});

test('certificate uploads require a matching file and valid internship date range', async () => {
  const missingFileDb = createPortfolioDatabase();
  const missingFileController = loadController(missingFileDb, createFileSystem());
  const missingFileResponse = createResponse();

  await missingFileController.createPortfolioItem({
    user: { id: 41 },
    params: { itemType: 'certification' },
    body: { title: 'Cloud Fundamentals', issuer: 'Cloud Academy' }
  }, missingFileResponse);

  assert.equal(missingFileResponse.statusCode, 400);
  assert.equal(missingFileDb.queries.length, 0);

  const invalidDateDb = createPortfolioDatabase();
  const fileSystem = createFileSystem();
  const invalidDateController = loadController(invalidDateDb, fileSystem);
  const invalidDateResponse = createResponse();
  await invalidDateController.createPortfolioItem({
    user: { id: 41 },
    params: { itemType: 'internship' },
    body: {
      company: 'Example Labs',
      role: 'Intern',
      type: 'Summer Internship',
      startDate: '2025-08-01',
      endDate: '2025-06-01'
    },
    file: { path: 'temp-internship.png', originalname: 'certificate.png', mimetype: 'image/png' }
  }, invalidDateResponse);

  assert.equal(invalidDateResponse.statusCode, 400);
  assert.equal(invalidDateDb.queries.length, 0);
  assert.deepEqual(fileSystem.operations, [['unlink', 'temp-internship.png']]);

  const mismatchedFileDb = createPortfolioDatabase();
  const mismatchedFileSystem = createFileSystem();
  const mismatchedFileController = loadController(mismatchedFileDb, mismatchedFileSystem);
  const mismatchedFileResponse = createResponse();
  await mismatchedFileController.createPortfolioItem({
    user: { id: 41 },
    params: { itemType: 'certification' },
    body: { title: 'Cloud Fundamentals', issuer: 'Cloud Academy' },
    file: { path: 'temp-certification.pdf', originalname: 'certificate.pdf', mimetype: 'application/pdf' }
  }, mismatchedFileResponse);

  assert.equal(mismatchedFileResponse.statusCode, 400);
  assert.equal(mismatchedFileDb.queries.length, 0);
  assert.deepEqual(mismatchedFileSystem.operations, [['unlink', 'temp-certification.pdf']]);
});

test('dashboard profile completion reflects populated fields and submitted portfolio sections', async () => {
  const controllerFileSystem = createFileSystem();
  const partiallyCompleteDb = createDashboardDatabase({
    student: {
      full_name: 'Viraj Gandhi',
      email: 'viraj@example.com',
      enrollment_number: 'CS230',
      department: 'Computer Science',
      batch: 'CSE-2024-B1',
      cgpa: 8.2,
      tenth_percentage: null,
      twelfth_percentage: null,
      graduation_percentage: null
    },
    counts: { skill_count: 0, project_count: 0, certification_count: 0, internship_count: 0 }
  });
  const partiallyCompleteController = loadController(partiallyCompleteDb, controllerFileSystem);
  const partialResponse = createResponse();

  await partiallyCompleteController.getStudentDashboard({ user: { id: 41 } }, partialResponse);

  assert.equal(partialResponse.statusCode, 200);
  assert.equal(partialResponse.body.data.summary.profileCompletion, 46);
  assert.equal(partialResponse.body.data.summary.profileCompletionCompleted, 6);
  assert.equal(partialResponse.body.data.summary.profileCompletionTotal, 13);

  const completeDb = createDashboardDatabase({
    student: {
      full_name: 'Viraj Gandhi',
      email: 'viraj@example.com',
      enrollment_number: 'CS230',
      department: 'Computer Science',
      batch: 'CSE-2024-B1',
      cgpa: 8.2,
      tenth_percentage: 90,
      twelfth_percentage: 88,
      graduation_percentage: 85
    },
    counts: { skill_count: 1, project_count: 1, certification_count: 1, internship_count: 1 }
  });
  const completeController = loadController(completeDb, createFileSystem());
  const completeResponse = createResponse();

  await completeController.getStudentDashboard({ user: { id: 41 } }, completeResponse);

  assert.equal(completeResponse.body.data.summary.profileCompletion, 100);
  assert.equal(completeResponse.body.data.summary.profileCompletionCompleted, 13);
  assert.equal(completeResponse.body.data.summary.profileCompletionTotal, 13);
});
