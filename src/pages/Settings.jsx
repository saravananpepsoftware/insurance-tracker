import React, { useState, useEffect } from 'react';
import { useCustomers } from '../context/CustomerContext';
import { useToast } from '../context/ToastContext';
import { formatFileSize } from '../utils/formatCurrency';
import { getPdfStorageStats } from '../utils/indexedDb';
import { exportDataAsJson, importDataFromJson } from '../utils/storage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Settings as SettingsIcon,
  HardDrive,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Shield,
  Coins,
  CheckCircle,
  Database
} from 'lucide-react';

export function Settings() {
  const { customers, resetDemo, clearAll } = useCustomers();
  const { addToast } = useToast();

  const [pdfStats, setPdfStats] = useState({ count: 0, totalBytes: 0 });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    getPdfStorageStats().then(setPdfStats);
  }, [customers]);

  const handleExportJson = () => {
    try {
      const json = exportDataAsJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `insuretrack_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('Data backup exported successfully!', 'success');
    } catch (e) {
      console.error(e);
      addToast('Failed to export data', 'error');
    }
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        importDataFromJson(content);
        window.location.reload();
      } catch (err) {
        addToast(err.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page-container">
      {/* Header with accent bar */}
      <div className="header-with-accent" style={{ marginBottom: '22px' }}>
        <div className="header-accent-bar" />
        <div>
          <h1 className="page-title">Application Settings</h1>
          <p className="page-subtitle">
            System configuration, data persistence, and local database management
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* System Information */}
        <div className="app-card">
          <div className="card-header">
            <div className="card-title">
              <Shield size={18} color="var(--primary-orange)" />
              <span>System & Environment</span>
            </div>
            <span className="badge badge-success">Online & Local</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Application Name:</span>
              <span style={{ fontWeight: 600 }}>InsureTrack</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Architecture:</span>
              <span style={{ fontWeight: 600 }}>100% Frontend-Only (Client-Side)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Currency Format:</span>
              <span style={{ fontWeight: 600, color: 'var(--primary-orange)' }}>Indian Rupee (INR ₹)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Active Insurance Types:</span>
              <span style={{ fontWeight: 600 }}>Motor & Accidental</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Admin Mode:</span>
              <span style={{ fontWeight: 600, color: 'var(--status-success)' }}>Active Admin Session</span>
            </div>
          </div>
        </div>

        {/* Local Storage & IndexedDB Status */}
        <div className="app-card">
          <div className="card-header">
            <div className="card-title">
              <HardDrive size={18} color="var(--primary-orange)" />
              <span>Local Storage & IndexedDB</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Browser Sandboxed</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>LocalStorage Records:</span>
              <span style={{ fontWeight: 700 }}>{customers.length} Policies</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>IndexedDB PDF Documents:</span>
              <span style={{ fontWeight: 700, color: 'var(--primary-orange)' }}>{pdfStats.count} Files</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>IndexedDB Storage Consumed:</span>
              <span style={{ fontWeight: 600 }}>{formatFileSize(pdfStats.totalBytes)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Data Safety:</span>
              <span style={{ color: 'var(--status-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> Persistent on refresh
              </span>
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="app-card">
          <div className="card-header">
            <div className="card-title">
              <Database size={18} color="var(--primary-orange)" />
              <span>Data Backup & Restore</span>
            </div>
          </div>

          <div className="card-body">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Export all customer records and payment history as a JSON backup file, or restore from a previously exported backup.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={handleExportJson}>
                <Download size={15} />
                <span>Export JSON Backup</span>
              </button>

              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                <Upload size={15} />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  onChange={handleImportJson}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Database Reset & Wipe */}
        <div className="app-card" style={{ borderColor: 'var(--border-light)' }}>
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--status-danger)' }}>
              <Trash2 size={18} />
              <span>Reset & Clear Local Data</span>
            </div>
          </div>

          <div className="card-body">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Reset back to realistic sample demo data, or purge all customer records and indexed documents.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline-orange"
                onClick={() => setShowResetConfirm(true)}
              >
                <RefreshCw size={15} />
                <span>Reset to Demo Sample Data</span>
              </button>

              <button
                className="btn btn-danger"
                onClick={() => setShowClearConfirm(true)}
              >
                <Trash2 size={15} />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset to Sample Demo Data"
        message="This will replace all current customer records and re-seed the system with 10 realistic Indian demo insurance customers with pre-generated PDF certificates. Continue?"
        confirmLabel="Reset to Demo Data"
        onConfirm={() => resetDemo()}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Clear Confirmation */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear All Local Storage & Documents"
        message="Are you sure you want to completely erase all customer records, payments, and policy documents from both LocalStorage and IndexedDB? This action is irreversible."
        confirmLabel="Erase All Data"
        isDanger
        onConfirm={() => clearAll()}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}

