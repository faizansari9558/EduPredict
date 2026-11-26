/**
 * Notification Routes
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get(
  '/recipients',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  notificationController.getStudentRecipients
);
router.post(
  '/send',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  notificationController.sendStudentNotification
);
router.get('/', authenticateToken, notificationController.getMyNotifications);
router.put('/:id/read', authenticateToken, notificationController.markNotificationRead);
router.put('/read-all', authenticateToken, notificationController.markAllNotificationsRead);

module.exports = router;
