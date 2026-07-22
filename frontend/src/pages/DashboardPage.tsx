import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardStats, Challan, Product } from '../types';
import { MetricsCard } from '../components/MetricsCard';
import { useAuth } from '../context/AuthContext';
import { Users, Package, FileText, AlertTriangle, IndianRupee, Plus, CheckCircle, ArrowUpRight } from 'lucide-react';

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
    return <div style={{ padding: '28px', color: 'var(--text-muted)' }}>Loading operational metrics...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">Operations Control Center</h1>
          <p className="page-subtitle">Welcome back, {user?.name}. Here is your live enterprise summary.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {['ADMIN', 'SALES'].includes(user?.role || '') && (
            <button onClick={() => setActiveTab('challans')} className="btn btn-primary">
              <Plus size={18} /> New Sales Challan
            </button>
          )}
        </div>
      </div>

      {/* Low Stock Warning Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className="alert-banner alert-warning">
          <AlertTriangle size={22} className="pulse-icon" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--accent-amber)', fontWeight: 800 }}>Low Inventory Alert:</strong>{' '}
            {lowStockProducts.length} product(s) are below safety threshold levels!
            <button
              onClick={() => setActiveTab('inventory')}
              style={{
                marginLeft: '14px',
                background: 'none',
                border: 'none',
                color: 'var(--accent-amber)',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.875rem',
              }}
            >
              Resolve Inventory Alerts →
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid-cols-4" style={{ marginBottom: '28px' }}>
        <MetricsCard
          title="TOTAL REVENUE"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          subtitle="Confirmed Sales Challans"
          icon={IndianRupee}
          color="var(--accent-emerald)"
        />
        <MetricsCard
          title="ACTIVE CUSTOMERS"
          value={stats?.activeCustomers || 0}
          subtitle={`Out of ${stats?.totalCustomers || 0} Total Leads`}
          icon={Users}
          color="var(--primary)"
        />
        <MetricsCard
          title="INVENTORY CATALOG"
          value={stats?.totalProducts || 0}
          subtitle={`${stats?.lowStockProducts || 0} Low Stock Alerts`}
          icon={Package}
          color="var(--accent-purple)"
        />
        <MetricsCard
          title="TOTAL CHALLANS"
          value={stats?.totalChallans || 0}
          subtitle={`${stats?.confirmedChallans || 0} Dispatched & Confirmed`}
          icon={FileText}
          color="var(--accent-amber)"
        />
      </div>

      {/* Main Grid: Recent Challans & Low Stock Alert List */}
      <div className="grid-cols-2">
        {/* Recent Challans Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>Recent Sales Challans</h3>
            <button onClick={() => setActiveTab('challans')} className="btn btn-secondary btn-sm">
              View All <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentChallans.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No challans generated yet.</td>
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

        {/* Low Stock Items Alert Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>Low Stock Stock List</h3>
            <button onClick={() => setActiveTab('inventory')} className="btn btn-secondary btn-sm">
              Manage Stock <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Stock</th>
                  <th>Min Alert</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--accent-emerald)', fontWeight: 700, padding: '24px' }}>
                      <CheckCircle size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                      All inventory stock levels are healthy!
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{p.sku}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
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
    </div>
  );
};
