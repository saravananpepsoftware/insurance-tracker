import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../context/CustomerContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatIndianDate, calculateDaysRemaining, getUrgencyInfo } from '../utils/dateUtils';
import { getCarrierBadge } from '../utils/carrierUtils';
import { InsuranceTypeBadge, PaymentStatusBadge, RenewalUrgencyBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { DashboardHeroArtwork } from '../components/dashboard/DashboardHeroArtwork';
import {
  RefreshCw,
  Search,
  Phone,
  Eye,
  Calendar,
  User,
  ChevronRight
} from 'lucide-react';

export function Renewals() {
  const navigate = useNavigate();
  const { customers } = useCustomers();

  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');

  const renewalStats = useMemo(() => {
    let expired = 0;
    let within7 = 0;
    let within15 = 0;
    let within30 = 0;
    let future = 0;

    customers.forEach((c) => {
      const days = calculateDaysRemaining(c.policyEndDate);
      if (days < 0) {
        expired++;
      } else if (days <= 7) {
        within7++;
        within15++;
        within30++;
      } else if (days <= 15) {
        within15++;
        within30++;
      } else if (days <= 30) {
        within30++;
      } else {
        future++;
      }
    });

    return { expired, within7, within15, within30, future };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const days = calculateDaysRemaining(c.policyEndDate);

      if (activeTab === 'EXPIRING_SOON' && (days < 0 || days > 30)) return false;
      if (activeTab === 'EXPIRED' && days >= 0) return false;
      if (activeTab === '7_DAYS' && (days < 0 || days > 7)) return false;
      if (activeTab === '15_DAYS' && (days < 0 || days > 15)) return false;
      if (activeTab === '30_DAYS' && (days < 0 || days > 30)) return false;
      if (activeTab === 'FUTURE' && days <= 30) return false;

      if (search) {
        const q = search.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesCompany = c.insuranceCompany?.toLowerCase().includes(q);
        const matchesPhone = c.phone?.toLowerCase().includes(q);
        if (!matchesName && !matchesCompany && !matchesPhone) return false;
      }

      return true;
    }).sort((a, b) => calculateDaysRemaining(a.policyEndDate) - calculateDaysRemaining(b.policyEndDate));
  }, [customers, activeTab, search]);

  return (
    <div className="page-container">
      {/* Header matching exact reference */}
      <div className="customer-registry-header">
        <div className="customer-registry-header-left">
          <div className="customer-registry-icon-badge">
            <RefreshCw size={22} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="customer-registry-title">Policy Renewal Radar</h1>
            <p className="customer-registry-subtitle">
              Monitor approaching expirations, lapse prevention, and upcoming renewals ({customers.length} total)
            </p>
          </div>
        </div>

        {/* Top Right Reference Artwork */}
        <div className="customer-hero-artwork">
          <DashboardHeroArtwork />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('ALL')}
          >
            All Policies ({customers.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'EXPIRING_SOON' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('EXPIRING_SOON')}
          >
            Expiring Soon ({renewalStats.within30})
          </button>
          <button
            className={`btn btn-sm ${activeTab === '7_DAYS' ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setActiveTab('7_DAYS')}
          >
            0–7 Days ({renewalStats.within7})
          </button>
          <button
            className={`btn btn-sm ${activeTab === '15_DAYS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('15_DAYS')}
          >
            8–15 Days ({renewalStats.within15})
          </button>
          <button
            className={`btn btn-sm ${activeTab === '30_DAYS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('30_DAYS')}
          >
            16–30 Days ({renewalStats.within30})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'EXPIRED' ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setActiveTab('EXPIRED')}
          >
            Expired ({renewalStats.expired})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'FUTURE' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('FUTURE')}
          >
            Future ({renewalStats.future})
          </button>
        </div>

        <div className="search-input-box" style={{ maxWidth: '280px' }}>
          <Search size={16} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Search renewals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table & Mobile Cards */}
      {filteredCustomers.length === 0 ? (
        <div className="app-card">
          <EmptyState
            icon={RefreshCw}
            title="No renewal records in this category"
            description="Select another timeframe tab to review active, upcoming, or expired policies."
            actionLabel="View All Policies"
            onAction={() => setActiveTab('ALL')}
          />
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-container desktop-only">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>INSURANCE COMPANY</th>
                  <th>TYPE</th>
                  <th>START DATE</th>
                  <th>EXPIRY DATE</th>
                  <th>DAYS REMAINING</th>
                  <th style={{ textAlign: 'right' }}>REMAINING AMOUNT</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => {
                  const urgency = getUrgencyInfo(c.policyEndDate);
                  const remaining = Number(c.remainingAmount) || 0;
                  const carrier = getCarrierBadge(c.insuranceCompany, c.carrierCode);

                  return (
                    <tr
                      key={c.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/customers/${c.id}`)}
                    >
                      <td>
                        <div className="table-customer-avatar-cell">
                          <div className="table-customer-avatar">
                            <User size={16} />
                          </div>
                          <div className="table-customer-info">
                            <span className="table-customer-name">{c.name}</span>
                            <span className="table-customer-phone">
                              <Phone size={11} color="#64748B" />
                              <span>{c.phone}</span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="carrier-name" style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                          {c.insuranceCompany}
                        </span>
                      </td>
                      <td>
                        <InsuranceTypeBadge type={c.insuranceType} />
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {formatIndianDate(c.policyStartDate)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px' }}>
                          <Calendar size={13} color="var(--primary-orange)" />
                          <span>{formatIndianDate(c.policyEndDate)}</span>
                        </div>
                      </td>
                      <td>
                        <RenewalUrgencyBadge endDate={c.policyEndDate} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="table-amount-bold" style={{ color: remaining > 0 ? '#DC2626' : '#22C55E' }}>
                          {formatCurrency(remaining)}
                        </span>
                      </td>
                      <td>
                        <PaymentStatusBadge status={c.paymentStatus} />
                      </td>
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/customers/${c.id}`)}
                        >
                          <Eye size={13} />
                          <span>Profile</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Renewals Table View (Matches exact Customer Directory style, zero swipe!) */}
          <div className="mobile-table-card mobile-only">
            <div className="mobile-table-header-strip">
              <div className="mobile-table-title-area">
                <span className="mobile-table-title">Renewals Directory</span>
                <span className="mobile-table-count-badge">{filteredCustomers.length}</span>
              </div>
              <span className="mobile-table-hint">Tap row for details</span>
            </div>

            <div className="mobile-table-wrapper">
              <table className="mobile-customer-table">
                <thead>
                  <tr>
                    <th className="m-th-customer">Customer</th>
                    <th className="m-th-status">Expiry & Due</th>
                    <th className="m-th-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => {
                    const days = calculateDaysRemaining(c.policyEndDate);
                    const urgency = getUrgencyInfo(c.policyEndDate);
                    const remaining = Number(c.remainingAmount) || 0;
                    const initial = c.name ? c.name.trim().charAt(0).toUpperCase() : 'C';

                    return (
                      <tr
                        key={`m-renewal-row-${c.id}`}
                        className="mobile-table-row"
                        onClick={() => navigate(`/customers/${c.id}`)}
                      >
                        <td className="m-td-customer">
                          <div className="m-table-cust-cell">
                            <div className="m-table-cust-avatar">
                              {initial}
                            </div>
                            <div className="m-table-cust-info">
                              <span className="m-table-cust-name" title={c.name}>{c.name}</span>
                              <span className="m-table-cust-phone">
                                <Phone size={10} color="#888" style={{ flexShrink: 0 }} />
                                <span>{c.phone}</span>
                              </span>
                              {c.insuranceCompany && (
                                <span className="m-table-cust-company" title={c.insuranceCompany}>
                                  {c.insuranceCompany}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="m-td-status">
                          <div className="m-table-status-cell">
                            <span
                              className={`urgency-pill ${
                                days <= 7
                                  ? 'urgency-critical'
                                  : days <= 15
                                  ? 'urgency-warning'
                                  : 'urgency-notice'
                              }`}
                              style={{ fontSize: '10.5px', padding: '2px 6px' }}
                            >
                              <span className="urgency-dot" />
                              <span>{urgency.shortLabel || urgency.label}</span>
                            </span>
                            <span className="m-table-due" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {formatIndianDate(c.policyEndDate)}
                            </span>
                          </div>
                        </td>

                        <td className="m-td-action">
                          <button
                            type="button"
                            className="m-table-detail-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/customers/${c.id}`);
                            }}
                            title="View Details"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
