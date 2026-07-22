import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { InventoryPage } from './pages/InventoryPage';
import { ChallansPage } from './pages/ChallansPage';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('apex_erp_theme') || 'cyber-obsidian';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('apex_erp_theme', theme);
  }, [theme]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-heading)',
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--primary)',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px',
        }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Initializing Apex Command Canvas...</h2>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      {/* Floating Executive Command Dock Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTheme={theme}
        onThemeChange={setTheme}
      />

      {/* Full-Width Canvas Workspace */}
      <main className="main-canvas">
        {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
        {activeTab === 'customers' && <CustomersPage />}
        {activeTab === 'inventory' && <InventoryPage />}
        {activeTab === 'challans' && <ChallansPage />}
      </main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
