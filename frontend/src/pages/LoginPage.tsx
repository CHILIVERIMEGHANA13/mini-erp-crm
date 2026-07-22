import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Hexagon, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

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
        background: 'var(--bg-main)',
        backgroundImage: 'var(--bg-mesh)',
        backgroundSize: 'cover',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative ambient background blur orbs */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '20%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.15)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '20%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'rgba(6, 182, 212, 0.12)',
        filter: 'blur(90px)',
        pointerEvents: 'none',
      }} />

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px',
          padding: '40px',
          border: '1px solid var(--border-glow)',
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.4), 0 0 40px var(--primary-light)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
              borderRadius: '18px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '16px',
              boxShadow: 'var(--primary-glow)',
            }}
          >
            <Hexagon size={36} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 900,
            color: 'var(--text-main)',
            letterSpacing: '-0.03em',
          }}>
            APEX ERP Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Enterprise Mini ERP + CRM Operations Suite
          </p>
        </div>

        {error && (
          <div className="alert-banner alert-danger" style={{ marginBottom: '20px' }}>
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Role Logins Demo */}
        <div style={{
          marginBottom: '28px',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '16px',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'var(--text-muted)',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            <Sparkles size={14} style={{ color: 'var(--accent-amber)' }} />
            1-Click Quick Demo Login:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button type="button" onClick={() => handleQuickLogin('ADMIN')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', padding: '8px 12px' }}>
              <span className="badge badge-admin"><span className="badge-dot" />ADMIN</span>
            </button>
            <button type="button" onClick={() => handleQuickLogin('SALES')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', padding: '8px 12px' }}>
              <span className="badge badge-sales"><span className="badge-dot" />SALES</span>
            </button>
            <button type="button" onClick={() => handleQuickLogin('WAREHOUSE')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', padding: '8px 12px' }}>
              <span className="badge badge-warehouse"><span className="badge-dot" />WAREHOUSE</span>
            </button>
            <button type="button" onClick={() => handleQuickLogin('ACCOUNTS')} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', padding: '8px 12px' }}>
              <span className="badge badge-accounts"><span className="badge-dot" />ACCOUNTS</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '42px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '42px' }}
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
            style={{ width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: 700 }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Operations Portal'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
