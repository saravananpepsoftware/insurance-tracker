import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../context/CustomerContext';
import { formatCurrency } from '../utils/formatCurrency';
import { calculateRemaining, getPaymentStatus } from '../utils/calculations';
import { getCarrierBadge } from '../utils/carrierUtils';
import { PaymentStatusBadge } from '../components/common/StatusBadge';
import { StatCard } from '../components/common/StatCard';
import { PaymentModal } from '../components/payments/PaymentModal';
import { EmptyState } from '../components/common/EmptyState';
import { DashboardHeroArtwork } from '../components/dashboard/DashboardHeroArtwork';
import {
  CreditCard,
  Layers,
  CheckCircle2,
  Coins,
  PlusCircle,
  Search,
  Eye,
  Phone,
  User,
  ChevronRight
} from 'lucide-react';

export function Payments() {
  const navigate = useNavigate();
  const { customers, metrics } = useCustomers();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [customerForPayment, setCustomerForPayment] = useState(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (activeFilter !== 'ALL' && c.paymentStatus !== activeFilter) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesCompany = c.insuranceCompany?.toLowerCase().includes(q);
        const matchesPhone = c.phone?.toLowerCase().includes(q);
        if (!matchesName && !matchesCompany && !matchesPhone) return false;
      }
      return true;
    });
  }, [customers, activeFilter, search]);

  return (
    <div className="page-container">
      {/* Header matching exact reference */}
      <div className="customer-registry-header">
        <div className="customer-registry-header-left">
          <div className="customer-registry-icon-badge">
            <CreditCard size={22} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="customer-registry-title">Payments & Premiums</h1>
            <p className="customer-registry-subtitle">
              Track premium collections, outstanding balances, and installment records ({customers.length} total)
            </p>
          </div>
        </div>

        {/* Top Right Reference Artwork */}
        <div className="customer-hero-artwork">
          <DashboardHeroArtwork />
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="stat-grid">
        <StatCard
          label="TOTAL BUSINESS"
          value={formatCurrency(metrics.totalBusiness)}
          subtext="Total insurance amount"
          icon={Layers}
          colorTheme="gold"
        />

        <StatCard
          label="TOTAL COLLECTED"
          value={formatCurrency(metrics.totalCollected)}
          subtext="Received payments"
          icon={CheckCircle2}
          colorTheme="green"
        />

        <StatCard
          label="PENDING PAYMENTS"
          value={formatCurrency(metrics.pendingPayments)}
          subtext="Outstanding premiums"
          icon={Coins}
          colorTheme="orange"
        />

        <StatCard
          label="PAYMENT STANDING"
          value={`${metrics.paymentStatusCounts.paid} Paid`}
          subtext={`${metrics.paymentStatusCounts.partial} Partial • ${metrics.paymentStatusCounts.pending} Pending`}
          icon={CreditCard}
          colorTheme="orange"
        />
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${activeFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('ALL')}
          >
            All Payments ({customers.length})
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'Paid' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('Paid')}
          >
            Fully Paid ({metrics.paymentStatusCounts.paid})
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'Partial Payment' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('Partial Payment')}
          >
            Partial Payment ({metrics.paymentStatusCounts.partial})
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'Pending' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter('Pending')}
          >
            Pending ({metrics.paymentStatusCounts.pending})
          </button>
        </div>

        <div className="search-input-box" style={{ maxWidth: '300px' }}>
          <Search size={16} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Payments Table & Mobile Cards */}
      {filteredCustomers.length === 0 ? (
        <div className="app-card">
          <EmptyState
            icon={CreditCard}
            title="No payment records match"
            description="Try switching the filter tab or clearing your search term."
            actionLabel="View All Payments"
            onAction={() => {
              setActiveFilter('ALL');
              setSearch('');
            }}
          />
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="table-container desktop-only">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CUSTOMER NAME</th>
                  <th>INSURANCE COMPANY</th>
                  <th style={{ textAlign: 'right' }}>TOTAL AMOUNT</th>
                  <th style={{ textAlign: 'right' }}>PAID AMOUNT</th>
                  <th style={{ textAlign: 'right' }}>REMAINING AMOUNT</th>
                  <th>PAYMENT STATUS</th>
                  <th style={{ textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => {
                  const paid = Number(c.partialAmount ?? c.paidAmount) || 0;
                  const total = Number(c.totalAmount) || 0;
                  const remaining = calculateRemaining(total, paid);
                  const status = getPaymentStatus(total, paid);
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
                      <td style={{ textAlign: 'right' }} className="table-amount-cell">
                        {formatCurrency(total)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--status-paid)' }} className="table-amount-cell">
                        {formatCurrency(paid)}
                      </td>
                      <td
                        style={{ textAlign: 'right' }}
                        className="table-amount-bold"
                      >
                        <span style={{ color: remaining > 0 ? '#DC2626' : '#64748B' }}>
                          {formatCurrency(remaining)}
                        </span>
                      </td>
                      <td>
                        <PaymentStatusBadge status={status} />
                      </td>
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {remaining > 0 ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setCustomerForPayment(c)}
                            >
                              <PlusCircle size={14} />
                              <span>Add Payment</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--status-paid)', fontWeight: 700 }}>
                              Completed
                            </span>
                          )}
                          <button
                            className="btn-icon-only"
                            title="View Profile"
                            onClick={() => navigate(`/customers/${c.id}`)}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Payments Table View (Matches exact Customer Directory style, zero swipe!) */}
          <div className="mobile-table-card mobile-only">
            <div className="mobile-table-header-strip">
              <div className="mobile-table-title-area">
                <span className="mobile-table-title">Payment Directory</span>
                <span className="mobile-table-count-badge">{filteredCustomers.length}</span>
              </div>
              <span className="mobile-table-hint">Tap row for details</span>
            </div>

            <div className="mobile-table-wrapper">
              <table className="mobile-customer-table">
                <thead>
                  <tr>
                    <th className="m-th-customer">Customer</th>
                    <th className="m-th-status">Status & Due</th>
                    <th className="m-th-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => {
                    const total = Number(c.totalAmount) || 0;
                    const paid = Number(c.partialAmount ?? c.paidAmount) || 0;
                    const remaining = calculateRemaining(total, paid);
                    const status = getPaymentStatus(total, paid);
                    const initial = c.name ? c.name.trim().charAt(0).toUpperCase() : 'C';

                    return (
                      <tr
                        key={`m-pay-${c.id}`}
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
                            <PaymentStatusBadge status={status} short />
                            <span className={`m-table-due ${remaining > 0 ? 'due-danger' : 'due-settled'}`}>
                              {remaining > 0 ? formatCurrency(remaining) : 'Settled'}
                            </span>
                          </div>
                        </td>

                        <td className="m-td-action">
                          {remaining > 0 ? (
                            <button
                              type="button"
                              className="m-table-detail-btn m-table-pay-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomerForPayment(c);
                              }}
                              title="Add Payment"
                            >
                              <PlusCircle size={12} />
                              <span>Pay</span>
                            </button>
                          ) : (
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
                          )}
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

      {/* Record Payment Modal */}
      <PaymentModal
        isOpen={!!customerForPayment}
        customer={customerForPayment}
        onClose={() => setCustomerForPayment(null)}
      />
    </div>
  );
}
