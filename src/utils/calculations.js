import { calculateDaysRemaining } from './dateUtils';

/**
 * Calculates remaining amount
 * Remaining Amount = Total Amount - Partial Amount
 */
export function calculateRemaining(total, partial) {
  const t = Math.max(0, Number(total) || 0);
  const p = Math.max(0, Number(partial) || 0);
  return Math.max(0, t - p);
}

/**
 * Automatically calculates payment status:
 * If Partial Amount = 0: Status = Pending
 * If Partial Amount > 0 and Partial Amount < Total Amount: Status = Partial Payment
 * If Partial Amount = Total Amount: Status = Paid
 */
export function getPaymentStatus(total, partial) {
  const t = Math.max(0, Number(total) || 0);
  const p = Math.max(0, Number(partial) || 0);

  if (p === 0 || t === 0) {
    return 'Pending';
  }
  if (p >= t) {
    return 'Paid';
  }
  return 'Partial Payment';
}

/**
 * Computes all dashboard statistics
 */
export function calculateDashboardMetrics(customers = []) {
  let totalBusiness = 0;
  let totalPending = 0;
  let totalCollected = 0;
  let upcomingRenewalsCount = 0;
  let expiredPoliciesCount = 0;

  // Breakdown counts
  let paidCount = 0;
  let partialCount = 0;
  let pendingCount = 0;

  let motorCount = 0;
  let motorTotal = 0;
  let accidentalCount = 0;
  let accidentalTotal = 0;

  customers.forEach(c => {
    const total = Number(c.totalAmount) || 0;
    const partial = Number(c.partialAmount) || 0;
    const remaining = calculateRemaining(total, partial);
    const status = getPaymentStatus(total, partial);

    totalBusiness += total;
    totalCollected += partial;
    totalPending += remaining;

    if (status === 'Paid') paidCount++;
    else if (status === 'Partial Payment') partialCount++;
    else pendingCount++;

    if (c.insuranceType === 'Motor Insurance') {
      motorCount++;
      motorTotal += total;
    } else {
      accidentalCount++;
      accidentalTotal += total;
    }

    const daysLeft = calculateDaysRemaining(c.policyEndDate);
    // "Upcoming Renewals: Display the number of policies whose policy expiry date is within the next 30 days. Only count policies that have not expired yet."
    if (daysLeft >= 0 && daysLeft <= 30) {
      upcomingRenewalsCount++;
    } else if (daysLeft < 0) {
      expiredPoliciesCount++;
    }
  });

  return {
    totalCustomers: customers.length,
    totalBusiness,
    totalPending,
    pendingPayments: totalPending,
    totalCollected,
    upcomingRenewalsCount,
    expiredPoliciesCount,
    paymentStatusCounts: {
      paid: paidCount,
      partial: partialCount,
      pending: pendingCount
    },
    insuranceTypeStats: {
      motor: { count: motorCount, total: motorTotal },
      accidental: { count: accidentalCount, total: accidentalTotal }
    }
  };
}

