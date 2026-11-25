import React, { useMemo } from 'react';
import { useCustomers } from '../context/CustomerContext';
import { formatCurrency } from '../utils/formatCurrency';
import { getCarrierBadge } from '../utils/carrierUtils';
import { StatCard } from '../components/common/StatCard';
import { DashboardHeroArtwork } from '../components/dashboard/DashboardHeroArtwork';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

export function Reports({ onOpenAddCustomer }) {
  const { customers, metrics } = useCustomers();

  // Aggregate by Carrier
  const carrierBreakdown = useMemo(() => {
    const map = {};
    customers.forEach((c) => {
      const name = c.insuranceCompany || 'Other';
      if (!map[name]) {
        map[name] = {
          name,
          carrierCode: c.carrierCode,
          count: 0,
          totalAmount: 0,
          paidAmount: 0,
          remainingAmount: 0
        };
      }
      map[name].count += 1;
      map[name].totalAmount += Number(c.totalAmount) || 0;
      map[name].paidAmount += Number(c.partialAmount) || 0;
      map[name].remainingAmount += Number(c.remainingAmount) || 0;
    });
    return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [customers]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Company', 'Type', 'Total Amount', 'Paid Amount', 'Remaining Amount', 'Status', 'Expiry'];
    const rows = customers.map(c => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.insuranceCompany}"`,
      `"${c.insuranceType}"`,
      c.totalAmount,
      c.partialAmount,
      c.remainingAmount,
      `"${c.paymentStatus}"`,
      `"${c.policyEndDate}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ashok-auto-insurance-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      {/* Header matching exact reference */}
      <div className="customer-registry-header">
        <div className="customer-registry-header-left">
          <div className="customer-registry-icon-badge">
            <BarChart3 size={22} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="customer-registry-title">Executive Reports & Analytics</h1>
            <p className="customer-registry-subtitle">
              Comprehensive business performance, collection audit, and carrier breakdown ({carrierBreakdown.length} carriers)
            </p>
          </div>
        </div>

        {/* Top Right Reference Artwork */}
        <div className="customer-hero-artwork">
          <DashboardHeroArtwork />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button className="btn btn-outline" onClick={handlePrint}>
          <Printer size={15} />
          <span>Print Report</span>
        </button>
        <button className="btn btn-primary" onClick={handleExportCSV}>
          <Download size={15} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* 4 Key Financial Metrics */}
      <div className="stat-grid">
        <StatCard
          label="GROSS PORTFOLIO"
          value={formatCurrency(metrics.totalBusiness || 0)}
          badge={`${customers.length} Policies`}
          subtext="Total business volume"
          icon={TrendingUp}
          colorTheme="orange"
        />

        <StatCard
          label="TOTAL REVENUE COLLECTED"
          value={formatCurrency(metrics.totalCollected || 0)}
          badge={`${metrics.collectionRate || 58}% collected`}
          subtext="Realized premiums"
          icon={ShieldCheck}
          colorTheme="green"
        />

        <StatCard
          label="OUTSTANDING BALANCE"
          value={formatCurrency(metrics.pendingPayments || 0)}
          badge={`${metrics.paymentStatusCounts?.pending || 0} unpaid`}
          subtext="Pending premium balance"
          icon={CreditCard}
          colorTheme="gold"
        />

        <StatCard
          label="RENEWALS AT RISK"
          value={metrics.upcomingRenewalsCount || 0}
          badge={`${metrics.expiredPoliciesCount || 0} expired`}
          subtext="Expiring in next 30 days"
          icon={AlertTriangle}
          colorTheme="red"
        />
      </div>

      {/* Insurance Carrier Performance Breakdown */}
      <div className="app-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">
            <BarChart3 size={18} color="var(--primary-orange)" />
            <span>Portfolio Breakdown by Insurance Company</span>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {carrierBreakdown.length} Active Carriers
          </span>
        </div>

        {/* Desktop Data Table */}
        <div className="table-container desktop-only" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>CARRIER</th>
                <th style={{ textAlign: 'center' }}>POLICIES</th>
                <th style={{ textAlign: 'right' }}>GROSS BUSINESS</th>
                <th style={{ textAlign: 'right' }}>COLLECTED</th>
                <th style={{ textAlign: 'right' }}>OUTSTANDING</th>
                <th style={{ textAlign: 'center' }}>COLLECTION %</th>
              </tr>
            </thead>
            <tbody>
              {carrierBreakdown.map((item) => {
                const carrier = getCarrierBadge(item.name, item.carrierCode);
                const percent = item.totalAmount > 0 ? Math.round((item.paidAmount / item.totalAmount) * 100) : 0;

                return (
                  <tr key={item.name}>
                    <td>
                      <span className="carrier-name" style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)' }}>{item.name}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {item.count}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      {formatCurrency(item.totalAmount)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--status-paid)', fontWeight: 600 }}>
                      {formatCurrency(item.paidAmount)}
                    </td>
                    <td style={{ textAlign: 'right', color: item.remainingAmount > 0 ? '#DC2626' : 'var(--text-secondary)', fontWeight: 700 }}>
                      {formatCurrency(item.remainingAmount)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge" style={{
                        backgroundColor: percent >= 75 ? '#F0FDF4' : percent >= 40 ? '#FFFBEB' : '#FEF2F2',
                        color: percent >= 75 ? '#16A34A' : percent >= 40 ? '#D97706' : '#DC2626',
                        fontWeight: 700
                      }}>
                        {percent}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Carrier Table View (Matches exact Customer Directory style, zero swipe!) */}
        <div className="mobile-table-card mobile-only" style={{ margin: 0, border: 'none' }}>
          <div className="mobile-table-header-strip">
            <div className="mobile-table-title-area">
              <span className="mobile-table-title">Carrier Directory</span>
              <span className="mobile-table-count-badge">{carrierBreakdown.length}</span>
            </div>
            <span className="mobile-table-hint">Performance Summary</span>
          </div>

          <div className="mobile-table-wrapper">
            <table className="mobile-customer-table">
              <thead>
                <tr>
                  <th className="m-th-customer">Carrier</th>
                  <th className="m-th-status">Gross & Due</th>
                  <th className="m-th-action">Collect %</th>
                </tr>
              </thead>
              <tbody>
                {carrierBreakdown.map((item) => {
                  const percent = item.totalAmount > 0 ? Math.round((item.paidAmount / item.totalAmount) * 100) : 0;
                  const initial = item.name ? item.name.trim().charAt(0).toUpperCase() : 'C';

                  return (
                    <tr key={`m-carrier-${item.name}`} className="mobile-table-row">
                      <td className="m-td-customer">
                        <div className="m-table-cust-cell">
                          <div className="m-table-cust-avatar">
                            {initial}
                          </div>
                          <div className="m-table-cust-info">
                            <span className="m-table-cust-name" title={item.name}>{item.name}</span>
                            <span className="m-table-cust-phone">
                              <span>{item.count} {item.count === 1 ? 'Policy' : 'Policies'}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="m-td-status">
                        <div className="m-table-status-cell">
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {formatCurrency(item.totalAmount)}
                          </span>
                          <span className={`m-table-due ${item.remainingAmount > 0 ? 'due-danger' : 'due-settled'}`}>
                            {item.remainingAmount > 0 ? `${formatCurrency(item.remainingAmount)} due` : '100% Settled'}
                          </span>
                        </div>
                      </td>

                      <td className="m-td-action">
                        <span
                          className="badge"
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: percent >= 75 ? 'rgba(34, 197, 94, 0.15)' : percent >= 40 ? 'rgba(234, 88, 12, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                            color: percent >= 75 ? '#22C55E' : percent >= 40 ? '#EA580C' : '#DC2626'
                          }}
                        >
                          {percent}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;

