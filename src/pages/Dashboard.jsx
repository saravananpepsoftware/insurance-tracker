import React from 'react';
import { useCustomers } from '../context/CustomerContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { AnalyticsCharts } from '../components/dashboard/AnalyticsCharts';
import { UpcomingRenewalsList } from '../components/dashboard/UpcomingRenewalsList';
import { DashboardHeroArtwork } from '../components/dashboard/DashboardHeroArtwork';
import { DashboardStatRibbon } from '../components/dashboard/DashboardStatRibbon';
import { LayoutDashboard } from 'lucide-react';

export function Dashboard() {
  const { customers, metrics } = useCustomers();
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';

  return (
    <div className="page-container dashboard-page">
      {/* Header matching exact reference */}
      <div className="customer-registry-header">
        <div className="customer-registry-header-left">
          <div className="customer-registry-icon-badge">
            <LayoutDashboard size={22} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="customer-registry-title">{isStaff ? 'Staff Dashboard' : 'Executive Dashboard'}</h1>
            <p className="customer-registry-subtitle">
              {isStaff
                ? 'Customer renewal alerts, policy follow-ups, and operational tasks'
                : `Insurance portfolio performance, pending payments, and renewal alerts (${customers.length} policies)`}
            </p>
          </div>
        </div>

        {/* Top Right Reference Artwork */}
        <div className="customer-hero-artwork">
          <DashboardHeroArtwork />
        </div>
      </div>

      {/* Hide Stat Ribbon and Analytics Charts for Staff Login */}
      {!isStaff && (
        <>
          {/* Dynamic Segmented Stat Ribbon Bar (Matches Reference Design) */}
          <DashboardStatRibbon metrics={metrics} />

          {/* Dashboard Analytics Charts */}
          <AnalyticsCharts metrics={metrics} />
        </>
      )}

      {/* Upcoming Renewals Section */}
      <UpcomingRenewalsList customers={customers} />
    </div>
  );
}

export default Dashboard;

