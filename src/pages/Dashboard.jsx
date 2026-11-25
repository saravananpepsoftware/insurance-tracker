import React from 'react';
import { useCustomers } from '../context/CustomerContext';
import { formatCurrency } from '../utils/formatCurrency';
import { AnalyticsCharts } from '../components/dashboard/AnalyticsCharts';
import { UpcomingRenewalsList } from '../components/dashboard/UpcomingRenewalsList';
import { DashboardHeroArtwork } from '../components/dashboard/DashboardHeroArtwork';
import { DashboardStatRibbon } from '../components/dashboard/DashboardStatRibbon';

export function Dashboard() {
  const { customers, metrics } = useCustomers();

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
            <h1 className="page-title">Executive Dashboard</h1>
            <p className="page-subtitle">
              Insurance portfolio performance, pending payments, and renewal alerts
            </p>
          </div>
        </div>

        {/* Top Right Reference Artwork (Hidden on mobile) */}
        <div className="dashboard-hero-artwork">
          <DashboardHeroArtwork />
        </div>
      </div>

      {/* Dynamic Segmented Stat Ribbon Bar (Matches Reference Design) */}
      <DashboardStatRibbon metrics={metrics} />

      {/* Dashboard Analytics Charts */}
      <AnalyticsCharts metrics={metrics} />

      {/* Upcoming Renewals Section */}
      <UpcomingRenewalsList customers={customers} />
    </div>
  );
}
