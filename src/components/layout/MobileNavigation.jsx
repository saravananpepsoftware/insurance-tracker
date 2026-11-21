import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCustomers } from '../../context/CustomerContext';
import { LayoutDashboard, Users, CreditCard, RefreshCw } from 'lucide-react';

export function MobileNavigation() {
  const { metrics } = useCustomers();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <LayoutDashboard size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/customers"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Users size={20} />
        <span>Customers</span>
      </NavLink>

      <NavLink
        to="/payments"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <CreditCard size={20} />
        <span>Payments</span>
      </NavLink>

      <NavLink
        to="/renewals"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <RefreshCw size={20} />
        <span>Renewals</span>
        {metrics.upcomingRenewalsCount > 0 && (
          <span className="mobile-nav-badge">
            {metrics.upcomingRenewalsCount}
          </span>
        )}
      </NavLink>
    </nav>
  );
}

