import React from 'react';
import { useCustomers } from '../context/CustomerContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { AnalyticsCharts } from '../components/dashboard/AnalyticsCharts';
import { UpcomingRenewalsList } from '../components/dashboard/UpcomingRenewalsList';
import { DashboardHeroArtwork } from '../components/dashboard/DashboardHeroArtwork';
import { DashboardStatRibbon } from '../components/dashboard/DashboardStatRibbon';

export function Dashboard() {
  const { customers, metrics } = useCustomers();
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';

  return (
    <div className="page-container dashboard-page">
      {/* Header with Orange Accent Bar and Right Artwork from Reference */}
      <div className="dashboard-header-wrapper" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div className="header-with-accent">
          <div className="header-accent-bar" />
          <div>
            <h1 className="page-title">{isStaff ? 'Staff Dashboard' : 'Executive Dashboard'}</h1>
            <p className="page-subtitle">
              {isStaff
                ? 'Customer renewal alerts, policy follow-ups, and operational tasks'
                : 'Insurance portfolio performance, pending payments, and renewal alerts'}
            </p>
          </div>
        </div>

        {/* Top Right Reference Artwork (Hidden on mobile) */}
        <div className="dashboard-hero-artwork">
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

