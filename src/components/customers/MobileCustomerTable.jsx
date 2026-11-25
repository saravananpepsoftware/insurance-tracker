import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateRemaining, getPaymentStatus } from '../../utils/calculations';
import { PaymentStatusBadge } from '../common/StatusBadge';
import { Eye, Phone } from 'lucide-react';

export function MobileCustomerTable({
  customers,
  onViewDetail
}) {
  return (
    <div className="mobile-table-card mobile-only">
      <div className="mobile-table-header-strip">
        <div className="mobile-table-title-area">
          <span className="mobile-table-title">Customer Directory</span>
          <span className="mobile-table-count-badge">{customers.length}</span>
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
            {customers.map((c) => {
              const total = Number(c.totalAmount) || 0;
              const paid = Number(c.partialAmount ?? c.paidAmount) || 0;
              const remaining = calculateRemaining(total, paid);
              const status = getPaymentStatus(total, paid);
              const initial = c.name ? c.name.trim().charAt(0).toUpperCase() : 'C';

              return (
                <tr
                  key={c.id}
                  className="mobile-table-row"
                  onClick={() => onViewDetail(c)}
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
                    <button
                      type="button"
                      className="m-table-detail-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(c);
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
  );
}

export default MobileCustomerTable;

