import React, { useMemo } from 'react';
import { useCustomers } from '../context/CustomerContext';
import { formatCurrency } from '../utils/formatCurrency';
import { getCarrierBadge } from '../utils/carrierUtils';
import { StatCard } from '../components/common/StatCard';
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
    link.setAttribute('download', `insuretrack-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div className="header-with-accent">
          <div className="header-accent-bar" />
          <div>
            <h1 className="page-title">Executive Reports & Analytics</h1>
            <p className="page-subtitle">
              Comprehensive business performance, collection audit, and carrier portfolio breakdown
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Report</span>
          </button>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
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

        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
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
                      <span className="carrier-name" style={{ fontWeight: 700, fontSize: '13.5px', color: '#1E293B' }}>{item.name}</span>
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
      </div>
    </div>
  );
}

export default Reports;

