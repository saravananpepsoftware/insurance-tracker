import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, X, CheckCircle2, ArrowRight, Shield, AlertTriangle, Phone, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatIndianDate } from '../../utils/dateUtils';
import { WhatsAppIcon } from '../customers/RenewalReminderModal';

export function ReminderPopupNotification({ notification, onClose }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!notification) {
      setProgress(100);
      return;
    }

    const duration = 8000; // 8 seconds
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - step;
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [notification, isPaused, onClose]);

  if (!notification) return null;

  const {
    recipient = 'Customer',
    phone = '',
    type = 'payment', // 'payment' | 'expiry'
    amount = 0,
    daysLeft = 0,
    policyEndDate = '',
    company = 'Insurance Carrier',
    insuranceType = 'Insurance Policy',
    customerId = ''
  } = notification;

  const isPayment = type === 'payment';
  const isExpired = daysLeft < 0;

  return (
    <div
      className="reminder-popup-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      aria-live="assertive"
    >
      {/* Top Progress Bar */}
      <div className="reminder-popup-progress-track">
        <div
          className="reminder-popup-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="reminder-popup-body">
        {/* Left Icon Box with pulsing glow */}
        <div className="reminder-popup-icon-box">
          <BellRing size={22} className="bell-ringing-anim" />
        </div>

        {/* Content */}
        <div className="reminder-popup-content">
          <div className="reminder-popup-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="reminder-popup-title">
                App Notification: Reminder Sent!
              </span>
              <span className="reminder-popup-badge-admin">
                Admin Dispatched
              </span>
            </div>
            <button
              className="reminder-popup-close-btn"
              onClick={onClose}
              title="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>

          <p className="reminder-popup-desc">
            WhatsApp reminder notice was dispatched to{' '}
            <strong>{recipient}</strong> ({phone}).
          </p>

          {/* Details Card */}
          <div className="reminder-popup-details-card">
            {isPayment ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wallet size={15} color="#EA580C" />
                  <span style={{ fontSize: '12.5px', color: '#475569' }}>
                    Pending Balance Due:
                  </span>
                </div>
                <strong style={{ fontSize: '13.5px', color: '#DC2626' }}>
                  {formatCurrency(amount)}
                </strong>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={15} color="var(--primary-orange)" />
                  <span style={{ fontSize: '12.5px', color: '#475569' }}>
                    Policy Expiration:
                  </span>
                </div>
                <strong style={{ fontSize: '13px', color: isExpired ? '#DC2626' : '#D97706' }}>
                  {isExpired ? `Expired (${Math.abs(daysLeft)}d ago)` : `Due in ${daysLeft} days`}
                </strong>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '4px', fontSize: '11.5px', color: '#64748B' }}>
              <span>{company} • {insuranceType}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#16A34A', fontWeight: 600 }}>
                <CheckCircle2 size={12} /> Logged in Records
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="reminder-popup-footer">
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>
              Automated in-app popup • Stored in Activity History
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {customerId && (
                <button
                  type="button"
                  className="btn-popup-view"
                  onClick={() => {
                    onClose();
                    navigate(`/customers/${customerId}`);
                  }}
                >
                  <span>View Customer</span>
                  <ArrowRight size={13} />
                </button>
              )}
              <button
                type="button"
                className="btn-popup-dismiss"
                onClick={onClose}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReminderPopupNotification;
