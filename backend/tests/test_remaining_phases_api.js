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

async function testRemainingPhasesAPI() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  console.log('================================================================');
  console.log('🧪 TESTING PHASES 13-16: RESUME AI, CAREER AI, ALERTS & REPORTS');
  console.log('================================================================\n');

  const studentToken = generateToken(5, 'aisha.khan@edupredict.local', 'student');
  const teacherToken = generateToken(2, 'sharma@edupredict.local', 'teacher');

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
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    return { status: res.status, data };
  }

  // 1. Phase 13: Resume AI & ATS Analyzer
  try {
    const sampleResume = `
      Aisha Khan - Software Engineer
      Email: aisha@example.com | GitHub: github.com/aisha | LinkedIn: linkedin.com/in/aisha
      
      EDUCATION
      B.Tech in Computer Science and Engineering | CGPA: 8.8 / 10.0
      
      TECHNICAL SKILLS
      Languages: JavaScript, Python, C++, SQL
      Frameworks & Tools: React, Node.js, Express, Docker, Git, REST API
      
      EXPERIENCE & PROJECTS
      Full-Stack EduPredict Platform:
      - Engineered scalable student analytics portal reducing query latency by 45%.
      - Architected multi-language sandbox code execution runner serving 500+ daily requests.
      - Developed responsive dashboards using React and CSS Grid.
      
      CERTIFICATIONS
      - AWS Certified Cloud Practitioner
      - Meta Front-End Developer Specialization
    `;

    const res = await apiCall('/api/student/resume/analyze', 'POST', {
      resume_text: sampleResume,
      target_role: 'Software Development'
    });

    if (res.status === 200 && res.data.success && res.data.data.ats_score > 70) {
      console.log(`✅ PASS: POST /api/student/resume/analyze (ATS Score: ${res.data.data.ats_score} - ${res.data.data.ats_grade})`);
      passed++;
    } else {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    console.error('❌ FAIL: Resume AI ->', err.message);
    failed++;
  }

  // 2. Phase 14: Career AI Chat, Mock Interview, Roadmap, Cover Letter
  try {
    const chatRes = await apiCall('/api/career-ai/chat', 'POST', {
      message: 'How should I prepare for upcoming tech interviews?'
    });
    const mockRes = await apiCall('/api/career-ai/mock-questions', 'POST', {
      role: 'Software Engineer',
      difficulty: 'Medium'
    });
    const roadmapRes = await apiCall('/api/career-ai/roadmap', 'POST', {
      target_goal: 'Full-Stack Developer'
    });
    const coverRes = await apiCall('/api/career-ai/cover-letter', 'POST', {
      company_name: 'Google',
      job_title: 'Software Development Engineer'
    });

    if (
      chatRes.status === 200 && chatRes.data.success &&
      mockRes.status === 200 && mockRes.data.data.questions?.length === 5 &&
      roadmapRes.status === 200 && roadmapRes.data.data.milestones?.length === 3 &&
      coverRes.status === 200 && coverRes.data.data.letter_text
    ) {
      console.log('✅ PASS: POST /api/career-ai (Chat, Mock Questions, Roadmap, Cover Letter)');
      passed++;
    } else {
      throw new Error('Career AI endpoints verification failed');
    }
  } catch (err) {
    console.error('❌ FAIL: Career AI ->', err.message);
    failed++;
  }

  // 3. Phase 15: Notifications & Alerts
  try {
    const getRes = await apiCall('/api/notifications', 'GET');
    const readAllRes = await apiCall('/api/notifications/read-all', 'PUT');

    if (
      getRes.status === 200 && getRes.data.success &&
      Array.isArray(getRes.data.data.notifications) &&
      readAllRes.status === 200 && readAllRes.data.success
    ) {
      console.log(`✅ PASS: /api/notifications (Retrieved ${getRes.data.data.notifications.length} alerts & marked read)`);
      passed++;
    } else {
      throw new Error('Notifications verification failed');
    }
  } catch (err) {
    console.error('❌ FAIL: Notifications ->', err.message);
    failed++;
  }

  // 4. Phase 16: Reports & CSV Export
  try {
    const scoreRes = await apiCall('/api/reports/student/5/scorecard', 'GET');
    const csvRes = await apiCall('/api/reports/batch/1/export', 'GET', null, teacherToken);

    if (
      scoreRes.status === 200 && scoreRes.data.success && scoreRes.data.data.placement_forecast &&
      csvRes.status === 200 && typeof csvRes.data === 'string' && csvRes.data.includes('Student ID')
    ) {
      console.log('✅ PASS: /api/reports (Scorecard JSON & Batch Performance CSV export verified)');
      passed++;
    } else {
      throw new Error('Reports verification failed');
    }
  } catch (err) {
    console.error('❌ FAIL: Reports & Exports ->', err.message);
    failed++;
  }

  server.close();

  console.log('\n================================================================');
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed out of 4 Feature Areas`);
  console.log('================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

testRemainingPhasesAPI().catch(e => { console.error(e); process.exit(1); });
