/**
 * Utility for insurance company carrier badges and brand colors
 */
export const CARRIER_BADGES = {
  HDFC: { bg: '#C8102E', label: 'HDFC' },
  ICICI: { bg: '#A61D24', label: 'ICICI' },
  TATA: { bg: '#004B87', label: 'TATA' },
  BAJAJ: { bg: '#0066B2', label: 'BAJAJ' },
  STAR: { bg: '#00843D', label: 'STAR' },
  NIA: { bg: '#D9531E', label: 'NIA' },
  SBI: { bg: '#004890', label: 'SBI' },
  REL: { bg: '#4338CA', label: 'REL' },
  ACKO: { bg: '#7C3AED', label: 'ACKO' },
  DIGIT: { bg: '#D97706', label: 'DIGIT' },
  CARE: { bg: '#0D9488', label: 'CARE' },
  CHOLA: { bg: '#2563EB', label: 'CHOLA' },
  KOTAK: { bg: '#DC2626', label: 'KOTAK' },
  ROYAL: { bg: '#475569', label: 'ROYAL' }
};

export function getCarrierBadge(companyName = '', carrierCode = '') {
  if (carrierCode && CARRIER_BADGES[carrierCode]) {
    return CARRIER_BADGES[carrierCode];
  }

  const upper = (companyName || '').toUpperCase();
  for (const [code, info] of Object.entries(CARRIER_BADGES)) {
    if (upper.includes(code)) return info;
  }

  // Fallback: extract first word abbreviation
  const firstWord = (companyName || 'INS').trim().split(/\s+/)[0].slice(0, 5).toUpperCase();
  return { bg: '#EA580C', label: firstWord || 'INS' };
}

