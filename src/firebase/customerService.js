import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  onSnapshot
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from './config.js';
import { savePdfDocument, deletePdfDocument } from '../utils/indexedDb.js';
import { calculateRemaining, getPaymentStatus } from '../utils/calculations.js';

const COLLECTION_NAME = 'customers';
export const MAX_PDF_SIZE_BYTES = 2 * 1024 * 1024; // 2MB strict limit

/**
 * Converts a File or Blob into a Base64 data URI string
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

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
        const total = Number(data.totalAmount) || 0;
        const paid = Number(data.partialAmount ?? data.paidAmount) || 0;
        const remaining = data.remainingAmount !== undefined ? Number(data.remainingAmount) : calculateRemaining(total, paid);
        const status = data.paymentStatus || getPaymentStatus(total, paid);

        customers.push({
          id: d.id,
          ...data,
          totalAmount: total,
          partialAmount: paid,
          paidAmount: paid,
          remainingAmount: remaining,
          paymentStatus: status
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
 * Policy PDFs are stored strictly in Firebase Cloud Storage (NEVER in Firestore)
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
    // 1. Strict validation: only allow upload of PDF files less than 2MB
    if (pdfFile.size >= MAX_PDF_SIZE_BYTES) {
      throw new Error(
        `PDF file size (${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB) exceeds 2MB limit. Only PDF files less than 2MB are allowed.`
      );
    }

    pdfFileName = pdfFile.name;
    pdfFileSize = pdfFile.size;
    hasPdf = true;

    // 2. Upload to Firebase Cloud Storage (NEVER store binary/base64 in Firestore)
    try {
      const sanitizedFileName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `policies/${newId}/${sanitizedFileName}`);
      await uploadBytes(storageRef, pdfFile, {
        contentType: 'application/pdf',
        customMetadata: {
          customerId: newId,
          fileName: pdfFile.name,
          fileSize: String(pdfFile.size),
          uploadedAt: new Date().toISOString()
        }
      });
      pdfUrl = await getDownloadURL(storageRef);
      console.log(`PDF uploaded to Firebase Storage successfully for ${newId}:`, pdfUrl);
    } catch (storageErr) {
      console.error('Firebase Cloud Storage upload error:', storageErr);
      throw new Error(`Failed to upload PDF to Firebase Cloud Storage: ${storageErr.message || 'Storage error'}`);
    }

    // 3. Local client cache in IndexedDB for instant preview & offline retrieval
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
    paidAmount: partial,
    remainingAmount: remaining,
    paymentStatus,
    policyStartDate: formData.policyStartDate,
    policyEndDate: formData.policyEndDate,
    paymentHistory: partial > 0 ? [
      {
        id: 'pay-init-' + newId,
        amount: partial,
        date: new Date().toISOString(),
        type: 'Initial Down Payment',
        remainingAfter: remaining,
        status: paymentStatus
      }
    ] : [],
    pdfFileName,
    pdfFileSize,
    hasPdf,
    pdfUrl,
    // NOTE: pdfDataUri is deliberately excluded. Firestore only stores metadata & Cloud Storage URL.
    createdAt: new Date().toISOString()
  };

  const docRef = doc(db, COLLECTION_NAME, newId);
  await setDoc(docRef, newCustomer);
  return newCustomer;
}

/**
 * Update existing customer in Firebase Firestore
 * Policy PDFs are stored strictly in Firebase Cloud Storage (NEVER in Firestore)
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

    // Delete from Firebase Storage if existed
    if (existing.pdfFileName) {
      try {
        const storageRef = ref(storage, `policies/${id}/${existing.pdfFileName}`);
        await deleteObject(storageRef);
      } catch (e) {
        console.warn('Firebase Storage PDF delete error:', e);
      }
    }
  } else if (newPdfFile) {
    // 1. Strict validation: only allow upload of PDF files less than 2MB
    if (newPdfFile.size >= MAX_PDF_SIZE_BYTES) {
      throw new Error(
        `PDF file size (${(newPdfFile.size / (1024 * 1024)).toFixed(2)} MB) exceeds 2MB limit. Only PDF files less than 2MB are allowed.`
      );
    }

    // Cleanly delete previous PDF from Firebase Storage when replacing
    const sanitizedNewName = newPdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const newStoragePath = `policies/${id}/${sanitizedNewName}`;

    if (existing.pdfUrl) {
      try {
        const oldRef = ref(storage, existing.pdfUrl);
        if (oldRef.fullPath !== newStoragePath) {
          await deleteObject(oldRef);
          console.log(`Deleted replaced PDF from Firebase Storage: ${oldRef.fullPath}`);
        }
      } catch (delErr) {
        console.warn('Could not delete old PDF by URL from Storage:', delErr);
        if (existing.pdfFileName) {
          try {
            const sanitizedOldName = existing.pdfFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
            if (sanitizedOldName !== sanitizedNewName) {
              const fallbackRef = ref(storage, `policies/${id}/${sanitizedOldName}`);
              await deleteObject(fallbackRef);
              console.log(`Deleted replaced PDF from Firebase Storage via fallback: ${fallbackRef.fullPath}`);
            }
          } catch (e2) {
            console.warn('Fallback delete old PDF error:', e2);
          }
        }
      }
    } else if (existing.pdfFileName) {
      try {
        const sanitizedOldName = existing.pdfFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        if (sanitizedOldName !== sanitizedNewName) {
          const oldStorageRef = ref(storage, `policies/${id}/${sanitizedOldName}`);
          await deleteObject(oldStorageRef);
          console.log(`Deleted replaced PDF from Firebase Storage: ${oldStorageRef.fullPath}`);
        }
      } catch (e) {
        console.warn('Failed to delete old PDF from Storage:', e);
      }
    }

    pdfFileName = newPdfFile.name;
    pdfFileSize = newPdfFile.size;
    hasPdf = true;

    // 2. Upload to Firebase Cloud Storage (NEVER in Firestore!)
    try {
      const sanitizedFileName = newPdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `policies/${id}/${sanitizedFileName}`);
      await uploadBytes(storageRef, newPdfFile, {
        contentType: 'application/pdf',
        customMetadata: {
          customerId: id,
          fileName: newPdfFile.name,
          fileSize: String(newPdfFile.size),
          uploadedAt: new Date().toISOString()
        }
      });
      pdfUrl = await getDownloadURL(storageRef);
      console.log(`PDF updated in Firebase Storage successfully for ${id}:`, pdfUrl);
    } catch (storageErr) {
      console.error('Firebase Storage upload error:', storageErr);
      throw new Error(`Failed to upload PDF to Firebase Cloud Storage: ${storageErr.message || 'Storage error'}`);
    }

    // 3. Cache in IndexedDB
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
    paidAmount: partial,
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

  // Delete any legacy pdfDataUri field from Firestore if present
  if ('pdfDataUri' in updatedCustomer || 'pdfDataUri' in existing) {
    updatedCustomer.pdfDataUri = deleteField();
  }

  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, updatedCustomer);
  return updatedCustomer;
}

/**
 * Record a payment for customer in Firebase Firestore
 */
export async function addPaymentToFirebase(id, customer, numPayment) {
  const currentPaid = Number(customer.partialAmount ?? customer.paidAmount) || 0;
  const total = Number(customer.totalAmount) || 0;
  const newPaid = currentPaid + numPayment;
  const newRemaining = calculateRemaining(total, newPaid);
  const newStatus = getPaymentStatus(total, newPaid);

  const existingHistory = Array.isArray(customer.paymentHistory) ? customer.paymentHistory : (
    currentPaid > 0 ? [
      {
        id: 'pay-init-' + (customer.id || '0'),
        amount: currentPaid,
        date: customer.createdAt || new Date().toISOString(),
        type: 'Initial Down Payment',
        remainingAfter: calculateRemaining(total, currentPaid),
        status: getPaymentStatus(total, currentPaid)
      }
    ] : []
  );

  const newPaymentEntry = {
    id: 'pay-' + Date.now(),
    amount: numPayment,
    date: new Date().toISOString(),
    type: newRemaining === 0 ? 'Final Settlement' : 'Installment Payment',
    remainingAfter: newRemaining,
    status: newStatus
  };

  const updates = {
    partialAmount: newPaid,
    paidAmount: newPaid,
    remainingAmount: newRemaining,
    paymentStatus: newStatus,
    lastPaymentDate: new Date().toISOString(),
    paymentHistory: [...existingHistory, newPaymentEntry]
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

  // 2. Delete from Firebase Storage if had file URL
  if (customer?.pdfFileName) {
    try {
      const sanitizedFileName = customer.pdfFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `policies/${id}/${sanitizedFileName}`);
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
