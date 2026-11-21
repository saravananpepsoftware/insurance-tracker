import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomers } from '../../context/CustomerContext';
import { calculateDaysRemaining } from '../../utils/dateUtils';
import {
  Search,
  Bell,
  Plus,
  ShieldCheck,
  X
} from 'lucide-react';

export function Navbar({ onOpenAddCustomer }) {
  const { searchTerm, setSearchTerm, customers } = useCustomers();
  const [showNotifications, setShowNotifications] = useState(false);
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

  // Urgent expiring notifications (0 - 15 days)
  const urgentNotifications = customers.filter(c => {
    const days = calculateDaysRemaining(c.policyEndDate);
    return days >= 0 && days <= 15;
  }).slice(0, 5);

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

        {/* Notification Bell */}
        <div className="notification-wrapper" ref={notifRef}>
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
          >
            <Bell size={18} strokeWidth={2} />
            {urgentNotifications.length > 0 && <span className="notification-indicator" />}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--card-border-subtle)',
                marginBottom: '10px'
              }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                  Policy Alerts ({urgentNotifications.length})
                </span>
                <span style={{ fontSize: '11px', color: 'var(--primary-orange)', fontWeight: 700 }}>
                  Expiring Soon
                </span>
              </div>

              {urgentNotifications.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  No urgent policies expiring in the next 15 days.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {urgentNotifications.map(c => {
                    const days = calculateDaysRemaining(c.policyEndDate);
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setShowNotifications(false);
                          navigate(`/customers/${c.id}`);
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#FFFDFB',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid var(--card-border-subtle)'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                            {c.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {c.insuranceCompany}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: days <= 7 ? 'var(--status-danger)' : 'var(--primary-orange)',
                          backgroundColor: days <= 7 ? 'var(--status-danger-bg)' : 'var(--light-orange)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)'
                        }}>
                          {days === 0 ? 'Today' : `${days}d left`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{
                borderTop: '1px solid var(--card-border-subtle)',
                paddingTop: '8px',
                marginTop: '10px',
                textAlign: 'center'
              }}>
                <button
                  style={{ fontSize: '12px', color: 'var(--primary-orange)', fontWeight: 700, background: 'none' }}
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/renewals');
                  }}
                >
                  View All Renewals →
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
