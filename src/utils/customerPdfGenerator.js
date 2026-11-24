import { jsPDF } from 'jspdf';
import { formatIndianDate, calculateDaysRemaining } from './dateUtils.js';
import { calculateRemaining } from './calculations.js';

/**
 * Formats a number into clean Indian-style comma separated currency string without raw Unicode symbols
 * @param {number|string} amount
 * @returns {string} e.g. "Rs. 60,000"
 */
function formatPdfCurrency(amount) {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString('en-IN');
  return `Rs. ${formatted}`;
}

/**
 * Generates an official, beautifully formatted and aligned A4 PDF summary of a customer
 * @param {object} customer
 */
export function generateCustomerPdf(customer) {
  if (!customer) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  const total = Number(customer.totalAmount) || 0;
  const paid = Number(customer.partialAmount ?? customer.paidAmount) || 0;
  const remaining =
    customer.remainingAmount !== undefined
      ? Number(customer.remainingAmount)
      : calculateRemaining(total, paid);
  const paidPercent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const daysLeft = calculateDaysRemaining(customer.policyEndDate);
  const isExpired = daysLeft < 0;

  let currentY = margin;

  // =========================================================================
  // 1. TOP HEADER ACCENT BAR & BRANDING
  // =========================================================================
  // Vibrant Orange Top Accent Strip
  doc.setFillColor(255, 107, 0); // #FF6B00
  doc.rect(0, 0, pageWidth, 4, 'F');

  currentY = 12;

  // Left Brand Name & Shield Badge
  doc.setFillColor(255, 107, 0);
  doc.roundedRect(margin, currentY, 9, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('A', margin + 3.2, currentY + 6.5);

  doc.setTextColor(15, 23, 42); // #0F172A
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Ashok Auto', margin + 12, currentY + 7);

  doc.setTextColor(255, 107, 0);
  doc.text('Insurance', margin + 45, currentY + 7);

  doc.setTextColor(100, 116, 139); // #64748B
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('INSURANCE MANAGEMENT & POLICY REPORT', margin + 12, currentY + 11.5);

  // Right Document Title & Timestamp
  doc.setTextColor(255, 107, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('CUSTOMER DETAILS STATEMENT', pageWidth - margin, currentY + 5, { align: 'right' });

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const todayStr = formatIndianDate(new Date().toISOString());
  doc.text(`Generated: ${todayStr}`, pageWidth - margin, currentY + 9.5, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Doc Ref: #${customer.id || 'CUST-RECORD'}`, pageWidth - margin, currentY + 13.5, {
    align: 'right'
  });

  // Header Divider Rule
  currentY = 28;
  doc.setDrawColor(254, 215, 170); // #FED7AA
  doc.setLineWidth(0.6);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  // =========================================================================
  // 2. CUSTOMER IDENTITY CARD
  // =========================================================================
  currentY += 4;
  const cardHeight = 24;

  // Soft Background Box
  doc.setFillColor(255, 251, 248); // #FFFBF8
  doc.setDrawColor(246, 237, 229); // #F6EDE5
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, cardHeight, 3, 3, 'FD');

  // Customer Avatar Box
  const avatarSize = 15;
  const avatarX = margin + 4;
  const avatarY = currentY + (cardHeight - avatarSize) / 2;
  doc.setFillColor(255, 234, 219); // #FFEADB
  doc.setDrawColor(255, 216, 191);
  doc.roundedRect(avatarX, avatarY, avatarSize, avatarSize, 3, 3, 'FD');

  doc.setTextColor(255, 107, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const initial = (customer.name || 'C').charAt(0).toUpperCase();
  doc.text(initial, avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 4.5, { align: 'center' });

  // Customer Name & Contact Info
  const textLeft = avatarX + avatarSize + 5;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(customer.name || 'Customer Name', textLeft, currentY + 8);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Mobile: ${customer.phone || 'N/A'}`, textLeft, currentY + 13);
  doc.text(
    `Insurance Carrier: ${customer.insuranceCompany || 'General Insurance'}`,
    textLeft,
    currentY + 18
  );

  // Status Badges on the right of Customer Identity Card
  const badgeRightX = pageWidth - margin - 4;
  const statusLabel =
    remaining === 0
      ? 'FULLY PAID'
      : paid > 0
      ? 'PARTIAL PAYMENT'
      : 'PENDING';

  // Payment Status Pill
  if (remaining === 0) {
    doc.setFillColor(220, 252, 231); // #DCFCE7
    doc.setDrawColor(187, 247, 208);
    doc.setTextColor(21, 128, 61); // #15803D
  } else if (paid > 0) {
    doc.setFillColor(255, 239, 229); // #FFEFE5
    doc.setDrawColor(254, 215, 170);
    doc.setTextColor(194, 65, 12); // #C2410C
  } else {
    doc.setFillColor(254, 243, 199); // #FEF3C7
    doc.setDrawColor(254, 240, 138);
    doc.setTextColor(180, 83, 9); // #B45309
  }

  const badgeW = 34;
  const badgeH = 6.5;
  doc.roundedRect(badgeRightX - badgeW, currentY + 5, badgeW, badgeH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(statusLabel, badgeRightX - badgeW / 2, currentY + 9.5, { align: 'center' });

  // Expiry Indicator Pill
  const expiryLabel = isExpired ? `Expired (${Math.abs(daysLeft)}d ago)` : `${daysLeft} Days Remaining`;
  if (isExpired || daysLeft <= 15) {
    doc.setFillColor(254, 226, 226);
    doc.setDrawColor(254, 202, 202);
    doc.setTextColor(185, 28, 28);
  } else {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.setTextColor(71, 85, 105);
  }
  doc.roundedRect(badgeRightX - badgeW, currentY + 13, badgeW, badgeH, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.text(expiryLabel, badgeRightX - badgeW / 2, currentY + 17.5, { align: 'center' });

  currentY += cardHeight + 7;

  // =========================================================================
  // 3. SECTION 1: POLICY & COVERAGE SPECIFICATIONS
  // =========================================================================
  // Section Header Bar
  doc.setFillColor(255, 107, 0);
  doc.rect(margin, currentY, 2.5, 5, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('1. Policy & Coverage Specifications', margin + 5, currentY + 4);

  currentY += 7;

  // 2-Column Structured Table
  const tableHeight = 32;
  const colHalfWidth = contentWidth / 2;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, tableHeight, 2, 2, 'FD');

  const rowHeight = 8;
  const policyFields = [
    [
      { label: 'Insurance Company:', val: customer.insuranceCompany || 'N/A' },
      { label: 'Policy Classification:', val: customer.insuranceType || 'Motor Insurance' }
    ],
    [
      { label: 'Effective Start Date:', val: formatIndianDate(customer.policyStartDate) },
      { label: 'Policy Expiry Date:', val: formatIndianDate(customer.policyEndDate) }
    ],
    [
      { label: 'Policy Validity Term:', val: '365 Days (1 Year Annual)' },
      { label: 'Remaining Duration:', val: isExpired ? 'Expired' : `${daysLeft} Days Active` }
    ],
    [
      { label: 'Policy Document:', val: customer.pdfFileName || 'Certificate Attached' },
      { label: 'Registered Contact:', val: customer.phone || 'N/A' }
    ]
  ];

  policyFields.forEach((row, i) => {
    const rowY = currentY + i * rowHeight;

    // Zebra striping
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin + 0.3, rowY, contentWidth - 0.6, rowHeight, 'F');
    }

    // Border bottom
    if (i < policyFields.length - 1) {
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, rowY + rowHeight, margin + contentWidth, rowY + rowHeight);
    }

    // Column 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(row[0].label, margin + 4, rowY + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(row[0].val, margin + 42, rowY + 5.2);

    // Column 2
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(row[1].label, margin + colHalfWidth + 4, rowY + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(row[1].val, margin + colHalfWidth + 44, rowY + 5.2);
  });

  // Vertical Center Grid Line
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + colHalfWidth, currentY, margin + colHalfWidth, currentY + tableHeight);

  currentY += tableHeight + 8;

  // =========================================================================
  // 4. SECTION 2: FINANCIAL SUMMARY & PREMIUM SETTLEMENT
  // =========================================================================
  doc.setFillColor(255, 107, 0);
  doc.rect(margin, currentY, 2.5, 5, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('2. Financial Summary & Premium Settlement', margin + 5, currentY + 4);

  currentY += 7;

  // 3 Financial Metric Stat Boxes
  const statBoxWidth = (contentWidth - 8) / 3; // ~58mm each
  const statBoxHeight = 22;

  // Box 1: Total Premium
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, statBoxWidth, statBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL PREMIUM AMOUNT', margin + 5, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(formatPdfCurrency(total), margin + 5, currentY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Gross Policy Value', margin + 5, currentY + 18.5);

  // Box 2: Paid Amount
  const box2X = margin + statBoxWidth + 4;
  doc.setFillColor(240, 253, 244); // #F0FDF4
  doc.setDrawColor(187, 247, 208); // #BBF7D0
  doc.roundedRect(box2X, currentY, statBoxWidth, statBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 163, 74); // #16A34A
  doc.text('AMOUNT PAID (COLLECTED)', box2X + 5, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(22, 163, 74);
  doc.text(formatPdfCurrency(paid), box2X + 5, currentY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Settlement: ${paidPercent}% completed`, box2X + 5, currentY + 18.5);

  // Box 3: Remaining Due
  const box3X = box2X + statBoxWidth + 4;
  if (remaining > 0) {
    doc.setFillColor(255, 247, 237); // #FFF7ED
    doc.setDrawColor(254, 215, 170); // #FED7AA
    doc.roundedRect(box3X, currentY, statBoxWidth, statBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(234, 88, 12); // #EA580C
    doc.text('REMAINING BALANCE DUE', box3X + 5, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(220, 38, 38); // #DC2626
    doc.text(formatPdfCurrency(remaining), box3X + 5, currentY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(194, 65, 12);
    doc.text('Unpaid balance pending', box3X + 5, currentY + 18.5);
  } else {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(box3X, currentY, statBoxWidth, statBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('REMAINING BALANCE DUE', box3X + 5, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('Rs. 0', box3X + 5, currentY + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(22, 163, 74);
    doc.text('Account 100% Settled', box3X + 5, currentY + 18.5);
  }

  currentY += statBoxHeight + 5;

  // Progress Bar for Payment Settlement
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, currentY, contentWidth, 3.5, 1.5, 1.5, 'F');

  if (paidPercent > 0) {
    const fillWidth = (contentWidth * paidPercent) / 100;
    doc.setFillColor(remaining === 0 ? 34 : 255, remaining === 0 ? 197 : 107, remaining === 0 ? 94 : 0);
    doc.roundedRect(margin, currentY, fillWidth, 3.5, 1.5, 1.5, 'F');
  }

  currentY += 8;

  // =========================================================================
  // 5. SECTION 3: TRANSACTION & PAYMENT HISTORY LEDGER
  // =========================================================================
  doc.setFillColor(255, 107, 0);
  doc.rect(margin, currentY, 2.5, 5, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('3. Recorded Payment Ledger', margin + 5, currentY + 4);

  currentY += 7;

  // Table Columns (Total = 182mm)
  // Date: 42mm | Policy Classification: 60mm | Amount Paid: 40mm | Remaining Balance: 40mm
  const colDateW = 42;
  const colClassW = 60;
  const colPaidW = 40;
  const colRemW = 40;

  // Table Header Row
  doc.setFillColor(30, 35, 48); // #1E2330
  doc.rect(margin, currentY, contentWidth, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);

  let headerX = margin + 3;
  doc.text('DATE & TIME', headerX, currentY + 4.8);

  headerX += colDateW;
  doc.text('POLICY CLASSIFICATION', headerX, currentY + 4.8);

  headerX += colClassW;
  doc.text('PAID (INR)', headerX + colPaidW - 6, currentY + 4.8, { align: 'right' });

  headerX += colPaidW;
  doc.text('BALANCE (INR)', headerX + colRemW - 6, currentY + 4.8, { align: 'right' });

  currentY += 7;

  // Ledger Entries
  const history = customer.paymentHistory && customer.paymentHistory.length > 0
    ? customer.paymentHistory
    : [
        {
          id: 'initial',
          date: customer.createdAt || customer.policyStartDate || new Date().toISOString(),
          amount: paid,
          remainingAfter: remaining,
          notes: paid > 0 ? 'Initial Registration Payment' : 'Policy Account Created'
        }
      ];

  const ledgerRowHeight = 7.5;
  const maxRows = 6;
  const rowsToPrint = history.slice(0, maxRows);

  rowsToPrint.forEach((item, idx) => {
    const rowY = currentY + idx * ledgerRowHeight;

    // Zebra striping
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, rowY, contentWidth, ledgerRowHeight, 'F');
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, rowY + ledgerRowHeight, margin + contentWidth, rowY + ledgerRowHeight);

    // Text Values
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    let cellX = margin + 3;
    doc.text(formatIndianDate(item.date), cellX, rowY + 5);

    cellX += colDateW;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(customer.insuranceType || 'Motor Insurance', cellX, rowY + 5);

    cellX += colClassW;
    doc.setTextColor(22, 163, 74);
    doc.text(formatPdfCurrency(item.amount), cellX + colPaidW - 6, rowY + 5, { align: 'right' });

    cellX += colPaidW;
    doc.setTextColor(
      Number(item.remainingAfter) > 0 ? 220 : 71,
      Number(item.remainingAfter) > 0 ? 38 : 85,
      Number(item.remainingAfter) > 0 ? 38 : 105
    );
    doc.text(formatPdfCurrency(item.remainingAfter), cellX + colRemW - 6, rowY + 5, { align: 'right' });
  });

  // Table Outer Border
  const totalLedgerH = ledgerRowHeight * rowsToPrint.length;
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, currentY - 7, contentWidth, totalLedgerH + 7, 'D');

  currentY += totalLedgerH + 10;

  // =========================================================================
  // 6. OFFICIAL AGENCY STAMP & FOOTER
  // =========================================================================
  const footerY = 262;

  // Horizontal dividing line
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  // Left Disclaimer & Agency Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Ashok Auto Insurance & Management Services', margin, footerY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Support Email: ashokinsurance@gmail.com  |  Portal: Ashok Auto Insurance Administration System',
    margin,
    footerY + 9.5
  );
  doc.text(
    'Notice: This statement is an electronically generated summary of insurance records. No signature required.',
    margin,
    footerY + 13.5
  );

  // Right Stamp Verification Box
  const stampW = 48;
  const stampH = 14;
  const stampX = pageWidth - margin - stampW;
  const stampY = footerY + 3;

  doc.setFillColor(255, 251, 248);
  doc.setDrawColor(255, 215, 170);
  doc.setLineWidth(0.4);
  doc.roundedRect(stampX, stampY, stampW, stampH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 107, 0);
  doc.text('OFFICIALLY VERIFIED', stampX + stampW / 2, stampY + 5.5, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Ashok Auto Insurance Admin', stampX + stampW / 2, stampY + 9.5, { align: 'center' });
  doc.text(`Ref: ${todayStr}`, stampX + stampW / 2, stampY + 12.5, { align: 'center' });

  // Page Number
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Page 1 of 1', pageWidth / 2, pageHeight - 5, { align: 'center' });

  // =========================================================================
  // 7. SAVE & DOWNLOAD FILE
  // =========================================================================
  const sanitizedName = (customer.name || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${sanitizedName}_Insurance_Details.pdf`;

  doc.save(fileName);
  return fileName;
}
