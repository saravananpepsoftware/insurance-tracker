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
  Database,
  Cloud
} from 'lucide-react';

export function Settings() {
  const { customers, firebaseConnected, firebaseError, clearAll } = useCustomers();
  const { addToast } = useToast();

  const [pdfStats, setPdfStats] = useState({ count: 0, totalBytes: 0 });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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
      a.download = `ashok_auto_insurance_backup_${new Date().toISOString().slice(0, 10)}.json`;
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
              <span style={{ fontWeight: 600 }}>Ashok Auto Insurance</span>
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

        {/* Firebase Cloud Database Status */}
        <div className="app-card" style={{ borderLeft: '4px solid var(--primary-orange)' }}>
          <div className="card-header">
            <div className="card-title">
              <Cloud size={18} color="var(--primary-orange)" />
              <span>Firebase Realtime Cloud Database</span>
            </div>
            <span
              className="badge"
              style={{
                backgroundColor: firebaseConnected ? '#DCFCE7' : '#FEF3C7',
                color: firebaseConnected ? '#15803D' : '#B45309',
                fontWeight: 700
              }}
            >
              {firebaseConnected ? '● Connected' : '● Connecting / Fallback Mode'}
            </span>
          </div>

          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>PROJECT ID</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>ashok-auto-insurnace</span>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>DATABASE</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Cloud Firestore (Real-time)</span>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>STORAGE BUCKET</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>ashok-auto-insurnace.firebasestorage.app</span>
              </div>
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
              All customer profiles, payment transactions, and policy PDF documents are stored and synced in real-time with Firebase.
            </p>
          </div>
        </div>

        {/* Database Clear */}
        <div className="app-card" style={{ borderColor: 'var(--border-light)' }}>
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--status-danger)' }}>
              <Trash2 size={18} />
              <span>Clear Database Records</span>
            </div>
          </div>

          <div className="card-body">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Purge all customer records, payments, and policy documents from Firebase and storage.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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

      {/* Clear Confirmation */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear All Customer Records & Documents"
        message="Are you sure you want to completely erase all customer records, payments, and policy documents? This action is irreversible."
        confirmLabel="Erase All Data"
        isDanger
        onConfirm={() => clearAll()}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}

