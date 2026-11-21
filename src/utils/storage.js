import { createInitialSampleCustomers } from './sampleData';
import { savePdfDocument, clearAllPdfDocuments } from './indexedDb';
import { generateSamplePolicyPdf } from './samplePdfs';

const STORAGE_KEY = 'INSURETRACK_CUSTOMERS_V2';
const SETTINGS_KEY = 'INSURETRACK_SETTINGS_V2';

/**
 * Initializes and populates default demo data and demo PDFs if first launch
 */
export async function initializeDataIfEmpty() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const demoCustomers = createInitialSampleCustomers();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoCustomers));
    
    // Asynchronously seed demo PDFs into IndexedDB
    try {
      for (const customer of demoCustomers) {
        const pdfBlob = generateSamplePolicyPdf(customer);
        await savePdfDocument(customer.id, pdfBlob, customer.pdfFileName, pdfBlob.size);
      }
    } catch (e) {
      console.warn('Could not pre-seed IndexedDB PDFs:', e);
    }
    return demoCustomers;
  }

  try {
    return JSON.parse(existing);
  } catch (err) {
    console.error('Error parsing stored customers:', err);
    return [];
  }
}

/**
 * Load customers from localStorage
 */
export function getStoredCustomers() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse customers from storage', e);
    return [];
  }
}

/**
 * Save customers to localStorage
 */
export function setStoredCustomers(customers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch (e) {
    console.error('Failed to save customers to storage', e);
    throw e;
  }
}

/**
 * Resets storage back to initial demo data
 */
export async function resetToDemoData() {
  await clearAllPdfDocuments();
  const demoCustomers = createInitialSampleCustomers();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoCustomers));

  // Seed sample PDFs
  for (const customer of demoCustomers) {
    const pdfBlob = generateSamplePolicyPdf(customer);
    await savePdfDocument(customer.id, pdfBlob, customer.pdfFileName, pdfBlob.size);
  }
  return demoCustomers;
}

/**
 * Clears all customer records and indexedDB PDFs
 */
export async function clearAllAppData() {
  localStorage.removeItem(STORAGE_KEY);
  await clearAllPdfDocuments();
}

/**
 * Export data as JSON string for backup
 */
export function exportDataAsJson() {
  const customers = getStoredCustomers();
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    customerCount: customers.length,
    customers
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Import customer data from JSON string
 */
export function importDataFromJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.customers)) {
      throw new Error('Invalid file format. "customers" array is required.');
    }
    setStoredCustomers(parsed.customers);
    return parsed.customers;
  } catch (err) {
    throw new Error('Import failed: ' + err.message);
  }
}

/**
 * Default insurance companies list
 */
export const DEFAULT_COMPANIES = [
  'Acko General Insurance',
  'Bajaj Allianz General Insurance',
  'Care Health Insurance',
  'Cholamandalam MS General Insurance',
  'Digit General Insurance',
  'Future Generali India Insurance',
  'HDFC ERGO General Insurance',
  'ICICI Lombard General Insurance',
  'IFFCO Tokio General Insurance',
  'Kotak Mahindra General Insurance',
  'Liberty General Insurance',
  'Magma HDI General Insurance',
  'ManipalCigna Health Insurance',
  'National Insurance Company',
  'New India Assurance',
  'Niva Bupa Health Insurance',
  'Oriental Insurance Company',
  'Raheja QBE General Insurance',
  'Reliance General Insurance',
  'Royal Sundaram General Insurance',
  'SBI General Insurance',
  'Star Health & Allied Insurance',
  'Tata AIG General Insurance',
  'United India Insurance',
  'Universal Sompo General Insurance'
];

const COMPANIES_STORAGE_KEY = 'INSURETRACK_COMPANIES_V2';

/**
 * Get all stored companies (or defaults)
 */
export function getStoredCompanies() {
  const raw = localStorage.getItem(COMPANIES_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(DEFAULT_COMPANIES));
    return DEFAULT_COMPANIES;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_COMPANIES;
  } catch (e) {
    return DEFAULT_COMPANIES;
  }
}

/**
 * Save new company to stored list
 */
export function saveStoredCompany(newCompanyName) {
  const trimmed = newCompanyName.trim();
  if (!trimmed) return getStoredCompanies();
  const current = getStoredCompanies();
  if (!current.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
    const updated = [...current, trimmed].sort((a, b) => a.localeCompare(b));
    localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
  return current;
}

