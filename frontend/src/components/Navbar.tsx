import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LogOut, Palette, Shield, User } from 'lucide-react';

interface NavbarProps {
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTheme = 'cyber-obsidian', onThemeChange }) => {
  const { user, logout, quickSwitchRole } = useAuth();
  const [activeTheme, setActiveTheme] = useState(currentTheme);

  useEffect(() => {
    setActiveTheme(currentTheme);
  }, [currentTheme]);

  if (!user) return null;

  const roleBadgeClass: Record<UserRole, string> = {
    ADMIN: 'badge-admin',
    SALES: 'badge-sales',
    WAREHOUSE: 'badge-warehouse',
    ACCOUNTS: 'badge-accounts',
  };

  const themes = [
    { id: 'cyber-obsidian', label: 'Cyber', icon: '🌌' },
    { id: 'aurora-nebula', label: 'Aurora', icon: '🔮' },
    { id: 'emerald-matrix', label: 'Emerald', icon: '🐉' },
    { id: 'titanium-lux', label: 'Titanium', icon: '⚡' },
  ];

  const handleThemeSelect = (themeId: string) => {
    setActiveTheme(themeId);
    if (onThemeChange) {
      onThemeChange(themeId);
    } else {
      document.documentElement.setAttribute('data-theme', themeId);
      localStorage.setItem('apex_erp_theme', themeId);
    }
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
          Mini ERP & CRM
        </h3>
        <span className={`badge ${roleBadgeClass[user.role]}`}>
          <span className="badge-dot" />
          {user.role} ROLE
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Dynamic Theme Engine Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px 8px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
        }}>
          <Palette size={14} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Attire:
          </span>
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeSelect(t.id)}
              style={{
                border: 'none',
                background: activeTheme === t.id ? 'var(--primary)' : 'transparent',
                color: activeTheme === t.id ? '#ffffff' : 'var(--text-muted)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTheme === t.id ? 'var(--primary-glow)' : 'none',
              }}
              title={`Switch to ${t.label} theme`}
            >
              <span style={{ marginRight: '4px' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Demo Role Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '4px 8px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
        }}>
          <Shield size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Role:
          </span>
          {(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => quickSwitchRole(r)}
              style={{
                border: 'none',
                background: user.role === r ? 'var(--primary-light)' : 'transparent',
                color: user.role === r ? 'var(--primary)' : 'var(--text-muted)',
                outline: user.role === r ? '1px solid var(--primary)' : 'none',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* User Profile Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px', borderLeft: '1px solid var(--border-color)' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.85rem',
            boxShadow: 'var(--primary-glow)',
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{user.name}</div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{user.email}</div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Sign Out"
            style={{ padding: '6px 10px', color: 'var(--accent-rose)' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
