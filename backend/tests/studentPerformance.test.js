const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const studentControllerSource = fs.readFileSync(
  path.join(__dirname, '../controllers/studentController.js'),
  'utf8'
);
const predictionControllerSource = fs.readFileSync(
  path.join(__dirname, '../controllers/predictionController.js'),
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

function loadStudentController(queryResults) {
  const module = { exports: {} };
  const queries = [];
  vm.runInNewContext(studentControllerSource, {
    module,
    exports: module.exports,
    __dirname: path.join(__dirname, '../controllers'),
    console: { error() {} },
    require(name) {
      if (name === 'path') return path;
      if (name === 'fs/promises') return fs.promises;
      if (name === 'crypto') return require('node:crypto');
      if (name === '../config/db') {
        return {
          async query(sql, params) {
            queries.push({ sql, params });
            return [queryResults.shift() || []];
          }
        };
      }
      throw new Error(`Unexpected dependency: ${name}`);
    }
  });
  return { controller: module.exports, queries };
}

function loadPredictionController({ aptitude, coding }) {
  const module = { exports: {} };
  const queries = [];
  let predictionCallCount = 0;
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('FROM students s')) {
        return [[{
          user_id: 41,
          cgpa: 8.2,
          tenth_percentage: 90,
          twelfth_percentage: 88,
          backlogs_count: 0,
          profile_completion_pct: 75
        }]];
      }
      if (sql.includes('FROM skill_proficiency')) return [[{ count: 4 }]];
      if (sql.includes('FROM student_portfolio_items')) {
        return [[{ num_projects: 2, num_certifications: 1, num_internships: 0 }]];
      }
      if (sql.includes('AS aptitude_score')) return [[aptitude]];
      if (sql.includes('AS coding_score')) return [[coding]];
      return [{ affectedRows: 1 }];
    }
  };
  const mlService = {
    async predictAndExplain(features) {
      predictionCallCount += 1;
      return {
        prediction: {
          placement_probability_pct: 73,
          placement_tier: 'Dream',
          readiness_status: 'Good Readiness',
          estimated_package_lpa: 8.2,
          confidence_score: 0.73,
          model_used: 'Test model'
        },
        explanation: { positive_drivers: [], risk_blockers: [], actionable_recommendations: [] },
        receivedFeatures: features
      };
    }
  };

  vm.runInNewContext(predictionControllerSource, {
    module,
    exports: module.exports,
    console: { error() {}, warn() {} },
    require(name) {
      if (name === '../config/db') return pool;
      if (name === '../services/mlService') return mlService;
      throw new Error(`Unexpected dependency: ${name}`);
    }
  });
  return { controller: module.exports, queries, getPredictionCallCount: () => predictionCallCount };
}

test('student results are empty when the signed-in student has no completed assessments', async () => {
  const { controller, queries } = loadStudentController([[], []]);
  const response = createResponse();

  await controller.getStudentResults({ user: { id: 41 } }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(Array.from(response.body.data.results), []);
  assert.deepEqual({ ...response.body.data.summary }, {
    completed_assessments: 0,
    coding_submissions: 0,
    average_score: null,
    best_score: null
  });
  assert.equal(queries[0].params[0], 41);
  assert.equal(queries[1].params[0], 41);
});

test('student results use only submitted records and calculate rank from actual cohort scores', async () => {
  const { controller, queries } = loadStudentController([
    [{
      id: 14,
      assessment_id: 3,
      title: 'Aptitude Assessment',
      assessment_type: 'aptitude',
      submitted_at: new Date('2026-01-03T00:00:00Z'),
      score: 80,
      max_score: 100
    }],
    [{
      id: 77,
      problem_id: 5,
      title: 'Coding Challenge',
      difficulty_level: 'easy',
      score: 75,
      submitted_at: new Date('2026-01-04T00:00:00Z')
    }],
    [
      { assessment_id: 3, student_user_id: 41, best_score: 80 },
      { assessment_id: 3, student_user_id: 42, best_score: 90 },
      { assessment_id: 3, student_user_id: 43, best_score: 50 }
    ],
    [
      { problem_id: 5, student_user_id: 41, best_score: 75 },
      { problem_id: 5, student_user_id: 42, best_score: 50 }
    ]
  ]);
  const response = createResponse();

  await controller.getStudentResults({ user: { id: 41 } }, response);

  const [codingResult, assessmentResult] = response.body.data.results;
  assert.equal(response.statusCode, 200);
  assert.equal(codingResult.rank, 1);
  assert.equal(codingResult.cohort_size, 2);
  assert.equal(codingResult.percentile, 100);
  assert.equal(assessmentResult.rank, 2);
  assert.equal(assessmentResult.cohort_size, 3);
  assert.equal(assessmentResult.percentile, 67);
  assert.equal(response.body.data.summary.average_score, 77.5);
  assert.equal(response.body.data.summary.best_score, 80);
  assert.equal(queries[0].params[0], 41);
  assert.equal(queries[1].params[0], 41);
});

test('student rank is not reported until another student has a completed result to compare', async () => {
  const { controller } = loadStudentController([
    [{
      id: 14,
      assessment_id: 3,
      title: 'Aptitude Assessment',
      assessment_type: 'aptitude',
      submitted_at: new Date('2026-01-03T00:00:00Z'),
      score: 80,
      max_score: 100
    }],
    [],
    [{ assessment_id: 3, student_user_id: 41, best_score: 80 }]
  ]);
  const response = createResponse();

  await controller.getStudentResults({ user: { id: 41 } }, response);

  assert.equal(response.body.data.results[0].rank, null);
  assert.equal(response.body.data.results[0].percentile, null);
  assert.equal(response.body.data.results[0].cohort_size, 1);
});

test('placement analysis does not run without the student’s completed aptitude and coding assessments', async () => {
  const { controller, getPredictionCallCount } = loadPredictionController({
    aptitude: { aptitude_score: null, completed_assessments: 0 },
    coding: { coding_score: null, completed_assessments: 0 }
  });
  const response = createResponse();

  await controller.getStudentPlacementPrediction({ user: { id: 41 }, params: {} }, response);

  assert.equal(response.statusCode, 422);
  assert.match(response.body.message, /aptitude and coding assessments/);
  assert.deepEqual(Array.from(response.body.missing), [
    'a completed aptitude assessment',
    'a graded coding assessment'
  ]);
  assert.equal(getPredictionCallCount(), 0);
});

test('placement analysis sends this student’s scored tests and verified portfolio counts to the model', async () => {
  const { controller, queries, getPredictionCallCount } = loadPredictionController({
    aptitude: { aptitude_score: 84.5, completed_assessments: 2 },
    coding: { coding_score: 76, completed_assessments: 3 }
  });
  const response = createResponse();

  await controller.getStudentPlacementPrediction({ user: { id: 41 }, params: {} }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(getPredictionCallCount(), 1);
  assert.equal(response.body.data.features_evaluated.aptitude_score, 84.5);
  assert.equal(response.body.data.features_evaluated.coding_score, 76);
  assert.equal(response.body.data.features_evaluated.num_projects, 2);
  assert.equal(response.body.data.features_evaluated.num_certifications, 1);
  assert.equal(queries.some((query) => query.params?.[0] === 41), true);
});
