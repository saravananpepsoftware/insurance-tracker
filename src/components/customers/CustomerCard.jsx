import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateRemaining, getPaymentStatus } from '../../utils/calculations';
import { formatIndianDate } from '../../utils/dateUtils';
import { PaymentStatusBadge, InsuranceTypeBadge, RenewalUrgencyBadge } from '../common/StatusBadge';
import { Phone, ChevronRight, PlusCircle } from 'lucide-react';

export function CustomerCard({ customer, onAddPayment }) {
  const navigate = useNavigate();
  const paid = Number(customer.partialAmount ?? customer.paidAmount) || 0;
  const total = Number(customer.totalAmount) || 0;
  const remaining = calculateRemaining(total, paid);
  const status = getPaymentStatus(total, paid);

  return (
    <div
      className="mobile-customer-card"
      onClick={() => navigate(`/customers/${customer.id}`)}
    >
      <div className="mobile-card-header">
        <div>
          <div className="mobile-card-name">{customer.name}</div>
          <div className="mobile-card-phone">
            <Phone size={12} />
            <a
              href={`tel:${customer.phone}`}
              onClick={(e) => e.stopPropagation()}
              style={{ color: 'inherit' }}
            >
              {customer.phone}
            </a>
          </div>
        </div>
        <PaymentStatusBadge status={status} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <InsuranceTypeBadge type={customer.insuranceType} />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          • {customer.insuranceCompany}
        </span>
      </div>

      <div className="mobile-card-meta">
        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Remaining Balance</div>
          <div style={{
            fontWeight: 700,
            fontSize: '13px',
            color: remaining > 0 ? 'var(--status-danger)' : 'var(--status-success)'
          }}>
            {formatCurrency(remaining)}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Policy Expiry</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <span style={{ fontWeight: 600, fontSize: '12px' }}>
              {formatIndianDate(customer.policyEndDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="mobile-card-actions" onClick={(e) => e.stopPropagation()}>
        <RenewalUrgencyBadge endDate={customer.policyEndDate} short />

        <div style={{ display: 'flex', gap: '8px' }}>
          {remaining > 0 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onAddPayment(customer)}
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              <PlusCircle size={13} />
              Pay
            </button>
          )}

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`/customers/${customer.id}`)}
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            <span>Details</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

