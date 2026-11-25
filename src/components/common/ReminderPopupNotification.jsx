import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, X, CheckCircle2, ArrowRight, Shield, AlertTriangle, Phone, Wallet, Radio, Smartphone, Zap } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatIndianDate } from '../../utils/dateUtils';

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
    title = '',
    body = '',
    fcmToken = '',
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
  const displayTitle = title || (isPayment ? 'Pay the pending amount' : 'Your policy expires soon, renew quick');

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
        <div className={`reminder-popup-icon-box ${isPayment ? 'icon-payment' : 'icon-expiry'}`}>
          <BellRing size={22} className="bell-ringing-anim" />
        </div>

        {/* Content */}
        <div className="reminder-popup-content">
          <div className="reminder-popup-header-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="reminder-popup-badge-admin">
                  FCM App Pop-up
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }}></span>
                  Device Delivered
                </span>
              </div>
              <h4 className="reminder-popup-title">
                {displayTitle}
              </h4>
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
            FCM push notification delivered to <strong>{recipient}</strong> ({phone}).
          </p>

          {/* Device Mock Notification Card */}
          <div className="fcm-device-preview-card">
            <div className="fcm-device-preview-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Smartphone size={12} color="var(--primary-orange)" />
                <span style={{ fontWeight: 700, color: '#F8FAFC' }}>Ashok Auto Insurance</span>
              </div>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>Just now</span>
            </div>
            <div className="fcm-device-preview-title">
              {displayTitle}
            </div>
            <div className="fcm-device-preview-body">
              {body || (isPayment
                ? `Pending amount of ${formatCurrency(amount)} is due for ${company} (${insuranceType}).`
                : `Policy for ${company} (${insuranceType}) expires soon. Please renew quick.`
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '9.5px', color: '#94A3B8' }}>
              <span>FCM Token: {fcmToken ? `${fcmToken.slice(0, 16)}...` : 'active'}</span>
              <span style={{ color: '#4ADE80', fontWeight: 700 }}>Priority: High</span>
            </div>
          </div>

          {/* Details Card */}
          <div className="reminder-popup-details-card" style={{ marginTop: '8px' }}>
            {isPayment ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wallet size={15} color="#EA580C" />
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Pending Balance Due:
                  </span>
                </div>
                <strong style={{ fontSize: '13.5px', color: '#DC2626', fontWeight: 800 }}>
                  {formatCurrency(amount)}
                </strong>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={15} color="var(--primary-orange)" />
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Policy Expiration:
                  </span>
                </div>
                <strong style={{ fontSize: '13px', color: isExpired ? '#DC2626' : '#D97706', fontWeight: 800 }}>
                  {isExpired ? `Expired (${Math.abs(daysLeft)}d ago)` : `Due in ${daysLeft} days (${formatIndianDate(policyEndDate)})`}
                </strong>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '4px', fontSize: '11.5px', color: '#64748B' }}>
              <span>{company} • {insuranceType}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#16A34A', fontWeight: 600 }}>
                <CheckCircle2 size={12} /> Logged in Activity History
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="reminder-popup-footer">
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>
              Dispatched via Firebase Cloud Messaging
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

