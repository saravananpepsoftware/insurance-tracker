import React, { useState, useEffect } from 'react';
import {
  X,
  BellRing,
  Send,
  MessageSquare,
  Mail,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  Clock,
  Shield,
  Smartphone
} from 'lucide-react';
import { formatIndianDate, calculateDaysRemaining } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { useToast } from '../../context/ToastContext';

export function WhatsAppIcon({ size = 16, color = "currentColor", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.486-8.413Z" />
    </svg>
  );
}

export function RenewalReminderModal({ isOpen, onClose, customer, onRecordReminder }) {
  const { addToast } = useToast();
  const [timing, setTiming] = useState('30_days');
  const [channel, setChannel] = useState('whatsapp');
  const [copied, setCopied] = useState(false);

  const daysLeft = customer ? calculateDaysRemaining(customer.policyEndDate) : 0;
  const isExpired = daysLeft < 0;

  // Build default message
  const getDefaultMessage = (selectedTiming, selectedChannel) => {
    if (!customer) return '';
    const expiryFormatted = formatIndianDate(customer.policyEndDate);
    const company = customer.insuranceCompany || 'your insurer';
    const type = customer.insuranceType || 'Insurance';
    const remaining = Number(customer.remainingAmount) || 0;
    const remainingClause = remaining > 0 ? ` Outstanding balance: ${formatCurrency(remaining)}.` : '';

    if (isExpired) {
      return `Dear ${customer.name},\n\nYour ${type} policy with ${company} has EXPIRED on ${expiryFormatted} (${Math.abs(daysLeft)} days ago).${remainingClause}\n\nPlease renew immediately to prevent coverage lapse, inspection penalties, and loss of No Claim Bonus (NCB).\n\nContact InsureTrack Support to renew now.`;
    }

    let timePhrase = 'in 30 days';
    if (selectedTiming === '15_days') timePhrase = 'in 15 days';
    else if (selectedTiming === '7_days') timePhrase = 'in 7 days';
    else if (daysLeft <= 30) timePhrase = `in ${daysLeft} days`;

    return `Dear ${customer.name},\n\nThis is a priority renewal reminder for your ${type} policy with ${company}.\n\nYour policy is due for renewal ${timePhrase} on ${expiryFormatted}.${remainingClause}\n\nRenew today to maintain uninterrupted insurance coverage. Reply to this message or contact InsureTrack to complete your quick renewal.`;
  };

  const [message, setMessage] = useState('');

  // Update default message when modal opens or customer changes
  useEffect(() => {
    if (isOpen && customer) {
      setMessage(getDefaultMessage(timing, channel));
      setCopied(false);
    }
  }, [isOpen, customer, timing, channel]);

  if (!isOpen || !customer) return null;

  const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    addToast('Reminder message copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
    if (onRecordReminder) {
      onRecordReminder(customer.id, {
        channel: 'whatsapp',
        timingDays: timing === '30_days' ? 30 : timing === '15_days' ? 15 : 7,
        message,
        note: `Dispatched via WhatsApp (${timing === '30_days' ? '30 days prior notice' : timing})`
      });
    }
    onClose();
  };

  const handleLogAsSent = () => {
    if (onRecordReminder) {
      onRecordReminder(customer.id, {
        channel,
        timingDays: timing === '30_days' ? 30 : timing === '15_days' ? 15 : 7,
        message,
        note: `Dispatched via ${channel.toUpperCase()} (${timing.replace('_', ' ')})`
      });
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', width: '92%' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--light-orange)',
                color: 'var(--primary-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BellRing size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '18px' }}>Send Renewal Reminder</h2>
              <p className="modal-subtitle">
                Notify {customer.name} before policy expiration
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Policy Context Alert Box */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: isExpired ? '#FEF2F2' : '#FFF8F3',
              border: `1px solid ${isExpired ? '#FECACA' : '#FED7AA'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={18} color={isExpired ? '#DC2626' : 'var(--primary-orange)'} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0F172A' }}>
                  {customer.insuranceCompany} • {customer.insuranceType}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Expiry Date: <strong>{formatIndianDate(customer.policyEndDate)}</strong>
                </div>
              </div>
            </div>

            <span
              className="badge"
              style={{
                backgroundColor: isExpired ? '#DC2626' : '#EA580C',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '11.5px',
                padding: '4px 10px',
                borderRadius: '9999px'
              }}
            >
              {isExpired ? `Expired (${Math.abs(daysLeft)}d ago)` : `${daysLeft} days left`}
            </span>
          </div>

          {/* Timing Option Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Select Reminder Window
            </label>
            <div className="reminder-timing-options">
              <button
                type="button"
                className={`reminder-timing-btn ${timing === '30_days' ? 'active' : ''}`}
                onClick={() => setTiming('30_days')}
              >
                🔔 30 Days Before
              </button>
              <button
                type="button"
                className={`reminder-timing-btn ${timing === '15_days' ? 'active' : ''}`}
                onClick={() => setTiming('15_days')}
              >
                ⚠️ 15 Days Before
              </button>
              <button
                type="button"
                className={`reminder-timing-btn ${timing === '7_days' ? 'active' : ''}`}
                onClick={() => setTiming('7_days')}
              >
                🚨 7 Days Before
              </button>
            </div>
          </div>

          {/* Delivery Channel Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Notification Channel
            </label>
            <div className="reminder-channel-tabs">
              <button
                type="button"
                className={`reminder-channel-tab ${channel === 'whatsapp' ? 'active' : ''}`}
                onClick={() => setChannel('whatsapp')}
              >
                <WhatsAppIcon size={16} color={channel === 'whatsapp' ? '#25D366' : '#64748B'} />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                className={`reminder-channel-tab ${channel === 'sms' ? 'active' : ''}`}
                onClick={() => setChannel('sms')}
              >
                <MessageSquare size={15} />
                <span>SMS</span>
              </button>
              <button
                type="button"
                className={`reminder-channel-tab ${channel === 'email' ? 'active' : ''}`}
                onClick={() => setChannel('email')}
              >
                <Mail size={15} />
                <span>Email</span>
              </button>
            </div>
          </div>

          {/* Message Preview and Editor */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                Notice Message Content
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copied ? '#16A34A' : 'var(--primary-orange)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              className="reminder-message-preview"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your reminder notice..."
            />
            <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '4px', textAlign: 'right' }}>
              Recipient Phone: <strong>{customer.phone}</strong>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {channel === 'whatsapp' ? (
              <button
                type="button"
                className="btn-whatsapp"
                onClick={handleSendWhatsApp}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <WhatsAppIcon size={17} color="#FFFFFF" />
                <span>Send Reminder in WhatsApp</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleLogAsSent}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Send size={15} />
                <span>Send Reminder in {channel.toUpperCase()}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RenewalReminderModal;

