import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomers } from '../context/CustomerContext';
import { formatCurrency, formatFileSize } from '../utils/formatCurrency';
import { formatIndianDate, calculateDaysRemaining, getUrgencyInfo } from '../utils/dateUtils';
import { calculateRemaining, getPaymentStatus } from '../utils/calculations';
import { PaymentStatusBadge, InsuranceTypeBadge, RenewalUrgencyBadge } from '../components/common/StatusBadge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PaymentModal } from '../components/payments/PaymentModal';
import { PdfViewerModal } from '../components/common/PdfViewerModal';
import { RenewalReminderModal, WhatsAppIcon } from '../components/customers/RenewalReminderModal';
import { getPdfDocument } from '../utils/indexedDb';
import heroCarShieldImg from '../assets/hero-insurance-car-shield.png';
import {
  ArrowLeft,
  Phone,
  Shield,
  Building2,
  Calendar,
  FileText,
  Eye,
  Download,
  Edit3,
  Trash2,
  PlusCircle,
  LayoutGrid,
  CreditCard,
  Clock,
  Layers,
  Briefcase,
  Coins,
  Wallet,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Check,
  BellRing,
  Send,
  Radio,
  Smartphone,
  ChevronDown
} from 'lucide-react';

export function CustomerDetails({ onOpenEditCustomer }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomerById, deleteCustomer, recordRenewalReminder, dispatchCustomerReminder } = useCustomers();

  const customer = getCustomerById(id);

  // Active navigation tab: 'overview' | 'payments' | 'documents' | 'history'
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfMeta, setPdfMeta] = useState(null);

  // Reminder popover state on navigation bar
  const [showTabReminderMenu, setShowTabReminderMenu] = useState(false);
  const tabReminderRef = useRef(null);

  // Temporary 2-second tick indicator state when a reminder message is clicked
  const [activeTick, setActiveTick] = useState(null); // 'expiry' | 'payment' | null
  const tickTimeoutRef = useRef(null);

  const handleSendReminderMessage = (type, title) => {
    // Clear any existing tick timeout
    if (tickTimeoutRef.current) {
      clearTimeout(tickTimeoutRef.current);
    }

    // Dispatch FCM reminder
    dispatchCustomerReminder(customer, type, title);

    // Show tick for 2 seconds only, then hide
    setActiveTick(type);
    tickTimeoutRef.current = setTimeout(() => {
      setActiveTick(null);
      setShowTabReminderMenu(false);
    }, 2000);
  };

  // Top WhatsApp reminder popover state
  const [showWhatsappDropdown, setShowWhatsappDropdown] = useState(false);
  const whatsappReminderRef = useRef(null);
  const [showBannerWhatsappDropdown, setShowBannerWhatsappDropdown] = useState(false);
  const bannerWhatsappRef = useRef(null);
  const [activeWhatsappTick, setActiveWhatsappTick] = useState(null); // 'renewal' | 'payment' | null
  const whatsappTickTimeoutRef = useRef(null);

  const handleSendWhatsApp = (type) => {
    if (!customer) return;

    if (whatsappTickTimeoutRef.current) {
      clearTimeout(whatsappTickTimeoutRef.current);
    }

    const remainingAmt = Number(customer.remainingAmount) || 0;
    const totalAmt = Number(customer.totalAmount) || 0;
    const paidAmt = Number(customer.partialAmount) || 0;
    const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const company = customer.insuranceCompany || 'your insurer';
    const policyType = customer.insuranceType || 'Insurance Policy';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = customer.policyEndDate ? new Date(customer.policyEndDate) : today;
    end.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isExpiredState = daysRemaining < 0;
    const timePhrase = isExpiredState ? `has EXPIRED (${Math.abs(daysRemaining)} days ago)` : `is due for renewal in ${daysRemaining} days`;

    let message = '';
    let reminderTitle = '';
    if (type === 'renewal') {
      reminderTitle = 'Policy Renewal Reminder';
      message = `*POLICY RENEWAL REMINDER*\n\nDear ${customer.name},\n\nThis is a priority policy renewal reminder from InsureTrack regarding your ${policyType} policy with ${company}.\n\nYour policy ${timePhrase}.${remainingAmt > 0 ? `\n• Remaining Amount Due: ₹${remainingAmt.toLocaleString('en-IN')}` : ''}\n\nPlease renew quick to avoid policy lapse and loss of coverage benefits.\n\nThank you,\nInsureTrack Team`;
    } else {
      reminderTitle = 'Remaining Amount Payment Reminder';
      message = `*PENDING AMOUNT PAYMENT REMINDER*\n\nDear ${customer.name},\n\nThis is a reminder regarding the remaining payment on your ${policyType} policy with ${company}.\n\n• Policy Total: ₹${totalAmt.toLocaleString('en-IN')}\n• Amount Paid: ₹${paidAmt.toLocaleString('en-IN')}\n• Remaining Balance Due: ₹${remainingAmt.toLocaleString('en-IN')}\n\nPlease complete the pending balance payment at your earliest convenience.\n\nThank you,\nInsureTrack Team`;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    recordRenewalReminder(customer.id, {
      channel: 'whatsapp',
      type: type,
      timingDays: 30,
      title: reminderTitle,
      message,
      note: `${reminderTitle} dispatched to customer via WhatsApp`
    });

    setActiveWhatsappTick(type);
    whatsappTickTimeoutRef.current = setTimeout(() => {
      setActiveWhatsappTick(null);
      setShowWhatsappDropdown(false);
      setShowBannerWhatsappDropdown(false);
    }, 2000);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (tickTimeoutRef.current) {
        clearTimeout(tickTimeoutRef.current);
      }
      if (whatsappTickTimeoutRef.current) {
        clearTimeout(whatsappTickTimeoutRef.current);
      }
    };
  }, []);

  // Close tab reminder and whatsapp reminder menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (tabReminderRef.current && !tabReminderRef.current.contains(event.target)) {
        setShowTabReminderMenu(false);
      }
      if (whatsappReminderRef.current && !whatsappReminderRef.current.contains(event.target)) {
        setShowWhatsappDropdown(false);
      }
      if (bannerWhatsappRef.current && !bannerWhatsappRef.current.contains(event.target)) {
        setShowBannerWhatsappDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check indexedDB PDF meta
  useEffect(() => {
    let active = true;
    if (customer?.id) {
      getPdfDocument(customer.id)
        .then((doc) => {
          if (active && doc) {
            setPdfMeta(doc);
          }
        })
        .catch((e) => console.warn('Could not read PDF meta:', e));
    }
    return () => { active = false; };
  }, [customer]);

  if (!customer) {
    return (
      <div className="page-container">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/customers')}
          style={{ marginBottom: '20px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Customers</span>
        </button>

        <div className="app-card" style={{ padding: '48px', textAlign: 'center' }}>
          <AlertCircle size={40} color="var(--status-warning)" style={{ margin: '0 auto 12px' }} />
          <h3>Customer Record Not Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
            The requested customer profile could not be loaded or has been deleted.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
            onClick={() => navigate('/customers')}
          >
            Return to Customer List
          </button>
        </div>
      </div>
    );
  }

  const total = Number(customer.totalAmount) || 0;
  const paid = Number(customer.partialAmount ?? customer.paidAmount) || 0;
  const remaining = customer.remainingAmount !== undefined ? Number(customer.remainingAmount) : calculateRemaining(total, paid);
  const paidPercent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const daysLeft = calculateDaysRemaining(customer.policyEndDate);
  const urgency = getUrgencyInfo(customer.policyEndDate);
  const isExpired = daysLeft < 0;
  const alertCount = (remaining > 0 ? 1 : 0) + (daysLeft <= 30 ? 1 : 0);

  const handleDownloadPdf = async () => {
    try {
      const doc = await getPdfDocument(customer.id);
      if (doc?.blob) {
        const url = URL.createObjectURL(doc.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName || `${customer.name.replace(/\s+/g, '_')}_Policy.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (customer?.pdfDataUri) {
        const res = await fetch(customer.pdfDataUri);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = customer.pdfFileName || `${customer.name.replace(/\s+/g, '_')}_Policy.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (customer?.pdfUrl) {
        window.open(customer.pdfUrl, '_blank');
      } else {
        alert('No policy PDF document is currently attached to this record.');
      }
    } catch (e) {
      console.error(e);
      if (customer?.pdfDataUri) {
        window.open(customer.pdfDataUri, '_blank');
      } else if (customer?.pdfUrl) {
        window.open(customer.pdfUrl, '_blank');
      } else {
        alert('Failed to retrieve PDF file for download.');
      }
    }
  };

  // Generate a clean filename for display
  const displayPdfName = customer.pdfFileName || pdfMeta?.fileName || `${customer.name.replace(/\s+/g, '_')}_${customer.insuranceCompany?.split(' ')[0] || 'Policy'}.pdf`;
  const displayPdfSize = customer.pdfFileSize || pdfMeta?.fileSize || 2450000;

  return (
    <div className="page-container">
      {/* Top Action Bar matching reference */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/customers')}
          style={{ padding: '7px 16px', borderRadius: '10px', fontWeight: 600 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Customers</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* WhatsApp Reminder Button with Compact Popover */}
          <div style={{ position: 'relative' }} ref={whatsappReminderRef}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowWhatsappDropdown(!showWhatsappDropdown)}
              style={{
                padding: '7px 16px',
                borderRadius: '10px',
                borderColor: customer.reminderSent ? '#22C55E' : '#25D366',
                color: customer.reminderSent ? '#16A34A' : '#15803D',
                backgroundColor: '#F0FDF4',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
              title="Click to select WhatsApp reminder"
            >
              <WhatsAppIcon size={16} color={customer.reminderSent ? '#16A34A' : '#25D366'} />
              <span>{customer.reminderSent ? 'Send Reminder in WhatsApp' : 'Send Reminder in WhatsApp'}</span>
              <ChevronDown
                size={14}
                style={{
                  transition: 'transform 0.15s ease',
                  transform: showWhatsappDropdown ? 'rotate(180deg)' : 'none'
                }}
              />
            </button>

            {/* Compact Popover Anchored Right Near WhatsApp Button */}
            {showWhatsappDropdown && (
              <div className="whatsapp-reminder-popover">
                {/* 1. Policy Renews */}
                <button
                  type="button"
                  className={`whatsapp-popover-item ${activeWhatsappTick === 'renewal' ? 'is-sent' : ''}`}
                  onClick={() => handleSendWhatsApp('renewal')}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                    <span className="whatsapp-popover-title">
                      Policy Renews
                    </span>
                    <span className="whatsapp-popover-sub">
                      {daysLeft < 0 ? `Expired (${Math.abs(daysLeft)}d ago)` : `Expires in ${daysLeft} days`}
                    </span>
                  </div>

                  {activeWhatsappTick === 'renewal' ? (
                    <span className="reminder-tick-badge" title="Sent">
                      <Check size={13} strokeWidth={2.8} />
                    </span>
                  ) : (
                    <WhatsAppIcon size={15} color="#25D366" />
                  )}
                </button>

                <div className="whatsapp-popover-divider" />

                {/* 2. Remaining Amount */}
                <button
                  type="button"
                  className={`whatsapp-popover-item ${activeWhatsappTick === 'payment' ? 'is-sent' : ''}`}
                  onClick={() => handleSendWhatsApp('payment')}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                    <span className="whatsapp-popover-title">
                      Remaining Amount
                    </span>
                    <span className="whatsapp-popover-sub" style={{ color: remaining > 0 ? '#DC2626' : '#16A34A', fontWeight: 600 }}>
                      {remaining > 0 ? `Pending: ${formatCurrency(remaining)}` : 'Cleared (₹0)'}
                    </span>
                  </div>

                  {activeWhatsappTick === 'payment' ? (
                    <span className="reminder-tick-badge" title="Sent">
                      <Check size={13} strokeWidth={2.8} />
                    </span>
                  ) : (
                    <WhatsAppIcon size={15} color="#25D366" />
                  )}
                </button>
              </div>
            )}
          </div>

          {remaining > 0 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowPaymentModal(true)}
              style={{ padding: '7px 16px', borderRadius: '10px' }}
            >
              <PlusCircle size={15} />
              <span>Add Payment</span>
            </button>
          )}

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenEditCustomer(customer)}
            style={{ padding: '7px 16px', borderRadius: '10px' }}
          >
            <Edit3 size={15} />
            <span>Edit Profile</span>
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => setShowDeleteConfirm(true)}
            style={{ padding: '7px 16px', borderRadius: '10px' }}
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Customer Profile Hero Banner with 3D Car Artwork */}
      <div className="customer-hero-banner">
        {/* Left Customer Info */}
        <div className="customer-hero-left">
          <div className="customer-hero-avatar">
            {customer.name.charAt(0).toUpperCase()}
          </div>

          <div className="customer-hero-info">
            <div className="customer-hero-name-row">
              <h1 className="customer-hero-name">{customer.name}</h1>
              <PaymentStatusBadge status={customer.paymentStatus} />
            </div>

            <div className="customer-hero-meta-row">
              <span className="customer-hero-meta-item">
                <Phone size={14} color="var(--primary-orange)" />
                <a href={`tel:${customer.phone}`} style={{ color: 'inherit', fontWeight: 600 }}>
                  {customer.phone}
                </a>
              </span>
              <span className="customer-hero-divider">|</span>
              <span className="customer-hero-meta-item">
                <Building2 size={14} color="var(--primary-orange)" />
                <span style={{ fontWeight: 600 }}>{customer.insuranceCompany}</span>
              </span>
              <span className="customer-hero-divider">|</span>
              <span className="customer-hero-meta-item">
                <Shield size={14} color="var(--primary-orange)" />
                <span style={{ fontWeight: 500 }}>ID: {customer.id}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right 3D Car Shield Artwork and Urgency Pill */}
        <div className="customer-hero-right">
          <img
            src={heroCarShieldImg}
            alt="Insurance Protected"
            className="customer-hero-car-img"
            onError={(e) => { e.target.src = '/images/hero-insurance-car-shield.png'; }}
          />

          <div className="customer-hero-badge-box">
            <RenewalUrgencyBadge endDate={customer.policyEndDate} />
          </div>
        </div>
      </div>

      {/* Floating Horizontal Navigation Tabs Bar with Reminder Bell */}
      <div className="customer-nav-tabs-bar">
        <div className="customer-nav-tabs-left">
          <button
            className={`customer-nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutGrid size={16} />
            <span>Overview</span>
          </button>

          <button
            className={`customer-nav-tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={16} />
            <span>Payments</span>
          </button>

          <button
            className={`customer-nav-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={16} />
            <span>Documents</span>
          </button>

          <button
            className={`customer-nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={16} />
            <span>Activity History</span>
          </button>
        </div>

        {/* Right: Bell Icon Reminder Dropdown on this Navbar (Commented out as requested) */}
        {/*
        <div className="customer-nav-tabs-right">
          <div className="customer-nav-reminder-wrapper" ref={tabReminderRef}>
            <button
              type="button"
              className={`customer-nav-bell-btn ${alertCount > 0 ? 'has-alerts' : ''} ${showTabReminderMenu ? 'active' : ''}`}
              onClick={() => setShowTabReminderMenu(!showTabReminderMenu)}
              title="Reminders for Pending Amount & Policy Expiry"
            >
              <div className="bell-icon-inner">
                <BellRing size={16} />
                {alertCount > 0 && (
                  <span className="bell-badge-pill">{alertCount}</span>
                )}
              </div>
              <span>Reminders</span>
              <ChevronDown size={14} className={`bell-chevron ${showTabReminderMenu ? 'open' : ''}`} />
            </button>

            {showTabReminderMenu && (
              <div className="customer-nav-reminder-dropdown">
                <button
                  type="button"
                  className={`reminder-dropdown-title-item ${activeTick === 'expiry' ? 'is-sent' : ''}`}
                  onClick={() => handleSendReminderMessage('expiry', 'Your policy expires soon, renew quick')}
                >
                  <span>Your policy expires soon, renew quick</span>
                  {activeTick === 'expiry' && (
                    <span className="reminder-tick-badge" title="Sent">
                      <Check size={13} strokeWidth={2.8} />
                    </span>
                  )}
                </button>

                <div className="reminder-dropdown-divider" />

                <button
                  type="button"
                  className={`reminder-dropdown-title-item ${activeTick === 'payment' ? 'is-sent' : ''}`}
                  onClick={() => handleSendReminderMessage('payment', 'Pay the pending amount')}
                >
                  <span>Pay the pending amount</span>
                  {activeTick === 'payment' && (
                    <span className="reminder-tick-badge" title="Sent">
                      <Check size={13} strokeWidth={2.8} />
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        */}
      </div>

      {/* TAB 1: OVERVIEW (Exact Reference Mockup Layout) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 30-Day Policy Renewal Reminder Alert Banner */}
          {daysLeft <= 30 && (
            <div className={`renewal-reminder-banner ${isExpired ? 'banner-critical' : ''}`}>
              <div className="renewal-reminder-banner-left">
                <div className="reminder-bell-icon-box">
                  <BellRing size={20} />
                </div>
                <div>
                  <div className="renewal-reminder-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span>{isExpired ? 'Policy Has Expired - Renewal Required' : '30-Day Renewal Reminder Notice'}</span>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: isExpired ? '#FEE2E2' : '#FFEDD5',
                        color: isExpired ? '#DC2626' : '#C2410C',
                        fontWeight: 700,
                        fontSize: '11px',
                        padding: '2px 8px'
                      }}
                    >
                      {isExpired ? `Expired (${Math.abs(daysLeft)}d ago)` : `${daysLeft} days left`}
                    </span>
                  </div>
                  <div className="renewal-reminder-desc">
                    Policy with {customer.insuranceCompany} {isExpired ? 'expired on' : 'expires on'} {formatIndianDate(customer.policyEndDate)}. Dispatch renewal notice via WhatsApp or SMS before 30 days.
                  </div>
                </div>
              </div>

              <div className="renewal-reminder-actions" style={{ position: 'relative' }} ref={bannerWhatsappRef}>
                <button
                  type="button"
                  className="btn-whatsapp"
                  onClick={() => setShowBannerWhatsappDropdown(!showBannerWhatsappDropdown)}
                  style={{ padding: '8px 16px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '13px', cursor: 'pointer' }}
                >
                  <WhatsAppIcon size={16} color="#FFFFFF" />
                  <span>Send Reminder in WhatsApp</span>
                  <ChevronDown
                    size={14}
                    style={{
                      transition: 'transform 0.15s ease',
                      transform: showBannerWhatsappDropdown ? 'rotate(180deg)' : 'none'
                    }}
                  />
                </button>

                {showBannerWhatsappDropdown && (
                  <div className="whatsapp-reminder-popover" style={{ top: 'calc(100% + 6px)', right: 0 }}>
                    {/* 1. Policy Renews */}
                    <button
                      type="button"
                      className={`whatsapp-popover-item ${activeWhatsappTick === 'renewal' ? 'is-sent' : ''}`}
                      onClick={() => handleSendWhatsApp('renewal')}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                        <span className="whatsapp-popover-title">
                          Policy Renews
                        </span>
                        <span className="whatsapp-popover-sub">
                          {daysLeft < 0 ? `Expired (${Math.abs(daysLeft)}d ago)` : `Expires in ${daysLeft} days`}
                        </span>
                      </div>

                      {activeWhatsappTick === 'renewal' ? (
                        <span className="reminder-tick-badge" title="Sent">
                          <Check size={13} strokeWidth={2.8} />
                        </span>
                      ) : (
                        <WhatsAppIcon size={15} color="#25D366" />
                      )}
                    </button>

                    <div className="whatsapp-popover-divider" />

                    {/* 2. Remaining Amount */}
                    <button
                      type="button"
                      className={`whatsapp-popover-item ${activeWhatsappTick === 'payment' ? 'is-sent' : ''}`}
                      onClick={() => handleSendWhatsApp('payment')}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                        <span className="whatsapp-popover-title">
                          Remaining Amount
                        </span>
                        <span className="whatsapp-popover-sub" style={{ color: remaining > 0 ? '#DC2626' : '#16A34A', fontWeight: 600 }}>
                          {remaining > 0 ? `Pending: ${formatCurrency(remaining)}` : 'Cleared (₹0)'}
                        </span>
                      </div>

                      {activeWhatsappTick === 'payment' ? (
                        <span className="reminder-tick-badge" title="Sent">
                          <Check size={13} strokeWidth={2.8} />
                        </span>
                      ) : (
                        <WhatsAppIcon size={15} color="#25D366" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Two-Column Grid: Financial Summary & Policy Duration */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {/* Left Card: Financial & Payment Summary */}
            <div className="app-card">
              <div className="card-header">
                <div className="card-title">
                  <Layers size={18} color="var(--primary-orange)" />
                  <span>Financial & Payment Summary</span>
                </div>
                <span
                  className="badge"
                  style={{
                    backgroundColor: paidPercent === 100 ? '#F0FDF4' : '#FFEADB',
                    color: paidPercent === 100 ? '#16A34A' : 'var(--primary-orange)',
                    fontWeight: 800,
                    fontSize: '12px',
                    padding: '3px 10px',
                    borderRadius: '9999px'
                  }}
                >
                  {paidPercent}% Settled
                </span>
              </div>

              <div className="card-body">
                {/* 3 Metrics Inner Boxes Grid */}
                <div className="financial-summary-grid">
                  {/* Total Business */}
                  <div className="metric-inner-box">
                    <div className="metric-box-icon" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                      <Briefcase size={18} />
                    </div>
                    <span className="metric-box-label">Total Business</span>
                    <span className="metric-box-value">{formatCurrency(total)}</span>
                  </div>

                  {/* Amount Paid */}
                  <div className="metric-inner-box">
                    <div className="metric-box-icon" style={{ backgroundColor: '#FEFCE8', color: '#CA8A04' }}>
                      <Coins size={18} />
                    </div>
                    <span className="metric-box-label">Amount Paid</span>
                    <span className="metric-box-value val-success">{formatCurrency(paid)}</span>
                  </div>

                  {/* Remaining Due */}
                  <div className="metric-inner-box">
                    <div className="metric-box-icon" style={{ backgroundColor: remaining > 0 ? '#FEF2F2' : '#F0FDF4', color: remaining > 0 ? '#DC2626' : '#16A34A' }}>
                      <Wallet size={18} />
                    </div>
                    <span className="metric-box-label">Remaining Due</span>
                    <span className={`metric-box-value ${remaining > 0 ? 'val-danger' : 'val-success'}`}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>

                {/* Bottom Current Status Row */}
                <div className="financial-status-footer">
                  <span style={{ fontSize: '13.5px', color: '#64748B', fontWeight: 600 }}>Current Status</span>
                  <PaymentStatusBadge status={customer.paymentStatus} />
                </div>
              </div>
            </div>

            {/* Right Card: Policy Duration & Validity */}
            <div className="app-card">
              <div className="card-header">
                <div className="card-title">
                  <Calendar size={18} color="var(--primary-orange)" />
                  <span>Policy Duration & Validity</span>
                </div>
                <span
                  className="badge"
                  style={{
                    backgroundColor: isExpired ? '#FEF2F2' : '#F0FDF4',
                    color: isExpired ? '#DC2626' : '#16A34A',
                    fontWeight: 800,
                    fontSize: '12px',
                    padding: '3px 10px',
                    borderRadius: '9999px'
                  }}
                >
                  {isExpired ? 'Expired' : 'Active'}
                </span>
              </div>

              <div className="card-body">
                <div className="validity-list-container">
                  <div className="validity-list-row">
                    <div className="validity-row-left">
                      <Shield size={16} color="var(--primary-orange)" />
                      <span>Policy Classification</span>
                    </div>
                    <span className="validity-row-right">{customer.insuranceType}</span>
                  </div>

                  <div className="validity-list-row">
                    <div className="validity-row-left">
                      <Building2 size={16} color="var(--primary-orange)" />
                      <span>Insurance Carrier</span>
                    </div>
                    <span className="validity-row-right">{customer.insuranceCompany}</span>
                  </div>

                  <div className="validity-list-row">
                    <div className="validity-row-left">
                      <Calendar size={16} color="var(--primary-orange)" />
                      <span>Effective Start Date</span>
                    </div>
                    <span className="validity-row-right">{formatIndianDate(customer.policyStartDate)}</span>
                  </div>

                  <div className="validity-list-row">
                    <div className="validity-row-left">
                      <Calendar size={16} color="var(--primary-orange)" />
                      <span>Policy Expiry Date</span>
                    </div>
                    <span className="validity-row-right" style={{ color: urgency.color }}>
                      {formatIndianDate(customer.policyEndDate)}
                    </span>
                  </div>

                  <div className="validity-list-row">
                    <div className="validity-row-left">
                      <RefreshCw size={16} color="var(--primary-orange)" />
                      <span>Renewal Status</span>
                    </div>
                    <span className="validity-row-right" style={{ color: urgency.color }}>
                      {urgency.label}
                    </span>
                  </div>

                  <div className="validity-list-row">
                    <div className="validity-row-left">
                      <WhatsAppIcon size={16} color="#25D366" />
                      <span>30-Day Renewal Reminder</span>
                    </div>
                    <span className="validity-row-right">
                      {customer.reminderSent ? (
                        <span style={{ color: '#16A34A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} />
                          Notice Sent (WhatsApp)
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => handleSendWhatsApp('renewal')}
                          style={{
                            fontSize: '11.5px',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            color: '#15803D',
                            borderColor: '#25D366',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          <WhatsAppIcon size={13} color="#25D366" />
                          <span>Send Reminder</span>
                        </button>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card: Policy Document (PDF Document) */}
          <div className="app-card">
            <div className="card-header">
              <div className="card-title">
                <FileText size={18} color="var(--primary-orange)" />
                <span>Policy Document (PDF Document)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>
                <ShieldCheck size={16} color="#16A34A" />
                <span>Stored securely in InsureTrack</span>
              </div>
            </div>

            <div className="card-body">
              <div className="policy-doc-box">
                <div className="policy-doc-left">
                  <div className="pdf-icon-badge">
                    PDF
                  </div>
                  <div>
                    <div className="policy-doc-name">{displayPdfName}</div>
                    <div className="policy-doc-meta">
                      {formatFileSize(displayPdfSize)} • PDF Format • Click to preview
                    </div>
                  </div>
                </div>

                <div className="policy-doc-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowPdfModal(true)}
                    style={{ padding: '8px 18px', borderRadius: '10px' }}
                  >
                    <Eye size={15} />
                    <span>View PDF</span>
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={handleDownloadPdf}
                    style={{ padding: '8px 18px', borderRadius: '10px' }}
                  >
                    <Download size={15} />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS (Transaction Ledger) */}
      {activeTab === 'payments' && (
        <div className="app-card">
          <div className="card-header">
            <div className="card-title">
              <CreditCard size={18} color="var(--primary-orange)" />
              <span>Payment Ledger & Settlement Records</span>
            </div>
            {remaining > 0 && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowPaymentModal(true)}>
                <PlusCircle size={14} />
                <span>Add Payment</span>
              </button>
            )}
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>PAYMENT TYPE</th>
                  <th style={{ textAlign: 'right' }}>AMOUNT</th>
                  <th style={{ textAlign: 'right' }}>OUTSTANDING</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(customer.paymentHistory) && customer.paymentHistory.length > 0 ? (
                  customer.paymentHistory.map((item, idx) => (
                    <tr key={item.id || `pay-hist-${idx}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="var(--primary-orange)" />
                          <span>{formatIndianDate(item.date)}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{item.type || `Installment #${idx + 1}`}</span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--status-paid)', fontWeight: 700 }}>
                        {formatCurrency(item.amount)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: (Number(item.remainingAfter) || 0) > 0 ? '#DC2626' : 'var(--text-secondary)' }}>
                        {formatCurrency(item.remainingAfter)}
                      </td>
                      <td>
                        <PaymentStatusBadge status={item.status || (Number(item.remainingAfter) === 0 ? 'Paid' : 'Partial Payment')} />
                      </td>
                    </tr>
                  ))
                ) : paid > 0 ? (
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="var(--primary-orange)" />
                        <span>{formatIndianDate(customer.createdAt || customer.policyStartDate)}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>Initial Down Payment</span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--status-paid)', fontWeight: 700 }}>
                      {formatCurrency(paid)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: remaining > 0 ? '#DC2626' : 'var(--text-secondary)' }}>
                      {formatCurrency(remaining)}
                    </td>
                    <td>
                      <PaymentStatusBadge status={customer.paymentStatus} />
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                      <p style={{ fontWeight: 600 }}>No payments recorded yet.</p>
                      <button
                        className="btn btn-outline-orange btn-sm"
                        style={{ marginTop: '10px' }}
                        onClick={() => setShowPaymentModal(true)}
                      >
                        <PlusCircle size={14} />
                        <span>Record First Payment</span>
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="app-card">
          <div className="card-header">
            <div className="card-title">
              <FileText size={18} color="var(--primary-orange)" />
              <span>Policy Document Repository</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onOpenEditCustomer(customer)}>
              <Edit3 size={14} />
              <span>Replace / Re-upload Document</span>
            </button>
          </div>

          <div className="card-body">
            <div className="policy-doc-box">
              <div className="policy-doc-left">
                <div className="pdf-icon-badge">
                  PDF
                </div>
                <div>
                  <div className="policy-doc-name">{displayPdfName}</div>
                  <div className="policy-doc-meta">
                    {formatFileSize(displayPdfSize)} • IndexedDB Secure File Blob • Generated Certificate
                  </div>
                </div>
              </div>

              <div className="policy-doc-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowPdfModal(true)}
                >
                  <Eye size={15} />
                  <span>View in Preview</span>
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleDownloadPdf}
                >
                  <Download size={15} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVITY HISTORY */}
      {activeTab === 'history' && (
        <div className="app-card">
          <div className="card-header">
            <div className="card-title">
              <Clock size={18} color="var(--primary-orange)" />
              <span>Customer Activity Timeline</span>
            </div>
          </div>

          <div className="card-body" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#0F172A' }}>Customer Registered in InsureTrack</div>
                  <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                    Policy issued by {customer.insuranceCompany} ({customer.insuranceType})
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '4px' }}>
                    Effective: {formatIndianDate(customer.policyStartDate)}
                  </div>
                </div>
              </div>

              {paid > 0 && (
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Coins size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#0F172A' }}>Payment Received</div>
                    <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                      {formatCurrency(paid)} collected towards total premium of {formatCurrency(total)}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: isExpired ? '#FEF2F2' : '#FFFBEB', color: isExpired ? '#DC2626' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#0F172A' }}>Policy Renewal Deadline</div>
                  <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                    Scheduled expiry on {formatIndianDate(customer.policyEndDate)} ({urgency.label})
                  </div>
                </div>
              </div>

              {/* Renewal Reminders in Activity Timeline */}
              {customer.renewalReminders && customer.renewalReminders.length > 0 ? (
                customer.renewalReminders.map((rem) => (
                  <div key={rem.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FFF7ED', color: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BellRing size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#0F172A' }}>
                        Renewal Notice Sent ({rem.channel?.toUpperCase() || 'WHATSAPP'})
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                        {rem.note || '30-day policy renewal reminder notice'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '4px' }}>
                        Dispatched on {formatIndianDate(rem.sentAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : customer.reminderSent ? (
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FFF7ED', color: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BellRing size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#0F172A' }}>
                      Renewal Notice Sent ({customer.lastReminderChannel?.toUpperCase() || 'WHATSAPP'})
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                      30-day renewal notification recorded
                    </div>
                    {customer.lastReminderDate && (
                      <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '4px' }}>
                        Dispatched on {formatIndianDate(customer.lastReminderDate)}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        customer={customer}
        onClose={() => setShowPaymentModal(false)}
      />

      {/* Renewal Reminder Modal */}
      <RenewalReminderModal
        isOpen={showReminderModal}
        customer={customer}
        onClose={() => setShowReminderModal(false)}
        onRecordReminder={recordRenewalReminder}
      />

      {/* PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={showPdfModal}
        customer={customer}
        onClose={() => setShowPdfModal(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Customer Profile"
        message={`Are you sure you want to permanently delete ${customer.name}? All payment records and attached policy documents will be removed.`}
        confirmLabel="Delete Customer"
        isDanger
        onConfirm={() => {
          deleteCustomer(customer.id);
          navigate('/customers');
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

export default CustomerDetails;
