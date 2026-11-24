import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from './config';
import { savePdfDocument, deletePdfDocument } from '../utils/indexedDb';
import { calculateRemaining, getPaymentStatus } from '../utils/calculations';

const COLLECTION_NAME = 'customers';

/**
 * Real-time subscription to Firebase Firestore customers collection
 * @param {Function} onData Callback receiving array of customer objects
 * @param {Function} onError Callback for error handling
 * @returns {Function} Unsubscribe function
 */
export function subscribeToCustomers(onData, onError) {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const customers = [];
      snapshot.forEach((d) => {
        const data = d.data();
        customers.push({
          id: d.id,
          ...data
        });
      });

      // Sort by creation date descending
      customers.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      onData(customers);
    },
    (err) => {
      console.error('Firebase Firestore onSnapshot error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Add a new customer to Firebase Firestore
 */
export async function addCustomerToFirebase(formData, pdfFile) {
  const total = Math.max(0, Number(formData.totalAmount) || 0);
  const partial = Math.max(0, Number(formData.partialAmount) || 0);
  const remaining = calculateRemaining(total, partial);
  const paymentStatus = getPaymentStatus(total, partial);

  const newId = 'cust-' + Date.now();
  let pdfFileName = '';
  let pdfFileSize = 0;
  let hasPdf = false;
  let pdfUrl = '';

  if (pdfFile) {
    pdfFileName = pdfFile.name;
    pdfFileSize = pdfFile.size;
    hasPdf = true;

    // 1. Try uploading to Firebase Storage
    try {
      const storageRef = ref(storage, `policies/${newId}/${pdfFile.name}`);
      await uploadBytes(storageRef, pdfFile);
      pdfUrl = await getDownloadURL(storageRef);
    } catch (storageErr) {
      console.warn('Firebase Storage upload failed (rules or config), falling back to local IndexedDB cache:', storageErr);
    }

    // 2. Also cache in IndexedDB for instant preview & offline access
    try {
      await savePdfDocument(newId, pdfFile, pdfFile.name, pdfFile.size);
    } catch (idbErr) {
      console.warn('IndexedDB caching error:', idbErr);
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
    pdfUrl,
    createdAt: new Date().toISOString()
  };

  const docRef = doc(db, COLLECTION_NAME, newId);
  await setDoc(docRef, newCustomer);
  return newCustomer;
}

/**
 * Update existing customer in Firebase Firestore
 */
export async function updateCustomerInFirebase(id, existing, formData, newPdfFile, removePdf = false) {
  const total = Math.max(0, Number(formData.totalAmount) || 0);
  const partial = Math.max(0, Number(formData.partialAmount) || 0);
  const remaining = calculateRemaining(total, partial);
  const paymentStatus = getPaymentStatus(total, partial);

  let pdfFileName = existing.pdfFileName || '';
  let pdfFileSize = existing.pdfFileSize || 0;
  let hasPdf = existing.hasPdf || false;
  let pdfUrl = existing.pdfUrl || '';

  if (removePdf) {
    pdfFileName = '';
    pdfFileSize = 0;
    hasPdf = false;
    pdfUrl = '';

    // Delete from IndexedDB
    try {
      await deletePdfDocument(id);
    } catch (e) {
      console.warn('IndexedDB PDF delete error:', e);
    }

    // Try deleting from Firebase Storage if URL existed
    if (existing.pdfFileName) {
      try {
        const storageRef = ref(storage, `policies/${id}/${existing.pdfFileName}`);
        await deleteObject(storageRef);
      } catch (e) {
        console.warn('Firebase Storage PDF delete error:', e);
      }
    }
  } else if (newPdfFile) {
    pdfFileName = newPdfFile.name;
    pdfFileSize = newPdfFile.size;
    hasPdf = true;

    // Upload to Firebase Storage
    try {
      const storageRef = ref(storage, `policies/${id}/${newPdfFile.name}`);
      await uploadBytes(storageRef, newPdfFile);
      pdfUrl = await getDownloadURL(storageRef);
    } catch (storageErr) {
      console.warn('Firebase Storage upload error:', storageErr);
    }

    // Cache in IndexedDB
    try {
      await savePdfDocument(id, newPdfFile, newPdfFile.name, newPdfFile.size);
    } catch (idbErr) {
      console.warn('IndexedDB cache error:', idbErr);
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
    pdfUrl,
    updatedAt: new Date().toISOString()
  };

  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, updatedCustomer);
  return updatedCustomer;
}

/**
 * Record a payment for customer in Firebase Firestore
 */
export async function addPaymentToFirebase(id, customer, numPayment) {
  const currentPaid = Number(customer.partialAmount) || 0;
  const total = Number(customer.totalAmount) || 0;
  const newPaid = currentPaid + numPayment;
  const newRemaining = calculateRemaining(total, newPaid);
  const newStatus = getPaymentStatus(total, newPaid);

  const updates = {
    partialAmount: newPaid,
    remainingAmount: newRemaining,
    paymentStatus: newStatus,
    lastPaymentDate: new Date().toISOString()
  };

  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, updates);
  return { ...customer, ...updates };
}

/**
 * Delete customer from Firebase Firestore & Storage
 */
export async function deleteCustomerFromFirebase(id, customer) {
  // 1. Delete from Firestore
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);

  // 2. Delete from Firebase Storage if had file
  if (customer?.pdfFileName) {
    try {
      const storageRef = ref(storage, `policies/${id}/${customer.pdfFileName}`);
      await deleteObject(storageRef);
    } catch (e) {
      console.warn('Firebase Storage file delete error:', e);
    }
  }

  // 3. Delete from IndexedDB cache
  try {
    await deletePdfDocument(id);
  } catch (e) {
    console.warn('IndexedDB delete error:', e);
  }
}

/**
 * Record renewal reminder in Firebase Firestore
 */
export async function recordReminderInFirebase(id, customer, reminderData) {
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

  const updates = {
    reminderSent: true,
    lastReminderDate: reminderEntry.sentAt,
    lastReminderChannel: reminderEntry.channel,
    expiryReminderSent: reminderData.type === 'renewal' || reminderData.type === 'expiry' ? true : customer.expiryReminderSent,
    paymentReminderSent: reminderData.type === 'payment' ? true : customer.paymentReminderSent,
    renewalReminders: [reminderEntry, ...existingReminders]
  };

  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, updates);
  return reminderEntry;
}

/**
 * Clear all customers from Firebase Firestore
 */
export async function clearAllCustomersFromFirebase(customers) {
  for (const customer of customers) {
    try {
      await deleteCustomerFromFirebase(customer.id, customer);
    } catch (e) {
      console.warn(`Error deleting customer ${customer.id}:`, e);
    }
  }
}
