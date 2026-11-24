import React from 'react';
import { useCustomers } from '../context/CustomerContext';
import { formatCurrency } from '../utils/formatCurrency';
import { StatCard } from '../components/common/StatCard';
import { AnalyticsCharts } from '../components/dashboard/AnalyticsCharts';
import { UpcomingRenewalsList } from '../components/dashboard/UpcomingRenewalsList';
import { DashboardHeroArtwork } from '../components/dashboard/DashboardHeroArtwork';
import { Users, Layers, Coins, CalendarDays } from 'lucide-react';

export function Dashboard() {
  const { customers, metrics } = useCustomers();

  return (
    <div className="page-container">
      {/* Header with Orange Accent Bar and Right Artwork from Reference */}
      <div style={{
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

      {/* 4 Summary Stat Cards Matching Reference */}
      <div className="stat-grid">
        <StatCard
          label="TOTAL CUSTOMERS"
          value={metrics.totalCustomers ?? 0}
          badge={`${metrics.insuranceTypeStats?.motor?.count || 0} Motor, ${metrics.insuranceTypeStats?.accidental?.count || 0} Accident`}
          subtext="Registered clients"
          icon={Users}
          colorTheme="orange"
        />

        <StatCard
          label="TOTAL BUSINESS"
          value={formatCurrency(metrics.totalBusiness || 0)}
          badge={`Collected: ${formatCurrency(metrics.totalCollected || 0)}`}
          subtext="Gross policy value"
          icon={Layers}
          colorTheme="gold"
        />

        <StatCard
          label="PENDING PAYMENTS"
          value={formatCurrency(metrics.pendingPayments || 0)}
          badge={`${metrics.paymentStatusCounts?.pending || 0} full pending`}
          subtext="Unpaid premiums balance"
          icon={Coins}
          colorTheme="green"
        />

        <StatCard
          label="UPCOMING RENEWALS"
          value={metrics.upcomingRenewalsCount ?? 0}
          badge={`${metrics.expiredPoliciesCount || 0} already expired`}
          subtext="Expiring in next 30 days"
          icon={CalendarDays}
          colorTheme="red"
        />
      </div>

      {/* Dashboard Analytics Charts */}
      <AnalyticsCharts metrics={metrics} />

      {/* Upcoming Renewals Section */}
      <UpcomingRenewalsList customers={customers} />
    </div>
  );
}
