import React from 'react';
import { LayoutDashboard, Users, Package, FileText, Hexagon, Zap } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customer CRM', icon: Users },
    { id: 'inventory', label: 'Products & Stock', icon: Package },
    { id: 'challans', label: 'Sales Challans', icon: FileText },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: 'var(--primary-glow)',
        }}>
          <Hexagon size={24} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
        </div>
        <div className="hide-mobile">
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 900,
            fontSize: '1.2rem',
            letterSpacing: '-0.03em',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            APEX ERP
            <span style={{
              fontSize: '0.625rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              border: '1px solid var(--border-glow)',
            }}>
              PRO
            </span>
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            Wholesale Operations
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '20px 12px', flex: 1 }}>
        <div className="hide-mobile" style={{
          fontSize: '0.6875rem',
          fontWeight: 800,
          color: 'var(--text-muted)',
          padding: '0 12px 12px 12px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Navigation Portal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: isActive ? 'var(--border-glow)' : 'transparent',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginBottom: '6px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                textAlign: 'left',
                position: 'relative',
                boxShadow: isActive ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {/* Active Tab Accent Bar */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: '0',
                  top: '15%',
                  bottom: '15%',
                  width: '4px',
                  borderRadius: '0 4px 4px 0',
                  background: 'var(--primary)',
                  boxShadow: 'var(--primary-glow)',
                }} />
              )}
              <Icon size={20} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.2s ease' }} />
              <span className="hide-mobile">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info Badge */}
      <div className="hide-mobile" style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        background: 'rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
          <Zap size={14} style={{ color: 'var(--accent-amber)' }} />
          Apex Operations Hub
        </div>
        <div style={{ fontSize: '0.725rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
          ● Enterprise Ready System
        </div>
      </div>
    </aside>
  );
};
