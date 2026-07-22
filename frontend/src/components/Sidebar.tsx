import React from 'react';
import { LayoutDashboard, Users, Package, FileText, Box } from 'lucide-react';

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
      <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ background: '#2563eb', padding: '8px', borderRadius: '8px', color: '#fff', display: 'flex' }}>
          <Box size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#f8fafc' }}>
            APEX ERP
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Wholesale Operations</div>
        </div>
      </div>

      <nav style={{ padding: '16px 8px', flex: 1 }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', padding: '0 12px 8px 12px', textTransform: 'uppercase' }}>
          Navigation
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
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#2563eb' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                marginBottom: '4px',
                transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid #1e293b', fontSize: '0.75rem', color: '#64748b' }}>
        Placement Drive Demo <br />
        <span style={{ color: '#10b981', fontWeight: 600 }}>● Full Stack Solution Ready</span>
      </div>
    </aside>
  );
};
