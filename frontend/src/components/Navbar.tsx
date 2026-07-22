import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LayoutDashboard, Users, Package, FileText, Hexagon, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'challans', label: 'Challans', icon: FileText },
  ];

  const roleBadgeClass: Record<UserRole, string> = {
    ADMIN: 'badge-admin',
    SALES: 'badge-sales',
    WAREHOUSE: 'badge-warehouse',
    ACCOUNTS: 'badge-accounts',
  };

  return (
    <header className="floating-command-dock">
      <div className="brand">
        <div className="brand-mark"><Hexagon size={20} /></div>
        <div>
          <div className="brand-name">Apex ERP</div>
          <div className="brand-eyebrow">Operations workspace</div>
        </div>
      </div>

      <nav className="top-nav" aria-label="Primary navigation">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}>
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <div>
          <div className="user-name">{user.name}</div>
          <span className={`badge ${roleBadgeClass[user.role]}`}>{user.role}</span>
        </div>
        <button onClick={logout} className="btn btn-secondary btn-sm" title="Sign out" aria-label="Sign out">
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};
