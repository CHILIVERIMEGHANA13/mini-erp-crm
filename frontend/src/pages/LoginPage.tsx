import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Box, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickSwitchRole } = useAuth();
  const [email, setEmail] = useState('admin@minierp.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setError('');
    setLoading(true);
    try {
      await quickSwitchRole(role);
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: '#2563eb',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '12px',
            }}
          >
            <Box size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>APEX ERP Portal</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Full-Stack Mini ERP + CRM Operations Portal
          </p>
        </div>

        {error && (
          <div className="alert-banner alert-danger" style={{ marginBottom: '16px' }}>
            <span>{error}</span>
          </div>
        )}

        {/* Preset Quick Demo Logins */}
        <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} color="#2563eb" /> 1-Click Role Login Demo:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button type="button" onClick={() => handleQuickLogin('ADMIN')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
              <span className="badge badge-admin">ADMIN</span>
            </button>
            <button type="button" onClick={() => handleQuickLogin('SALES')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
              <span className="badge badge-sales">SALES</span>
            </button>
            <button type="button" onClick={() => handleQuickLogin('WAREHOUSE')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
              <span className="badge badge-warehouse">WAREHOUSE</span>
            </button>
            <button type="button" onClick={() => handleQuickLogin('ACCOUNTS')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
              <span className="badge badge-accounts">ACCOUNTS</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: '0.9375rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
