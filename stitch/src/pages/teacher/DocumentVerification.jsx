import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

export default function DocumentVerification() {
  const [items, setItems] = useState([
    {
      id: 1,
      studentName: 'Faizan Ansari',
      rollNo: '21CS042',
      type: 'Technical Project',
      title: 'EduPredict — AI Academic Predictor',
      proofUrl: 'https://github.com/example/edupredict',
      submittedDate: 'Sep 05, 2024',
      details: 'Full stack ML application with XGBoost engine and responsive frontend interface.',
      status: 'pending'
    },
    {
      id: 2,
      studentName: 'Aarav Sharma',
      rollNo: '21CS018',
      type: 'Industrial Internship',
      title: 'Microsoft India Summer Intern',
      proofUrl: 'https://example.com/certificate.pdf',
      submittedDate: 'Sep 04, 2024',
      details: '3-month summer internship in Azure Cognitive Services team.',
      status: 'pending'
    },
    {
      id: 3,
      studentName: 'Sneha Patel',
      rollNo: '21CS089',
      type: 'Certification',
      title: 'AWS Certified Solutions Architect',
      proofUrl: 'https://aws.amazon.com/verify/102938',
      submittedDate: 'Sep 03, 2024',
      details: 'Associate level certification credential ID: AWS-SAA-8849201.',
      status: 'pending'
    },
    {
      id: 4,
      studentName: 'Rohan Verma',
      rollNo: '21CS104',
      type: 'Technical Project',
      title: 'Blockchain Voting Portal',
      proofUrl: 'https://github.com/rohan/voting',
      submittedDate: 'Aug 29, 2024',
      details: 'Smart contract based voting system.',
      status: 'rejected',
      feedback: 'Incomplete GitHub repository. Missing README and deployment instructions.'
    }
  ]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [feedback, setFeedback] = useState('');

  const handleApprove = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, status: 'verified' } : item));
    setSelectedItem(null);
  };

  const handleReject = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, status: 'rejected', feedback } : item));
    setSelectedItem(null);
    setFeedback('');
  };

  const columns = [
    {
      header: 'Student',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-on-surface">{row.studentName}</div>
          <div className="text-xs font-mono text-on-surface-variant">{row.rollNo}</div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: (row) => (
        <span className="px-2.5 py-1 bg-surface-container rounded-lg text-xs font-medium text-primary">
          {row.type}
        </span>
      )
    },
    {
      header: 'Credential / Item',
      accessor: (row) => (
        <div>
          <div className="text-xs font-semibold text-on-surface">{row.title}</div>
          <div className="text-[11px] text-on-surface-variant line-clamp-1">{row.details}</div>
        </div>
      )
    },
    {
      header: 'Submitted',
      accessor: (row) => <span className="text-xs text-on-surface-variant">{row.submittedDate}</span>
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Action',
      accessor: (row) => (
        <div className="flex gap-2">
          {row.status === 'pending' ? (
            <Button
              variant="primary"
              size="sm"
              icon="rate_review"
              onClick={() => setSelectedItem(row)}
            >
              Review
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon="visibility"
              onClick={() => setSelectedItem(row)}
            >
              View
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Faculty Audit"
        title="Verification Queue"
        subtitle="Review, approve, or provide revision feedback for student-submitted projects, internships, and certifications"
      />

      <DataTable
        columns={columns}
        data={items}
        keyExtractor={(r) => r.id}
      />

      {selectedItem && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          title={`Audit: ${selectedItem.title}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-surface-container/40 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-semibold">Student Name:</span>
                <span className="font-bold text-on-surface">{selectedItem.studentName} ({selectedItem.rollNo})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-semibold">Category:</span>
                <span className="font-medium text-primary">{selectedItem.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-semibold">Submitted On:</span>
                <span>{selectedItem.submittedDate}</span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Student Summary & Notes
              </h5>
              <p className="text-sm text-on-surface-variant leading-relaxed bg-surface p-3 rounded-xl border border-outline-variant/30">
                {selectedItem.details}
              </p>
            </div>

            {selectedItem.proofUrl && (
              <div>
                <a
                  href={selectedItem.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Inspect Submitted Link / Document Proof
                </a>
              </div>
            )}

            {selectedItem.status === 'pending' && (
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Faculty Review Feedback (Optional if approved, required if rejected)
                </label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. Verified against repository commit logs. Good work."
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs bg-surface resize-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
              {selectedItem.status === 'pending' && (
                <>
                  <Button variant="danger" icon="close" onClick={() => handleReject(selectedItem.id)}>
                    Reject & Request Changes
                  </Button>
                  <Button variant="primary" icon="check" onClick={() => handleApprove(selectedItem.id)}>
                    Approve & Verify
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
