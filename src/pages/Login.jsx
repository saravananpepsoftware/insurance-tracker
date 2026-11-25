import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loginIllustrationImg from '../assets/login-illustration-fade.png';
import {
  Shield,
  ShieldCheck,
  Users,
  CreditCard,
  BarChart3,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2
} from 'lucide-react';
import '../styles/login.css';

export function Login() {
  const { isAuthenticated, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [portalType, setPortalType] = useState('admin'); // 'admin' | 'staff'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSwitchPortal = (type) => {
    if (type === portalType) return;
    setPortalType(type);
    setError('');
    setPassword('');
    setEmail('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError(`Please enter your ${portalType === 'staff' ? 'staff' : 'admin'} email ID.`);
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password, portalType);
      if (res.success) {
        navigate('/', { replace: true });
      } else {
        setError(res.error || 'Invalid credentials. Please verify and try again.');
      }
    } catch (err) {
      setError(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Fluid Organic Top-Right Background Wave Accent */}
      <svg
        className="login-bg-accent login-bg-top-right"
        viewBox="0 0 380 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="loginWaveGradTR" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#FFA64D" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FFE0C8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 120 0 C 190 70 240 60 280 120 C 320 180 340 240 380 280 L 380 0 Z"
          fill="url(#loginWaveGradTR)"
        />
        <path
          d="M 210 0 C 260 50 290 80 330 140 C 360 180 370 220 380 240 L 380 0 Z"
          fill="#FF6B00"
          opacity="0.9"
        />
      </svg>

      {/* Fluid Organic Bottom-Left Background Wave Accent */}
      <svg
        className="login-bg-accent login-bg-bottom-left"
        viewBox="0 0 360 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="loginWaveGradBL" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#FFA64D" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFF1E8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 0 100 C 50 140 100 120 160 170 C 220 220 250 240 280 260 L 0 260 Z"
          fill="url(#loginWaveGradBL)"
        />
        <path
          d="M 0 150 C 40 180 80 170 130 205 C 180 240 200 250 220 260 L 0 260 Z"
          fill="#FF5500"
          opacity="0.95"
        />
      </svg>

      {/* Delicate flowing contour ribbon line */}
      <svg
        className="login-bg-ribbon"
        viewBox="0 0 1200 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 0 150 C 250 50 400 350 700 200 C 950 80 1050 300 1200 220"
          stroke="rgba(255, 107, 0, 0.22)"
          strokeWidth="1.8"
          strokeDasharray="4 2"
        />
        <path
          d="M 0 190 C 280 80 430 380 730 230 C 980 110 1070 330 1200 250"
          stroke="rgba(255, 133, 51, 0.15)"
          strokeWidth="1.2"
        />
      </svg>

      {/* Main Split Card */}
      <div className="login-split-card">
        {/* =========================================================
            LEFT COLUMN: Artwork Showcase & Features
            ========================================================= */}
        <div className="login-showcase-column">
          {/* Top 3D Artwork Illustration */}
          <div className="showcase-artwork-container">
            <img
              src={loginIllustrationImg}
              alt="Manage Insurance Policies with Ease"
              className="showcase-artwork-img"
            />
          </div>

          {/* Heading */}
          <div className="showcase-text-block">
            <h2 className="showcase-headline">
              Manage Insurance <br />
              <span>Policies with Ease</span>
            </h2>
          </div>

          {/* 4 Feature Items Grid */}
          <div className="showcase-features-grid">
            <div className="showcase-feature-item">
              <div className="showcase-feature-icon-box">
                <Shield size={18} strokeWidth={2.4} />
              </div>
              <span className="showcase-feature-label">
                Policy<br />Management
              </span>
            </div>

            <div className="showcase-feature-item">
              <div className="showcase-feature-icon-box">
                <Users size={18} strokeWidth={2.4} />
              </div>
              <span className="showcase-feature-label">
                Customer<br />Management
              </span>
            </div>

            <div className="showcase-feature-item">
              <div className="showcase-feature-icon-box">
                <CreditCard size={18} strokeWidth={2.4} />
              </div>
              <span className="showcase-feature-label">
                Payment<br />Tracking
              </span>
            </div>

            <div className="showcase-feature-item">
              <div className="showcase-feature-icon-box">
                <BarChart3 size={18} strokeWidth={2.4} />
              </div>
              <span className="showcase-feature-label">
                Reports &<br />Analytics
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: Sign In Form (Admin & Staff)
            ========================================================= */}
        <div className="login-form-column">
          <div className="login-form-inner">
            {/* Top Brand Logo */}
            <div className="login-form-brand-header">
              <div className="login-form-logo-box">
                <ShieldCheck size={26} strokeWidth={2.4} />
              </div>
              <div className="login-brand-title">
                Ashok Auto <span>Insurance</span>
              </div>
              <div className="login-brand-subtitle">
                INSURANCE MANAGEMENT PORTAL
              </div>
            </div>

            {/* Portal Switcher Tabs: Admin Portal vs Staff Portal */}
            <div className="login-portal-selector">
              <button
                type="button"
                className={`login-portal-pill-btn ${portalType === 'admin' ? 'active' : ''}`}
                onClick={() => handleSwitchPortal('admin')}
              >
                <ShieldCheck size={14} strokeWidth={2.4} />
                <span>Admin Portal</span>
              </button>
              <button
                type="button"
                className={`login-portal-pill-btn ${portalType === 'staff' ? 'active' : ''}`}
                onClick={() => handleSwitchPortal('staff')}
              >
                <Users size={14} strokeWidth={2.4} />
                <span>Staff Portal</span>
              </button>
            </div>

            {/* Title */}
            <div className="login-form-title-group">
              <h1 className="login-portal-title">
                {portalType === 'staff' ? 'Staff Portal Sign In' : 'Admin Portal Sign In'}
              </h1>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="login-error-banner">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="login-fields-container">
                {/* Email Field */}
                <div className="login-input-group">
                  <label className="login-field-label" htmlFor="portalEmail">
                    {portalType === 'staff' ? 'Staff Email ID' : 'Admin Email ID'}
                  </label>
                  <div className="login-input-shell">
                    <span className="login-input-leading-icon">
                      <Mail size={16} />
                    </span>
                    <input
                      id="portalEmail"
                      type="email"
                      className="login-native-input"
                      placeholder="Enter your email ID"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="login-input-group">
                  <label className="login-field-label" htmlFor="portalPassword">
                    Password
                  </label>
                  <div className="login-input-shell">
                    <span className="login-input-leading-icon">
                      <Lock size={16} />
                    </span>
                    <input
                      id="portalPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="login-native-input"
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
                      className="login-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="login-aux-row">
                  <label className="login-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="login-custom-checkbox"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    className="login-forgot-link"
                    onClick={() => {
                      if (portalType === 'staff') {
                        alert(
                          'Staff Default Credentials:\n• Email ID: staff@gmail.com\n• Password: Staff@123\n\nStored in Firestore "staff" collection.'
                        );
                      } else {
                        alert(
                          'Administrator Default Credentials:\n• Email ID: ashokinsurance@gmail.com\n• Password: Ashok@123\n\nStored in Firestore "admins" collection.'
                        );
                      }
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  className="login-cta-button"
                  disabled={isSubmitting || authLoading}
                >
                  {isSubmitting || authLoading ? (
                    <>
                      <Loader2 size={18} className="spin-animation" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={17} strokeWidth={2.4} />
                      <span>
                        {portalType === 'staff' ? 'Sign In as Staff' : 'Sign In to Dashboard'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
