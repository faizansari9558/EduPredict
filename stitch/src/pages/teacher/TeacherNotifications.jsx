import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';

export default function TeacherNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Project Submissions (5 Students)',
      message: '5 students submitted their Capstone project repositories for Stage-2 faculty verification.',
      time: '30 mins ago',
      type: 'verification',
      read: false,
      icon: 'fact_check',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: 2,
      title: 'Assessment Window Closing in 2 Hours',
      message: 'The submission window for "National Mock Placement Exam – Stage 3" will close at 6:00 PM.',
      time: '2 hours ago',
      type: 'assessment',
      read: false,
      icon: 'timer',
      color: 'text-amber-600 bg-amber-50'
    },
    {
      id: 3,
      title: 'Institutional Accreditation Report Ready',
      message: 'NAAC Criterion 2.6 outcome report for Computer Science & Engineering is generated.',
      time: '1 day ago',
      type: 'system',
      read: true,
      icon: 'description',
      color: 'text-green-600 bg-green-50'
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Faculty Communications"
        title="Notifications & Faculty Alerts"
        subtitle="Departmental alerts, pending audit requests, and examination timeline notifications"
        action={
          <Button variant="outline" icon="done_all" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        }
      />

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
              n.read
                ? 'bg-surface border-outline-variant/30 opacity-80'
                : 'bg-surface-container/40 border-primary/20 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
              <span className="material-symbols-outlined text-xl">{n.icon}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className={`font-headline font-bold text-sm ${n.read ? 'text-on-surface' : 'text-primary'}`}>
                  {n.title}
                </h4>
                <span className="text-xs text-on-surface-variant shrink-0">{n.time}</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {n.message}
              </p>
            </div>

            {!n.read && (
              <span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0 mt-2"></span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
