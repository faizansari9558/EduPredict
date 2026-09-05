const app = require('../app');
const jwt = require('jsonwebtoken');
const http = require('http');

function generateToken(id, email, role) {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET || 'development_secret',
    { expiresIn: '1h' }
  );
}

async function testPredictionAPI() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  console.log('================================================================');
  console.log('🧪 TESTING EXPRESS PREDICTION & ML INTEGRATION ENDPOINTS');
  console.log('================================================================\n');

  const studentToken = generateToken(5, 'aisha.khan@edupredict.local', 'student');
  const teacherToken = generateToken(2, 'sharma@edupredict.local', 'teacher');
  const adminToken = generateToken(1, 'admin@edupredict.local', 'admin');

  let passed = 0;
  let failed = 0;

  async function apiCall(endpoint, method = 'GET', body = null, token = studentToken) {
    const opts = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${baseUrl}${endpoint}`, opts);
    const data = await res.json();
    return { status: res.status, data };
  }

  // 1. Model Info
  try {
    const res = await apiCall('/api/prediction/model-info', 'GET', null, adminToken);
    if (res.status === 200 && res.data.success) {
      console.log('✅ PASS: GET /api/prediction/model-info');
      passed++;
    } else {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    console.error('❌ FAIL: GET /api/prediction/model-info ->', err.message);
    failed++;
  }

  // 2. Student Placement Prediction & Explainability
  try {
    const res = await apiCall('/api/prediction/student/5', 'GET', null, studentToken);
    if (res.status === 200 && res.data.success && res.data.data.prediction) {
      console.log('✅ PASS: GET /api/prediction/student/:studentId');
      console.log(`   → Prediction: ${res.data.data.prediction.placement_tier} (${res.data.data.prediction.placement_probability_pct}%)`);
      console.log(`   → Positive drivers count: ${res.data.data.explanation.positive_drivers.length}`);
      console.log(`   → Recommendations count: ${res.data.data.explanation.actionable_recommendations.length}`);
      passed++;
    } else {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    console.error('❌ FAIL: GET /api/prediction/student/:studentId ->', err.message);
    failed++;
  }

  // 3. Batch Placement Forecast
  try {
    const res = await apiCall('/api/prediction/batch/1', 'POST', {}, teacherToken);
    if (res.status === 200 && res.data.success && res.data.data.summary) {
      console.log('✅ PASS: POST /api/prediction/batch/:batchId');
      console.log(`   → Batch summary: ${res.data.data.summary.total_students} students, ${res.data.data.summary.placement_ready_pct}% placement ready`);
      passed++;
    } else {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    console.error('❌ FAIL: POST /api/prediction/batch/:batchId ->', err.message);
    failed++;
  }

  server.close();

  console.log('\n================================================================');
  console.log(`📊 PREDICTION API TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

testPredictionAPI().catch(e => { console.error(e); process.exit(1); });
