/**
 * Generates a valid, beautifully formatted PDF Blob in plain JavaScript.
 * This ensures demo customers have real, viewable and downloadable PDF certificates.
 */

export function generateSamplePolicyPdf(customer) {
  const policyNo = customer.policyNumber || `POL-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const title = `CERTIFICATE OF INSURANCE - ${customer.insuranceType.toUpperCase()}`;
  const company = customer.insuranceCompany || 'HDFC ERGO General Insurance';
  const name = customer.name || 'Valued Customer';
  const phone = customer.phone || '+91 98765 43210';
  const total = `INR ${Number(customer.totalAmount || 0).toLocaleString('en-IN')}`;
  const paid = `INR ${Number(customer.partialAmount || 0).toLocaleString('en-IN')}`;
  const remaining = `INR ${Number(customer.remainingAmount || 0).toLocaleString('en-IN')}`;
  const period = `${customer.policyStartDate || '2026-01-01'} to ${customer.policyEndDate || '2027-01-01'}`;
  const dateIssued = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Stream text content in PDF syntax
  const textCommands = [
    'BT',
    '/F1 20 Tf',
    '50 780 Td',
    '(INSURETRACK INSURANCE MANAGEMENT) Tj',
    '/F1 12 Tf',
    '0 -24 Td',
    `(${title}) Tj`,
    '/F1 10 Tf',
    '0 -16 Td',
    `(Policy Number: ${policyNo}   |   Date Issued: ${dateIssued}) Tj`,
    '0 -30 Td',
    '/F1 14 Tf',
    '(1. POLICYHOLDER DETAILS) Tj',
    '/F1 10 Tf',
    '0 -18 Td',
    `(Full Name:             ${name}) Tj`,
    '0 -16 Td',
    `(Contact Number:       ${phone}) Tj`,
    '0 -16 Td',
    '(Account Category:     Individual Premium Customer) Tj',
    '0 -30 Td',
    '/F1 14 Tf',
    '(2. UNDERWRITING & COVERAGE DETAILS) Tj',
    '/F1 10 Tf',
    '0 -18 Td',
    `(Underwriter / Carrier: ${company}) Tj`,
    '0 -16 Td',
    `(Coverage Classification: ${customer.insuranceType}) Tj`,
    '0 -16 Td',
    `(Effective Period:      ${period}) Tj`,
    '0 -16 Td',
    '(Status:                Active & Verified on InsureTrack Registry) Tj',
    '0 -30 Td',
    '/F1 14 Tf',
    '(3. FINANCIAL & PREMIUM STATEMENT) Tj',
    '/F1 10 Tf',
    '0 -18 Td',
    `(Gross Total Amount:    ${total}) Tj`,
    '0 -16 Td',
    `(Amount Collected:      ${paid}) Tj`,
    '0 -16 Td',
    `(Balance Remaining:     ${remaining}) Tj`,
    '0 -16 Td',
    `(Payment Standing:      ${customer.paymentStatus || 'Verified'}) Tj`,
    '0 -40 Td',
    '/F1 9 Tf',
    '(This document serves as an official electronic certificate of insurance coverage.) Tj',
    '0 -14 Td',
    '(For claims, verification, or renewals, contact your designated insurance administrator.) Tj',
    '0 -40 Td',
    '/F1 10 Tf',
    '(Authorized Administrator Signature:  [ DIGITALLY ATTESTED - INSURETRACK ADMIN ] ) Tj',
    'ET'
  ].join('\n');

  const streamContent = textCommands;
  const streamLength = streamContent.length;

  const pdfBody = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 595 842]
  /Contents 5 0 R
  /Resources <<
    /Font <<
      /F1 4 0 R
    >>
  >>
>>
endobj
4 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica
>>
endobj
5 0 obj
<<
  /Length ${streamLength}
>>
stream
${streamContent}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000261 00000 n 
0000000336 00000 n 
trailer
<<
  /Size 6
  /Root 1 0 R
>>
startxref
${430 + streamLength}
%%EOF`;

  return new Blob([pdfBody], { type: 'application/pdf' });
}

