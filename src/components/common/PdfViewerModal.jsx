import React, { useState, useEffect } from 'react';
import { getPdfDocument } from '../../utils/indexedDb';
import { formatFileSize } from '../../utils/formatCurrency';
import { FileText, Download, ExternalLink, X, AlertCircle, Loader2 } from 'lucide-react';

export function PdfViewerModal({ isOpen, customer, onClose }) {
  const [loading, setLoading] = useState(true);
  const [docData, setDocData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    let createdUrl = null;

    if (isOpen && customer?.id) {
      setLoading(true);
      setError(null);
      setDocData(null);

      getPdfDocument(customer.id)
        .then(async (doc) => {
          if (!active) return;
          if (doc && doc.blob) {
            createdUrl = doc.url;
            setDocData(doc);
          } else if (customer.pdfUrl) {
            try {
              const res = await fetch(customer.pdfUrl);
              const blob = await res.blob();
              createdUrl = URL.createObjectURL(blob);
              setDocData({
                blob,
                url: createdUrl,
                fileName: customer.pdfFileName || `${customer.name}_Policy.pdf`,
                fileSize: customer.pdfFileSize || blob.size
              });
            } catch (fetchErr) {
              console.warn('Could not fetch blob from pdfUrl, using direct URL:', fetchErr);
              setDocData({
                url: customer.pdfUrl,
                fileName: customer.pdfFileName || `${customer.name}_Policy.pdf`,
                fileSize: customer.pdfFileSize || 0
              });
            }
          } else {
            setError('No PDF file found for this customer.');
          }
        })
        .catch((err) => {
          if (!active) return;
          console.error('Error loading PDF document:', err);
          setError('Failed to load PDF document from storage.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, customer]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!docData?.blob) return;
    const url = URL.createObjectURL(docData.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docData.fileName || `${customer.name}_Policy.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleOpenNewTab = () => {
    if (!docData?.url) return;
    window.open(docData.url, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-lg"
        style={{ height: '85vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--light-orange)',
              color: 'var(--primary-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '16px' }}>
                {customer?.pdfFileName || 'Policy Document'}
              </h3>
              <p className="modal-subtitle">
                {customer?.name} • {docData?.fileSize ? formatFileSize(docData.fileSize) : 'PDF Document'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {docData && (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleOpenNewTab}
                  title="Open in new browser tab"
                >
                  <ExternalLink size={14} />
                  <span>Open Tab</span>
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleDownload}
                  title="Download PDF"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </>
            )}
            <button className="btn-icon-only" onClick={onClose} title="Close preview">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: 0, flex: 1, backgroundColor: '#475569', position: 'relative' }}>
          {loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#FFFFFF',
              gap: '12px'
            }}>
              <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '14px' }}>Loading policy document preview...</p>
            </div>
          )}

          {error && !loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-secondary)',
              padding: '24px',
              gap: '12px'
            }}>
              <AlertCircle size={40} color="var(--status-danger)" />
              <h4 style={{ color: 'var(--text-primary)' }}>{error}</h4>
              <p style={{ fontSize: '13px' }}>
                You can upload a replacement PDF in the customer profile edit section.
              </p>
            </div>
          )}

          {docData?.url && !loading && !error && (
            <iframe
              src={docData.url}
              title="PDF Policy Preview"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
                backgroundColor: '#525659'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

