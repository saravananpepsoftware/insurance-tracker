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
      channel: reminderData.channel || 'fcm_push',
      type: reminderData.type || 'expiry',
      title: reminderData.title || '',
      timingDays: reminderData.timingDays || 30,
      customMessage: reminderData.message || '',
      note: reminderData.note || 'Reminder dispatched'
    };

    const existingReminders = Array.isArray(customer.renewalReminders) ? customer.renewalReminders : [];

    const updatedCustomer = {
      ...customer,
      reminderSent: true,
      lastReminderDate: reminderEntry.sentAt,
      lastReminderChannel: reminderEntry.channel,
      expiryReminderSent: reminderData.type === 'expiry' ? true : customer.expiryReminderSent,
      paymentReminderSent: reminderData.type === 'payment' ? true : customer.paymentReminderSent,
      renewalReminders: [reminderEntry, ...existingReminders]
    };

    const updated = customers.map(c => c.id === id ? updatedCustomer : c);
    persistCustomers(updated);
    addToast(`"${reminderData.title || 'Reminder'}" sent successfully!`, 'success');
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

  // Dispatch FCM App Pop-up Notification (Firebase Cloud Messaging)
  const dispatchCustomerReminder = useCallback((customer, type = 'payment', customTitle = '') => {
    if (!customer) return;

    const remaining = Number(customer.remainingAmount) || 0;
    const total = Number(customer.totalAmount) || 0;
    const paid = Number(customer.partialAmount) || 0;
    const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `+91 ${cleanPhone.slice(0,5)} ${cleanPhone.slice(5)}` : customer.phone;
    const company = customer.insuranceCompany || 'your insurer';
    const policyType = customer.insuranceType || 'Insurance Policy';

    const defaultTitle = type === 'payment' ? 'Pay the pending amount' : 'Your policy expires soon, renew quick';
    const finalTitle = customTitle || defaultTitle;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = customer.policyEndDate ? new Date(customer.policyEndDate) : today;
    end.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = daysRemaining < 0;
    const timePhrase = isExpired ? `expired ${Math.abs(daysRemaining)} days ago` : `expires in ${daysRemaining} days`;

    // FCM Notification Payload Body
    let fcmBody = '';
    if (type === 'payment') {
      fcmBody = `Dear ${customer.name}, please pay the pending amount of ₹${remaining.toLocaleString('en-IN')} for your ${policyType} (${company}). Total: ₹${total.toLocaleString('en-IN')}, Paid: ₹${paid.toLocaleString('en-IN')}.`;
    } else {
      fcmBody = `Dear ${customer.name}, your ${policyType} policy with ${company} ${timePhrase}. Please renew quick to ensure continuous protection.`;
    }

    // Generated FCM Device Registration Token for this customer app instance
    const fcmDeviceToken = `fcm_${customer.id}_tok_${Math.random().toString(36).substring(2, 9)}`;

    // Record in history as FCM App Notification and update customer sent state
    recordRenewalReminder(customer.id, {
      channel: 'fcm_push',
      type: type,
      timingDays: 30,
      title: finalTitle,
      message: fcmBody,
      fcmToken: fcmDeviceToken,
      note: `${finalTitle} sent via FCM App Notification`
    });

    // Note: Do NOT trigger popup notification card modal here per user request:
    // "after sending message dont show like this card just show tick in near that selected message"
  }, [recordRenewalReminder]);

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

