import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Database Synchronization Complete',
      message: 'Automated nightly sync with SIS MySQL database synchronized 1,440 student transcripts with zero discrepancies.',
      time: '1 hour ago',
      type: 'system',
      read: false,
      icon: 'dns',
      color: 'text-green-600 bg-green-50'
    },
    {
      id: 2,
      title: 'Placement Season 2025 Drive Launch',
      message: 'Over 40 recruiters registered on the platform for upcoming campus drives commencing October 1.',
      time: '4 hours ago',
      type: 'tpo',
      read: false,
      icon: 'business_center',
      color: 'text-primary bg-primary/10'
    },
    {
      id: 3,
      title: 'Faculty Mentor Allocation Alert',
      message: 'Information Technology department has 12 unassigned final-year project groups.',
      time: '1 day ago',
      type: 'alert',
      read: true,
      icon: 'group_off',
      color: 'text-amber-600 bg-amber-50'
    }
  ]);

  const [isBroadcastModal, setIsBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Users');

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    const item = {
      id: Date.now(),
      title: `[Broadcast to ${targetAudience}] ${broadcastTitle}`,
      message: broadcastMessage,
      time: 'Just now',
      type: 'broadcast',
      read: false,
      icon: 'campaign',
      color: 'text-purple-600 bg-purple-50'
    };
    setNotifications([item, ...notifications]);
    setIsBroadcastModal(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Campus Communications"
        title="Admin Announcements & System Logs"
        subtitle="Manage campus broadcasts, security logs, and institutional system events"
        action={
          <Button variant="primary" icon="campaign" onClick={() => setIsBroadcastModal(true)}>
            New Campus Broadcast
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

      <Modal
        isOpen={isBroadcastModal}
        onClose={() => setIsBroadcastModal(false)}
        title="Issue Campus-Wide Broadcast"
        size="md"
      >
        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
            >
              <option value="All Users">All Users (Students + Faculty)</option>
              <option value="Students Only">Students Only</option>
              <option value="Faculty Only">Faculty Only</option>
              <option value="Final Year Students">Final Year Students (2025 Batch)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Announcement Title *
            </label>
            <input
              type="text"
              required
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="e.g. Schedule for Tier-1 Placement Mock Drives"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Announcement Message *
            </label>
            <textarea
              rows={3}
              required
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Type message content dispatched to student and faculty dashboards..."
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" onClick={() => setIsBroadcastModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Dispatch Broadcast</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
