import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  initializeDataIfEmpty,
  getStoredCustomers,
  setStoredCustomers,
  resetToDemoData,
  clearAllAppData,
  getStoredCompanies,
  saveStoredCompany
} from '../utils/storage';
import { savePdfDocument, deletePdfDocument } from '../utils/indexedDb';
import { calculateRemaining, getPaymentStatus, calculateDashboardMetrics } from '../utils/calculations';
import { useToast } from './ToastContext';

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState(() => getStoredCompanies());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  // Load data on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await initializeDataIfEmpty();
        setCustomers(data);
      } catch (err) {
        console.error('Failed to initialize customer data:', err);
        addToast('Failed to load local customer data', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [addToast]);

  // Save to localStorage whenever customers change (after initial load)
  const persistCustomers = useCallback((newCustomers) => {
    setCustomers(newCustomers);
    setStoredCustomers(newCustomers);
  }, []);

  // Add new customer
  const addCustomer = useCallback(async (formData, pdfFile) => {
    const total = Math.max(0, Number(formData.totalAmount) || 0);
    const partial = Math.max(0, Number(formData.partialAmount) || 0);
    const remaining = calculateRemaining(total, partial);
    const paymentStatus = getPaymentStatus(total, partial);

    const newId = 'cust-' + Date.now();
    let pdfFileName = '';
    let pdfFileSize = 0;
    let hasPdf = false;

    if (pdfFile) {
      try {
        await savePdfDocument(newId, pdfFile, pdfFile.name, pdfFile.size);
        pdfFileName = pdfFile.name;
        pdfFileSize = pdfFile.size;
        hasPdf = true;
      } catch (e) {
        console.error('Failed to save PDF in IndexedDB:', e);
        addToast('Policy PDF could not be saved to IndexedDB', 'warning');
      }
    }

    const newCustomer = {
      id: newId,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      insuranceCompany: formData.insuranceCompany.trim(),
      insuranceType: formData.insuranceType,
      totalAmount: total,
      partialAmount: partial,
      remainingAmount: remaining,
      paymentStatus,
      policyStartDate: formData.policyStartDate,
      policyEndDate: formData.policyEndDate,
      pdfFileName,
      pdfFileSize,
      hasPdf,
      createdAt: new Date().toISOString()
    };

    const updated = [newCustomer, ...customers];
    persistCustomers(updated);
    addToast(`Customer "${newCustomer.name}" added successfully!`, 'success');
    return newCustomer;
  }, [customers, persistCustomers, addToast]);

  // Update existing customer
  const updateCustomer = useCallback(async (id, formData, newPdfFile, removePdf = false) => {
    const existing = customers.find(c => c.id === id);
    if (!existing) {
      addToast('Customer not found', 'error');
      return null;
    }

    const total = Math.max(0, Number(formData.totalAmount) || 0);
    const partial = Math.max(0, Number(formData.partialAmount) || 0);
    const remaining = calculateRemaining(total, partial);
    const paymentStatus = getPaymentStatus(total, partial);

    let pdfFileName = existing.pdfFileName;
    let pdfFileSize = existing.pdfFileSize;
    let hasPdf = existing.hasPdf;

    if (removePdf) {
      try {
        await deletePdfDocument(id);
      } catch (e) {
        console.error(e);
      }
      pdfFileName = '';
      pdfFileSize = 0;
      hasPdf = false;
    } else if (newPdfFile) {
      try {
        await savePdfDocument(id, newPdfFile, newPdfFile.name, newPdfFile.size);
        pdfFileName = newPdfFile.name;
        pdfFileSize = newPdfFile.size;
        hasPdf = true;
      } catch (e) {
        console.error('Failed to update PDF in IndexedDB:', e);
        addToast('Failed to update PDF document', 'warning');
      }
    }

    const updatedCustomer = {
      ...existing,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      insuranceCompany: formData.insuranceCompany.trim(),
      insuranceType: formData.insuranceType,
      totalAmount: total,
      partialAmount: partial,
      remainingAmount: remaining,
      paymentStatus,
      policyStartDate: formData.policyStartDate,
      policyEndDate: formData.policyEndDate,
      pdfFileName,
      pdfFileSize,
      hasPdf,
      updatedAt: new Date().toISOString()
    };

    const updated = customers.map(c => c.id === id ? updatedCustomer : c);
    persistCustomers(updated);
    addToast(`Customer "${updatedCustomer.name}" updated successfully!`, 'success');
    return updatedCustomer;
  }, [customers, persistCustomers, addToast]);

  // Add payment to customer
  const addPayment = useCallback((id, paymentAmount) => {
    const numPayment = Number(paymentAmount);
    if (isNaN(numPayment) || numPayment <= 0) {
      addToast('Please enter a valid positive payment amount', 'error');
      return false;
    }

    const customer = customers.find(c => c.id === id);
    if (!customer) {
      addToast('Customer not found', 'error');
      return false;
    }

    const currentPaid = Number(customer.partialAmount) || 0;
    const total = Number(customer.totalAmount) || 0;
    const remaining = calculateRemaining(total, currentPaid);

    if (numPayment > remaining) {
      addToast(`Payment amount cannot exceed remaining balance of ₹${remaining.toLocaleString('en-IN')}`, 'error');
      return false;
    }

    const newPaid = currentPaid + numPayment;
    const newRemaining = calculateRemaining(total, newPaid);
    const newStatus = getPaymentStatus(total, newPaid);

    const updatedCustomer = {
      ...customer,
      partialAmount: newPaid,
      remainingAmount: newRemaining,
      paymentStatus: newStatus,
      lastPaymentDate: new Date().toISOString()
    };

    const updated = customers.map(c => c.id === id ? updatedCustomer : c);
    persistCustomers(updated);
    addToast(`Payment of ₹${numPayment.toLocaleString('en-IN')} added for ${customer.name}!`, 'success');
    return true;
  }, [customers, persistCustomers, addToast]);

  // Delete customer
  const deleteCustomer = useCallback(async (id) => {
    const customer = customers.find(c => c.id === id);
    const name = customer ? customer.name : 'Customer';

    try {
      await deletePdfDocument(id);
    } catch (e) {
      console.warn('PDF deletion error:', e);
    }

    const updated = customers.filter(c => c.id !== id);
    persistCustomers(updated);
    addToast(`"${name}" has been deleted`, 'info');
  }, [customers, persistCustomers, addToast]);

  // Reset demo
  const resetDemo = useCallback(async () => {
    setLoading(true);
    try {
      const demo = await resetToDemoData();
      setCustomers(demo);
      addToast('Reset to demo sample data successfully!', 'success');
    } catch (e) {
      console.error(e);
      addToast('Failed to reset sample data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Clear all data
  const clearAll = useCallback(async () => {
    setLoading(true);
    try {
      await clearAllAppData();
      setCustomers([]);
      addToast('All customer records and documents cleared.', 'info');
    } catch (e) {
      console.error(e);
      addToast('Failed to clear data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Get customer by ID
  const getCustomerById = useCallback((id) => {
    return customers.find(c => c.id === id) || null;
  }, [customers]);

  // Add custom company
  const addCompany = useCallback((companyName) => {
    const updated = saveStoredCompany(companyName);
    setCompanies(updated);
    return updated;
  }, []);

  // Record renewal reminder sent
  const recordRenewalReminder = useCallback((id, reminderData) => {
    const customer = customers.find(c => c.id === id);
    if (!customer) return false;

    const reminderEntry = {
      id: 'rem-' + Date.now(),
      sentAt: new Date().toISOString(),
      channel: reminderData.channel || 'whatsapp',
      timingDays: reminderData.timingDays || 30,
      customMessage: reminderData.message || '',
      note: reminderData.note || '30-day renewal reminder dispatched'
    };

    const existingReminders = Array.isArray(customer.renewalReminders) ? customer.renewalReminders : [];

    const updatedCustomer = {
      ...customer,
      reminderSent: true,
      lastReminderDate: reminderEntry.sentAt,
      lastReminderChannel: reminderEntry.channel,
      renewalReminders: [reminderEntry, ...existingReminders]
    };

    const updated = customers.map(c => c.id === id ? updatedCustomer : c);
    persistCustomers(updated);
    addToast('Renewal reminder notice recorded successfully!', 'success');
    return true;
  }, [customers, persistCustomers, addToast]);

  // App-level Pop-up Notification for Reminders
  const [popupNotification, setPopupNotification] = useState(null);

  const triggerAppNotification = useCallback((notificationData) => {
    setPopupNotification({
      id: 'notif-' + Date.now(),
      timestamp: new Date().toISOString(),
      ...notificationData
    });
  }, []);

  const closeAppNotification = useCallback(() => {
    setPopupNotification(null);
  }, []);

  // Dispatch reminder (opens WhatsApp, updates customer record, triggers popup notification)
  const dispatchCustomerReminder = useCallback((customer, type = 'payment', customTitle = '') => {
    if (!customer) return;

    const remaining = Number(customer.remainingAmount) || 0;
    const total = Number(customer.totalAmount) || 0;
    const paid = Number(customer.partialAmount) || 0;
    const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const company = customer.insuranceCompany || 'your insurer';
    const policyType = customer.insuranceType || 'Insurance Policy';

    const defaultTitle = type === 'payment' ? 'Pay the pending amount' : 'Your policy expires soon, renew quick';
    const finalTitle = customTitle || defaultTitle;

    let message = '';
    if (type === 'payment') {
      message = `*PAY THE PENDING AMOUNT*\n\nDear ${customer.name},\n\nThis is a priority payment reminder from InsureTrack regarding your ${policyType} policy with ${company}.\n\n• Policy Total: ₹${total.toLocaleString('en-IN')}\n• Amount Paid: ₹${paid.toLocaleString('en-IN')}\n• Pending Balance: ₹${remaining.toLocaleString('en-IN')}\n\nPlease complete the pending balance settlement at your earliest convenience to maintain uninterrupted insurance coverage.\n\nThank you,\nInsureTrack Admin Team`;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = customer.policyEndDate ? new Date(customer.policyEndDate) : today;
      end.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const isExpired = daysLeft < 0;
      const timePhrase = isExpired ? `has EXPIRED (${Math.abs(daysLeft)} days ago)` : `is due for renewal in ${daysLeft} days`;

      message = `*YOUR POLICY EXPIRES SOON, RENEW QUICK*\n\nDear ${customer.name},\n\nThis is a priority renewal notification from InsureTrack regarding your ${policyType} policy with ${company}.\n\nYour policy ${timePhrase}.${remaining > 0 ? `\n• Pending Balance: ₹${remaining.toLocaleString('en-IN')}` : ''}\n\nPlease renew promptly to avoid insurance coverage lapse, inspection requirements, and NCB forfeiture.\n\nThank you,\nInsureTrack Admin Team`;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Record in history
    recordRenewalReminder(customer.id, {
      channel: 'whatsapp',
      timingDays: 30,
      message,
      note: `${finalTitle} dispatched via WhatsApp & in-app notification`
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = customer.policyEndDate ? new Date(customer.policyEndDate) : today;
    end.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Trigger in-app popup notification with the exact clicked message title!
    triggerAppNotification({
      title: finalTitle,
      recipient: customer.name,
      phone: customer.phone,
      type,
      amount: remaining,
      totalAmount: total,
      paidAmount: paid,
      daysLeft: daysRemaining,
      policyEndDate: customer.policyEndDate,
      company: customer.insuranceCompany,
      insuranceType: customer.insuranceType,
      customerId: customer.id
    });
  }, [recordRenewalReminder, triggerAppNotification]);

  // Dashboard metrics
  const metrics = useMemo(() => {
    return calculateDashboardMetrics(customers);
  }, [customers]);

  return (
    <CustomerContext.Provider
      value={{
        customers,
        companies,
        addCompany,
        loading,
        searchTerm,
        setSearchTerm,
        addCustomer,
        updateCustomer,
        addPayment,
        deleteCustomer,
        getCustomerById,
        recordRenewalReminder,
        dispatchCustomerReminder,
        popupNotification,
        triggerAppNotification,
        closeAppNotification,
        resetDemo,
        clearAll,
        metrics
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
}

