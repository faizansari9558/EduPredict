import React from 'react';
import NotificationCenter from '../../components/NotificationCenter';

export default function StudentNotifications() {
  return (
    <NotificationCenter
      eyebrow="Activity Center"
      title="Notifications & Alerts"
      subtitle="Messages sent to your signed-in student account."
    />
  );
}
