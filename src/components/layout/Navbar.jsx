import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomers } from '../../context/CustomerContext';
import {
  Search,
  Plus,
  ShieldCheck,
  X
} from 'lucide-react';

export function Navbar({ onOpenAddCustomer }) {
  const { searchTerm, setSearchTerm } = useCustomers();
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val && location.pathname !== '/customers' && location.pathname !== '/payments' && location.pathname !== '/renewals') {
      navigate('/customers');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <header className="navbar">
      {/* Mobile Brand for small screens */}
      <div className="navbar-mobile-brand">
        <div className="logo-icon-box" style={{ width: '32px', height: '32px' }}>
          <ShieldCheck size={18} strokeWidth={2.4} />
        </div>
        <div style={{ fontWeight: 800, fontSize: '18px', color: '#111827', letterSpacing: '-0.02em' }}>
          Insure<span style={{ color: 'var(--primary-orange)' }}>Track</span>
        </div>
      </div>

      {/* Global Search Bar (Desktop) */}
      <div className="navbar-left">
        <div className="global-search-bar">
          <Search size={16} color="#94A3B8" />
          <input
            ref={searchInputRef}
            type="text"
            className="global-search-input"
            placeholder="Search by customer name, phone, or company..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm ? (
            <button onClick={clearSearch} style={{ color: 'var(--text-muted)' }}>
              <X size={14} />
            </button>
          ) : (
            <span className="search-shortcut-badge">Ctrl + K</span>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="navbar-right">
        {/* + Add Customer Orange Pill Button */}
        <button
          className="btn btn-primary btn-navbar-add"
          onClick={onOpenAddCustomer}
          title="Add New Customer"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Add Customer</span>
        </button>

        {/* User Admin Profile Widget */}
        <div className="user-profile-widget">
          <div className="user-avatar">
            AD
          </div>
          <div className="user-meta">
            <span className="user-name">Admin Manager</span>
            <span className="user-role">Insurance Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
