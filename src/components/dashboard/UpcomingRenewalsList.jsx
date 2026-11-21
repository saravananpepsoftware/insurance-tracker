import React from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateDaysRemaining, formatIndianDate, getUrgencyInfo } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { getCarrierBadge } from '../../utils/carrierUtils';
import {
  RefreshCw,
  ArrowRight,
  Phone,
  User,
  Car,
  Shield,
  Calendar,
  ChevronRight
} from 'lucide-react';

export function UpcomingRenewalsList({ customers }) {
  const navigate = useNavigate();

  // Filter policies expiring in next 30 days and not expired
  const upcoming = customers
    .filter((c) => {
      const days = calculateDaysRemaining(c.policyEndDate);
      return days >= 0 && days <= 30;
    })
    .sort((a, b) => calculateDaysRemaining(a.policyEndDate) - calculateDaysRemaining(b.policyEndDate));

  return (
    <div className="app-card renewals-dashboard-card" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <RefreshCw size={18} color="var(--primary-orange)" />
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Upcoming Policy Renewals
          </span>
          <span
            className="badge badge-orange"
            style={{ backgroundColor: '#FFEADB', color: 'var(--primary-orange)', fontWeight: 700, fontSize: '12.5px', padding: '3px 10px' }}
          >
            {upcoming.length} Due
          </span>
        </div>

        <button
          className="btn btn-outline-orange btn-sm"
          onClick={() => navigate('/renewals')}
          style={{ padding: '6px 14px', fontSize: '13px' }}
        >
          <span>View All</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div style={{ padding: 0 }}>
        {upcoming.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No policies expiring in the next 30 days!</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="table-container desktop-only" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>CUSTOMER</th>
                    <th>INSURANCE COMPANY</th>
                    <th>TYPE</th>
                    <th>EXPIRY DATE</th>
                    <th>URGENCY / DAYS LEFT</th>
                    <th style={{ textAlign: 'right' }}>REMAINING AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.slice(0, 6).map((c) => {
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
                          <div className="table-company-cell">
                            <div
                              className="carrier-logo-box"
                              style={{ backgroundColor: carrier.bg }}
                            >
                              {carrier.label.split(' ')[0]}
                            </div>
                            <span className="carrier-name">{c.insuranceCompany}</span>
                          </div>
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
                          <span
                            className={`urgency-pill ${
                              days <= 7
                                ? 'urgency-critical'
                                : days <= 15
                                ? 'urgency-warning'
                                : 'urgency-notice'
                            }`}
                          >
                            <span className="urgency-dot" />
                            <span>{urgency.label}</span>
                          </span>
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

            {/* Native Mobile Renewal Cards (No horizontal swipe required!) */}
            <div className="mobile-only mobile-renewal-card-list">
              {upcoming.slice(0, 6).map((c) => {
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
                    {/* Top row: Customer Avatar, Name, and Urgency Pill */}
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

                      <span
                        className={`urgency-pill ${
                          days <= 7
                            ? 'urgency-critical'
                            : days <= 15
                            ? 'urgency-warning'
                            : 'urgency-notice'
                        }`}
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                      >
                        <span className="urgency-dot" />
                        <span>{urgency.label}</span>
                      </span>
                    </div>

                    {/* Middle row: Badges for Carrier and Policy Type */}
                    <div className="mobile-renewal-meta">
                      <div className="table-company-cell" style={{ gap: '6px' }}>
                        <div
                          className="carrier-logo-box"
                          style={{ backgroundColor: carrier.bg, width: '22px', height: '22px', fontSize: '8px' }}
                        >
                          {carrier.label.split(' ')[0]}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                          {c.insuranceCompany.split(' ')[0]}
                        </span>
                      </div>

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
