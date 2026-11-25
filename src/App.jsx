import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomerProvider, useCustomers } from './context/CustomerContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from './components/common/ToastContainer';
import { ReminderPopupNotification } from './components/common/ReminderPopupNotification';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { CustomerFormModal } from './components/customers/CustomerFormModal';

// Pages
import { Login } from './pages/Login';
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
import './styles/dark-mode.css';

function AuthenticatedApp() {
  const { popupNotification, closeAppNotification } = useCustomers();
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('ashok_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ashok_sidebar_collapsed', String(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

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
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Desktop Sidebar Navigation */}
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebarCollapse} />

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
            <Route path="/login" element={<Navigate to="/" replace />} />
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

      {/* Global In-App Pop-up Notification for Admin Reminders */}
      <ReminderPopupNotification
        notification={popupNotification}
        onClose={closeAppNotification}
      />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="unauthenticated-app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer />
      </div>
    );
  }

  return (
    <CustomerProvider>
      <AuthenticatedApp />
    </CustomerProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
