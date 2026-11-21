import React from 'react';
import { Search, X, Filter } from 'lucide-react';

export function CustomerFilterBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  expiryFilter,
  onExpiryFilterChange,
  onResetFilters
}) {
  const hasActiveFilters =
    search !== '' ||
    typeFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    expiryFilter !== 'ALL';

  return (
    <div className="filter-bar">
      {/* Left: Search input */}
      <div className="filter-group-left">
        <div className="search-input-box">
          <Search size={16} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or company..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              style={{ color: 'var(--text-muted)', display: 'flex' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Right: Dropdowns */}
      <div className="filter-group-right">
        {/* Insurance Type */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '150px' }}
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          aria-label="Filter by Insurance Type"
        >
          <option value="ALL">All Types</option>
          <option value="Motor Insurance">Motor Insurance</option>
          <option value="Accidental Insurance">Accidental Insurance</option>
        </select>

        {/* Payment Status */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '150px' }}
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          aria-label="Filter by Payment Status"
        >
          <option value="ALL">All Payments</option>
          <option value="Paid">Fully Paid</option>
          <option value="Partial Payment">Partial Payment</option>
          <option value="Pending">Pending</option>
        </select>

        {/* Expiry Filter */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '150px' }}
          value={expiryFilter}
          onChange={(e) => onExpiryFilterChange(e.target.value)}
          aria-label="Filter by Policy Expiry"
        >
          <option value="ALL">All Policies</option>
          <option value="EXPIRING_SOON">Expiring in 30 Days</option>
          <option value="EXPIRED">Expired Policies</option>
          <option value="ACTIVE">Active (30+ Days)</option>
        </select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={onResetFilters}
            title="Reset All Filters"
          >
            <X size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}

