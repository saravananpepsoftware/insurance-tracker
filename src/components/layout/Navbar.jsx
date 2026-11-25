import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Plus,
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

  const isStaff = user?.role === 'staff';
  const userInitials = isStaff ? 'ST' : (user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS');
  const userDisplayName = user?.name || (isStaff ? 'Ashok Insurance Staff' : 'Ashok Insurance Admin');
  const userEmail = user?.email || (isStaff ? 'staff@gmail.com' : 'ashokinsurance@gmail.com');

  return (
    <header className="navbar">
      <div className="navbar-capsule-wrapper">
        {/* Decorative corner accent layers */}
        <div className="navbar-corner-accent-left" aria-hidden="true" />
        <div className="navbar-corner-accent-right" aria-hidden="true" />

        {/* Floating Stadium Capsule Navbar */}
        <div className="navbar-capsule">
          {/* Left Brand Section */}
          <div className="navbar-brand-group">
            {/* Orange Shield Logo with Car Front Silhouette */}
            <svg
              className="navbar-shield-logo"
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Ashok Auto Logo"
            >
              <defs>
                <linearGradient id="navShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF851A" />
                  <stop offset="100%" stopColor="#EA4E00" />
                </linearGradient>
              </defs>
              <path
                d="M 22 2.5 C 31 2.5 39.5 6 39.5 13.5 C 39.5 28 27.5 37.5 22 41.5 C 16.5 37.5 4.5 28 4.5 13.5 C 4.5 6 13 2.5 22 2.5 Z"
                fill="url(#navShieldGrad)"
              />
              <path
                d="M 22 4.5 C 29.5 4.5 37 7.5 37 14 C 37 26.5 26.5 35 22 38.5 C 17.5 35 7 26.5 7 14 C 7 7.5 14.5 4.5 22 4.5 Z"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="1"
                fill="none"
              />
              {/* Car Front Silhouette */}
              <path d="M 17 15 L 18.5 19 L 25.5 19 L 27 15 Z" fill="#FFFFFF" />
              <path
                d="M 14 20 C 14 19.4 14.5 19 15.2 19 L 28.8 19 C 29.5 19 30 19.4 30 20 L 30.8 23 C 31 23.6 30.5 24.2 29.8 24.2 L 14.2 24.2 C 13.5 24.2 13 23.6 13.2 23 Z"
                fill="#FFFFFF"
              />
              <ellipse cx="16" cy="21.6" rx="1.6" ry="0.9" fill="#EA4E00" />
              <ellipse cx="28" cy="21.6" rx="1.6" ry="0.9" fill="#EA4E00" />
              <rect x="19" y="21.5" width="6" height="1.2" rx="0.6" fill="#EA4E00" />
              <rect x="17" y="23.5" width="10" height="1.2" rx="0.6" fill="rgba(0,0,0,0.15)" />
              <rect x="13.8" y="24" width="2.5" height="2.2" rx="0.8" fill="#FFFFFF" />
              <rect x="27.7" y="24" width="2.5" height="2.2" rx="0.8" fill="#FFFFFF" />
            </svg>

            <div className="navbar-brand-divider" />

            <div className="navbar-brand-text">
              <span className="navbar-brand-title">Ashok Auto</span>
              <div className="navbar-brand-sub-wrap">
                <span className="navbar-brand-subtitle">Insurance</span>
                <svg className="navbar-brand-swoosh" viewBox="0 0 95 10" fill="none">
                  <path
                    d="M 2 2 Q 48 10 93 2"
                    stroke="#FF7A00"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Center 3D Perspective Particle Wave SVG */}
          <svg
            className="navbar-wave-bg"
            viewBox="0 0 500 70"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M 0 35 Q 120 10 240 35 T 480 30 T 500 42"
              stroke="#FF7A00"
              strokeWidth="1.4"
              strokeDasharray="2.5 5.5"
              opacity="0.4"
            />
            <path
              d="M 0 40 Q 130 15 260 40 T 500 35"
              stroke="#FF7A00"
              strokeWidth="1.4"
              strokeDasharray="3 6.5"
              opacity="0.3"
            />
            <path
              d="M 0 45 Q 140 20 280 45 T 500 40"
              stroke="#FF7A00"
              strokeWidth="1.4"
              strokeDasharray="3.5 7.5"
              opacity="0.2"
            />
            <path
              d="M 0 30 Q 110 8 220 30 T 460 25 T 500 38"
              stroke="#FF7A00"
              strokeWidth="1.2"
              strokeDasharray="2 5"
              opacity="0.3"
            />
          </svg>

          {/* Right Action & Profile Controls */}
          <div className="navbar-right-group">
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
              type="button"
              className="btn-add-customer-pill btn-navbar-add"
              onClick={onOpenAddCustomer}
              title="Add New Customer"
            >
              <Plus size={16} strokeWidth={2.8} />
              <span className="navbar-add-text-desktop">Add Customer</span>
              <span className="navbar-add-text-mobile">Add</span>
            </button>

            <div className="navbar-user-divider" />

            {/* User Profile Widget & Dropdown */}
            <div className="navbar-user-profile-container" ref={profileMenuRef}>
              <div
                className="navbar-user-profile user-profile-widget"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                title={`Click to view ${isStaff ? 'Staff' : 'Admin'} account / Logout`}
              >
                <div
                  className="navbar-user-avatar user-avatar"
                  style={
                    isStaff
                      ? { background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', color: '#FFFFFF' }
                      : {}
                  }
                >
                  {userInitials}
                </div>
                <div className="navbar-user-meta user-meta">
                  <span className="navbar-user-name user-name">{userDisplayName}</span>
                  <span className="navbar-user-email user-role">{userEmail}</span>
                </div>
                <ChevronDown
                  size={14}
                  className="navbar-user-chevron"
                  style={{
                    color: '#64748B',
                    transition: 'transform 0.2s ease',
                    transform: showProfileMenu ? 'rotate(180deg)' : 'none'
                  }}
                />
              </div>

              {showProfileMenu && (
                <div className="navbar-user-dropdown user-profile-dropdown">
                  <div className="navbar-user-dropdown-header">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        color: isStaff ? '#0284C7' : '#16A34A',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}
                    >
                      <UserCheck size={13} />
                      <span>{isStaff ? 'Authenticated Staff' : 'Authenticated Admin'}</span>
                    </div>
                    <div className="navbar-user-dropdown-name">{userDisplayName}</div>
                    <div className="navbar-user-dropdown-email">{userEmail}</div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="navbar-user-dropdown-logout"
                  >
                    <LogOut size={15} />
                    <span>Sign Out (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
