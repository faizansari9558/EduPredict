import React, { useEffect, useState } from 'react';
import { teacherApi } from '../../services/teacherApi';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

export default function DocumentVerification() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    let active = true;
    teacherApi.getPendingVerifications()
      .then((response) => {
        if (active) setItems(response.data || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load document verifications.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const review = async (item, status) => {
    setSaving(true);
    setError('');
    try {
      await teacherApi.verifyItem(item.id, status, feedback);
      setItems((current) => current.map((record) => record.id === item.id ? { ...record, status } : record));
      setSelectedItem(null);
      setFeedback('');
    } catch (requestError) {
      setError(requestError.message || 'Unable to save the document review.');
    } finally {
      setSaving(false);
    }
  };

  const downloadFile = async (item) => {
    setDownloadingId(item.id);
    setError('');
    try {
      const blob = await teacherApi.downloadVerificationFile(item.id);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = item.title || 'student-document';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (requestError) {
      setError(requestError.message || 'Unable to download the uploaded document.');
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    {
      key: 'student',
      label: 'Student',
      render: (_, row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.studentName}</div>
          <div className="text-xs font-mono text-on-surface-variant">{row.rollNo}</div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Document type'
    },
    {
      key: 'title',
      label: 'Uploaded file',
      render: (value) => <span className="text-xs font-medium text-on-surface">{value}</span>
    },
    {
      key: 'submittedDate',
      label: 'Submitted',
      render: (value) => value ? new Date(value).toLocaleDateString() : '—'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button
          variant={row.status === 'pending' ? 'primary' : 'outline'}
          size="sm"
          icon={row.status === 'pending' ? 'rate_review' : 'visibility'}
          onClick={() => setSelectedItem(row)}
        >
          {row.status === 'pending' ? 'Review' : 'View'}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Faculty Audit"
        title="Verification Queue"
        subtitle="Review student-submitted certificates and other uploaded documents from your department."
      />

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={items}
        emptyMessage={loading ? 'Loading uploaded documents…' : 'No documents have been submitted for review.'}
      />

      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={() => {
          if (!saving) {
            setSelectedItem(null);
            setFeedback('');
          }
        }}
        title={selectedItem ? `Review: ${selectedItem.title}` : 'Review document'}
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="rounded-xl bg-surface-container-low p-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-on-surface-variant">Student</span>
                <span className="font-semibold text-right text-on-surface">{selectedItem.studentName} ({selectedItem.rollNo})</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-on-surface-variant">Document type</span>
                <span className="font-medium text-right text-on-surface">{selectedItem.type}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-on-surface-variant">Uploaded file</span>
                <span className="font-medium text-right text-on-surface break-all">{selectedItem.title}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-on-surface-variant">Submitted</span>
                <span className="font-medium text-right text-on-surface">
                  {selectedItem.submittedDate ? new Date(selectedItem.submittedDate).toLocaleString() : '—'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-on-surface-variant">Status</span>
                <StatusBadge status={selectedItem.status} />
              </div>
            </div>
            <Button
              variant="outline"
              icon="download"
              loading={downloadingId === selectedItem.id}
              disabled={Boolean(downloadingId)}
              onClick={() => downloadFile(selectedItem)}
            >
              Download uploaded document
            </Button>

            {selectedItem.status === 'pending' && (
              <>
                <div>
                  <label htmlFor="verification-feedback" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Review feedback
                  </label>
                  <textarea
                    id="verification-feedback"
                    rows={3}
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    placeholder="Provide a reason if you reject this document."
                    className="w-full rounded-xl border border-outline-variant/50 bg-surface px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-3 border-t border-outline-variant/20 pt-4">
                  <Button variant="outline" disabled={saving} onClick={() => setSelectedItem(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    icon="close"
                    loading={saving}
                    onClick={() => review(selectedItem, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    icon="check"
                    loading={saving}
                    onClick={() => review(selectedItem, 'verified')}
                  >
                    Verify
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
