import React from 'react';
import { getUrgencyInfo } from '../../utils/dateUtils';
import { Car, ShieldCheck } from 'lucide-react';

export function PaymentStatusBadge({ status }) {
  if (status === 'Paid') {
    return (
      <span className="table-status-clean status-paid">
        Paid
      </span>
    );
  }
  if (status === 'Partial Payment') {
    return (
      <span className="table-status-clean status-partial">
        Partial Payment
      </span>
    );
  }
  return (
    <span className="table-status-clean status-pending">
      Pending
    </span>
  );
}

export function InsuranceTypeBadge({ type }) {
  const isMotor = type === 'Motor Insurance';
  return (
    <span className={`badge ${isMotor ? 'badge-type-motor' : 'badge-type-accidental'}`}>
      {isMotor ? <Car size={13} /> : <ShieldCheck size={13} />}
      <span>{type}</span>
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

