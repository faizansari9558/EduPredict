/**
 * Notification Routes
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, notificationController.getMyNotifications);
router.put('/:id/read', authenticateToken, notificationController.markNotificationRead);
router.put('/read-all', authenticateToken, notificationController.markAllNotificationsRead);

module.exports = router;
