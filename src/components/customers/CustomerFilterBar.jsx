import React from 'react';
import { Search, X, Layers, CreditCard, Shield, ChevronDown, Plus } from 'lucide-react';

export function CustomerFilterBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  expiryFilter,
  onExpiryFilterChange,
  onResetFilters,
  onOpenAddCustomer
}) {
  const hasActiveFilters =
    search !== '' ||
    typeFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    expiryFilter !== 'ALL';

  return (
    <div className="customer-registry-controls">
      {/* Search Input Pill */}
      <div className="search-pill-container">
        <Search size={16} color="#64748B" />
        <input
          type="text"
          placeholder="Search by customer name, phone, or company..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              border: 'none',
              background: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px'
            }}
            title="Clear Search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Dropdowns + Add Customer Action Button */}
      <div className="filter-pills-row">
        {/* Insurance Type */}
        <div className="filter-pill-select-box">
          <Layers size={14} color="var(--primary-orange)" />
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            aria-label="Filter by Insurance Type"
          >
            <option value="ALL">All Types</option>
            <option value="Motor Insurance">Motor Insurance</option>
            <option value="Accidental Insurance">Accidental Insurance</option>
          </select>
          <ChevronDown size={14} color="#64748B" className="filter-pill-chevron" />
        </div>

        {/* Payment Status */}
        <div className="filter-pill-select-box">
          <CreditCard size={14} color="var(--primary-orange)" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            aria-label="Filter by Payment Status"
          >
            <option value="ALL">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Partial Payment">Partial Payment</option>
            <option value="Pending">Pending</option>
          </select>
          <ChevronDown size={14} color="#64748B" className="filter-pill-chevron" />
        </div>

        {/* Expiry / Policy Urgency */}
        <div className="filter-pill-select-box">
          <Shield size={14} color="var(--primary-orange)" />
          <select
            value={expiryFilter}
            onChange={(e) => onExpiryFilterChange(e.target.value)}
            aria-label="Filter by Policy Expiry"
          >
            <option value="ALL">All Policies</option>
            <option value="EXPIRING_SOON">Expiring in 30 Days</option>
            <option value="EXPIRED">Expired Policies</option>
            <option value="ACTIVE">Active (30+ Days)</option>
          </select>
          <ChevronDown size={14} color="#64748B" className="filter-pill-chevron" />
        </div>

        {/* Reset button if any filter is active */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onResetFilters}
            style={{ borderRadius: '9999px', height: '42px', padding: '0 14px' }}
            title="Reset All Filters"
          >
            <X size={14} />
            <span>Reset</span>
          </button>
        )}

        {/* + Add Customer Button in Exact Pill Format */}
        {onOpenAddCustomer && (
          <button
            type="button"
            className="btn-add-customer-pill"
            onClick={onOpenAddCustomer}
          >
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default CustomerFilterBar;
