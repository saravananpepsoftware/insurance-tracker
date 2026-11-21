import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatIndianDate } from '../../utils/dateUtils';
import { InsuranceTypeBadge, PaymentStatusBadge } from '../common/StatusBadge';
import { Users, ArrowRight, Phone } from 'lucide-react';

export function RecentCustomersList({ customers }) {
  const navigate = useNavigate();
  const recent = [...customers].slice(0, 5);

  return (
    <div className="app-card">
      <div className="card-header">
        <div className="card-title">
          <Users size={18} color="var(--primary-orange)" />
          <span>Recently Added Customers</span>
        </div>
        <button
          className="btn btn-outline-orange btn-sm"
          onClick={() => navigate('/customers')}
        >
          <span>View All Customers</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div style={{ padding: 0 }}>
        {recent.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>No customers added yet.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Insurance Company</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Total Amount</th>
                  <th>Policy Expiry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr
                    key={c.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/customers/${c.id}`)}
                  >
                    <td>
                      <div className="table-customer-cell">
                        <span className="table-customer-name">{c.name}</span>
                        <span className="table-customer-phone">
                          <Phone size={12} /> {c.phone}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, fontSize: '14px' }}>{c.insuranceCompany}</span>
                    </td>
                    <td>
                      <InsuranceTypeBadge type={c.insuranceType} />
                    </td>
                    <td style={{ textAlign: 'right' }} className="table-amount-cell">
                      {formatCurrency(c.totalAmount)}
                    </td>
                    <td>
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{formatIndianDate(c.policyEndDate)}</span>
                    </td>
                    <td>
                      <PaymentStatusBadge status={c.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

