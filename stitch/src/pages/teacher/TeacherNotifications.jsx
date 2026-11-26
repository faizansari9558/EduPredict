import React from 'react';
import NotificationCenter from '../../components/NotificationCenter';

export default function TeacherNotifications() {
  return (
    <NotificationCenter
      eyebrow="Faculty Communications"
      title="Teacher Notifications"
      subtitle="Notify students in your department and review notifications for your account."
      canNotifyStudents
      senderRole="teacher"
    />
  );
}
