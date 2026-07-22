import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardStats, Challan, Product } from '../types';
import { MetricsCard } from '../components/MetricsCard';
import { useAuth } from '../context/AuthContext';
import { Users, Package, FileText, AlertTriangle, IndianRupee, Plus, CheckCircle, ArrowUpRight, Sparkles, ShieldAlert, Zap } from 'lucide-react';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentChallans, setRecentChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, productsRes, challansRes] = await Promise.all([
        api.getStats(),
        api.getProducts('lowStock=true'),
        api.getChallans('limit=5'),
      ]);

      setStats(statsData);
      setLowStockProducts(productsRes.data || []);
      setRecentChallans(challansRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '36px', color: 'var(--text-muted)' }}>Loading Bento Operations Hub...</div>;
  }

  return (
    <div className="bento-grid">
      {/* 1. Hero Operations Command Banner (Span 12) */}
      <div className="bento-col-12 bento-hero-banner">
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '10px',
            border: '1px solid var(--border-glow)',
          }}>
            <Sparkles size={14} /> Enterprise Operations Hub
          </div>
          <h1 className="page-title" style={{ fontSize: '2.25rem', lineHeight: 1.1 }}>
            Welcome back, {user?.name}
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.95rem', marginTop: '6px', maxWidth: '600px' }}>
            Real-time wholesale CRM, stock allocation, and dispatch challan operations monitoring.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {['ADMIN', 'SALES'].includes(user?.role || '') && (
            <button onClick={() => setActiveTab('challans')} className="btn btn-primary" style={{ padding: '14px 24px', fontSize: '0.95rem' }}>
              <Plus size={18} /> New Sales Challan
            </button>
          )}
          <button onClick={() => setActiveTab('inventory')} className="btn btn-secondary" style={{ padding: '14px 20px' }}>
            <Zap size={18} style={{ color: 'var(--accent-amber)' }} /> Stock Status
          </button>
        </div>
      </div>

      {/* Low Stock Alert Ticker (Span 12 if active) */}
      {lowStockProducts.length > 0 && (
        <div className="bento-col-12 alert-banner alert-warning" style={{ marginBottom: 0 }}>
          <AlertTriangle size={24} className="pulse-icon" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--accent-amber)', fontWeight: 800, fontSize: '0.95rem' }}>
              CRITICAL INVENTORY ALERT:
            </strong>{' '}
            {lowStockProducts.length} product(s) are currently running below safety stock levels!
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="btn btn-secondary btn-sm"
            style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--accent-amber)' }}
          >
            Review Stock Items →
          </button>
        </div>
      )}

      {/* 2. Key Metrics Bento Row (Span 3 each) */}
      <div className="bento-col-3">
        <MetricsCard
          title="TOTAL REVENUE"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          subtitle="Confirmed Dispatched Sales"
          icon={IndianRupee}
          color="var(--accent-emerald)"
        />
      </div>
      <div className="bento-col-3">
        <MetricsCard
          title="ACTIVE ACCOUNTS"
          value={stats?.activeCustomers || 0}
          subtitle={`Out of ${stats?.totalCustomers || 0} Total Leads`}
          icon={Users}
          color="var(--primary)"
        />
      </div>
      <div className="bento-col-3">
        <MetricsCard
          title="PRODUCTS IN CATALOG"
          value={stats?.totalProducts || 0}
          subtitle={`${stats?.lowStockProducts || 0} Low Stock Alerts`}
          icon={Package}
          color="var(--accent-purple)"
        />
      </div>
      <div className="bento-col-3">
        <MetricsCard
          title="SALES CHALLANS"
          value={stats?.totalChallans || 0}
          subtitle={`${stats?.confirmedChallans || 0} Dispatched`}
          icon={FileText}
          color="var(--accent-amber)"
        />
      </div>

      {/* 3. Main Asymmetric Bento Row */}
      {/* Left: Recent Challans (Span 7) */}
      <div className="bento-col-7 bento-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Recent Dispatched Challans</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest generated sales delivery orders</p>
          </div>
          <button onClick={() => setActiveTab('challans')} className="btn btn-secondary btn-sm">
            View All Challans <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Challan #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentChallans.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '28px' }}>
                    No sales challans recorded yet.
                  </td>
                </tr>
              ) : (
                recentChallans.map((ch) => (
                  <tr key={ch.id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{ch.challanNumber}</td>
                    <td style={{ fontWeight: 600 }}>{ch.customerSnapshot?.businessName || ch.customerSnapshot?.name}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{ch.totalAmount.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${ch.status.toLowerCase()}`}>
                        <span className="badge-dot" />
                        {ch.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Low Stock Alert Inventory Bento (Span 5) */}
      <div className="bento-col-5 bento-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Stock Alert Feed</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Inventory below threshold</p>
          </div>
          <button onClick={() => setActiveTab('inventory')} className="btn btn-secondary btn-sm">
            Manage Stock <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>SKU / Product</th>
                <th>Stock</th>
                <th>Min Alert</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--accent-emerald)', fontWeight: 700, padding: '28px' }}>
                    <CheckCircle size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                    All stock levels are optimal!
                  </td>
                </tr>
              ) : (
                lowStockProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{p.sku}</div>
                    </td>
                    <td style={{ color: 'var(--accent-rose)', fontWeight: 800 }}>{p.currentStock} units</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.minStockAlert} units</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
