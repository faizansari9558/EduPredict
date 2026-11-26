const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const resumeParser = require('../services/resumeParser');

const controllerSource = fs.readFileSync(
  path.join(__dirname, '../controllers/resumeController.js'),
  'utf8'
);
const serviceSource = fs.readFileSync(
  path.join(__dirname, '../services/resumeService.js'),
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

function loadController({ extractedText = '', parserError = null } = {}) {
  const module = { exports: {} };
  const calls = [];
  const operations = [];
  const transaction = { committed: false, rolledBack: false, released: false };
  const connection = {
    async beginTransaction() {},
    async query(sql, params) {
      calls.push({ sql, params });
      return [{ insertId: 71 }];
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
  const db = {
    async getConnection() {
      return connection;
    }
  };
  const resumeService = {
    async analyzeResume(...args) {
      calls.push({ analysisArgs: args });
      return { ats_score: 42, ats_grade: 'C (Needs Improvement)' };
    }
  };
  const resumeParser = {
    async extractResumeText(file) {
      if (parserError) throw parserError;
      return `${extractedText}:${file.originalname}`;
    }
  };
  const fileSystem = {
    async mkdir(...args) {
      operations.push(['mkdir', ...args]);
    },
    async writeFile(...args) {
      operations.push(['writeFile', ...args]);
    },
    async unlink(...args) {
      operations.push(['unlink', ...args]);
    }
  };

  vm.runInNewContext(controllerSource, {
    module,
    exports: module.exports,
    __dirname: path.join(__dirname, '../controllers'),
    console: { error() {} },
    require(name) {
      if (name === 'crypto') return crypto;
      if (name === 'fs/promises') return fileSystem;
      if (name === 'path') return path;
      if (name === '../config/db') return db;
      if (name === '../services/resumeParser') return resumeParser;
      if (name === '../services/resumeService') return resumeService;
      throw new Error(`Unexpected dependency: ${name}`);
    }
  });

  return { controller: module.exports, calls, operations, transaction };
}

function loadResumeService() {
  const module = { exports: {} };
  vm.runInNewContext(serviceSource, {
    module,
    exports: module.exports,
    console: { warn() {} },
    require(name) {
      if (name === '../config/db') {
        return {
          async query() {
            return [[]];
          }
        };
      }
      throw new Error(`Unexpected dependency: ${name}`);
    }
  });
  return module.exports;
}

test('pasted resume text is analyzed for the selected role and job description', async () => {
  const { controller, calls } = loadController();
  const response = createResponse();
  const resumeText = 'My resume has skills and experience.';

  await controller.analyzeResume({
    user: { id: 41 },
    body: {
      resume_text: resumeText,
      target_role: 'Web Development',
      job_description: 'React and CSS engineer'
    }
  }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(Array.from(calls[0].analysisArgs), [41, resumeText, 'Web Development', 'React and CSS engineer']);
  assert.deepEqual(Array.from(response.body.data.input_sources), ['typed_text']);
  assert.equal(response.body.data.uploaded_resume, null);
});

test('uploaded resume and typed text are analyzed together and the file is stored for that student', async () => {
  const { controller, calls, operations, transaction } = loadController({ extractedText: 'extracted content' });
  const response = createResponse();

  await controller.analyzeResume({
    user: { id: 41 },
    body: { resume_text: 'pasted content', target_role: 'Software Development' },
    file: {
      originalname: 'candidate.docx',
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: Buffer.from('docx')
    }
  }, response);

  const analysisArgs = calls.find((call) => call.analysisArgs).analysisArgs;
  assert.equal(response.statusCode, 200);
  assert.match(analysisArgs[1], /pasted content/);
  assert.match(analysisArgs[1], /extracted content:candidate\.docx/);
  assert.deepEqual(Array.from(response.body.data.input_sources), ['typed_text', 'uploaded_file']);
  assert.equal(response.body.data.uploaded_resume.document_id, 71);
  assert.equal(calls.find((call) => call.sql).params[0], 41);
  assert.equal(transaction.committed, true);
  assert.equal(transaction.released, true);
  assert.equal(operations.some(([operation]) => operation === 'writeFile'), true);
});

test('resume analysis rejects missing or unreadable resume content', async () => {
  const empty = loadController();
  const emptyResponse = createResponse();
  await empty.controller.analyzeResume({ user: { id: 41 }, body: {} }, emptyResponse);
  assert.equal(emptyResponse.statusCode, 400);
  assert.equal(empty.calls.length, 0);

  const unreadable = loadController({ parserError: new Error('Invalid PDF file.') });
  const unreadableResponse = createResponse();
  await unreadable.controller.analyzeResume({
    user: { id: 41 },
    body: {},
    file: { originalname: 'resume.pdf' }
  }, unreadableResponse);
  assert.equal(unreadableResponse.statusCode, 400);
  assert.equal(unreadableResponse.body.message, 'Invalid PDF file.');
  assert.equal(unreadable.calls.length, 0);
});

test('resume parser extracts TXT and DOCX text and rejects PDFs with invalid signatures', async () => {
  const text = 'Experienced software developer with Python and React experience.';
  assert.equal(await resumeParser.extractResumeText({
    originalname: 'resume.txt',
    buffer: Buffer.from(text, 'utf8')
  }), text);

  const docxPath = path.join(__dirname, '../node_modules/mammoth/test/test-data/single-paragraph.docx');
  const docxText = await resumeParser.extractResumeText({
    originalname: 'resume.docx',
    buffer: await fs.promises.readFile(docxPath)
  });
  assert.ok(docxText.trim().length > 0);

  await assert.rejects(
    resumeParser.extractResumeText({ originalname: 'resume.pdf', buffer: Buffer.from('not a pdf') }),
    /invalid or corrupted/
  );
});

test('ATS score and job-description keyword coverage reflect actual resume content', async () => {
  const resumeService = loadResumeService();
  const resumeText = [
    'Contact: alex@example.com',
    'Education: Bachelor of Computer Science',
    'Experience: developed a web service using Go and Kubernetes',
    'Skills: Go, Kubernetes',
    'Projects: automated deployment and reduced response time by 30%',
    'Certifications: Kubernetes administration'
  ].join('\n');

  const analysis = await resumeService.analyzeResume(
    41,
    resumeText,
    'Software Development',
    'Seeking an engineer with Go and Kubernetes experience'
  );

  assert.equal(analysis.keyword_analysis.source, 'job_description');
  assert.deepEqual(Array.from(analysis.keyword_analysis.matched_keywords), ['go', 'kubernetes']);
  assert.equal(analysis.keyword_analysis.coverage_percent, 100);
  assert.equal(analysis.ats_score < 100, true);
  assert.equal(analysis.score_breakdown.section_completeness.score, 40);
  assert.equal(analysis.score_breakdown.keyword_match.score, 30);

  const sparseAnalysis = await resumeService.analyzeResume(41, 'A short resume with basic skills.', 'Software Development');
  assert.equal(analysis.ats_score > sparseAnalysis.ats_score, true);
});
