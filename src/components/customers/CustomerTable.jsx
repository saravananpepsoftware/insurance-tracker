import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatIndianDate, calculateDaysRemaining } from '../../utils/dateUtils';
import { getCarrierBadge } from '../../utils/carrierUtils';
import {
  Eye,
  Edit3,
  Trash2,
  PlusCircle,
  Phone,
  Calendar,
  Car,
  Users,
  Shield,
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
            <th>Customer</th>
            <th>Insurance Company</th>
            <th>Policy Type</th>
            <th style={{ textAlign: 'center' }}>Total Amount</th>
            <th style={{ textAlign: 'center' }}>Paid Amount</th>
            <th style={{ textAlign: 'center' }}>Remaining Amount</th>
            <th>Policy End Date</th>
            <th style={{ textAlign: 'center' }}>Status</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => {
            const remaining = Number(c.remainingAmount) || 0;
            const carrier = getCarrierBadge(c.insuranceCompany, c.carrierCode);
            const daysLeft = calculateDaysRemaining(c.policyEndDate);

            return (
              <tr
                key={c.id}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/customers/${c.id}`)}
              >
                {/* 1. Customer Column */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="table-avatar-box">
                      {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
                        {c.name}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        <Phone size={11} color="#94A3B8" />
                        <span>{c.phone}</span>
                      </span>
                    </div>
                  </div>
                </td>

                {/* 2. Insurance Company Column */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      className="table-carrier-badge"
                      style={{ backgroundColor: carrier.bg }}
                    >
                      {carrier.label}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#1E293B', maxWidth: '170px', lineHeight: '1.3' }}>
                      {c.insuranceCompany}
                    </span>
                  </div>
                </td>

                {/* 3. Policy Type Column */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                    {c.insuranceType === 'Motor Insurance' ? (
                      <Car size={16} color="#2563EB" />
                    ) : (
                      <Users size={16} color="#2563EB" />
                    )}
                    <span>{c.insuranceType}</span>
                  </div>
                </td>

                {/* 4. Total Amount Column */}
                <td style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '14.5px', color: '#0F172A' }}>
                    {formatCurrency(c.totalAmount)}
                  </span>
                </td>

                {/* 5. Paid Amount Column */}
                <td style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '14.5px', color: '#16A34A' }}>
                    {formatCurrency(c.partialAmount)}
                  </span>
                </td>

                {/* 6. Remaining Amount Column */}
                <td style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '14.5px', color: remaining > 0 ? '#DC2626' : '#0F172A' }}>
                    {formatCurrency(remaining)}
                  </span>
                </td>

                {/* 7. Policy End Date Column */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={13} color="var(--primary-orange)" />
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#1E293B' }}>
                        {formatIndianDate(c.policyEndDate)}
                      </span>
                    </div>
                    <div>
                      {daysLeft < 0 ? (
                        <span className="table-expiry-pill pill-danger">• Expired</span>
                      ) : daysLeft <= 7 ? (
                        <span className="table-expiry-pill pill-danger">• {daysLeft} days left</span>
                      ) : daysLeft <= 30 ? (
                        <span className="table-expiry-pill pill-warning">• {daysLeft} days left</span>
                      ) : (
                        <span className="table-expiry-pill pill-success">• Active</span>
                      )}
                    </div>
                  </div>
                </td>

                {/* 8. Status Column */}
                <td style={{ textAlign: 'center' }}>
                  {c.paymentStatus === 'Paid' ? (
                    <span className="table-status-pill status-paid">
                      <CheckCircle2 size={13} />
                      <span>Paid</span>
                    </span>
                  ) : c.paymentStatus === 'Partial Payment' ? (
                    <span className="table-status-pill status-partial">
                      <Clock size={13} />
                      <span>Partial Payment</span>
                    </span>
                  ) : (
                    <span className="table-status-pill status-pending">
                      <Clock size={13} />
                      <span>Pending</span>
                    </span>
                  )}
                </td>

                {/* 9. Actions Column */}
                <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
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
