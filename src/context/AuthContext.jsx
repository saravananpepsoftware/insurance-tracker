import React, { createContext, useContext, useState, useEffect } from 'react';
import { seedDefaultAdmin, seedDefaultStaff, loginUser } from '../firebase/authService';

const AuthContext = createContext(null);
const STORAGE_KEY = 'insuretrack_admin_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Seed default admin and staff in Firestore on app launch
  useEffect(() => {
    Promise.all([
      seedDefaultAdmin().catch(console.error),
      seedDefaultStaff().catch(console.error)
    ]);
  }, []);

  const login = async (email, password, portalType = 'admin') => {
    setLoading(true);
    try {
      const result = await loginUser(email, password, portalType);
      if (result.success && result.user) {
        setUser(result.user);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
        } catch (e) {
          console.warn('LocalStorage save failed:', e);
        }
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error || 'Invalid credentials' };
      }
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('LocalStorage remove failed:', e);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
