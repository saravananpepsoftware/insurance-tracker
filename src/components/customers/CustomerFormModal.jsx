import React, { useState, useEffect } from 'react';
import { useCustomers } from '../../context/CustomerContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatFileSize } from '../../utils/formatCurrency';
import { calculateRemaining, getPaymentStatus } from '../../utils/calculations';
import { formatDateForInput, getDateWithDayOffset } from '../../utils/dateUtils';
import {
  X,
  User,
  Phone,
  Shield,
  CreditCard,
  Calendar,
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  Plus,
  Check
} from 'lucide-react';

export function CustomerFormModal({ isOpen, onClose, customerToEdit = null }) {
  const { addCustomer, updateCustomer, companies, addCompany } = useCustomers();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    insuranceCompany: '',
    insuranceType: 'Motor Insurance',
    totalAmount: '',
    partialAmount: '',
    policyStartDate: formatDateForInput(),
    policyEndDate: getDateWithDayOffset(365)
  });

  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [companyError, setCompanyError] = useState('');

  const [pdfFile, setPdfFile] = useState(null);
  const [existingPdfName, setExistingPdfName] = useState('');
  const [existingPdfSize, setExistingPdfSize] = useState(0);
  const [removeExistingPdf, setRemoveExistingPdf] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Initialize form with customerToEdit or defaults
  useEffect(() => {
    setIsAddingCompany(false);
    setNewCompanyName('');
    setCompanyError('');

    if (customerToEdit) {
      setFormData({
        name: customerToEdit.name || '',
        phone: customerToEdit.phone || '',
        insuranceCompany: customerToEdit.insuranceCompany || '',
        insuranceType: customerToEdit.insuranceType || 'Motor Insurance',
        totalAmount: customerToEdit.totalAmount?.toString() || '',
        partialAmount: customerToEdit.partialAmount?.toString() || '',
        policyStartDate: customerToEdit.policyStartDate || formatDateForInput(),
        policyEndDate: customerToEdit.policyEndDate || getDateWithDayOffset(365)
      });
      setExistingPdfName(customerToEdit.pdfFileName || '');
      setExistingPdfSize(customerToEdit.pdfFileSize || 0);
      setRemoveExistingPdf(false);
      setPdfFile(null);
    } else {
      setFormData({
        name: '',
        phone: '',
        insuranceCompany: '',
        insuranceType: 'Motor Insurance',
        totalAmount: '',
        partialAmount: '0',
        policyStartDate: formatDateForInput(),
        policyEndDate: getDateWithDayOffset(365)
      });
      setExistingPdfName('');
      setExistingPdfSize(0);
      setRemoveExistingPdf(false);
      setPdfFile(null);
    }
    setErrors({});
  }, [customerToEdit, isOpen]);

  // Dynamic available companies list (sorted, includes any current selection)
  const availableCompanies = React.useMemo(() => {
    const list = Array.isArray(companies) ? [...companies] : [];
    if (formData.insuranceCompany && !list.includes(formData.insuranceCompany)) {
      list.push(formData.insuranceCompany);
    }
    return list.sort((a, b) => a.localeCompare(b));
  }, [companies, formData.insuranceCompany]);

  const handleSaveNewCompany = () => {
    const trimmed = newCompanyName.trim();
    if (!trimmed) {
      setCompanyError('Please enter an insurance company name');
      return;
    }
    if (addCompany) {
      addCompany(trimmed);
    }
    setFormData((prev) => ({ ...prev, insuranceCompany: trimmed }));
    if (errors.insuranceCompany) {
      setErrors((prev) => ({ ...prev, insuranceCompany: null }));
    }
    addToast(`"${trimmed}" added and selected!`, 'success');
    setIsAddingCompany(false);
    setNewCompanyName('');
    setCompanyError('');
  };

  if (!isOpen) return null;

  // Real-time calculated amounts
  const totalNum = Math.max(0, parseFloat(formData.totalAmount) || 0);
  const partialNum = Math.max(0, parseFloat(formData.partialAmount) || 0);
  const calculatedRemaining = calculateRemaining(totalNum, partialNum);
  const calculatedStatus = getPaymentStatus(totalNum, partialNum);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      addToast('Please upload a valid PDF document only (.pdf)', 'error');
      return;
    }
    setPdfFile(file);
    setRemoveExistingPdf(false);
    addToast(`Selected PDF: ${file.name} (${formatFileSize(file.size)})`, 'info', 2000);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Customer name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (formData.phone.trim().length < 8) {
      errs.phone = 'Please enter a valid phone number';
    }

    if (!formData.insuranceCompany.trim()) {
      errs.insuranceCompany = 'Insurance company name is required';
    }

    if (!formData.totalAmount || isNaN(formData.totalAmount) || parseFloat(formData.totalAmount) <= 0) {
      errs.totalAmount = 'Total amount must be greater than 0';
    }

    if (formData.partialAmount === '' || isNaN(formData.partialAmount) || parseFloat(formData.partialAmount) < 0) {
      errs.partialAmount = 'Paid amount cannot be negative';
    } else if (parseFloat(formData.partialAmount) > parseFloat(formData.totalAmount)) {
      errs.partialAmount = 'Paid amount cannot exceed total amount';
    }

    if (!formData.policyStartDate) {
      errs.policyStartDate = 'Start date is required';
    }
    if (!formData.policyEndDate) {
      errs.policyEndDate = 'End date is required';
    } else if (formData.policyStartDate && formData.policyEndDate < formData.policyStartDate) {
      errs.policyEndDate = 'End date cannot be earlier than start date';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please review the form errors before saving', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (customerToEdit) {
        await updateCustomer(customerToEdit.id, formData, pdfFile, removeExistingPdf);
      } else {
        await addCustomer(formData, pdfFile);
      }
      onClose();
    } catch (err) {
      console.error(err);
      addToast('An error occurred while saving the customer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {customerToEdit ? 'Edit Customer Record' : 'Add New Insurance Customer'}
            </h3>
            <p className="modal-subtitle">
              {customerToEdit
                ? 'Update customer details, policy dates, and payment records'
                : 'Enter customer, insurance policy, and payment information'}
            </p>
          </div>
          <button className="btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            {/* Section 1: Customer Information */}
            <div className="form-section">
              <div className="form-section-title">
                <User size={15} color="var(--primary-orange)" />
                <span>Customer Information</span>
              </div>
              <div className="form-grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required">Customer Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="e.g. +91 98201 44521"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  {errors.phone && <div className="form-error">{errors.phone}</div>}
                </div>
              </div>
            </div>

            {/* Section 2: Insurance Details */}
            <div className="form-section">
              <div className="form-section-title">
                <Shield size={15} color="var(--primary-orange)" />
                <span>Insurance Details</span>
              </div>
              <div className="form-grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="form-label required" style={{ marginBottom: 0 }}>
                      Insurance Company
                    </label>
                    {!isAddingCompany ? (
                      <button
                        type="button"
                        className="btn-add-company-toggle"
                        onClick={() => {
                          setIsAddingCompany(true);
                          setNewCompanyName('');
                          setCompanyError('');
                        }}
                        title="Add a new insurance company to the list"
                      >
                        <Plus size={13} />
                        <span>Add Company</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-add-company-toggle text-secondary-btn"
                        onClick={() => {
                          setIsAddingCompany(false);
                          setNewCompanyName('');
                          setCompanyError('');
                        }}
                      >
                        <X size={13} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>

                  {!isAddingCompany ? (
                    <div>
                      <select
                        name="insuranceCompany"
                        className="form-select"
                        value={formData.insuranceCompany}
                        onChange={(e) => {
                          if (e.target.value === '__ADD_NEW__') {
                            setIsAddingCompany(true);
                            setNewCompanyName('');
                            setCompanyError('');
                          } else {
                            handleInputChange(e);
                          }
                        }}
                      >
                        <option value="">-- Select Insurance Company --</option>
                        {availableCompanies.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        <option value="__ADD_NEW__" style={{ color: 'var(--primary-orange)', fontWeight: 700 }}>
                          + Add New Company...
                        </option>
                      </select>
                      {errors.insuranceCompany && <div className="form-error">{errors.insuranceCompany}</div>}
                    </div>
                  ) : (
                    <div className="add-company-box">
                      <div className="add-company-input-group">
                        <input
                          type="text"
                          className="form-input add-company-input"
                          placeholder="e.g. Star Health, HDFC ERGO..."
                          value={newCompanyName}
                          onChange={(e) => {
                            setNewCompanyName(e.target.value);
                            if (companyError) setCompanyError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveNewCompany();
                            }
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="btn btn-primary add-company-submit-btn"
                          onClick={handleSaveNewCompany}
                        >
                          <Check size={14} />
                          <span>Add</span>
                        </button>
                      </div>
                      {companyError && <div className="form-error">{companyError}</div>}
                      <div className="add-company-hint">
                        Saves permanently to dropdown options for future policies
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required">Insurance Type</label>
                  <select
                    name="insuranceType"
                    className="form-select"
                    value={formData.insuranceType}
                    onChange={handleInputChange}
                  >
                    <option value="Motor Insurance">Motor Insurance</option>
                    <option value="Accidental Insurance">Accidental Insurance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Payment Details */}
            <div className="form-section">
              <div className="form-section-title">
                <CreditCard size={15} color="var(--primary-orange)" />
                <span>Payment Details (INR ₹)</span>
              </div>
              <div className="form-grid-3">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required">Total Amount (₹)</label>
                  <input
                    type="number"
                    name="totalAmount"
                    className="form-input"
                    placeholder="0"
                    min="0"
                    step="any"
                    value={formData.totalAmount}
                    onChange={handleInputChange}
                  />
                  {errors.totalAmount && <div className="form-error">{errors.totalAmount}</div>}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required">Paid Amount (₹)</label>
                  <input
                    type="number"
                    name="partialAmount"
                    className="form-input"
                    placeholder="0"
                    min="0"
                    step="any"
                    value={formData.partialAmount}
                    onChange={handleInputChange}
                  />
                  {errors.partialAmount && <div className="form-error">{errors.partialAmount}</div>}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Remaining Amount (₹)</label>
                  <input
                    type="text"
                    className="form-input"
                    disabled
                    value={formatCurrency(calculatedRemaining)}
                    style={{
                      fontWeight: 700,
                      color: calculatedRemaining > 0 ? 'var(--status-danger)' : 'var(--status-success)'
                    }}
                  />
                  <div className="form-helper">
                    Status: <strong>{calculatedStatus}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Policy Duration */}
            <div className="form-section">
              <div className="form-section-title">
                <Calendar size={15} color="var(--primary-orange)" />
                <span>Policy Duration</span>
              </div>
              <div className="form-grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required">Policy Start Date</label>
                  <input
                    type="date"
                    name="policyStartDate"
                    className="form-input"
                    value={formData.policyStartDate}
                    onChange={handleInputChange}
                  />
                  {errors.policyStartDate && <div className="form-error">{errors.policyStartDate}</div>}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label required">Policy End Date</label>
                  <input
                    type="date"
                    name="policyEndDate"
                    className="form-input"
                    value={formData.policyEndDate}
                    onChange={handleInputChange}
                  />
                  {errors.policyEndDate && <div className="form-error">{errors.policyEndDate}</div>}
                </div>
              </div>
            </div>

            {/* Section 5: Policy Document Upload */}
            <div className="form-section" style={{ marginBottom: 0 }}>
              <div className="form-section-title">
                <FileText size={15} color="var(--primary-orange)" />
                <span>Policy Document (PDF)</span>
              </div>

              {!pdfFile && existingPdfName && !removeExistingPdf ? (
                <div className="pdf-preview-pill">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} color="var(--primary-orange)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{existingPdfName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {formatFileSize(existingPdfSize)} • Uploaded to Secure IndexedDB
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                      Replace
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                      />
                    </label>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setRemoveExistingPdf(true)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ) : pdfFile ? (
                <div className="pdf-preview-pill" style={{ borderColor: 'var(--primary-orange)', backgroundColor: 'var(--light-orange)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} color="var(--primary-orange)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--primary-orange)' }}>
                        {pdfFile.name} (Ready to Save)
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {formatFileSize(pdfFile.size)} • PDF Document
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPdfFile(null)}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  className={`pdf-upload-box ${isDragOver ? 'dragover' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('customer-pdf-file-input').click()}
                >
                  <input
                    id="customer-pdf-file-input"
                    type="file"
                    accept="application/pdf,.pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />
                  <UploadCloud size={32} color="var(--primary-orange)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                    Click to browse or drag and drop Policy PDF here
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Accepted format: PDF up to 25MB (Stored safely in IndexedDB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : customerToEdit ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

