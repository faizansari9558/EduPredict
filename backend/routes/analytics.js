/**
 * Analytics Routes
 * All analytics endpoints for Student, Teacher, Department, and Admin dashboards
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

// ============================================================================
// STUDENT ANALYTICS ROUTES
// ============================================================================

/**
 * GET /api/analytics/student/:studentId
 * Get student performance overview (student only or teacher of this student)
 */
router.get('/student/:studentId', authenticateToken, analyticsController.getStudentPerformanceOverview);

/**
 * GET /api/analytics/student/:studentId/assessments
 * Get student assessment performance trends
 */
router.get('/student/:studentId/assessments', authenticateToken, analyticsController.getStudentAssessmentTrends);

/**
 * GET /api/analytics/student/:studentId/skills
 * Get student skill proficiency
 */
router.get('/student/:studentId/skills', authenticateToken, analyticsController.getStudentSkillProficiency);

/**
 * GET /api/analytics/student/:studentId/weaknesses
 * Get student weaknesses and recommendations
 */
router.get('/student/:studentId/weaknesses', authenticateToken, analyticsController.getStudentWeaknesses);

// ============================================================================
// TEACHER ANALYTICS ROUTES
// ============================================================================

/**
 * GET /api/analytics/teacher/:teacherId/class-summary
 * Get teacher class performance summary
 */
router.get('/teacher/:teacherId/class-summary', authenticateToken, analyticsController.getTeacherClassSummary);

/**
 * GET /api/analytics/teacher/:teacherId/at-risk
 * Get at-risk students for this teacher
 */
router.get('/teacher/:teacherId/at-risk', authenticateToken, analyticsController.getTeacherAtRiskStudents);

/**
 * GET /api/analytics/teacher/:teacherId/assessments/:assessmentId
 * Get detailed analytics for a specific assessment
 */
router.get('/teacher/:teacherId/assessments/:assessmentId', authenticateToken, analyticsController.getAssessmentAnalytics);

// ============================================================================
// DEPARTMENT ANALYTICS ROUTES
// ============================================================================

/**
 * GET /api/analytics/department/:departmentId
 * Get department performance overview
 */
router.get('/department/:departmentId', authenticateToken, analyticsController.getDepartmentOverview);

/**
 * GET /api/analytics/department/:departmentId/batches
 * Get batch performance comparison within department
 */
router.get('/department/:departmentId/batches', authenticateToken, analyticsController.getDepartmentBatchComparison);

/**
 * GET /api/analytics/department/:departmentId/skills
 * Get skill distribution across department
 */
router.get('/department/:departmentId/skills', authenticateToken, analyticsController.getDepartmentSkillDistribution);

// ============================================================================
// ADMIN ANALYTICS ROUTES
// ============================================================================

/**
 * GET /api/analytics/admin/system-overview
 * Get system-wide analytics (admin only)
 */
router.get('/admin/system-overview', authenticateToken, analyticsController.getSystemOverview);

/**
 * GET /api/analytics/admin/departments
 * Get comparative metrics for all departments (admin only)
 */
router.get('/admin/departments', authenticateToken, analyticsController.getDepartmentComparison);

/**
 * GET /api/analytics/admin/placement-readiness
 * Get placement readiness statistics by department (admin only)
 */
router.get('/admin/placement-readiness', authenticateToken, analyticsController.getPlacementReadiness);

module.exports = router;
