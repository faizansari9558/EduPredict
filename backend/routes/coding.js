const express = require('express');
const router = express.Router();
const codingController = require('../controllers/codingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// ==========================================
// STUDENT ROUTES
// ==========================================

// Student: Browse all published coding challenges
router.get('/challenges', authenticateToken, authorizeRoles('student', 'teacher', 'admin'), codingController.getStudentChallenges);

// Student & Teacher: Run code interactively (sandbox test)
router.post('/:problemId/run', authenticateToken, codingController.runCode);

// Student: Submit solution for autograding
router.post('/:problemId/submit', authenticateToken, authorizeRoles('student'), codingController.submitCode);

// Student: Get submission history for a problem
router.get('/:problemId/submissions', authenticateToken, codingController.getSubmissions);

// Single submission details with test case results
router.get('/submissions/:submissionId', authenticateToken, codingController.getSubmissionDetails);

// ==========================================
// TEACHER & ADMIN ROUTES
// ==========================================

// Teacher: Create problem
router.post('/', authenticateToken, authorizeRoles('teacher', 'admin'), codingController.createCodingProblem);

// Teacher: List problems authored by teacher (or all for admin)
router.get('/', authenticateToken, authorizeRoles('teacher', 'admin'), codingController.getCodingProblems);

// Teacher & Student: Get single problem details
router.get('/:problemId', authenticateToken, codingController.getCodingProblemDetails);

// Teacher: Update problem metadata
router.patch('/:problemId', authenticateToken, authorizeRoles('teacher', 'admin'), codingController.updateCodingProblem);

// Teacher: Toggle problem publish status
router.patch('/:problemId/publish', authenticateToken, authorizeRoles('teacher', 'admin'), codingController.togglePublishProblem);

// Teacher: Delete problem
router.delete('/:problemId', authenticateToken, authorizeRoles('teacher', 'admin'), codingController.deleteCodingProblem);

// ==========================================
// TEST CASES & TEMPLATES
// ==========================================

// Add test case
router.post('/:problemId/testcases', authenticateToken, authorizeRoles('teacher', 'admin'), codingController.addTestCase);

// Get test cases
router.get('/:problemId/testcases', authenticateToken, codingController.getTestCases);

// Update test case
router.patch('/testcases/:testcaseId', authenticateToken, authorizeRoles('teacher', 'admin'), codingController.updateTestCase);

// Delete test case
router.delete('/testcases/:testcaseId', authenticateToken, authorizeRoles('teacher', 'admin'), codingController.deleteTestCase);

// Set constraints
router.post('/:problemId/constraints', authenticateToken, authorizeRoles('teacher', 'admin'), codingController.setConstraints);

// Set code template for language
router.post('/:problemId/template/:language', authenticateToken, authorizeRoles('teacher', 'admin'), codingController.setCodeTemplate);

// Teacher: View all student submissions for a problem
router.get('/:problemId/submissions/all', authenticateToken, authorizeRoles('teacher', 'admin'), codingController.getAllProblemSubmissions);

// Teacher: Autograde or Regrade submission
router.post('/:problemId/autograde', authenticateToken, authorizeRoles('teacher', 'admin'), codingController.autogradeSubmission);

module.exports = router;
