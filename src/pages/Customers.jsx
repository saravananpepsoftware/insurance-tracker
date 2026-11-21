import React, { useState, useMemo } from 'react';
import { useCustomers } from '../context/CustomerContext';
import { calculateDaysRemaining } from '../utils/dateUtils';
import { CustomerTable } from '../components/customers/CustomerTable';
import { CustomerCard } from '../components/customers/CustomerCard';
import { CustomerFilterBar } from '../components/customers/CustomerFilterBar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PaymentModal } from '../components/payments/PaymentModal';
import { EmptyState } from '../components/common/EmptyState';
import { Plus, Users, User } from 'lucide-react';
import sidebarArtworkImg from '../assets/sidebar-insurance-artwork.png';

export function Customers({ onOpenAddCustomer, onOpenEditCustomer }) {
  const { customers, searchTerm, setSearchTerm, deleteCustomer } = useCustomers();

  // Filters
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expiryFilter, setExpiryFilter] = useState('ALL');

  // Modals state
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [customerForPayment, setCustomerForPayment] = useState(null);

  // Multi-filter evaluation
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Global Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(query);
        const matchesPhone = c.phone?.toLowerCase().includes(query);
        const matchesCompany = c.insuranceCompany?.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesCompany) return false;
      }

      // Insurance Type
      if (typeFilter !== 'ALL' && c.insuranceType !== typeFilter) {
        return false;
      }

      // Payment Status
      if (statusFilter !== 'ALL' && c.paymentStatus !== statusFilter) {
        return false;
      }

      // Expiry filter
      if (expiryFilter !== 'ALL') {
        const days = calculateDaysRemaining(c.policyEndDate);
        if (expiryFilter === 'EXPIRING_SOON') {
          if (days < 0 || days > 30) return false;
        } else if (expiryFilter === 'EXPIRED') {
          if (days >= 0) return false;
        } else if (expiryFilter === 'ACTIVE') {
          if (days <= 30) return false;
        }
      }

      return true;
    });
  }, [customers, searchTerm, typeFilter, statusFilter, expiryFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setExpiryFilter('ALL');
  };

  return (
    <div className="page-container">
      {/* Header matching exact reference */}
      <div className="customer-registry-header">
        <div className="customer-registry-header-left">
          <div className="customer-registry-icon-badge">
            <User size={22} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="customer-registry-title">Customer Registry</h1>
            <p className="customer-registry-subtitle">
              Manage policyholders, track payment standing, and access policy records ({filteredCustomers.length} of {customers.length} total)
            </p>
          </div>
        </div>

        <div className="customer-registry-header-art">
          <img
            src={sidebarArtworkImg}
            alt="Insurance Registry Protection"
            className="customer-registry-art-img"
          />
        </div>
      </div>

      {/* Filter and Search Bar in Exact Single-Row Format */}
      <CustomerFilterBar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        expiryFilter={expiryFilter}
        onExpiryFilterChange={setExpiryFilter}
        onResetFilters={handleResetFilters}
        onOpenAddCustomer={onOpenAddCustomer}
      />

      {/* Content: Desktop Table & Mobile Cards */}
      {filteredCustomers.length === 0 ? (
        <div className="app-card">
          <EmptyState
            icon={Users}
            title={customers.length === 0 ? 'No customers yet' : 'No matching customers found'}
            description={
              customers.length === 0
                ? 'Get started by creating your first insurance customer record.'
                : 'Try adjusting your search criteria or clearing your active filters.'
            }
            actionLabel={customers.length === 0 ? 'Add First Customer' : 'Clear Filters'}
            onAction={customers.length === 0 ? onOpenAddCustomer : handleResetFilters}
          />
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <CustomerTable
            customers={filteredCustomers}
            onEditCustomer={onOpenEditCustomer}
            onDeleteCustomer={(c) => setCustomerToDelete(c)}
            onAddPayment={(c) => setCustomerForPayment(c)}
          />

          {/* Mobile Card List View */}
          <div className="mobile-card-list">
            {filteredCustomers.map((c) => (
              <CustomerCard
                key={c.id}
                customer={c}
                onAddPayment={(c) => setCustomerForPayment(c)}
              />
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!customerToDelete}
        title="Delete Customer Record"
        message={`Are you sure you want to delete ${customerToDelete?.name}? This action cannot be undone and will permanently remove their policy document and payment history.`}
        confirmLabel="Delete Customer"
        isDanger
        onConfirm={() => {
          if (customerToDelete) {
            deleteCustomer(customerToDelete.id);
            setCustomerToDelete(null);
          }
        }}
        onCancel={() => setCustomerToDelete(null)}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={!!customerForPayment}
        customer={customerForPayment}
        onClose={() => setCustomerForPayment(null)}
      />
    </div>
  );
}

