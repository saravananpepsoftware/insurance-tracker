import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Plus,
  ShieldCheck,
  ChevronDown,
  LogOut,
  UserCheck,
  Sun,
  Moon
} from 'lucide-react';

export function Navbar({ onOpenAddCustomer }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

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

      {/* Right Controls */}
      <div className="navbar-right">
        {/* Day / Night Theme Switch */}
        <button
          type="button"
          className={`theme-toggle-switch ${theme === 'dark' ? 'is-dark' : 'is-light'}`}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
          aria-label="Toggle theme mode"
        >
          <div className="theme-toggle-track">
            <span className="theme-toggle-icon sun-icon" title="Day Mode">
              <Sun size={13} strokeWidth={2.4} />
            </span>
            <span className="theme-toggle-icon moon-icon" title="Night Mode">
              <Moon size={13} strokeWidth={2.4} />
            </span>
            <div className="theme-toggle-thumb">
              {theme === 'dark' ? (
                <Moon size={11} strokeWidth={2.5} />
              ) : (
                <Sun size={11} strokeWidth={2.5} />
              )}
            </div>
          </div>
        </button>

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

        {/* User Admin/Staff Profile Widget with Dropdown */}
        <div className="user-profile-widget-wrapper" ref={profileMenuRef} style={{ position: 'relative' }}>
          <div
            className="user-profile-widget"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title={`Click to view ${user?.role === 'staff' ? 'Staff' : 'Admin'} account / Logout`}
          >
            <div
              className="user-avatar"
              style={
                user?.role === 'staff'
                  ? { background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', color: '#FFFFFF' }
                  : {}
              }
            >
              {user?.role === 'staff' ? 'ST' : (user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS')}
            </div>
            <div className="user-meta">
              <span className="user-name">
                {user?.name || (user?.role === 'staff' ? 'Staff Member' : 'Admin Manager')}
              </span>
              <span className="user-role">
                {user?.email || (user?.role === 'staff' ? 'staff@gmail.com' : 'ashokinsurance@gmail.com')}
              </span>
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
                backgroundColor: 'var(--card-bg)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-card)',
                border: '1px solid var(--card-border)',
                padding: '14px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--card-border)' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: user?.role === 'staff' ? '#0284C7' : '#16A34A',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  <UserCheck size={13} />
                  <span>{user?.role === 'staff' ? 'Authenticated Staff' : 'Authenticated Admin'}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {user?.name || (user?.role === 'staff' ? 'Ashok Insurance Staff' : 'Ashok Insurance Admin')}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--primary-orange)', fontWeight: 600, wordBreak: 'break-all', marginTop: '2px' }}>
                  {user?.email || (user?.role === 'staff' ? 'staff@gmail.com' : 'ashokinsurance@gmail.com')}
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
