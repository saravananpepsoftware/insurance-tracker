import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomers } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Plus,
  ShieldCheck,
  X,
  ChevronDown,
  LogOut,
  UserCheck
} from 'lucide-react';

export function Navbar({ onOpenAddCustomer }) {
  const { searchTerm, setSearchTerm } = useCustomers();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchInputRef = useRef(null);
  const profileMenuRef = useRef(null);
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

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
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

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      {/* Mobile Brand for small screens */}
      <div className="navbar-mobile-brand">
        <div className="logo-icon-box" style={{ width: '28px', height: '28px', borderRadius: '8px' }}>
          <ShieldCheck size={16} strokeWidth={2.4} />
        </div>
        <div className="navbar-mobile-brand-text">
          Ashok Auto <span style={{ color: 'var(--primary-orange)' }}>Insurance</span>
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
          <span className="navbar-add-text-desktop">Add Customer</span>
          <span className="navbar-add-text-mobile">Add</span>
        </button>

        {/* User Admin Profile Widget with Dropdown */}
        <div className="user-profile-widget-wrapper" ref={profileMenuRef} style={{ position: 'relative' }}>
          <div
            className="user-profile-widget"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title="Click to view Admin account / Logout"
          >
            <div className="user-avatar">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="user-meta">
              <span className="user-name">{user?.name || 'Admin Manager'}</span>
              <span className="user-role">{user?.email || 'ashokinsurance@gmail.com'}</span>
            </div>
            <ChevronDown size={14} color="#94A3B8" style={{ marginLeft: '2px', transition: 'transform 0.2s', transform: showProfileMenu ? 'rotate(180deg)' : 'none' }} />
          </div>

          {showProfileMenu && (
            <div
              className="user-profile-dropdown"
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '260px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 12px 36px -4px rgba(255, 107, 0, 0.12), 0 4px 16px -2px rgba(0, 0, 0, 0.06)',
                border: '1px solid #F1E9E2',
                padding: '14px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#16A34A', fontWeight: 700, textTransform: 'uppercase' }}>
                  <UserCheck size={13} />
                  <span>Authenticated Admin</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0F172A', marginTop: '4px' }}>
                  {user?.name || 'Ashok Insurance Admin'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--primary-orange)', fontWeight: 600, wordBreak: 'break-all', marginTop: '2px' }}>
                  {user?.email || 'ashokinsurance@gmail.com'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.15s ease'
                }}
              >
                <LogOut size={15} />
                <span>Sign Out (Logout)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
