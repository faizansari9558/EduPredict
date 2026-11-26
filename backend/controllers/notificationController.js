/**
 * Notification Controller
 */

const notificationService = require('../services/notificationService');
const db = require('../config/db');

exports.getStudentRecipients = async (req, res) => {
  try {
    const search = String(req.query.search || '').trim().slice(0, 100);
    const params = [];
    let teacherDepartmentId = null;

    if (req.user.role === 'teacher') {
      const [teachers] = await db.query(
        'SELECT department_id FROM teachers WHERE user_id = ?',
        [req.user.id]
      );
      if (!teachers.length) {
        return res.status(404).json({ success: false, message: 'Teacher profile not found.' });
      }
      teacherDepartmentId = teachers[0].department_id;
    }

    let where = `WHERE u.status = 'active' AND r.name = 'student'`;
    if (teacherDepartmentId !== null) {
      where += ' AND s.department_id = ?';
      params.push(teacherDepartmentId);
    }
    if (search) {
      where += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR s.enrollment_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    params.push(100);

    const [recipients] = await db.query(
      `SELECT u.id, u.full_name, u.email, s.enrollment_number, d.name AS department
       FROM students s
       JOIN users u ON u.id = s.user_id
       JOIN roles r ON r.id = u.role_id
       JOIN departments d ON d.id = s.department_id
       ${where}
       ORDER BY u.full_name
       LIMIT ?`,
      params
    );

    return res.json({ success: true, data: recipients });
  } catch (error) {
    console.error('Get notification recipients error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve student recipients.' });
  }
};

exports.sendStudentNotification = async (req, res) => {
  const { studentId, title, message } = req.body || {};
  const recipientId = Number(studentId);
  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  const cleanMessage = typeof message === 'string' ? message.trim() : '';

  if (!Number.isSafeInteger(recipientId) || recipientId <= 0) {
    return res.status(400).json({ success: false, message: 'Select a valid student recipient.' });
  }
  if (!cleanTitle || cleanTitle.length > 255) {
    return res.status(400).json({ success: false, message: 'Title is required and must be 255 characters or fewer.' });
  }
  if (!cleanMessage || cleanMessage.length > 5000) {
    return res.status(400).json({ success: false, message: 'Message is required and must be 5,000 characters or fewer.' });
  }

  try {
    let recipientRows;
    if (req.user.role === 'teacher') {
      [recipientRows] = await db.query(
        `SELECT u.id, u.full_name
         FROM users u
         JOIN roles r ON r.id = u.role_id AND r.name = 'student'
         JOIN students s ON s.user_id = u.id
         JOIN teachers t ON t.user_id = ? AND t.department_id = s.department_id
         WHERE u.id = ? AND u.status = 'active'`,
        [req.user.id, recipientId]
      );
    } else {
      [recipientRows] = await db.query(
        `SELECT u.id, u.full_name
         FROM users u
         JOIN roles r ON r.id = u.role_id AND r.name = 'student'
         JOIN students s ON s.user_id = u.id
         WHERE u.id = ? AND u.status = 'active'`,
        [recipientId]
      );
    }

    if (!recipientRows.length) {
      return res.status(404).json({ success: false, message: 'Student not found or not in your notification scope.' });
    }

    const recipient = recipientRows[0];
    const notification = await notificationService.createNotification(
      recipient.id,
      `${req.user.role}_announcement`,
      cleanTitle,
      cleanMessage
    );

    return res.status(201).json({
      success: true,
      message: `Notification sent to ${recipient.full_name}.`,
      data: { notification, recipient: { id: recipient.id, full_name: recipient.full_name } }
    });
  } catch (error) {
    console.error('Send student notification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send the student notification.' });
  }
};

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
