import React from 'react';
import NotificationCenter from '../../components/NotificationCenter';

export default function AdminNotifications() {
  return (
    <NotificationCenter
      eyebrow="Campus Communications"
      title="Admin Notifications"
      subtitle="Send a notification to an active student and review notifications for your account."
      canNotifyStudents
      senderRole="admin"
    />
  );
}
