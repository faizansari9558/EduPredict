const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function initPhase15Schema() {
  console.log('Initializing Phase 15 Notifications schema...');
  
  try {
    await pool.query('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url VARCHAR(255) NULL');
    console.log('Added action_url column if needed.');
  } catch (err) {
    console.warn('Alter table warning:', err.message);
  }

  // Clear existing sample notifications to avoid duplicates
  await pool.query('DELETE FROM notifications WHERE user_id IN (2, 5)');

  // Seed sample notifications for student (id: 5) and teacher (id: 2)
  const sampleNotifications = [
    {
      user_id: 5,
      notification_type: 'verification',
      title: 'Document Verified',
      message: 'Your 10th Standard Marksheet has been verified by faculty.',
      action_url: '/student',
      is_read: false
    },
    {
      user_id: 5,
      notification_type: 'assessment',
      title: 'New Coding Challenge Available',
      message: 'Practice DSA problems in the Coding Arena to boost your placement readiness.',
      action_url: '/student',
      is_read: false
    },
    {
      user_id: 5,
      notification_type: 'recommendation',
      title: 'ML Placement Forecast Ready',
      message: 'Your placement forecast is Dream Tier (98.9% readiness). Check your AI recommendations.',
      action_url: '/student/analytics',
      is_read: false
    },
    {
      user_id: 2,
      notification_type: 'at_risk',
      title: 'At-Risk Student Flagged',
      message: 'A student in batch CSE-2024-B1 has been flagged for low assessment scores.',
      action_url: '/teacher/analytics',
      is_read: false
    }
  ];

  for (const n of sampleNotifications) {
    await pool.query(`
      INSERT INTO notifications (user_id, notification_type, title, message, action_url, is_read)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [n.user_id, n.notification_type, n.title, n.message, n.action_url, n.is_read]);
  }

  console.log('Phase 15 schema and seed data initialized successfully.');
  process.exit(0);
}

initPhase15Schema().catch(e => {
  console.error('Phase 15 init error:', e);
  process.exit(1);
});
