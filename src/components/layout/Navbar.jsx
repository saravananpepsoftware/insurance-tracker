import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomers } from '../../context/CustomerContext';
import { calculateDaysRemaining, formatIndianDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { WhatsAppIcon } from '../customers/RenewalReminderModal';
import {
  Search,
  Bell,
  Plus,
  ShieldCheck,
  X,
  Wallet,
  Calendar,
  Send,
  AlertCircle
} from 'lucide-react';

export function Navbar({ onOpenAddCustomer }) {
  const { searchTerm, setSearchTerm, customers, dispatchCustomerReminder } = useCustomers();
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState('pending'); // 'pending' | 'expiry'
  const notifRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val && location.pathname !== '/customers' && location.pathname !== '/payments' && location.pathname !== '/renewals') {
      navigate('/customers');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Customers with pending balance ("bending amount")
  const pendingNotifications = customers.filter(c => Number(c.remainingAmount) > 0);

  // Customers with expiring or expired policies (within 30 days or expired)
  const expiringNotifications = customers.filter(c => {
    const days = calculateDaysRemaining(c.policyEndDate);
    return days <= 30;
  });

  const totalAlertCount = pendingNotifications.length + expiringNotifications.length;

  return (
    <header className="navbar">
      {/* Mobile Brand for small screens */}
      <div className="navbar-mobile-brand">
        <div className="logo-icon-box" style={{ width: '32px', height: '32px' }}>
          <ShieldCheck size={18} strokeWidth={2.4} />
        </div>
        <div style={{ fontWeight: 800, fontSize: '18px', color: '#111827', letterSpacing: '-0.02em' }}>
          Insure<span style={{ color: 'var(--primary-orange)' }}>Track</span>
        </div>
      </div>

      {/* Global Search Bar (Desktop) */}
      <div className="navbar-left">
        <div className="global-search-bar">
          <Search size={16} color="#94A3B8" />
          <input
            ref={searchInputRef}
            type="text"
            className="global-search-input"
            placeholder="Search by customer name, phone, or company..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm ? (
            <button onClick={clearSearch} style={{ color: 'var(--text-muted)' }}>
              <X size={14} />
            </button>
          ) : (
            <span className="search-shortcut-badge">Ctrl + K</span>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="navbar-right">
        {/* + Add Customer Orange Pill Button */}
        <button
          className="btn btn-primary btn-navbar-add"
          onClick={onOpenAddCustomer}
          title="Add New Customer"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Add Customer</span>
        </button>

        {/* Notification Bell with Pending Amount & Expiry Alerts */}
        <div className="notification-wrapper" ref={notifRef}>
          <button
            className={`notification-btn ${totalAlertCount > 0 ? 'has-alerts' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View reminders and notifications"
            title={`${totalAlertCount} Reminders (Pending amounts & Expirations)`}
          >
            <Bell size={18} strokeWidth={2} />
            {totalAlertCount > 0 && (
              <span className="notification-indicator" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9.5px', fontWeight: 800 }}>
                {totalAlertCount > 9 ? '9+' : totalAlertCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown" style={{ width: '360px', padding: '14px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '8px',
                borderBottom: '1px solid #F1F5F9',
                marginBottom: '8px'
              }}>
                <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#0F172A' }}>
                  Admin Reminders & Alerts
                </span>
                <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700, backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '9999px' }}>
                  {totalAlertCount} Due
                </span>
              </div>

              {/* Notification Filter Tabs */}
              <div className="nav-notif-tabs">
                <button
                  type="button"
                  className={`nav-notif-tab ${activeNotifTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveNotifTab('pending')}
                >
                  Pay Pending Amount ({pendingNotifications.length})
                </button>
                <button
                  type="button"
                  className={`nav-notif-tab ${activeNotifTab === 'expiry' ? 'active' : ''}`}
                  onClick={() => setActiveNotifTab('expiry')}
                >
                  Policy Expiring Soon ({expiringNotifications.length})
                </button>
              </div>

              {/* TAB 1: PENDING PAYMENTS */}
              {activeNotifTab === 'pending' && (
                <div>
                  {pendingNotifications.length === 0 ? (
                    <div style={{ padding: '18px 12px', textAlign: 'center', color: '#64748B', fontSize: '12.5px' }}>
                      All customer accounts are fully paid! No pending balance.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                      {pendingNotifications.slice(0, 6).map(c => (
                        <div
                          key={c.id}
                          style={{
                            padding: '10px',
                            borderRadius: '10px',
                            backgroundColor: '#FFFDFB',
                            border: '1px solid #FED7AA',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <div
                                style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', cursor: 'pointer' }}
                                onClick={() => {
                                  setShowNotifications(false);
                                  navigate(`/customers/${c.id}`);
                                }}
                              >
                                {c.name}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                                {c.insuranceCompany}
                              </div>
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '13px', color: '#DC2626' }}>
                              {formatCurrency(c.remainingAmount)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '4px', borderTop: '1px dashed #FED7AA' }}>
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                              {c.phone}
                            </span>
                            <button
                              type="button"
                              className="btn-whatsapp-compact"
                              style={{ width: 'auto', padding: '4px 10px', fontSize: '11.5px', borderRadius: '6px' }}
                              onClick={() => {
                                dispatchCustomerReminder(c, 'payment');
                                setShowNotifications(false);
                              }}
                              title="Send WhatsApp payment reminder & show app pop-up"
                            >
                              <WhatsAppIcon size={12} color="#FFFFFF" />
                              <span>Remind</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: POLICY EXPIRATIONS */}
              {activeNotifTab === 'expiry' && (
                <div>
                  {expiringNotifications.length === 0 ? (
                    <div style={{ padding: '18px 12px', textAlign: 'center', color: '#64748B', fontSize: '12.5px' }}>
                      No policies expiring within the next 30 days.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                      {expiringNotifications.slice(0, 6).map(c => {
                        const days = calculateDaysRemaining(c.policyEndDate);
                        const isExpired = days < 0;
                        return (
                          <div
                            key={c.id}
                            style={{
                              padding: '10px',
                              borderRadius: '10px',
                              backgroundColor: '#FFFDFB',
                              border: `1px solid ${isExpired ? '#FECACA' : '#FED7AA'}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <div
                                  style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', cursor: 'pointer' }}
                                  onClick={() => {
                                    setShowNotifications(false);
                                    navigate(`/customers/${c.id}`);
                                  }}
                                >
                                  {c.name}
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                                  {c.insuranceCompany} • {formatIndianDate(c.policyEndDate)}
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: isExpired ? '#DC2626' : days <= 7 ? '#DC2626' : '#D97706',
                                  backgroundColor: isExpired ? '#FEE2E2' : days <= 7 ? '#FEE2E2' : '#FEF3C7',
                                  padding: '2px 8px',
                                  borderRadius: '9999px'
                                }}
                              >
                                {isExpired ? `Expired (${Math.abs(days)}d)` : `${days}d left`}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '4px', borderTop: '1px dashed #E2E8F0' }}>
                              <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                                {c.phone}
                              </span>
                              <button
                                type="button"
                                className="btn-whatsapp-compact"
                                style={{ width: 'auto', padding: '4px 10px', fontSize: '11.5px', borderRadius: '6px' }}
                                onClick={() => {
                                  dispatchCustomerReminder(c, 'expiry');
                                  setShowNotifications(false);
                                }}
                                title="Send WhatsApp renewal reminder & show app pop-up"
                              >
                                <WhatsAppIcon size={12} color="#FFFFFF" />
                                <span>Remind</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Dropdown Footer Links */}
              <div style={{
                borderTop: '1px solid #F1F5F9',
                paddingTop: '10px',
                marginTop: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button
                  type="button"
                  style={{ fontSize: '12px', color: '#2563EB', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/payments');
                  }}
                >
                  View Payments →
                </button>

                <button
                  type="button"
                  style={{ fontSize: '12px', color: 'var(--primary-orange)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/renewals');
                  }}
                >
                  View Renewals →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Admin Profile Widget */}
        <div className="user-profile-widget">
          <div className="user-avatar">
            AD
          </div>
          <div className="user-meta">
            <span className="user-name">Admin Manager</span>
            <span className="user-role">Insurance Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
