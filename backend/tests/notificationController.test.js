const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const controllerSource = fs.readFileSync(
  path.join(__dirname, '../controllers/notificationController.js'),
  'utf8'
);

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

function loadController({ teacherRows = [], recipientRows = [] } = {}) {
  const module = { exports: {} };
  const queries = [];
  const sentNotifications = [];
  const db = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('FROM teachers')) return [teacherRows];
      return [recipientRows];
    }
  };
  const notificationService = {
    async createNotification(...args) {
      sentNotifications.push(args);
      return { id: 501, user_id: args[0], type: args[1], title: args[2], message: args[3] };
    },
    async getUserNotifications() {},
    async markAsRead() {},
    async markAllAsRead() {}
  };

  vm.runInNewContext(controllerSource, {
    module,
    exports: module.exports,
    console: { error() {} },
    require(name) {
      if (name === '../services/notificationService') return notificationService;
      if (name === '../config/db') return db;
      throw new Error(`Unexpected dependency: ${name}`);
    }
  });
  return { controller: module.exports, queries, sentNotifications };
}

test('teacher recipient search is scoped to the teacher department', async () => {
  const recipient = { id: 22, full_name: 'Student Example', enrollment_number: 'STU022' };
  const { controller, queries } = loadController({
    teacherRows: [{ department_id: 7 }],
    recipientRows: [recipient]
  });
  const response = createResponse();

  await controller.getStudentRecipients({
    user: { id: 10, role: 'teacher' },
    query: { search: 'Student' }
  }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(Array.from(response.body.data), [recipient]);
  assert.equal(queries[0].params[0], 10);
  assert.match(queries[1].sql, /s\.department_id = \?/);
  assert.deepEqual(Array.from(queries[1].params), [7, '%Student%', '%Student%', '%Student%', 100]);
});

test('teacher cannot send notifications to students outside the teacher department', async () => {
  const { controller, sentNotifications } = loadController({
    teacherRows: [{ department_id: 7 }],
    recipientRows: []
  });
  const response = createResponse();

  await controller.sendStudentNotification({
    user: { id: 10, role: 'teacher' },
    body: { studentId: 99, title: 'Reminder', message: 'Please review your assessment.' }
  }, response);

  assert.equal(response.statusCode, 404);
  assert.equal(sentNotifications.length, 0);
});

test('valid admin and teacher notifications are persisted for an active student', async () => {
  const student = { id: 22, full_name: 'Student Example' };
  const teacher = loadController({ teacherRows: [], recipientRows: [student] });
  const teacherResponse = createResponse();

  await teacher.controller.sendStudentNotification({
    user: { id: 10, role: 'teacher' },
    body: { studentId: '22', title: '  Assessment reminder  ', message: '  Submit by Friday.  ' }
  }, teacherResponse);

  assert.equal(teacherResponse.statusCode, 201);
  assert.deepEqual(Array.from(teacher.sentNotifications[0]), [
    22,
    'teacher_announcement',
    'Assessment reminder',
    'Submit by Friday.'
  ]);
  assert.equal(teacher.queries[0].params[0], 10);
  assert.equal(teacher.queries[0].params[1], 22);

  const admin = loadController({ recipientRows: [student] });
  const adminResponse = createResponse();
  await admin.controller.sendStudentNotification({
    user: { id: 1, role: 'admin' },
    body: { studentId: 22, title: 'Office notice', message: 'Please check the portal.' }
  }, adminResponse);

  assert.equal(adminResponse.statusCode, 201);
  assert.equal(admin.sentNotifications[0][1], 'admin_announcement');
  assert.equal(admin.sentNotifications[0][0], 22);
});

test('notification sending rejects empty or oversized content before database access', async () => {
  const { controller, queries, sentNotifications } = loadController();
  const response = createResponse();

  await controller.sendStudentNotification({
    user: { id: 1, role: 'admin' },
    body: { studentId: 22, title: '   ', message: 'Message' }
  }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(queries.length, 0);
  assert.equal(sentNotifications.length, 0);
});
