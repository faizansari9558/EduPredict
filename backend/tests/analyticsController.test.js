const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');
const {
  getSystemOverview,
  getDepartmentComparison,
  getPlacementReadiness,
  getStudentPerformanceDistribution,
  getAssessmentResultsDistribution,
  getAcademicTrends,
  getSkillsComparison
} = require('../controllers/analyticsController');

test('system overview preserves account and department totals when assessment tables are empty', async () => {
  const originalQuery = db.query;
  let overviewQuery = '';
  db.query = async (query) => {
    overviewQuery = query;
    return [[{
      total_students: 2,
      total_teachers: 0,
      total_admins: 1,
      total_departments: 6,
      total_assessments: 0,
      students_with_metrics: 0,
      system_avg_score: null,
      system_pass_rate: null,
      placement_ready_students: 0
    }]];
  };
  const res = {
    json(payload) {
      return payload;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };

  let payload;
  try {
    payload = await getSystemOverview({}, res);
  } finally {
    db.query = originalQuery;
  }

  assert.doesNotMatch(overviewQuery, /CROSS JOIN/i);
  assert.match(overviewQuery, /FROM departments/i);
  assert.match(overviewQuery, /FROM assessments/i);
  assert.equal(payload.data.total_students, 2);
  assert.equal(payload.data.total_departments, 6);
  assert.equal(payload.data.total_assessments, 0);
  assert.equal(payload.data.placement_ready_pct, null);
  assert.equal(payload.data.system_avg_score, null);
});

test('department comparison filters inactive students and leaves unmeasured outcomes unavailable', async () => {
  const originalQuery = db.query;
  let departmentQuery = '';
  db.query = async (query) => {
    departmentQuery = query;
    return [[{
      id: 1,
      name: 'Computing',
      student_count: 2,
      students_with_metrics: 0,
      avg_score: null,
      pass_rate: null,
      placement_ready_pct: null
    }]];
  };
  const res = {
    json(payload) {
      this.payload = payload;
      return payload;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };

  try {
    await getDepartmentComparison({}, res);
  } finally {
    db.query = originalQuery;
  }

  assert.match(departmentQuery, /u\.status = 'active'/i);
  assert.equal(res.payload.data.departments[0].student_count, 2);
  assert.equal(res.payload.data.departments[0].avg_score, null);
  assert.equal(res.payload.data.departments[0].placement_ready_pct, null);
});

test('placement readiness reports analyzed students separately from active enrollment', async () => {
  const originalQuery = db.query;
  let readinessQuery = '';
  db.query = async (query) => {
    readinessQuery = query;
    return [[{
      department_name: 'Computing',
      total_students: 3,
      analyzed_students: 1,
      ready_count: 1,
      ready_pct: 100,
      borderline_count: 0,
      not_ready_count: 0
    }]];
  };
  const res = {
    json(payload) {
      this.payload = payload;
      return payload;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };

  try {
    await getPlacementReadiness({}, res);
  } finally {
    db.query = originalQuery;
  }

  assert.match(readinessQuery, /COUNT\(DISTINCT sm\.student_id\) as analyzed_students/i);
  assert.equal(res.payload.data.placement_readiness[0].total_students, 3);
  assert.equal(res.payload.data.placement_readiness[0].analyzed_students, 1);
  assert.equal(res.payload.data.placement_readiness[0].ready_pct, 100);
});

test('student performance buckets use evaluated scores normalized by assessment maximum marks', async () => {
  const originalQuery = db.query;
  let performanceQuery = '';
  db.query = async (query) => {
    performanceQuery = query;
    return [[
      { band: '80-100', student_count: 2 },
      { band: '40-59', student_count: 1 }
    ]];
  };
  const res = {
    json(payload) {
      return payload;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };

  let payload;
  try {
    payload = await getStudentPerformanceDistribution({}, res);
  } finally {
    db.query = originalQuery;
  }

  assert.match(performanceQuery, /aa\.status = 'evaluated'/i);
  assert.match(performanceQuery, /a\.total_marks/i);
  assert.equal(payload.data.students_analyzed, 3);
  assert.deepEqual(payload.data.bands, [
    { band: '80-100', students: 2 },
    { band: '60-79', students: 0 },
    { band: '40-59', students: 1 },
    { band: '0-39', students: 0 }
  ]);
});

test('assessment result distribution reports only scored evaluated attempts', async () => {
  const originalQuery = db.query;
  let resultsQuery = '';
  db.query = async (query) => {
    resultsQuery = query;
    return [[{ passed_attempts: 7, needs_support_attempts: 3, evaluated_attempts: 10 }]];
  };
  const res = {
    json(payload) {
      return payload;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };

  let payload;
  try {
    payload = await getAssessmentResultsDistribution({}, res);
  } finally {
    db.query = originalQuery;
  }

  assert.match(resultsQuery, /score_percent >= 60/i);
  assert.equal(payload.data.passed_attempts, 7);
  assert.equal(payload.data.needs_support_attempts, 3);
  assert.equal(payload.data.evaluated_attempts, 10);
});

test('academic trends return monthly averages and attempt counts by assessment type', async () => {
  const originalQuery = db.query;
  let trendsQuery = '';
  db.query = async (query) => {
    trendsQuery = query;
    return [[{
      period: '2026-05',
      assessment_type: 'aptitude',
      average_score: '72.50',
      evaluated_attempts: 4
    }]];
  };
  const res = {
    json(payload) {
      return payload;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };

  let payload;
  try {
    payload = await getAcademicTrends({}, res);
  } finally {
    db.query = originalQuery;
  }

  assert.match(trendsQuery, /INTERVAL 11 MONTH/i);
  assert.equal(payload.data.monthly_trends[0].period, '2026-05');
  assert.equal(payload.data.monthly_trends[0].average_score, 72.5);
  assert.equal(payload.data.monthly_trends[0].evaluated_attempts, 4);
});

test('skills comparison excludes skills that have not been assessed', async () => {
  const originalQuery = db.query;
  let skillsQuery = '';
  db.query = async (query) => {
    skillsQuery = query;
    return [[{
      category: 'Programming',
      average_proficiency: '81.25',
      students_assessed: 5,
      skill_attempts: 14
    }]];
  };
  const res = {
    json(payload) {
      return payload;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };

  let payload;
  try {
    payload = await getSkillsComparison({}, res);
  } finally {
    db.query = originalQuery;
  }

  assert.match(skillsQuery, /sp\.attempts > 0/i);
  assert.equal(payload.data.categories[0].category, 'Programming');
  assert.equal(payload.data.categories[0].average_proficiency, 81.25);
  assert.equal(payload.data.categories[0].students_assessed, 5);
});
