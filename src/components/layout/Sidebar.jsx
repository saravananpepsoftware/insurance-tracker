import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCustomers } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';
import { SidebarCarIllustration } from './SidebarCarIllustration';
import brandLogoImg from '../../assets/navbar-brand-logo.png';
import {
  Shield,
  LayoutGrid,
  Users,
  CreditCard,
  RefreshCw,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  LogOut
} from 'lucide-react';

export function Sidebar({ isCollapsed = false, onToggleCollapse }) {
  const { customers, metrics } = useCustomers();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (onToggleCollapse) onToggleCollapse();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapse]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Minimize / Expand Toggle Button */}
      {onToggleCollapse && (
        <button
          type="button"
          className="sidebar-collapse-toggle-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Minimize Sidebar (Ctrl+B)'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Minimize Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight size={14} strokeWidth={2.8} />
          ) : (
            <ChevronLeft size={14} strokeWidth={2.8} />
          )}
        </button>
      )}

      {/* Brand Header */}
      <div className="sidebar-header">
        <div
          className="sidebar-brand-group"
          onClick={isCollapsed ? onToggleCollapse : undefined}
          style={isCollapsed ? { cursor: 'pointer' } : undefined}
          title={isCollapsed ? 'Click to expand sidebar' : undefined}
        >
          <img
            src={brandLogoImg}
            alt="Ashok Auto Insurance Logo"
            className="sidebar-brand-logo-img"
          />
          <div className="sidebar-brand-divider" />
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">Ashok Auto</span>
            <div className="sidebar-brand-sub-wrap">
              <span className="sidebar-brand-subtitle">Insurance</span>
              <svg className="sidebar-brand-swoosh" viewBox="0 0 100 8" fill="none">
                <path
                  d="M 2 7 C 28 2, 62 1, 98 3 C 65 5, 30 6, 2 7 Z"
                  fill="#FF7500"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {/* Section 1: MAIN MENU */}
        <div className="sidebar-section-header">
          <span>MAIN MENU</span>
          <span className="sidebar-section-dash" />
        </div>

        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link-pill ${isActive ? 'active' : ''}`}
          title="Dashboard"
        >
          {({ isActive }) => (
            <>
              <div className="nav-pill-left">
                <LayoutGrid size={18} />
                <span>Dashboard</span>
              </div>
              {isActive && <ChevronRight size={13} className="nav-active-caret" />}
            </>
          )}
        </NavLink>

        <NavLink
          to="/customers"
          className={({ isActive }) => `nav-link-pill ${isActive ? 'active' : ''}`}
          title={`Customers (${customers.length})`}
        >
          {({ isActive }) => (
            <>
              <div className="nav-pill-left">
                <Users size={18} />
                <span>Customers</span>
              </div>
              <div className="nav-pill-right">
                {isActive && <ChevronRight size={13} className="nav-active-caret" />}
                <span className={`nav-pill-badge ${isActive ? 'badge-active-pill' : 'badge-inactive-pill'}`}>
                  {customers.length}
                </span>
              </div>
            </>
          )}
        </NavLink>

        <NavLink
          to="/payments"
          className={({ isActive }) => `nav-link-pill ${isActive ? 'active' : ''}`}
          title="Payments"
        >
          {({ isActive }) => (
            <>
              <div className="nav-pill-left">
                <CreditCard size={18} />
                <span>Payments</span>
              </div>
              {isActive && <ChevronRight size={13} className="nav-active-caret" />}
            </>
          )}
        </NavLink>

        <NavLink
          to="/renewals"
          className={({ isActive }) => `nav-link-pill ${isActive ? 'active' : ''}`}
          title={metrics.upcomingRenewalsCount > 0 ? `Renewals (${metrics.upcomingRenewalsCount})` : 'Renewals'}
        >
          {({ isActive }) => (
            <>
              <div className="nav-pill-left">
                <RefreshCw size={18} />
                <span>Renewals</span>
              </div>
              <div className="nav-pill-right">
                {isActive && <ChevronRight size={13} className="nav-active-caret" />}
                {metrics.upcomingRenewalsCount > 0 && (
                  <span className={`nav-pill-badge ${isActive ? 'badge-active-pill' : 'badge-renewal-pill'}`}>
                    {metrics.upcomingRenewalsCount}
                  </span>
                )}
              </div>
            </>
          )}
        </NavLink>

        {/* Section 2: MANAGEMENT */}
        <div className="sidebar-section-header" style={{ marginTop: '12px' }}>
          <span>MANAGEMENT</span>
          <span className="sidebar-section-dash" />
        </div>

        <NavLink
          to="/reports"
          className={({ isActive }) => `nav-link-pill ${isActive ? 'active' : ''}`}
          title="Reports"
        >
          {({ isActive }) => (
            <>
              <div className="nav-pill-left">
                <BarChart3 size={18} />
                <span>Reports</span>
              </div>
              {isActive && <ChevronRight size={13} className="nav-active-caret" />}
            </>
          )}
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="nav-link-pill"
          style={{
            background: 'none',
            border: 'none',
            width: '100%',
            cursor: 'pointer',
            textAlign: 'left',
            color: '#64748B',
            marginTop: '4px'
          }}
          title="Sign out of Session"
        >
          <div className="nav-pill-left">
            <LogOut size={18} color="#EF4444" />
            <span style={{ color: '#EF4444', fontWeight: 600 }}>Log Out</span>
          </div>
        </button>
      </nav>

      {/* Sidebar Footer with 3D Illustration, Fluid Waves & Floating Pending Payments Card */}
      <div className="sidebar-footer-container">
        <SidebarCarIllustration />

        <div
          className="sidebar-floating-pending-card"
          onClick={() => navigate('/payments')}
          title="Click to view pending payments"
        >
          <div className="pending-card-icon-box">
            <Shield size={16} strokeWidth={2.4} />
          </div>
          <span className="pending-card-text">Pending Payments</span>
          <ChevronRight size={18} className="pending-card-chevron" />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
