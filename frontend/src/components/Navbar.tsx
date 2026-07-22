import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LogOut, ShieldAlert, UserCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickSwitchRole } = useAuth();

  if (!user) return null;

  const roleBadgeClass: Record<UserRole, string> = {
    ADMIN: 'badge-admin',
    SALES: 'badge-sales',
    WAREHOUSE: 'badge-warehouse',
    ACCOUNTS: 'badge-accounts',
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h3 style={{ fontSize: '1rem', color: '#334155' }}>Mini ERP & CRM Portal</h3>
        <span className={`badge ${roleBadgeClass[user.role]}`}>
          {user.role} ROLE
        </span>
      </div>

      {/* Demo Role Switcher Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Switch Role:</span>
          {(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => quickSwitchRole(r)}
              style={{
                border: 'none',
                background: user.role === r ? '#2563eb' : 'transparent',
                color: user.role === r ? '#ffffff' : '#475569',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.email}</div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Sign Out"
            style={{ color: '#ef4444' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
