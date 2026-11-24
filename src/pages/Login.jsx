import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import '../styles/login.css';

export function Login() {
  const { isAuthenticated, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your admin email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/', { replace: true });
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Decorative ambient backdrop circles */}
      <div className="login-decorative-circle login-circle-1" />
      <div className="login-decorative-circle login-circle-2" />

      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-logo-box">
            <ShieldCheck size={28} strokeWidth={2.4} />
          </div>
          <div className="login-title-row">
            Insure<span>Track</span>
          </div>
          <div className="login-tagline">INSURANCE MANAGEMENT PORTAL</div>

          <div className="login-welcome-box">
            <h1 className="login-welcome-title">Admin Portal Sign In</h1>
            <p className="login-welcome-subtitle">
              Enter your authorized admin credentials to manage policies, customers, and payments.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-error-alert" style={{ marginTop: '14px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field-group">
            <label className="login-label" htmlFor="admin-email">
              Admin Email ID
            </label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <Mail size={17} />
              </span>
              <input
                id="admin-email"
                type="email"
                className="login-input"
                placeholder="ashokinsurance@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="login-field-group">
            <label className="login-label" htmlFor="admin-password">
              <span>Password</span>
            </label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <Lock size={17} />
              </span>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isSubmitting || authLoading}
          >
            {isSubmitting || authLoading ? (
              <>
                <Loader2 size={18} className="spin-animation" />
                <span>Verifying Admin Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={17} strokeWidth={2.4} />
              </>
            )}
          </button>
        </form>

        {/* Security & Firestore Collection Badge */}
        <div className="login-footer-security">
          <div className="login-security-badge">
            <CheckCircle2 size={13} color="#22C55E" />
            <span>Encrypted Session • Verified via Firestore</span>
          </div>
          <div className="login-collection-badge">
            Collection: <code>admins</code> (Ashok Auto Insurance)
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

