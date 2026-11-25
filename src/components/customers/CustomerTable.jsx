import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateRemaining, getPaymentStatus } from '../../utils/calculations';
import { formatIndianDate, calculateDaysRemaining } from '../../utils/dateUtils';
import { getCarrierBadge } from '../../utils/carrierUtils';
import { generateCustomerPdf } from '../../utils/customerPdfGenerator';
import { PaymentStatusBadge } from '../common/StatusBadge';
import {
  Eye,
  Edit3,
  Trash2,
  PlusCircle,
  FileDown,
  Phone,
  Calendar,
  Car,
  Users,
  Clock,
  CheckCircle2
} from 'lucide-react';

export function CustomerTable({
  customers,
  onEditCustomer,
  onDeleteCustomer,
  onAddPayment
}) {
  const navigate = useNavigate();

  return (
    <div className="customer-table-card desktop-only">
      <table className="exact-customer-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left', paddingLeft: '22px' }}>Customer</th>
            <th style={{ textAlign: 'left' }}>Insurance Company</th>
            <th style={{ textAlign: 'left' }}>Policy Type</th>
            <th style={{ textAlign: 'right' }}>Total Amount</th>
            <th style={{ textAlign: 'right' }}>Paid Amount</th>
            <th style={{ textAlign: 'right' }}>Remaining Amount</th>
            <th style={{ textAlign: 'left' }}>Policy End Date</th>
            <th style={{ textAlign: 'left' }}>Status</th>
            <th style={{ textAlign: 'center', paddingRight: '22px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => {
            const paid = Number(c.partialAmount ?? c.paidAmount) || 0;
            const total = Number(c.totalAmount) || 0;
            const remaining = calculateRemaining(total, paid);
            const status = getPaymentStatus(total, paid);
            const carrier = getCarrierBadge(c.insuranceCompany, c.carrierCode);
            const daysLeft = calculateDaysRemaining(c.policyEndDate);

            return (
              <tr
                key={c.id}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/customers/${c.id}`)}
              >
                {/* 1. Customer Column (Left-Aligned) */}
                <td style={{ textAlign: 'left', paddingLeft: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="table-avatar-box">
                      {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {c.name}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'nowrap' }}>
                        <Phone size={11} color="#94A3B8" />
                        <span>{c.phone}</span>
                      </span>
                    </div>
                  </div>
                </td>

                {/* 2. Insurance Company Column (Left-Aligned) */}
                <td style={{ textAlign: 'left' }}>
                  <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                    {c.insuranceCompany}
                  </span>
                </td>

                {/* 3. Policy Type Column (Left-Aligned) */}
                <td style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c.insuranceType === 'Motor Insurance' ? (
                      <Car size={16} color="#2563EB" />
                    ) : (
                      <Users size={16} color="#2563EB" />
                    )}
                    <span>{c.insuranceType}</span>
                  </div>
                </td>

                {/* 4. Total Amount Column (Right-Aligned) */}
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(c.totalAmount)}
                  </span>
                </td>

                {/* 5. Paid Amount Column (Right-Aligned, Green) */}
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '14.5px', color: '#16A34A', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(paid)}
                  </span>
                </td>

                {/* 6. Remaining Amount Column (Right-Aligned, Red when > 0, Dark when 0) */}
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '14.5px', color: remaining > 0 ? '#DC2626' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(remaining)}
                  </span>
                </td>

                {/* 7. Policy End Date Column (Left-Aligned) */}
                <td style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={13} color="var(--primary-orange)" />
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                        {formatIndianDate(c.policyEndDate)}
                      </span>
                    </div>
                    <div>
                      {daysLeft < 0 ? (
                        <span className="table-expiry-pill pill-danger">Expired</span>
                      ) : daysLeft <= 7 ? (
                        <span className="table-expiry-pill pill-danger">{daysLeft} days left</span>
                      ) : daysLeft <= 30 ? (
                        <span className="table-expiry-pill pill-warning">{daysLeft} days left</span>
                      ) : null}
                    </div>
                  </div>
                </td>

                {/* 8. Status Column (Left-Aligned) */}
                <td style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                  <PaymentStatusBadge status={status} />
                </td>

                {/* 9. Actions Column (Center-Aligned) */}
                <td style={{ textAlign: 'center', paddingRight: '22px', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <button
                      className="table-action-btn action-pay"
                      title="Add Payment"
                      onClick={() => onAddPayment(c)}
                    >
                      <PlusCircle size={17} />
                    </button>
                    <button
                      className="table-action-btn action-view"
                      title="View Customer Profile"
                      onClick={() => navigate(`/customers/${c.id}`)}
                    >
                      <Eye size={17} />
                    </button>
                    <button
                      className="table-action-btn action-pdf"
                      title="Download Customer Details PDF"
                      onClick={() => generateCustomerPdf(c)}
                    >
                      <FileDown size={17} />
                    </button>
                    <button
                      className="table-action-btn action-edit"
                      title="Edit Customer"
                      onClick={() => onEditCustomer(c)}
                    >
                      <Edit3 size={17} />
                    </button>
                    <button
                      className="table-action-btn action-delete"
                      title="Delete Customer"
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

export default CustomerTable;
