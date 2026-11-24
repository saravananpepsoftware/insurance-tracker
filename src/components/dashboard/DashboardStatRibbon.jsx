import React from 'react';
import { Users, Layers, Wallet, CalendarDays } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export function DashboardStatRibbon({ metrics }) {
  const motorCount = metrics?.insuranceTypeStats?.motor?.count || 0;
  const accidentalCount = metrics?.insuranceTypeStats?.accidental?.count || 0;
  const balanceCount =
    (metrics?.paymentStatusCounts?.pending || 0) + (metrics?.paymentStatusCounts?.partial || 0);
  const expiredCount = metrics?.expiredPoliciesCount || 0;

  return (
    <div className="stat-ribbon-container">
      <div className="stat-ribbon-bar">
        {/* SEGMENT 1: Total Customers (Dark Navy + Orange Fluid Glow Accent) */}
        <div className="stat-ribbon-segment segment-dark">
          <div className="segment-content">
            <div className="stat-icon-circle icon-orange">
              <Users size={19} strokeWidth={2.4} />
            </div>
            <div className="stat-info-group">
              <span className="stat-title text-light-muted">Total Customers</span>
              <span className="stat-metric text-white">{metrics?.totalCustomers ?? 0}</span>
              <span className="stat-subtitle text-light-sub">
                {motorCount} Motor, {accidentalCount} Accident
              </span>
            </div>
          </div>
        </div>

        {/* SEGMENT 2: Total Business */}
        <div className="stat-ribbon-segment segment-business">
          <div className="segment-content">
            <div className="stat-icon-circle icon-peach">
              <Layers size={19} strokeWidth={2.4} />
            </div>
            <div className="stat-info-group">
              <span className="stat-title">Total Business</span>
              <span className="stat-metric">{formatCurrency(metrics?.totalBusiness || 0)}</span>
              <span className="stat-subtitle">
                Collected: {formatCurrency(metrics?.totalCollected || 0)}
              </span>
            </div>
          </div>
          {/* Slanted divider line */}
          <svg className="segment-slant-line" viewBox="0 0 24 76" preserveAspectRatio="none">
            <line x1="24" y1="0" x2="2" y2="76" stroke="#EBE4DE" strokeWidth="1.5" />
          </svg>
        </div>

        {/* SEGMENT 3: Pending Payments */}
        <div className="stat-ribbon-segment segment-payments">
          <div className="segment-content">
            <div className="stat-icon-circle icon-mint">
              <Wallet size={19} strokeWidth={2.4} />
            </div>
            <div className="stat-info-group">
              <span className="stat-title">Pending Payments</span>
              <span className="stat-metric">{formatCurrency(metrics?.pendingPayments || 0)}</span>
              <span className="stat-subtitle">{balanceCount} with balance</span>
            </div>
          </div>
          {/* Slanted divider line */}
          <svg className="segment-slant-line" viewBox="0 0 24 76" preserveAspectRatio="none">
            <line x1="24" y1="0" x2="2" y2="76" stroke="#EBE4DE" strokeWidth="1.5" />
          </svg>
        </div>

        {/* SEGMENT 4: Upcoming Renewals */}
        <div className="stat-ribbon-segment segment-renewals">
          <div className="segment-content">
            <div className="stat-icon-circle icon-lavender">
              <CalendarDays size={19} strokeWidth={2.4} />
            </div>
            <div className="stat-info-group">
              <span className="stat-title">Upcoming Renewals</span>
              <span className="stat-metric">{metrics?.upcomingRenewalsCount ?? 0}</span>
              <span className="stat-subtitle">{expiredCount} already expired</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardStatRibbon;
