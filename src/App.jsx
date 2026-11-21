import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CustomerProvider } from './context/CustomerContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { CustomerFormModal } from './components/customers/CustomerFormModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetails } from './pages/CustomerDetails';
import { Payments } from './pages/Payments';
import { Renewals } from './pages/Renewals';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';

// Styles
import './styles/variables.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/responsive.css';

function AppContent() {
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  const handleOpenAddCustomer = () => {
    setCustomerToEdit(null);
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (customer) => {
    setCustomerToEdit(customer);
    setIsCustomerModalOpen(true);
  };

  const handleCloseCustomerModal = () => {
    setIsCustomerModalOpen(false);
    setCustomerToEdit(null);
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar onOpenAddCustomer={handleOpenAddCustomer} />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route
              path="/"
              element={<Dashboard onOpenAddCustomer={handleOpenAddCustomer} />}
            />
            <Route
              path="/customers"
              element={
                <Customers
                  onOpenAddCustomer={handleOpenAddCustomer}
                  onOpenEditCustomer={handleOpenEditCustomer}
                />
              }
            />
            <Route
              path="/customers/:id"
              element={
                <CustomerDetails
                  onOpenEditCustomer={handleOpenEditCustomer}
                />
              }
            />
            <Route path="/payments" element={<Payments />} />
            <Route path="/renewals" element={<Renewals />} />
            <Route path="/reports" element={<Reports onOpenAddCustomer={handleOpenAddCustomer} />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Mobile Fixed Bottom Navigation */}
        <MobileNavigation />
      </div>

      {/* Global Add / Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        customerToEdit={customerToEdit}
      />

      {/* Global Toast Notifications Container */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CustomerProvider>
          <AppContent />
        </CustomerProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

