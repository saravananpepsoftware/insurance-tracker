/**
 * Date manipulation and urgency calculation utilities
 */

/**
 * Calculates remaining days between today and end date.
 * Returns negative if expired.
 */
export function calculateDaysRemaining(endDateString) {
  if (!endDateString) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(endDateString);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Determines renewal category based on end date
 */
export function getRenewalCategory(endDateString) {
  const days = calculateDaysRemaining(endDateString);
  if (days < 0) return 'expired';
  if (days <= 7) return '7days';
  if (days <= 15) return '15days';
  if (days <= 30) return '30days';
  return 'future';
}

/**
 * Gets urgency color scheme and label
 * - Expiring in 0–7 days: Red
 * - Expiring in 8–15 days: Orange
 * - Expiring in 16–30 days: Yellow/Amber
 * - Expired: Gray / Crimson
 * - Future (>30 days): Green / Neutral
 */
export function getUrgencyInfo(endDateString) {
  const days = calculateDaysRemaining(endDateString);

  if (days < 0) {
    return {
      level: 'expired',
      label: `Expired ${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} ago`,
      shortLabel: 'Expired',
      badgeClass: 'badge-danger',
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA'
    };
  }

  if (days === 0) {
    return {
      level: 'critical',
      label: 'Expires Today',
      shortLabel: 'Today',
      badgeClass: 'badge-danger',
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA'
    };
  }

  if (days <= 7) {
    return {
      level: 'critical',
      label: `${days} ${days === 1 ? 'day' : 'days'} left`,
      shortLabel: `${days}d left`,
      badgeClass: 'badge-danger',
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA'
    };
  }

  if (days <= 15) {
    return {
      level: 'warning',
      label: `${days} days left`,
      shortLabel: `${days}d left`,
      badgeClass: 'badge-orange',
      color: '#F97316',
      bg: '#FFF7ED',
      border: '#FFEDD5'
    };
  }

  if (days <= 30) {
    return {
      level: 'notice',
      label: `${days} days left`,
      shortLabel: `${days}d left`,
      badgeClass: 'badge-warning',
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A'
    };
  }

  return {
    level: 'active',
    label: `${days} days left`,
    shortLabel: `${days}d`,
    badgeClass: 'badge-success',
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0'
  };
}

/**
 * Formats a date string nicely (e.g. 21 Nov 2026)
 */
export function formatIndianDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Gets date string for input element (YYYY-MM-DD)
 */
export function formatDateForInput(date = new Date()) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/**
 * Adds offset days to today and returns YYYY-MM-DD
 */
export function getDateWithDayOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatDateForInput(d);
}

