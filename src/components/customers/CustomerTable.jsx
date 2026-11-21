import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatIndianDate } from '../../utils/dateUtils';
import { getCarrierBadge } from '../../utils/carrierUtils';
import { PaymentStatusBadge, InsuranceTypeBadge, RenewalUrgencyBadge } from '../common/StatusBadge';
import { Eye, Edit3, Trash2, PlusCircle, Phone, User, Calendar } from 'lucide-react';

export function CustomerTable({
  customers,
  onEditCustomer,
  onDeleteCustomer,
  onAddPayment
}) {
  const navigate = useNavigate();

  return (
    <div className="table-container desktop-only">
      <table className="data-table">
        <thead>
          <tr>
            <th>CUSTOMER</th>
            <th>INSURANCE COMPANY</th>
            <th>TYPE</th>
            <th style={{ textAlign: 'right' }}>TOTAL AMOUNT</th>
            <th style={{ textAlign: 'right' }}>PAID AMOUNT</th>
            <th style={{ textAlign: 'right' }}>REMAINING AMOUNT</th>
            <th>POLICY END DATE</th>
            <th>STATUS</th>
            <th style={{ textAlign: 'center' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => {
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
                  <InsuranceTypeBadge type={c.insuranceType} />
                </td>
                <td style={{ textAlign: 'right' }} className="table-amount-cell">
                  {formatCurrency(c.totalAmount)}
                </td>
                <td style={{ textAlign: 'right', color: 'var(--status-paid)' }} className="table-amount-cell">
                  {formatCurrency(c.partialAmount)}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                      <Calendar size={13} color="var(--primary-orange)" />
                      <span>{formatIndianDate(c.policyEndDate)}</span>
                    </div>
                    <RenewalUrgencyBadge endDate={c.policyEndDate} short />
                  </div>
                </td>
                <td>
                  <PaymentStatusBadge status={c.paymentStatus} />
                </td>
                <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    {remaining > 0 && (
                      <button
                        className="btn-icon-only"
                        title="Add Payment"
                        style={{ color: 'var(--primary-orange)' }}
                        onClick={() => onAddPayment(c)}
                      >
                        <PlusCircle size={17} />
                      </button>
                    )}
                    <button
                      className="btn-icon-only"
                      title="View Customer Profile"
                      onClick={() => navigate(`/customers/${c.id}`)}
                    >
                      <Eye size={17} />
                    </button>
                    <button
                      className="btn-icon-only"
                      title="Edit Customer"
                      onClick={() => onEditCustomer(c)}
                    >
                      <Edit3 size={17} />
                    </button>
                    <button
                      className="btn-icon-only"
                      title="Delete Customer"
                      style={{ color: 'var(--status-danger)' }}
                      onClick={() => onDeleteCustomer(c)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
