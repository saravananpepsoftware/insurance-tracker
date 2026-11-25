import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCustomers } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';
import { SidebarCarIllustration } from './SidebarCarIllustration';
import {
  Shield,
  LayoutGrid,
  Users,
  CreditCard,
  RefreshCw,
  BarChart3,
  ChevronRight,
  ChevronDown,
  LogOut
} from 'lucide-react';

export function Sidebar() {
  const { customers, metrics } = useCustomers();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="logo-icon-box">
          <Shield size={22} className="logo-shield-icon" strokeWidth={2.4} />
        </div>
        <div className="logo-text-group">
          <div className="logo-brand">
            Ashok Auto <span>Insurance</span>
          </div>
          <div className="logo-tagline">INSURANCE MANAGEMENT</div>
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
