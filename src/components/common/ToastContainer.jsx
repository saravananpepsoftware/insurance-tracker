import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="var(--status-success)" />,
    error: <AlertCircle size={18} color="var(--status-danger)" />,
    warning: <AlertTriangle size={18} color="var(--status-warning)" />,
    info: <Info size={18} color="var(--primary-orange)" />
  };

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div style={{ flexShrink: 0 }}>
            {icons[toast.type] || icons.info}
          </div>
          <div style={{ flex: 1, color: 'var(--text-primary)' }}>
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px'
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

