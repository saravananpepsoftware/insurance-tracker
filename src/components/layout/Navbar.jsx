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
            {/* Orange Shield Logo with Front Car Silhouette & Dynamic Orbital Ribbon */}
            <svg
              className="navbar-shield-logo"
              width="48"
              height="53"
              viewBox="0 0 135 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Ashok Auto Logo"
            >
              <defs>
                <linearGradient id="navShieldGrad" x1="25%" y1="0%" x2="75%" y2="100%">
                  <stop offset="0%" stopColor="#FF9E00" />
                  <stop offset="45%" stopColor="#FF6A00" />
                  <stop offset="100%" stopColor="#DC3200" />
                </linearGradient>
                <linearGradient id="navSwooshGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF5500" />
                  <stop offset="60%" stopColor="#FF7D00" />
                  <stop offset="100%" stopColor="#FFA600" />
                </linearGradient>
              </defs>

              {/* Main Shield Body */}
              <path
                d="M 67.5 9
                   C 83 12 109 17 124 24
                   C 125 46 125 68 118 88
                   C 110 113 88 137 67.5 149
                   C 47 137 25 113 17 88
                   C 10 68 10 46 11 24
                   C 26 17 52 12 67.5 9 Z"
                fill="url(#navShieldGrad)"
              />

              {/* Car Silhouette (White) */}
              {/* Roofline */}
              <path
                d="M 48 54 
                   C 53 47 60 46 67.5 46 
                   C 75 46 82 47 87 54 
                   C 81 54 75 53 67.5 53 
                   C 60 53 54 54 48 54 Z"
                fill="#FFFFFF"
              />

              {/* Body, Hood & Side Mirrors */}
              <path
                d="M 42 62 
                   C 38 61 36 63 38 65 
                   C 40 65 42 64 43 63 
                   L 44 68 
                   C 44 70 47 72 50 72 
                   L 85 72 
                   C 88 72 91 70 91 68 
                   L 92 63 
                   C 93 64 95 65 97 65 
                   C 99 63 97 61 93 62 
                   C 88 61 79 59 67.5 59 
                   C 56 59 47 61 42 62 Z"
                fill="#FFFFFF"
              />

              {/* Front Lower Bumper */}
              <path
                d="M 45 73 
                   L 46 78 
                   C 47 81 50 83 55 83 
                   L 80 83 
                   C 85 83 88 81 89 78 
                   L 90 73 
                   Z"
                fill="#FFFFFF"
              />

              {/* Slanted Headlights (cutout showing gradient) */}
              <path d="M 41 67 Q 45 66 49 68 Q 45 70 41 67 Z" fill="url(#navShieldGrad)" />
              <path d="M 94 67 Q 90 66 86 68 Q 90 70 94 67 Z" fill="url(#navShieldGrad)" />

              {/* Lower Grille slot (cutout showing gradient) */}
              <rect x="54" y="76" width="27" height="3.5" rx="1.5" fill="url(#navShieldGrad)" />

              {/* Dynamic Orbital Ribbon Swoosh */}
              {/* Cutout Underlay to separate from shield */}
              <path
                className="navbar-shield-swoosh-cutout"
                d="M 6 96 
                   C 6 112 18 126 38 126 
                   C 60 126 88 108 124 74 
                   C 128 70 131 66 133 63
                   C 129 68 122 76 114 83
                   C 86 108 59 121 38 121
                   C 21 121 12 110 12 96
                   C 12 94 13 92 14 90
                   C 10 91 7 93 6 96
                   Z"
                fill="var(--navbar-shield-cutout, #FFFFFF)"
                stroke="var(--navbar-shield-cutout, #FFFFFF)"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />

              {/* Foreground Orange Swoosh */}
              <path
                d="M 6 96 
                   C 6 112 18 126 38 126 
                   C 60 126 88 108 124 74 
                   C 128 70 131 66 133 63
                   C 129 68 122 76 114 83
                   C 86 108 59 121 38 121
                   C 21 121 12 110 12 96
                   C 12 94 13 92 14 90
                   C 10 91 7 93 6 96
                   Z"
                fill="url(#navSwooshGrad)"
              />
            </svg>

            <div className="navbar-brand-divider" />

            <div className="navbar-brand-text">
              <span className="navbar-brand-title">Ashok Auto</span>
              <div className="navbar-brand-sub-wrap">
                <span className="navbar-brand-subtitle">Insurance</span>
                <svg className="navbar-brand-swoosh" viewBox="0 0 100 8" fill="none">
                  <path
                    d="M 2 7 C 28 2, 62 1, 98 3 C 65 5, 30 6, 2 7 Z"
                    fill="#FF7500"
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
