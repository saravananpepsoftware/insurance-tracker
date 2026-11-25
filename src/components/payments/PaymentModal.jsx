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
  const previousPaid = Number(customer.partialAmount ?? customer.paidAmount) || 0;
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

  const handleSubmit = async (e) => {
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
    try {
      const success = await addPayment(customer.id, num);
      if (success) {
        onClose();
      }
    } catch (err) {
      console.error('Payment submission error:', err);
      setError(err?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
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

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Customer Summary Box */}
            <div className="payment-modal-customer-box">
              <div className="payment-modal-summary-row">
                <span className="payment-modal-row-label">Customer Name:</span>
                <span className="payment-modal-row-val font-semibold">{customer.name}</span>
              </div>
              <div className="payment-modal-summary-row">
                <span className="payment-modal-row-label">Insurance Carrier:</span>
                <span className="payment-modal-row-val">{customer.insuranceCompany}</span>
              </div>
              <div className="payment-modal-summary-row">
                <span className="payment-modal-row-label">Total Policy Amount:</span>
                <span className="payment-modal-row-val font-semibold">{formatCurrency(total)}</span>
              </div>
              <div className="payment-modal-summary-row">
                <span className="payment-modal-row-label">Previously Paid:</span>
                <span className="payment-modal-row-val font-semibold status-paid-text">{formatCurrency(previousPaid)}</span>
              </div>
              <div className="payment-modal-summary-row payment-modal-balance-row">
                <span className="payment-modal-row-label font-semibold">Current Balance Remaining:</span>
                <span className="payment-modal-row-val font-bold status-danger-text">{formatCurrency(currentRemaining)}</span>
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
                min="0"
                max={currentRemaining}
                step="any"
                value={newAmount}
                onChange={handleAmountChange}
                autoFocus
              />
              {error && <div className="form-error">{error}</div>}
            </div>

            {/* Live Calculation Preview */}
            {parsedNewAmount > 0 && !error && (
              <div className="payment-modal-calc-preview">
                <div className="payment-modal-calc-title">
                  Live Calculation Preview
                </div>
                <div className="payment-modal-summary-row">
                  <span className="payment-modal-row-label">Current Paid Amount:</span>
                  <span className="payment-modal-row-val font-semibold">{formatCurrency(previousPaid)}</span>
                </div>
                <div className="payment-modal-summary-row">
                  <span className="payment-modal-row-label highlight-orange">+ Adding Payment:</span>
                  <strong className="payment-modal-row-val highlight-orange">+ {formatCurrency(parsedNewAmount)}</strong>
                </div>
                <div className="payment-modal-summary-row payment-modal-calc-divider">
                  <span className="payment-modal-row-label font-bold">= New Paid Amount:</span>
                  <strong className="payment-modal-row-val font-bold status-paid-text">{formatCurrency(updatedPaid)}</strong>
                </div>
                <div className="payment-modal-summary-row">
                  <span className="payment-modal-row-label font-bold">New Remaining Balance:</span>
                  <strong className={`payment-modal-row-val font-bold ${updatedRemaining > 0 ? 'status-danger-text' : 'status-paid-text'}`}>
                    {formatCurrency(updatedRemaining)}
                  </strong>
                </div>
                <div className="payment-modal-summary-row" style={{ paddingTop: '4px' }}>
                  <span className="payment-modal-row-label">Updated Payment Status:</span>
                  <span className={`payment-status-pill ${updatedStatus === 'Paid' ? 'pill-paid' : 'pill-partial'}`}>
                    {updatedStatus}
                  </span>
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

