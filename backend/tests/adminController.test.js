const test = require('node:test');
const assert = require('node:assert/strict');
const { getDashboardOverview } = require('../controllers/adminController');

test('admin dashboard overview returns real summary values', async () => {
  const req = { user: { role: 'admin' } };
  const res = {
    json(payload) {
      return payload;
    }
  };

  const payload = await getDashboardOverview(req, res);

  assert.equal(payload.success, true);
  assert.ok(payload.data.summary.totalStudents > 0);
  assert.ok(payload.data.summary.totalTeachers > 0);
  assert.ok(payload.data.summary.pendingVerifications >= 0);
  assert.ok(Array.isArray(payload.data.alerts));
});
