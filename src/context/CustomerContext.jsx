import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  getStoredCustomers,
  setStoredCustomers,
  clearAllAppData,
  getStoredCompanies,
  saveStoredCompany
} from '../utils/storage';
import {
  subscribeToCustomers,
  addCustomerToFirebase,
  updateCustomerInFirebase,
  addPaymentToFirebase,
  deleteCustomerFromFirebase,
  recordReminderInFirebase,
  clearAllCustomersFromFirebase
} from '../firebase/customerService';
import { calculateRemaining, getPaymentStatus, calculateDashboardMetrics } from '../utils/calculations';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState(() => getStoredCompanies());
  const [loading, setLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [firebaseError, setFirebaseError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  // Listen to live Firebase Firestore updates in real time (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let isInitialLoad = true;

    const unsubscribe = subscribeToCustomers(
      (liveCustomers) => {
        setCustomers(liveCustomers);
        setStoredCustomers(liveCustomers);
        setFirebaseConnected(true);
        setFirebaseError(null);
        setLoading(false);

        if (isInitialLoad) {
          isInitialLoad = false;
        }
      },
      (err) => {
        console.error('Firebase real-time error:', err);
        setFirebaseError(err);
        setLoading(false);

        // Fallback to local storage if offline or permissions pending
        const local = getStoredCustomers();
        setCustomers(local);

        if (err?.code === 'permission-denied') {
          addToast(
            'Firebase Firestore: Missing permissions. In Firebase Console > Firestore > Rules, set "allow read, write: if true;" to sync live.',
            'warning'
          );
        } else {
          addToast('Firebase connecting error, running in local fallback mode.', 'warning');
        }
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, addToast]);

  // Persist customers locally
  const persistCustomers = useCallback((newCustomers) => {
    setCustomers(newCustomers);
    setStoredCustomers(newCustomers);
  }, []);

  // Add new customer
  const addCustomer = useCallback(async (formData, pdfFile) => {
    try {
      const newCustomer = await addCustomerToFirebase(formData, pdfFile);
      setCustomers((prev) => [newCustomer, ...prev.filter((c) => c.id !== newCustomer.id)]);
      addToast(`Customer "${newCustomer.name}" saved to Firebase!`, 'success');
      return newCustomer;
    } catch (err) {
      console.warn('Saving locally due to Firebase error:', err);
      const total = Math.max(0, Number(formData.totalAmount) || 0);
      const partial = Math.max(0, Number(formData.partialAmount) || 0);
      const remaining = calculateRemaining(total, partial);
      const paymentStatus = getPaymentStatus(total, partial);
      const newId = 'cust-' + Date.now();

      const localCustomer = {
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
        pdfFileName: pdfFile ? pdfFile.name : '',
        pdfFileSize: pdfFile ? pdfFile.size : 0,
        hasPdf: !!pdfFile,
        createdAt: new Date().toISOString()
      };

      const updated = [localCustomer, ...customers];
      persistCustomers(updated);
      addToast(`Customer "${localCustomer.name}" saved locally (${err?.code || 'offline'})`, 'info');
      return localCustomer;
    }
  }, [customers, persistCustomers, addToast]);

  // Update existing customer
  const updateCustomer = useCallback(async (id, formData, newPdfFile, removePdf = false) => {
    const existing = customers.find((c) => c.id === id);
    if (!existing) {
      addToast('Customer not found', 'error');
      return null;
    }

    try {
      const updatedCustomer = await updateCustomerInFirebase(id, existing, formData, newPdfFile, removePdf);
      setCustomers((prev) => prev.map((c) => (c.id === id ? updatedCustomer : c)));
      addToast(`Customer "${updatedCustomer.name}" updated in Firebase!`, 'success');
      return updatedCustomer;
    } catch (err) {
      console.warn('Updating locally due to Firebase error:', err);
      const total = Math.max(0, Number(formData.totalAmount) || 0);
      const partial = Math.max(0, Number(formData.partialAmount) || 0);
      const remaining = calculateRemaining(total, partial);
      const paymentStatus = getPaymentStatus(total, partial);

      const localCustomer = {
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
        updatedAt: new Date().toISOString()
      };

      const updated = customers.map((c) => (c.id === id ? localCustomer : c));
      persistCustomers(updated);
      addToast(`Customer updated locally (${err?.code || 'offline'})`, 'info');
      return localCustomer;
    }
  }, [customers, persistCustomers, addToast]);

  // Add payment to customer
  const addPayment = useCallback(async (id, paymentAmount) => {
    const numPayment = Number(paymentAmount);
    if (isNaN(numPayment) || numPayment <= 0) {
      addToast('Please enter a valid positive payment amount', 'error');
      return false;
    }

    const customer = customers.find((c) => c.id === id);
    if (!customer) {
      addToast('Customer not found', 'error');
      return false;
    }

    const currentPaid = Number(customer.partialAmount ?? customer.paidAmount) || 0;
    const total = Number(customer.totalAmount) || 0;
    const remaining = calculateRemaining(total, currentPaid);

    if (numPayment > remaining) {
      addToast(`Payment amount cannot exceed remaining balance of ₹${remaining.toLocaleString('en-IN')}`, 'error');
      return false;
    }

    try {
      const updatedCustomer = await addPaymentToFirebase(id, customer, numPayment);
      setCustomers((prev) => prev.map((c) => (c.id === id ? updatedCustomer : c)));
      addToast(`Payment of ₹${numPayment.toLocaleString('en-IN')} recorded! New Paid: ₹${updatedCustomer.partialAmount.toLocaleString('en-IN')}, Remaining: ₹${updatedCustomer.remainingAmount.toLocaleString('en-IN')}`, 'success');
      return true;
    } catch (err) {
      console.warn('Payment saved locally due to Firebase error:', err);
      const newPaid = currentPaid + numPayment;
      const newRemaining = calculateRemaining(total, newPaid);
      const newStatus = getPaymentStatus(total, newPaid);

      const localCustomer = {
        ...customer,
        partialAmount: newPaid,
        paidAmount: newPaid,
        remainingAmount: newRemaining,
        paymentStatus: newStatus,
        lastPaymentDate: new Date().toISOString()
      };

      const updated = customers.map((c) => (c.id === id ? localCustomer : c));
      persistCustomers(updated);
      addToast(`Payment recorded locally: Paid ₹${newPaid.toLocaleString('en-IN')}, Remaining ₹${newRemaining.toLocaleString('en-IN')}`, 'info');
      return true;
    }
  }, [customers, persistCustomers, addToast]);

  // Delete customer
  const deleteCustomer = useCallback(async (id) => {
    const customer = customers.find((c) => c.id === id);
    const name = customer ? customer.name : 'Customer';

    try {
      await deleteCustomerFromFirebase(id, customer);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      addToast(`"${name}" deleted from Firebase`, 'info');
    } catch (err) {
      console.warn('Deleting locally due to Firebase error:', err);
      const updated = customers.filter((c) => c.id !== id);
      persistCustomers(updated);
      addToast(`"${name}" removed locally (${err?.code || 'offline'})`, 'info');
    }
  }, [customers, persistCustomers, addToast]);

  // Reset / Clear all data
  const resetDemo = useCallback(async () => {
    setLoading(true);
    try {
      await clearAllCustomersFromFirebase(customers);
      await clearAllAppData();
      setCustomers([]);
      addToast('All customer records cleared.', 'info');
    } catch (e) {
      console.error(e);
      addToast('Failed to clear records', 'error');
    } finally {
      setLoading(false);
    }
  }, [customers, addToast]);

  const clearAll = useCallback(async () => {
    setLoading(true);
    try {
      await clearAllCustomersFromFirebase(customers);
      await clearAllAppData();
      setCustomers([]);
      addToast('All customer records and documents cleared.', 'info');
    } catch (e) {
      console.error(e);
      addToast('Failed to clear data', 'error');
    } finally {
      setLoading(false);
    }
  }, [customers, addToast]);

  // Get customer by ID
  const getCustomerById = useCallback((id) => {
    return customers.find((c) => c.id === id) || null;
  }, [customers]);

  // Add custom company
  const addCompany = useCallback((companyName) => {
    const updated = saveStoredCompany(companyName);
    setCompanies(updated);
    return updated;
  }, []);

  // Record renewal reminder sent
  const recordRenewalReminder = useCallback(async (id, reminderData) => {
    const customer = customers.find((c) => c.id === id);
    if (!customer) return false;

    try {
      await recordReminderInFirebase(id, customer, reminderData);
      addToast(`"${reminderData.title || 'Reminder'}" recorded in Firebase!`, 'success');
      return true;
    } catch (err) {
      console.warn('Reminder saved locally due to Firebase error:', err);
      const reminderEntry = {
        id: 'rem-' + Date.now(),
        sentAt: new Date().toISOString(),
        channel: reminderData.channel || 'whatsapp',
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
        expiryReminderSent: reminderData.type === 'renewal' || reminderData.type === 'expiry' ? true : customer.expiryReminderSent,
        paymentReminderSent: reminderData.type === 'payment' ? true : customer.paymentReminderSent,
        renewalReminders: [reminderEntry, ...existingReminders]
      };

      const updated = customers.map((c) => (c.id === id ? updatedCustomer : c));
      persistCustomers(updated);
      addToast(`"${reminderData.title || 'Reminder'}" saved locally`, 'success');
      return true;
    }
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

  // Dispatch FCM App Pop-up Notification
  const dispatchCustomerReminder = useCallback((customer, type = 'payment', customTitle = '') => {
    if (!customer) return;

    const remaining = Number(customer.remainingAmount) || 0;
    const total = Number(customer.totalAmount) || 0;
    const paid = Number(customer.partialAmount) || 0;
    const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}` : customer.phone;
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

    let fcmBody = '';
    if (type === 'payment') {
      fcmBody = `Dear ${customer.name}, please pay the pending amount of ₹${remaining.toLocaleString('en-IN')} for your ${policyType} (${company}). Total: ₹${total.toLocaleString('en-IN')}, Paid: ₹${paid.toLocaleString('en-IN')}.`;
    } else {
      fcmBody = `Dear ${customer.name}, your ${policyType} policy with ${company} ${timePhrase}. Please renew quick to ensure continuous protection.`;
    }

    const fcmDeviceToken = `fcm_${customer.id}_tok_${Math.random().toString(36).substring(2, 9)}`;

    recordRenewalReminder(customer.id, {
      channel: 'fcm_push',
      type: type,
      timingDays: 30,
      title: finalTitle,
      message: fcmBody,
      fcmToken: fcmDeviceToken,
      note: `${finalTitle} sent via FCM App Notification`
    });
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
        firebaseConnected,
        firebaseError,
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
