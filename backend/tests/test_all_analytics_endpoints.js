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

async function runAllAnalyticsTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  console.log('================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE ANALYTICS API TEST SUITE (13 Endpoints)');
  console.log('================================================================\n');

  const studentToken = generateToken(5, 'aisha.khan@edupredict.local', 'student');
  const teacherToken = generateToken(2, 'sharma@edupredict.local', 'teacher');
  const adminToken = generateToken(1, 'admin@edupredict.local', 'admin');

  let passed = 0;
  let failed = 0;

  async function apiCall(endpoint, token) {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const body = await res.json();
    return { status: res.status, body };
  }

  async function testEndpoint(name, testFn) {
    try {
      await testFn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   → Details: ${err.message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // 1. STUDENT ANALYTICS ENDPOINTS
  // -------------------------------------------------------------
  console.log('--- [1/4] Testing Student Analytics Endpoints ---');

  await testEndpoint('GET /api/analytics/student/:studentId (Student Overview)', async () => {
    const res = await apiCall('/api/analytics/student/5', studentToken);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
    if (typeof res.body.data.overall_score === 'undefined') {
      throw new Error('Missing overall_score in response');
    }
  });

  await testEndpoint('GET /api/analytics/student/:studentId/assessments (Assessment Trends)', async () => {
    const res = await apiCall('/api/analytics/student/5/assessments', studentToken);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
    if (!Array.isArray(res.body.data.assessments)) {
      throw new Error('assessments is not an array');
    }
  });

  await testEndpoint('GET /api/analytics/student/:studentId/skills (Skill Proficiency)', async () => {
    const res = await apiCall('/api/analytics/student/5/skills', studentToken);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
    if (!Array.isArray(res.body.data.skills)) {
      throw new Error('skills is not an array');
    }
  });

  await testEndpoint('GET /api/analytics/student/:studentId/weaknesses (Weaknesses & Recommendations)', async () => {
    const res = await apiCall('/api/analytics/student/5/weaknesses', studentToken);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
    if (!Array.isArray(res.body.data.weaknesses) || !Array.isArray(res.body.data.strengths)) {
      throw new Error('weaknesses or strengths is not an array');
    }
  });

  // -------------------------------------------------------------
  // 2. TEACHER ANALYTICS ENDPOINTS
  // -------------------------------------------------------------
  console.log('\n--- [2/4] Testing Teacher Analytics Endpoints ---');

  await testEndpoint('GET /api/analytics/teacher/:teacherId/class-summary (Class Summary)', async () => {
    const res = await apiCall('/api/analytics/teacher/2/class-summary', teacherToken);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  });

  await testEndpoint('GET /api/analytics/teacher/:teacherId/at-risk (At-Risk Students)', async () => {
    const res = await apiCall('/api/analytics/teacher/2/at-risk', teacherToken);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
    if (!Array.isArray(res.body.data.at_risk_students)) {
      throw new Error('at_risk_students is not an array');
    }
  });

  await testEndpoint('GET /api/analytics/teacher/:teacherId/assessments/:assessmentId (Assessment Analytics)', async () => {
    const res = await apiCall('/api/analytics/teacher/2/assessments/1', teacherToken);
    if (res.status !== 200 && res.status !== 404) {
      throw new Error(`Unexpected status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  });

  // -------------------------------------------------------------
  // 3. DEPARTMENT ANALYTICS ENDPOINTS
  // -------------------------------------------------------------
  console.log('\n--- [3/4] Testing Department Analytics Endpoints ---');

  await testEndpoint('GET /api/analytics/department/:departmentId (Department Overview)', async () => {
    const res = await apiCall('/api/analytics/department/1', adminToken);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  });

  await testEndpoint('GET /api/analytics/department/:departmentId/batches (Department Batch Comparison)', async () => {
    const res = await apiCall('/api/analytics/department/1/batches', adminToken);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
    if (!Array.isArray(res.body.data.batches)) {
      throw new Error('batches is not an array');
    }
  });

  await testEndpoint('GET /api/analytics/department/:departmentId/skills (Department Skill Distribution)', async () => {
    const res = await apiCall('/api/analytics/department/1/skills', adminToken);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  });

  // -------------------------------------------------------------
  // 4. ADMIN ANALYTICS ENDPOINTS
  // -------------------------------------------------------------
  console.log('\n--- [4/4] Testing Admin Analytics Endpoints ---');

  await testEndpoint('GET /api/analytics/admin/system-overview (Admin System Overview)', async () => {
    const res = await apiCall('/api/analytics/admin/system-overview', adminToken);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  });

  await testEndpoint('GET /api/analytics/admin/departments (Admin Department Comparison)', async () => {
    const res = await apiCall('/api/analytics/admin/departments', adminToken);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
    if (!Array.isArray(res.body.data.departments)) {
      throw new Error('departments is not an array');
    }
  });

  await testEndpoint('GET /api/analytics/admin/placement-readiness (Admin Placement Readiness)', async () => {
    const res = await apiCall('/api/analytics/admin/placement-readiness', adminToken);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  });

  server.close();

  console.log('\n================================================================');
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed out of 13 Endpoints`);
  console.log('================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runAllAnalyticsTests().catch(e => { console.error(e); process.exit(1); });
