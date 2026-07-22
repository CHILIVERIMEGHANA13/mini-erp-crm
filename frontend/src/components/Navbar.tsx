import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LayoutDashboard, Users, Package, FileText, Hexagon, Palette, Shield, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentTheme = 'cyber-obsidian',
  onThemeChange,
}) => {
  const { user, logout, quickSwitchRole } = useAuth();
  const [activeTheme, setActiveTheme] = useState(currentTheme);

  useEffect(() => {
    setActiveTheme(currentTheme);
  }, [currentTheme]);

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'customers', label: 'Customer CRM', icon: Users },
    { id: 'inventory', label: 'Products & Stock', icon: Package },
    { id: 'challans', label: 'Sales Challans', icon: FileText },
  ];

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

  const roleBadgeClass: Record<UserRole, string> = {
    ADMIN: 'badge-admin',
    SALES: 'badge-sales',
    WAREHOUSE: 'badge-warehouse',
    ACCOUNTS: 'badge-accounts',
  };

  return (
    <header className="floating-command-dock">
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: 'var(--primary-glow)',
        }}>
          <Hexagon size={22} />
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 900,
            fontSize: '1.1rem',
            letterSpacing: '-0.03em',
            color: 'var(--text-main)',
            lineHeight: 1.1,
          }}>
            APEX
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
            ● OPERATIONS
          </div>
        </div>
      </div>

      {/* Floating Center Navigation Tabs */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(0, 0, 0, 0.25)',
        padding: '5px',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                border: 'none',
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? 'var(--primary-glow)' : 'none',
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Action Controls: Theme Switcher + Role + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Attire Engine */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '3px 6px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
        }}>
          <Palette size={14} style={{ color: 'var(--primary)', marginLeft: '4px' }} />
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeSelect(t.id)}
              style={{
                border: 'none',
                background: activeTheme === t.id ? 'var(--primary-light)' : 'transparent',
                color: activeTheme === t.id ? 'var(--primary)' : 'var(--text-muted)',
                outline: activeTheme === t.id ? '1px solid var(--primary)' : 'none',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={`Switch layout theme to ${t.label}`}
            >
              <span style={{ marginRight: '3px' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Demo Role Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '3px 6px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
        }}>
          <Shield size={14} style={{ color: 'var(--accent-cyan)', marginLeft: '4px' }} />
          {(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => quickSwitchRole(r)}
              style={{
                border: 'none',
                background: user.role === r ? 'var(--primary)' : 'transparent',
                color: user.role === r ? '#ffffff' : 'var(--text-muted)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Profile Chip & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={`badge ${roleBadgeClass[user.role]}`}>
            <span className="badge-dot" />
            {user.role}
          </span>
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
