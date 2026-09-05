/**
 * Master Comprehensive End-to-End Test Suite (Phases 1 to 18)
 * Verifies all subsystems: Auth, RBAC, Admin, Teacher, Student, Assessments, Coding Arena, Analytics, ML, Resume AI, Career AI, Notifications, Reports
 */

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

async function runMasterE2ETests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  console.log('================================================================');
  console.log('🌟 MASTER SYSTEM-WIDE E2E TEST SUITE (PHASES 1 - 18)');
  console.log('================================================================\n');

  const adminToken = generateToken(1, 'admin@edupredict.local', 'admin');
  const teacherToken = generateToken(2, 'sharma@edupredict.local', 'teacher');
  const studentToken = generateToken(5, 'aisha.khan@edupredict.local', 'student');

  let passed = 0;
  let failed = 0;

  async function testEndpoint(name, endpoint, method = 'GET', body = null, token = studentToken, expectedStatus = 200) {
    try {
      const opts = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(`${baseUrl}${endpoint}`, opts);
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : await res.text();

      if (res.status === expectedStatus && (typeof data === 'string' || data.success !== false)) {
        console.log(`✅ PASS: [${name}] ${method} ${endpoint}`);
        passed++;
        return data;
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error(`❌ FAIL: [${name}] ${method} ${endpoint} ->`, err.message);
      failed++;
      return null;
    }
  }

  console.log('--- 1. Health & Core API ---');
  await testEndpoint('Health Check', '/api/health', 'GET', null, adminToken);
  await testEndpoint('API Status', '/api', 'GET', null, adminToken);

  console.log('\n--- 2. Portals & RBAC ---');
  await testEndpoint('Admin Dashboard', '/api/admin/dashboard', 'GET', null, adminToken);
  await testEndpoint('Teacher Dashboard', '/api/teacher/dashboard', 'GET', null, teacherToken);
  await testEndpoint('Student Dashboard', '/api/student/dashboard', 'GET', null, studentToken);

  console.log('\n--- 3. Assessment & Coding Engine ---');
  await testEndpoint('Teacher Assessments', '/api/assessments', 'GET', null, teacherToken);
  await testEndpoint('Coding Challenges', '/api/coding/challenges', 'GET', null, studentToken);

  console.log('\n--- 4. Analytics & At-Risk Engine ---');
  await testEndpoint('Student Overview', '/api/analytics/student/5', 'GET', null, studentToken);
  await testEndpoint('Student Skills', '/api/analytics/student/5/skills', 'GET', null, studentToken);
  await testEndpoint('Teacher Class Summary', '/api/analytics/teacher/2/class-summary', 'GET', null, teacherToken);
  await testEndpoint('At-Risk Students', '/api/analytics/teacher/2/at-risk', 'GET', null, teacherToken);
  await testEndpoint('Admin System Overview', '/api/analytics/admin/system-overview', 'GET', null, adminToken);
  await testEndpoint('Admin Placement Readiness', '/api/analytics/admin/placement-readiness', 'GET', null, adminToken);

  console.log('\n--- 5. ML Prediction & AI Explainability ---');
  await testEndpoint('ML Model Info', '/api/prediction/model-info', 'GET', null, adminToken);
  await testEndpoint('Student Prediction & Drivers', '/api/prediction/student/5', 'GET', null, studentToken);
  await testEndpoint('Batch Placement Forecast', '/api/prediction/batch/1', 'POST', {}, teacherToken);

  console.log('\n--- 6. Resume AI, Career Copilot, Alerts & Reports ---');
  await testEndpoint('Resume ATS Scan', '/api/student/resume/analyze', 'POST', {
    resume_text: 'Aisha Khan. B.Tech CSE. Skills: JavaScript, Python, React. Engineered analytics.',
    target_role: 'Software Development'
  }, studentToken);
  await testEndpoint('Career AI Chat', '/api/career-ai/chat', 'POST', { message: 'Interview prep roadmap' }, studentToken);
  await testEndpoint('Mock Interview Generator', '/api/career-ai/mock-questions', 'POST', { role: 'Software Engineer' }, studentToken);
  await testEndpoint('Skill Roadmap Generator', '/api/career-ai/roadmap', 'POST', { target_goal: 'Full-Stack Developer' }, studentToken);
  await testEndpoint('Cover Letter Generator', '/api/career-ai/cover-letter', 'POST', { company_name: 'Google', job_title: 'SDE' }, studentToken);
  await testEndpoint('Notification Inbox', '/api/notifications', 'GET', null, studentToken);
  await testEndpoint('Student Placement Scorecard', '/api/reports/student/5/scorecard', 'GET', null, studentToken);
  await testEndpoint('Batch CSV Performance Export', '/api/reports/batch/1/export', 'GET', null, teacherToken);

  console.log('\n--- 7. Placement Cell & Company Job Drives ---');
  await testEndpoint('List Placement Drives', '/api/job-drives', 'GET', null, studentToken);
  await testEndpoint('Apply to Placement Drive', '/api/job-drives/1/apply', 'POST', {}, studentToken);
  await testEndpoint('View Drive Candidates', '/api/job-drives/1/candidates', 'GET', null, teacherToken);
  await testEndpoint('Create Placement Drive', '/api/job-drives', 'POST', {
    company_name: 'Google LLC',
    job_title: 'Software Engineer (Early Career)',
    job_role: 'Software Engineering',
    package_lpa: 24.0,
    min_cgpa: 8.5,
    min_aptitude_score: 80.0,
    min_coding_score: 85.0,
    required_skills: ['Go', 'C++', 'Distributed Systems'],
    job_description: 'Build planet-scale infrastructure and distributed systems.'
  }, adminToken, 201);

  server.close();

  console.log('\n================================================================');
  console.log(`🏆 MASTER E2E TEST RESULTS: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runMasterE2ETests().catch(e => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
