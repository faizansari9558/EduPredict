const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');
const documentReviewController = require('../controllers/documentReviewController');

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
    },
    download() {
      this.downloaded = true;
    }
  };
}

test('teacher document downloads are department-scoped and reject paths outside uploads', async () => {
  const originalQuery = db.query;
  let query = '';
  let params = [];
  db.query = async (sql, values) => {
    query = sql;
    params = values;
    return [[{
      stored_path: 'controllers/documentReviewController.js',
      file_name: 'certificate.pdf'
    }]];
  };
  const response = createResponse();
  const nextErrors = [];

  try {
    await documentReviewController.download({
      params: { itemId: '4' },
      user: { id: 15 }
    }, response, (error) => nextErrors.push(error));
  } finally {
    db.query = originalQuery;
  }

  assert.match(query, /JOIN teachers t ON t\.department_id=s\.department_id/i);
  assert.match(query, /WHERE doc\.id=\? AND t\.user_id=\?/i);
  assert.deepEqual(params, ['4', 15]);
  assert.equal(response.statusCode, 404);
  assert.equal(response.downloaded, undefined);
  assert.deepEqual(nextErrors, []);
});
