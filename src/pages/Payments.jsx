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
      {/* Header with accent bar */}
      <div className="header-with-accent" style={{ marginBottom: '20px' }}>
        <div className="header-accent-bar" />
        <div>
          <h1 className="page-title">Payments & Premiums</h1>
          <p className="page-subtitle">
            Track premium collections, outstanding balances, and installment records
          </p>
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

          {/* Native Mobile Payment Cards (Zero swipe!) */}
          <div className="mobile-only mobile-renewal-card-list">
            {filteredCustomers.map((c) => {
              const paid = Number(c.partialAmount ?? c.paidAmount) || 0;
              const total = Number(c.totalAmount) || 0;
              const remaining = calculateRemaining(total, paid);
              const status = getPaymentStatus(total, paid);
              const carrier = getCarrierBadge(c.insuranceCompany, c.carrierCode);

              return (
                <div
                  key={`m-payment-${c.id}`}
                  className="mobile-renewal-card"
                  onClick={() => navigate(`/customers/${c.id}`)}
                >
                  <div className="mobile-renewal-header">
                    <div className="mobile-renewal-user">
                      <div className="table-customer-avatar">
                        <User size={15} />
                      </div>
                      <div>
                        <div className="mobile-renewal-name">{c.name}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          {c.phone}
                        </div>
                      </div>
                    </div>

                    <PaymentStatusBadge status={status} />
                  </div>

                  <div className="mobile-renewal-meta">
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {c.insuranceCompany}
                    </span>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Total: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(c.totalAmount)}</strong>
                    </div>
                  </div>

                  <div className="mobile-renewal-footer">
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Remaining Balance</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: remaining > 0 ? '#DC2626' : '#22C55E' }}>
                        {formatCurrency(remaining)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {remaining > 0 && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '11.5px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomerForPayment(c);
                          }}
                        >
                          <PlusCircle size={13} />
                          <span>Pay</span>
                        </button>
                      )}
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '11.5px', borderRadius: '8px' }}
                        onClick={() => navigate(`/customers/${c.id}`)}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
