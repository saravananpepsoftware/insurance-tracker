import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatFileSize } from '../../utils/formatCurrency';
import { calculateRemaining, getPaymentStatus } from '../../utils/calculations';
import { formatIndianDate, calculateDaysRemaining } from '../../utils/dateUtils';
import {
  PaymentStatusBadge,
  InsuranceTypeBadge,
  RenewalUrgencyBadge
} from '../common/StatusBadge';
import {
  X,
  Phone,
  MessageCircle,
  Calendar,
  Shield,
  CreditCard,
  FileText,
  Eye,
  Download,
  ExternalLink,
  Edit3,
  PlusCircle,
  User,
  Clock,
  Building2,
  ChevronRight
} from 'lucide-react';

export function MobileCustomerDetailModal({
  isOpen,
  customer,
  onClose,
  onAddPayment,
  onEditCustomer,
  onViewPdf
}) {
  const navigate = useNavigate();

  if (!isOpen || !customer) return null;

  const total = Number(customer.totalAmount) || 0;
  const paid = Number(customer.partialAmount ?? customer.paidAmount) || 0;
  const remaining = calculateRemaining(total, paid);
  const status = getPaymentStatus(total, paid);
  const daysLeft = calculateDaysRemaining(customer.policyEndDate);

  const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '');
  const whatsAppPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const handleDownloadPdf = () => {
    if (customer.pdfUrl) {
      const link = document.createElement('a');
      link.href = customer.pdfUrl;
      link.download = customer.pdfFileName || 'Policy_Document.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="modal-overlay mobile-detail-overlay" onClick={onClose}>
      <div
        className="modal-content mobile-detail-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Bottom sheet pull handle */}
        <div className="mobile-sheet-handle-bar">
          <div className="mobile-sheet-handle"></div>
        </div>

        {/* Modal Header */}
        <div className="mobile-detail-header">
          <div className="mobile-detail-header-left">
            <div className="mobile-detail-avatar">
              {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="mobile-detail-title-row">
                <h3 className="mobile-detail-name">{customer.name}</h3>
                <PaymentStatusBadge status={status} />
              </div>
              <div className="mobile-detail-id">ID: {customer.id}</div>
            </div>
          </div>
          <button className="btn-icon-only mobile-detail-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="mobile-detail-body">
          {/* Quick Contact Bar */}
          <div className="mobile-detail-contact-bar">
            <a
              href={`tel:${customer.phone}`}
              className="mobile-contact-pill mobile-contact-call"
            >
              <Phone size={13} />
              <span>Call ({customer.phone})</span>
            </a>
            {cleanPhone && (
              <a
                href={`https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(
                  `Hello ${customer.name}, regarding your ${customer.insuranceCompany} insurance policy...`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-contact-pill mobile-contact-whatsapp"
              >
                <MessageCircle size={13} />
                <span>WhatsApp</span>
              </a>
            )}
          </div>

          {/* Financial Summary 3-Col Card */}
          <div className="mobile-detail-card">
            <div className="mobile-card-section-label">
              <CreditCard size={13} color="var(--primary-orange)" />
              <span>Financial & Payment Standing</span>
            </div>
            <div className="mobile-detail-stat-grid">
              <div className="mobile-stat-box">
                <div className="mobile-stat-label">Total Policy</div>
                <div className="mobile-stat-val">{formatCurrency(total)}</div>
              </div>
              <div className="mobile-stat-box">
                <div className="mobile-stat-label">Paid Amount</div>
                <div className="mobile-stat-val" style={{ color: 'var(--status-paid)' }}>
                  {formatCurrency(paid)}
                </div>
              </div>
              <div className="mobile-stat-box highlight">
                <div className="mobile-stat-label">Remaining Due</div>
                <div
                  className="mobile-stat-val"
                  style={{ color: remaining > 0 ? 'var(--status-danger)' : 'var(--status-paid)' }}
                >
                  {formatCurrency(remaining)}
                </div>
              </div>
            </div>
          </div>

          {/* Policy Information Card */}
          <div className="mobile-detail-card">
            <div className="mobile-card-section-label">
              <Shield size={13} color="var(--primary-orange)" />
              <span>Policy & Insurance Details</span>
            </div>
            <div className="mobile-detail-rows">
              <div className="mobile-detail-row">
                <span className="row-label">Insurance Company</span>
                <span className="row-value font-semibold">{customer.insuranceCompany || '—'}</span>
              </div>
              <div className="mobile-detail-row">
                <span className="row-label">Policy Classification</span>
                <div className="row-value">
                  <InsuranceTypeBadge type={customer.insuranceType} />
                </div>
              </div>
              <div className="mobile-detail-row">
                <span className="row-label">Effective Start Date</span>
                <span className="row-value">{formatIndianDate(customer.policyStartDate)}</span>
              </div>
              <div className="mobile-detail-row">
                <span className="row-label">Policy Expiry Date</span>
                <div className="row-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="font-semibold">{formatIndianDate(customer.policyEndDate)}</span>
                  <RenewalUrgencyBadge endDate={customer.policyEndDate} short />
                </div>
              </div>
            </div>
          </div>

          {/* Policy Document (PDF) Section */}
          <div className="mobile-detail-card">
            <div className="mobile-card-section-label">
              <FileText size={13} color="var(--primary-orange)" />
              <span>Policy Document (PDF)</span>
            </div>
            {customer.pdfUrl || customer.pdfFileName ? (
              <div className="mobile-pdf-preview-box">
                <div className="mobile-pdf-info">
                  <FileText size={22} color="var(--primary-orange)" />
                  <div>
                    <div className="mobile-pdf-name">{customer.pdfFileName || 'Policy_Document.pdf'}</div>
                    <div className="mobile-pdf-meta">
                      {customer.pdfFileSize ? formatFileSize(customer.pdfFileSize) + ' • ' : ''}
                      Stored in Cloud Storage
                    </div>
                  </div>
                </div>
                <div className="mobile-pdf-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      if (onViewPdf) onViewPdf(customer);
                    }}
                  >
                    <Eye size={12} />
                    <span>View PDF</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleDownloadPdf}
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mobile-no-pdf">
                <span>No policy PDF document attached</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="mobile-detail-footer">
          {remaining > 0 && (
            <button
              className="btn btn-primary btn-md mobile-footer-btn"
              onClick={() => {
                onClose();
                if (onAddPayment) onAddPayment(customer);
              }}
            >
              <PlusCircle size={15} />
              <span>Add Payment</span>
            </button>
          )}
          <button
            className="btn btn-secondary btn-md mobile-footer-btn"
            onClick={() => {
              onClose();
              if (onEditCustomer) onEditCustomer(customer);
            }}
          >
            <Edit3 size={15} />
            <span>Edit</span>
          </button>
          <button
            className="btn btn-secondary btn-md mobile-footer-btn mobile-full-page-btn"
            onClick={() => {
              onClose();
              navigate(`/customers/${customer.id}`);
            }}
          >
            <span>Full Profile</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileCustomerDetailModal;

