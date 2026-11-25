/**
 * IndexedDB storage for PDF Policy Documents
 * Allows reliable, large-file local storage beyond LocalStorage 5MB limits.
 */

const DB_NAME = 'InsureTrackPDFStore';
const DB_VERSION = 1;
const STORE_NAME = 'policy_documents';

let dbInstance = null;

function openDB() {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB not supported in this environment'));
  }
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Saves a PDF file (Blob or File) linked to customerId
 */
export async function savePdfDocument(customerId, fileOrBlob, fileName, fileSize) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record = {
      id: customerId,
      blob: fileOrBlob,
      fileName: fileName || 'policy_document.pdf',
      fileSize: fileSize || fileOrBlob.size || 0,
      uploadedAt: new Date().toISOString()
    };

    const request = store.put(record);
    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves a PDF document record by customerId
 */
export async function getPdfDocument(customerId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(customerId);

    request.onsuccess = () => {
      const result = request.result;
      if (!result) {
        resolve(null);
        return;
      }
      // Create blob URL for viewing/downloading
      let url = null;
      if (result.blob) {
        url = URL.createObjectURL(result.blob);
      }
      resolve({
        ...result,
        url
      });
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Deletes a PDF document by customerId
 */
export async function deletePdfDocument(customerId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(customerId);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clears all PDF documents from IndexedDB
 */
export async function clearAllPdfDocuments() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get count and total bytes of stored PDFs
 */
export async function getPdfStorageStats() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result || [];
        const totalBytes = items.reduce((sum, item) => sum + (item.fileSize || 0), 0);
        resolve({
          count: items.length,
          totalBytes
        });
      };
      request.onerror = () => resolve({ count: 0, totalBytes: 0 });
    });
  } catch {
    return { count: 0, totalBytes: 0 };
  }
}

