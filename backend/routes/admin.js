const express = require('express');
const {
  getDashboardOverview,
  getAllUsers,
  getUserById,
  createUser,
  bulkImportUsers,
  updateUserStatus,
  deleteUser,
  getAllStudents,
  getStudentById,
  updateStudentVerification,
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

// Dashboard
router.get(
  '/dashboard',
  authenticateToken,
  authorizeRoles('admin'),
  getDashboardOverview
);

// User management
router.get(
  '/users',
  authenticateToken,
  authorizeRoles('admin'),
  getAllUsers
);

router.post(
  '/users',
  authenticateToken,
  authorizeRoles('admin'),
  createUser
);

router.post(
  '/users/bulk',
  authenticateToken,
  authorizeRoles('admin'),
  upload.single('file'),
  bulkImportUsers
);

router.get(
  '/users/:userId',
  authenticateToken,
  authorizeRoles('admin'),
  getUserById
);

router.patch(
  '/users/:userId/status',
  authenticateToken,
  authorizeRoles('admin'),
  updateUserStatus
);

router.delete(
  '/users/:userId',
  authenticateToken,
  authorizeRoles('admin'),
  deleteUser
);

// Student management
router.get(
  '/students',
  authenticateToken,
  authorizeRoles('admin'),
  getAllStudents
);

router.get(
  '/students/:studentId',
  authenticateToken,
  authorizeRoles('admin'),
  getStudentById
);

router.patch(
  '/students/:studentId/verification',
  authenticateToken,
  authorizeRoles('admin'),
  updateStudentVerification
);

// Department management
router.get(
  '/departments',
  authenticateToken,
  authorizeRoles('admin'),
  getAllDepartments
);

router.get(
  '/departments/:deptId',
  authenticateToken,
  authorizeRoles('admin'),
  getDepartmentById
);

router.post(
  '/departments',
  authenticateToken,
  authorizeRoles('admin'),
  createDepartment
);

router.patch(
  '/departments/:deptId',
  authenticateToken,
  authorizeRoles('admin'),
  updateDepartment
);

module.exports = router;
