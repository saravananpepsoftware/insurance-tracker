import React from 'react';
import { getUrgencyInfo } from '../../utils/dateUtils';

export function PaymentStatusBadge({ status }) {
  if (status === 'Paid') {
    return (
      <span className="badge badge-paid">
        <span className="badge-dot" />
        Paid
      </span>
    );
  }
  if (status === 'Partial Payment') {
    return (
      <span className="badge badge-partial">
        <span className="badge-dot" />
        Partial Payment
      </span>
    );
  }
  return (
    <span className="badge badge-pending">
      <span className="badge-dot" />
      Pending
    </span>
  );
}

export function InsuranceTypeBadge({ type }) {
  const isMotor = type === 'Motor Insurance';
  return (
    <span className={`badge ${isMotor ? 'badge-type-motor' : 'badge-type-accidental'}`}>
      {type}
    </span>
  );
}

export function RenewalUrgencyBadge({ endDate, short = false }) {
  const info = getUrgencyInfo(endDate);
  return (
    <span className={`badge ${info.badgeClass}`}>
      <span className="badge-dot" />
      {short ? info.shortLabel : info.label}
    </span>
  );
}

