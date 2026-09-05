/**
 * Notification Controller
 */

const notificationService = require('../services/notificationService');

/**
 * GET /api/notifications
 */
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit, offset } = req.query;

    const data = await notificationService.getUserNotifications(
      userId,
      limit || 20,
      offset || 0
    );

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/notifications/:id/read
 */
exports.markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await notificationService.markAsRead(userId, id);

    res.json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/notifications/read-all
 */
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
