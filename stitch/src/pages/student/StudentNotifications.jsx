import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Project Verification Approved',
      message: 'Dr. Robert Vance verified your project "EduPredict — AI Academic Predictor". Your verified portfolio score increased by +12%.',
      time: '2 hours ago',
      type: 'verification',
      read: false,
      icon: 'verified',
      color: 'text-green-600 bg-green-50'
    },
    {
      id: 2,
      title: 'Upcoming Mock Placement Drive – Stage 3',
      message: 'Registration is open for the Tier-1 National Level Mock Coding Round scheduled for Sep 12, 2024 at 10:00 AM.',
      time: '1 day ago',
      type: 'assessment',
      read: false,
      icon: 'event_available',
      color: 'text-primary bg-primary/10'
    },
    {
      id: 3,
      title: 'AI Model Re-calibration Notice',
      message: 'EduPredict ML Engine recalculated your tier placement forecast based on latest Semester 6 CGPA and AWS certification.',
      time: '3 days ago',
      type: 'system',
      read: true,
      icon: 'auto_awesome',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      id: 4,
      title: 'Internship Certificate Awaiting Document',
      message: 'Please upload the final completion letter from Microsoft India (R&D) to finalize your internship credit audit.',
      time: '5 days ago',
      type: 'action_required',
      read: true,
      icon: 'warning',
      color: 'text-amber-600 bg-amber-50'
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Activity Center"
        title="Notifications & Alerts"
        subtitle="Real-time updates regarding faculty verifications, assessment invitations, and AI insights"
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
