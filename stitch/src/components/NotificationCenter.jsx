import React, { useEffect, useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import PageHeader from './PageHeader';
import { notificationApi } from '../services/notificationApi';

const senderLabels = {
  admin_announcement: 'From administration',
  teacher_announcement: 'From a teacher'
};

function formatCreatedAt(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
}

export default function NotificationCenter({ title, eyebrow, subtitle, canNotifyStudents = false, senderRole }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [composerError, setComposerError] = useState('');
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [sending, setSending] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    let active = true;
    notificationApi.getMine()
      .then((data) => {
        if (active) {
          setNotifications(data.notifications || []);
          setUnreadCount(Number(data.unread_count) || 0);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load notifications.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!canNotifyStudents || !isComposerOpen) return undefined;
    let active = true;
    setLoadingRecipients(true);
    setComposerError('');
    const timer = window.setTimeout(() => {
      notificationApi.getStudentRecipients(recipientSearch)
        .then((data) => {
          if (active) setRecipients(data || []);
        })
        .catch((requestError) => {
          if (active) setComposerError(requestError.message || 'Unable to load student recipients.');
        })
        .finally(() => {
          if (active) setLoadingRecipients(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [canNotifyStudents, isComposerOpen, recipientSearch]);

  const closeComposer = () => {
    setIsComposerOpen(false);
    setRecipientSearch('');
    setSelectedRecipient('');
    setNotificationTitle('');
    setNotificationMessage('');
    setComposerError('');
  };

  const handleSend = async (event) => {
    event.preventDefault();
    setComposerError('');
    setSuccess('');
    setSending(true);
    try {
      const result = await notificationApi.sendToStudent({
        studentId: selectedRecipient,
        title: notificationTitle,
        message: notificationMessage
      });
      setSuccess(result.message || 'Notification sent to the student.');
      closeComposer();
    } catch (requestError) {
      setComposerError(requestError.message || 'Unable to send this notification.');
    } finally {
      setSending(false);
    }
  };

  const handleMarkRead = async (notification) => {
    if (notification.is_read || markingId !== null) return;
    setMarkingId(notification.id);
    setError('');
    try {
      await notificationApi.markAsRead(notification.id);
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, is_read: 1 } : item
      )));
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (requestError) {
      setError(requestError.message || 'Unable to mark the notification as read.');
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    setError('');
    try {
      await notificationApi.markAllAsRead();
      setNotifications((current) => current.map((item) => ({ ...item, is_read: 1 })));
      setUnreadCount(0);
    } catch (requestError) {
      setError(requestError.message || 'Unable to mark notifications as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        actions={(
          <>
            {unreadCount > 0 && (
              <Button variant="outline" icon="done_all" onClick={handleMarkAllRead} loading={markingAll}>
                Mark All as Read
              </Button>
            )}
            {canNotifyStudents && (
              <Button variant="primary" icon="campaign" onClick={() => setIsComposerOpen(true)}>
                Notify a Student
              </Button>
            )}
          </>
        )}
      />

      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{success}</p>}

      {loading ? (
        <p className="p-6 text-sm text-on-surface-variant" role="status">Loading notifications...</p>
      ) : notifications.length ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const isRead = Boolean(Number(notification.is_read));
            const sender = senderLabels[notification.type] || String(notification.type || 'notification')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (letter) => letter.toUpperCase());
            return (
              <article
                key={notification.id}
                className={`flex items-start gap-4 rounded-2xl border p-5 transition-colors ${
                  isRead ? 'border-outline-variant/30 bg-surface opacity-80' : 'border-primary/20 bg-surface-container/40 shadow-sm'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  notification.type === 'admin_announcement'
                    ? 'bg-primary/10 text-primary'
                    : notification.type === 'teacher_announcement'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-surface-container text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-xl">campaign</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <h2 className={`text-sm font-bold ${isRead ? 'text-on-surface' : 'text-primary'}`}>{notification.title}</h2>
                    <time className="text-xs text-on-surface-variant">{formatCreatedAt(notification.created_at)}</time>
                  </div>
                  <p className="mb-1 text-[11px] font-semibold text-secondary">{sender}</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">{notification.message}</p>
                </div>
                {!isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(notification)}
                    disabled={markingId !== null}
                    className="shrink-0 text-xs font-semibold text-secondary hover:underline disabled:opacity-50"
                  >
                    {markingId === notification.id ? 'Saving...' : 'Mark read'}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <section className="rounded-2xl border border-outline-variant/30 bg-surface p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">notifications</span>
          <h2 className="mt-3 font-heading text-lg font-bold text-on-surface">No notifications yet</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Notifications sent to your account will appear here.
          </p>
        </section>
      )}

      <Modal isOpen={isComposerOpen} onClose={closeComposer} title="Send a Student Notification">
        <form onSubmit={handleSend} className="space-y-4">
          {canNotifyStudents && (
            <p className="text-xs text-on-surface-variant">
              {senderRole === 'teacher'
                ? 'You can notify active students in your department.'
                : 'Choose one active student to receive this notification.'}
            </p>
          )}

          <div>
            <label htmlFor="notification-recipient-search" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Find a student
            </label>
            <input
              id="notification-recipient-search"
              type="search"
              value={recipientSearch}
              onChange={(event) => setRecipientSearch(event.target.value)}
              placeholder="Search name, email, or university ID"
              className="w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              required
              value={selectedRecipient}
              onChange={(event) => setSelectedRecipient(event.target.value)}
              className="mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{loadingRecipients ? 'Loading students...' : 'Select a student'}</option>
              {recipients.map((recipient) => (
                <option key={recipient.id} value={recipient.id}>
                  {recipient.full_name} · {recipient.enrollment_number} · {recipient.department}
                </option>
              ))}
            </select>
            {!loadingRecipients && recipients.length === 0 && (
              <p className="mt-1 text-xs text-on-surface-variant">No eligible students found for this search.</p>
            )}
          </div>

          <div>
            <label htmlFor="notification-title" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Title
            </label>
            <input
              id="notification-title"
              required
              maxLength={255}
              value={notificationTitle}
              onChange={(event) => setNotificationTitle(event.target.value)}
              className="w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="notification-message" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Message
            </label>
            <textarea
              id="notification-message"
              required
              rows={5}
              maxLength={5000}
              value={notificationMessage}
              onChange={(event) => setNotificationMessage(event.target.value)}
              className="w-full resize-y rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-right text-xs text-on-surface-variant">{notificationMessage.length} / 5,000</p>
          </div>

          {composerError && <p className="text-sm text-red-700" role="alert">{composerError}</p>}

          <div className="flex justify-end gap-3 border-t border-outline-variant/20 pt-4">
            <Button variant="outline" onClick={closeComposer}>Cancel</Button>
            <Button type="submit" variant="primary" loading={sending} disabled={!selectedRecipient}>
              Send Notification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
