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
    return <div style={{ padding: '24px', color: '#64748b' }}>Loading dashboard summary...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Operations Overview</h1>
          <p className="page-subtitle">Welcome back, {user?.name}. Here is your enterprise summary.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {['ADMIN', 'SALES'].includes(user?.role || '') && (
            <button onClick={() => setActiveTab('challans')} className="btn btn-primary">
              <Plus size={16} /> New Sales Challan
            </button>
          )}
        </div>
      </div>

      {/* Low Stock Warning Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className="alert-banner alert-warning">
          <AlertTriangle size={20} />
          <div>
            <strong>Low Inventory Warning:</strong> {lowStockProducts.length} product(s) have stock levels below their minimum alert threshold!
            <button
              onClick={() => setActiveTab('inventory')}
              style={{ marginLeft: '12px', background: 'none', border: 'none', color: '#92400e', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}
            >
              View Inventory Alert List →
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
        <MetricsCard
          title="TOTAL REVENUE"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          subtitle="Confirmed Challans"
          icon={IndianRupee}
          color="#059669"
        />
        <MetricsCard
          title="ACTIVE CUSTOMERS"
          value={stats?.activeCustomers || 0}
          subtitle={`Out of ${stats?.totalCustomers || 0} Total`}
          icon={Users}
          color="#2563eb"
        />
        <MetricsCard
          title="INVENTORY ITEMS"
          value={stats?.totalProducts || 0}
          subtitle={`${stats?.lowStockProducts || 0} Low Stock Alerts`}
          icon={Package}
          color="#7c3aed"
        />
        <MetricsCard
          title="TOTAL CHALLANS"
          value={stats?.totalChallans || 0}
          subtitle={`${stats?.confirmedChallans || 0} Confirmed`}
          icon={FileText}
          color="#d97706"
        />
      </div>

      {/* Main Grid: Recent Challans & Low Stock Alert List */}
      <div className="grid-cols-2">
        {/* Recent Challans */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Recent Sales Challans</h3>
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
                    <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8' }}>No challans generated yet.</td>
                  </tr>
                ) : (
                  recentChallans.map((ch) => (
                    <tr key={ch.id}>
                      <td style={{ fontWeight: 700, color: '#2563eb' }}>{ch.challanNumber}</td>
                      <td>{ch.customerSnapshot?.businessName || ch.customerSnapshot?.name}</td>
                      <td style={{ fontWeight: 600 }}>₹{ch.totalAmount.toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-${ch.status.toLowerCase()}`}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Low Stock Inventory Alerts</h3>
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
                  <th>Current Stock</th>
                  <th>Min Alert</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: '#10b981', fontWeight: 600 }}>
                      <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                      All inventory stock levels are healthy!
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.sku}</td>
                      <td>{p.name}</td>
                      <td style={{ color: '#dc2626', fontWeight: 800 }}>{p.currentStock} units</td>
                      <td style={{ color: '#64748b' }}>{p.minStockAlert} units</td>
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
