import React, { useState, useEffect } from 'react';
import { useCustomers } from '../../context/CustomerContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateRemaining, getPaymentStatus } from '../../utils/calculations';
import { X, CreditCard, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export function PaymentModal({ isOpen, customer, onClose }) {
  const { addPayment } = useCustomers();
  const { addToast } = useToast();
  const [newAmount, setNewAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setNewAmount('');
    setError('');
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  const total = Number(customer.totalAmount) || 0;
  const previousPaid = Number(customer.partialAmount) || 0;
  const currentRemaining = calculateRemaining(total, previousPaid);

  const parsedNewAmount = Math.max(0, parseFloat(newAmount) || 0);
  const updatedPaid = previousPaid + parsedNewAmount;
  const updatedRemaining = calculateRemaining(total, updatedPaid);
  const updatedStatus = getPaymentStatus(total, updatedPaid);

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setNewAmount(val);
    const num = parseFloat(val);

    if (val === '') {
      setError('');
    } else if (isNaN(num) || num <= 0) {
      setError('Please enter an amount greater than ₹0');
    } else if (num > currentRemaining) {
      setError(`Payment cannot exceed the remaining balance of ${formatCurrency(currentRemaining)}`);
    } else {
      setError('');
    }
  };

  const handleSetFullRemaining = () => {
    setNewAmount(currentRemaining.toString());
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(newAmount);

    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (num > currentRemaining) {
      setError(`Payment cannot exceed ${formatCurrency(currentRemaining)}`);
      return;
    }

    setIsSubmitting(true);
    const success = addPayment(customer.id, num);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--light-orange)',
              color: 'var(--primary-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="modal-title">Record New Payment</h3>
              <p className="modal-subtitle">Add payment installment for {customer.name}</p>
            </div>
          </div>
          <button className="btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Customer Summary Box */}
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Customer Name:</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{customer.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Insurance Carrier:</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{customer.insuranceCompany}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Policy Amount:</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Previously Paid:</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-success)' }}>{formatCurrency(previousPaid)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px dashed var(--border-light)'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Current Balance Remaining:</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--status-danger)' }}>{formatCurrency(currentRemaining)}</span>
              </div>
            </div>

            {/* Input New Amount */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label required" style={{ marginBottom: 0 }}>
                  New Payment Amount (₹)
                </label>
                {currentRemaining > 0 && (
                  <button
                    type="button"
                    onClick={handleSetFullRemaining}
                    style={{
                      fontSize: '11px',
                      color: 'var(--primary-orange)',
                      fontWeight: 600,
                      background: 'none',
                      textDecoration: 'underline'
                    }}
                  >
                    Pay Full Balance ({formatCurrency(currentRemaining)})
                  </button>
                )}
              </div>
              <input
                type="number"
                className="form-input"
                placeholder="Enter amount in ₹"
                min="1"
                max={currentRemaining}
                step="50"
                value={newAmount}
                onChange={handleAmountChange}
                autoFocus
              />
              {error && <div className="form-error">{error}</div>}
            </div>

            {/* Live Calculation Preview */}
            {parsedNewAmount > 0 && !error && (
              <div style={{
                backgroundColor: 'var(--light-orange)',
                border: '1px solid var(--subtle-orange)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-orange)', textTransform: 'uppercase' }}>
                  Updated Payment Preview
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Updated Total Paid:</span>
                  <strong style={{ color: 'var(--status-success)' }}>{formatCurrency(updatedPaid)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>New Balance Remaining:</span>
                  <strong style={{ color: updatedRemaining > 0 ? 'var(--status-danger)' : 'var(--text-secondary)' }}>
                    {formatCurrency(updatedRemaining)}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>New Payment Standing:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{updatedStatus}</span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !newAmount || !!error}
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

