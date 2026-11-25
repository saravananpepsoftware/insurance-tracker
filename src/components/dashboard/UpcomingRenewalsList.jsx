import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateDaysRemaining, formatIndianDate, getUrgencyInfo } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { getCarrierBadge } from '../../utils/carrierUtils';
import { PaymentStatusBadge } from '../common/StatusBadge';
import {
  ArrowRight,
  Phone,
  User,
  Car,
  Shield,
  Calendar,
  ChevronRight,
  CalendarClock,
  Coins,
  Filter
} from 'lucide-react';

export function UpcomingRenewalsList({ customers = [] }) {
  const navigate = useNavigate();

  // Tab filter: 'expiring' | 'pending'
  const [activeTab, setActiveTab] = useState('pending');

  // Days filter:
  // For 'expiring' policies: default is '30' days
  const [expireDaysFilter, setExpireDaysFilter] = useState('30');
  // For 'pending' amounts: default is 'all' so ALL pending amounts are shown immediately!
  const [pendingDaysFilter, setPendingDaysFilter] = useState('all');

  const daysFilter = activeTab === 'expiring' ? expireDaysFilter : pendingDaysFilter;
  const setDaysFilter = activeTab === 'expiring' ? setExpireDaysFilter : setPendingDaysFilter;

  // Overall counts and totals
  const expiring30Count = useMemo(() => {
    return customers.filter((c) => {
      const days = calculateDaysRemaining(c.policyEndDate);
      return days >= 0 && days <= 30;
    }).length;
  }, [customers]);

  const pendingCount = useMemo(() => {
    return customers.filter((c) => (Number(c.remainingAmount) || 0) > 0).length;
  }, [customers]);

  const pendingTotalSum = useMemo(() => {
    return customers.reduce((sum, c) => sum + (Number(c.remainingAmount) || 0), 0);
  }, [customers]);

  // Filtered customer list
  const filteredList = useMemo(() => {
    let list = [...customers];

    if (activeTab === 'expiring') {
      // 1. Expire Customers Filter
      if (daysFilter === '30') {
        list = list.filter((c) => {
          const days = calculateDaysRemaining(c.policyEndDate);
          return days >= 0 && days <= 30;
        });
      } else if (daysFilter === '15') {
        list = list.filter((c) => {
          const days = calculateDaysRemaining(c.policyEndDate);
          return days >= 0 && days <= 15;
        });
      } else if (daysFilter === '7') {
        list = list.filter((c) => {
          const days = calculateDaysRemaining(c.policyEndDate);
          return days >= 0 && days <= 7;
        });
      } else if (daysFilter === 'expired') {
        list = list.filter((c) => calculateDaysRemaining(c.policyEndDate) < 0);
      } else if (daysFilter === 'all') {
        list = list.filter((c) => !!c.policyEndDate);
      }

      // Sort by earliest expiration first
      list.sort((a, b) => calculateDaysRemaining(a.policyEndDate) - calculateDaysRemaining(b.policyEndDate));
    } else {
      // 2. Pending Amounts Filter (customers with pending balance)
      list = list.filter((c) => (Number(c.remainingAmount) || 0) > 0);

      if (daysFilter === '30') {
        list = list.filter((c) => {
          const days = calculateDaysRemaining(c.policyEndDate);
          return days >= 0 && days <= 30;
        });
      } else if (daysFilter === '15') {
        list = list.filter((c) => {
          const days = calculateDaysRemaining(c.policyEndDate);
          return days >= 0 && days <= 15;
        });
      } else if (daysFilter === '7') {
        list = list.filter((c) => {
          const days = calculateDaysRemaining(c.policyEndDate);
          return days >= 0 && days <= 7;
        });
      } else if (daysFilter === 'expired') {
        list = list.filter((c) => calculateDaysRemaining(c.policyEndDate) < 0);
      }
      // If 'all': includes all customers with pending amounts!

      // Sort by highest pending amount first, then by earliest expiration
      list.sort((a, b) => {
        const remDiff = (Number(b.remainingAmount) || 0) - (Number(a.remainingAmount) || 0);
        if (remDiff !== 0) return remDiff;
        return calculateDaysRemaining(a.policyEndDate) - calculateDaysRemaining(b.policyEndDate);
      });
    }

    return list;
  }, [customers, activeTab, daysFilter]);

  return (
    <div className="app-card renewals-dashboard-card" style={{ marginBottom: '24px' }}>
      {/* Card Header with Two Filter Tabs & View All Button */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="dashboard-table-tabs">
          {/* Tab 1: Pending Amounts */}
          <button
            type="button"
            className={`dashboard-filter-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <Coins size={16} />
            <span>Pending Amounts</span>
            <span className="tab-count-pill">
              {pendingCount} Pending {pendingTotalSum > 0 ? `(₹${pendingTotalSum.toLocaleString('en-IN')})` : ''}
            </span>
          </button>

          {/* Tab 2: Expire Customers */}
          <button
            type="button"
            className={`dashboard-filter-tab ${activeTab === 'expiring' ? 'active' : ''}`}
            onClick={() => setActiveTab('expiring')}
          >
            <CalendarClock size={16} />
            <span>Expire Customers</span>
            <span className="tab-count-pill">
              {expiring30Count} Due
            </span>
          </button>
        </div>

        <button
          type="button"
          className="btn btn-outline-orange btn-sm"
          onClick={() => navigate(activeTab === 'expiring' ? '/renewals' : '/payments')}
          style={{ padding: '6px 14px', fontSize: '13px' }}
        >
          <span>{activeTab === 'expiring' ? 'View All Renewals' : 'View All Payments'}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Days Filter Sub-Bar */}
      <div className="dashboard-table-subbar">
        <div className="days-filter-container">
          <span className="days-filter-label">
            <Filter size={13} />
            <span>{activeTab === 'expiring' ? 'Expire Window:' : 'Filter By Expiry:'}</span>
          </span>

          <div className="days-filter-pills">
            {[
              { id: 'all', label: 'All' },
              { id: '30', label: '30 Days' },
              { id: '15', label: '15 Days' },
              { id: '7', label: '7 Days' },
              { id: 'expired', label: 'Expired' },
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                className={`days-filter-pill ${daysFilter === pill.id ? 'active' : ''}`}
                onClick={() => setDaysFilter(pill.id)}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        <div className="days-filter-summary">
          Showing <strong>{filteredList.length}</strong> {activeTab === 'expiring' ? 'expiring customers' : 'pending amount customers'}
          {activeTab === 'pending' && filteredList.length > 0 && (
            <span> (Outstanding: <strong>{formatCurrency(filteredList.reduce((sum, c) => sum + (Number(c.remainingAmount) || 0), 0))}</strong>)</span>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div style={{ padding: 0 }}>
        {filteredList.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>
              {activeTab === 'expiring'
                ? `No policies expiring in the selected window (${daysFilter === 'all' ? 'All' : daysFilter === 'expired' ? 'Expired' : `${daysFilter} days`})!`
                : `No pending amount customers found for filter "${daysFilter === 'all' ? 'All' : daysFilter === 'expired' ? 'Expired' : `${daysFilter} days`}"!`}
            </p>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px' }}>
              Try selecting "All" or a different filter range above.
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setDaysFilter('all')}
            >
              Show All Customers
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-container desktop-only" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>CUSTOMER</th>
                    <th>INSURANCE COMPANY</th>
                    <th>TYPE</th>
                    <th>EXPIRY DATE</th>
                    <th>{activeTab === 'expiring' ? 'DAYS REMAINING' : 'PAYMENT STATUS'}</th>
                    <th style={{ textAlign: 'right' }}>REMAINING AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.slice(0, 8).map((c) => {
                    const days = calculateDaysRemaining(c.policyEndDate);
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
                          {c.insuranceType === 'Motor Insurance' ? (
                            <span className="badge badge-type-motor" style={{ gap: '6px' }}>
                              <Car size={13} />
                              <span>Motor Insurance</span>
                            </span>
                          ) : (
                            <span className="badge badge-type-accidental" style={{ gap: '6px' }}>
                              <Shield size={13} />
                              <span>Accidental Insurance</span>
                            </span>
                          )}
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 500 }}>
                            <Calendar size={14} color="var(--primary-orange)" />
                            <span>{formatIndianDate(c.policyEndDate)}</span>
                          </div>
                        </td>

                        <td>
                          {activeTab === 'expiring' ? (
                            <span
                              className={`urgency-pill ${
                                days < 0
                                  ? 'urgency-expired'
                                  : days <= 7
                                  ? 'urgency-critical'
                                  : days <= 15
                                  ? 'urgency-warning'
                                  : days <= 30
                                  ? 'urgency-notice'
                                  : 'urgency-active'
                              }`}
                            >
                              <span className="urgency-dot" />
                              <span>{urgency.label}</span>
                            </span>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                              <PaymentStatusBadge status={c.paymentStatus} />
                              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                                {days < 0 ? `Expired (${Math.abs(days)}d ago)` : `${days}d to expiry`}
                              </span>
                            </div>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <span className="table-amount-bold" style={{ color: remaining > 0 ? '#DC2626' : '#22C55E' }}>
                            {formatCurrency(remaining)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Native Mobile Renewal Cards */}
            <div className="mobile-only mobile-renewal-card-list">
              {filteredList.slice(0, 8).map((c) => {
                const days = calculateDaysRemaining(c.policyEndDate);
                const urgency = getUrgencyInfo(c.policyEndDate);
                const remaining = Number(c.remainingAmount) || 0;
                const carrier = getCarrierBadge(c.insuranceCompany, c.carrierCode);

                return (
                  <div
                    key={`m-renewal-${c.id}`}
                    className="mobile-renewal-card"
                    onClick={() => navigate(`/customers/${c.id}`)}
                  >
                    {/* Top row: Customer Avatar, Name, and Urgency / Status */}
                    <div className="mobile-renewal-header">
                      <div className="mobile-renewal-user">
                        <div className="table-customer-avatar">
                          <User size={15} />
                        </div>
                        <div>
                          <div className="mobile-renewal-name">{c.name}</div>
                          <a
                            href={`tel:${c.phone}`}
                            className="mobile-renewal-phone"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone size={11} color="var(--primary-orange)" />
                            <span>{c.phone}</span>
                          </a>
                        </div>
                      </div>

                      {activeTab === 'expiring' ? (
                        <span
                          className={`urgency-pill ${
                            days < 0
                              ? 'urgency-expired'
                              : days <= 7
                              ? 'urgency-critical'
                              : days <= 15
                              ? 'urgency-warning'
                              : days <= 30
                              ? 'urgency-notice'
                              : 'urgency-active'
                          }`}
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          <span className="urgency-dot" />
                          <span>{urgency.label}</span>
                        </span>
                      ) : (
                        <PaymentStatusBadge status={c.paymentStatus} />
                      )}
                    </div>

                    {/* Middle row: Carrier and Policy End Date */}
                    <div className="mobile-renewal-meta">
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {c.insuranceCompany}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#64748B' }}>
                        <Calendar size={12} color="var(--primary-orange)" />
                        <span>{formatIndianDate(c.policyEndDate)}</span>
                      </div>
                    </div>

                    {/* Bottom row: Balance Due and Tap to View Details */}
                    <div className="mobile-renewal-footer">
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Remaining Due</span>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: remaining > 0 ? '#DC2626' : '#22C55E' }}>
                          {formatCurrency(remaining)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '11.5px', borderRadius: '8px' }}
                        onClick={() => navigate(`/customers/${c.id}`)}
                      >
                        <span>Details</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
