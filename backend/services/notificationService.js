/**
 * Notification Service
 * Manages user alert notifications, unread counts, and status updates
 */

const pool = require('../config/db');

class NotificationService {
  /**
   * Send a notification to a specific user
   */
  async createNotification(userId, type, title, message, actionUrl = null) {
    try {
      const [result] = await pool.query(`
        INSERT INTO notifications (user_id, notification_type, title, message, action_url, is_read)
        VALUES (?, ?, ?, ?, ?, false)
      `, [userId, type, title, message, actionUrl]);

      return {
        id: result.insertId,
        user_id: userId,
        type,
        title,
        message,
        action_url: actionUrl,
        is_read: false
      };
    } catch (err) {
      console.error('Error creating notification:', err);
      throw err;
    }
  }

  /**
   * Fetch paginated notifications for a user
   */
  async getUserNotifications(userId, limit = 20, offset = 0) {
    const [rows] = await pool.query(`
      SELECT 
        id, 
        user_id, 
        notification_type AS type, 
        title, 
        message, 
        action_url, 
        is_read, 
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, Number(limit), Number(offset)]);

    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = false',
      [userId]
    );

    return {
      notifications: rows,
      unread_count: countRows[0]?.unread_count || 0
    };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(userId, notificationId) {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
    return { success: true };
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = ?',
      [userId]
    );
    return { success: true };
  }
}

module.exports = new NotificationService();
