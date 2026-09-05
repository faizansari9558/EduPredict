/**
 * Job Drive Routes
 */

const express = require('express');
const router = express.Router();
const jobDriveController = require('../controllers/jobDriveController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, jobDriveController.getJobDrives);
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), jobDriveController.createJobDrive);
router.post('/:id/apply', authenticateToken, authorizeRoles('student'), jobDriveController.applyToJobDrive);
router.get('/:id/candidates', authenticateToken, authorizeRoles('admin', 'teacher'), jobDriveController.getDriveCandidates);
router.put('/applications/:applicationId/status', authenticateToken, authorizeRoles('admin', 'teacher'), jobDriveController.updateCandidateStatus);

module.exports = router;
