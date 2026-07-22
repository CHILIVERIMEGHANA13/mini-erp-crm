import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product, StockMovement } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, AlertTriangle, ArrowDownRight, ArrowUpRight, History, Package, X, Check } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isMovementsModalOpen, setIsMovementsModalOpen] = useState(false);

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Networking',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 5,
    location: 'Main Warehouse',
    imageUrl: '',
  });

  // Stock Adjust Form State
  const [adjustData, setAdjustData] = useState({
    quantity: 1,
    movementType: 'IN' as 'IN' | 'OUT',
    reason: 'Restock shipment received',
  });

  const canEdit = ['ADMIN', 'WAREHOUSE'].includes(user?.role || '');

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, lowStockOnly]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (categoryFilter) query.append('category', categoryFilter);
      if (lowStockOnly) query.append('lowStock', 'true');

      const res = await api.getProducts(query.toString());
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: 'Networking',
      unitPrice: 1000,
      currentStock: 10,
      minStockAlert: 5,
      location: 'Rack A-01, Main Warehouse',
      imageUrl: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitPrice: p.unitPrice,
      currentStock: p.currentStock,
      minStockAlert: p.minStockAlert,
      location: p.location,
      imageUrl: p.imageUrl || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setIsAddModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleOpenAdjust = (p: Product) => {
    setAdjustingProduct(p);
    setAdjustData({
      quantity: 5,
      movementType: 'IN',
      reason: 'Vendor Stock Inward Receipt',
    });
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    try {
      await api.adjustStock(adjustingProduct.id, adjustData);
      setAdjustingProduct(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to adjust stock');
    }
  };

  const handleViewMovements = async () => {
    try {
      const data = await api.getStockMovements();
      setMovements(data || []);
      setIsMovementsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Product & Stock Inventory</h1>
          <p className="page-subtitle">Track warehouse stock levels, low-stock thresholds, and stock movements.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleViewMovements} className="btn btn-secondary">
            <History size={16} /> Movement Audit Log
          </button>
          {canEdit && (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={16} /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search SKU, product name, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Networking">Networking</option>
          <option value="Cabling">Cabling</option>
          <option value="Power Supply">Power Supply</option>
          <option value="Hardware">Hardware</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
          />
          Show Low Stock Warnings Only
        </label>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Current Stock</th>
              <th>Warehouse Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8' }}>Loading product catalog...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8' }}>No products found.</td>
              </tr>
            ) : (
              products.map((p) => {
                const isLowStock = p.currentStock <= p.minStockAlert;
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{p.sku}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{p.category}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{p.unitPrice.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: isLowStock ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontSize: '0.9375rem' }}>
                          {p.currentStock} units
                        </span>
                        {isLowStock && (
                          <span className="badge badge-cancelled" title={`Below alert min of ${p.minStockAlert}`}>
                            <span className="badge-dot" />
                            LOW
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Min Alert: {p.minStockAlert}</div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{p.location}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {canEdit && (
                          <>
                            <button onClick={() => handleOpenAdjust(p)} className="btn btn-secondary btn-sm" style={{ color: 'var(--primary)' }}>
                              Adjust Stock
                            </button>
                            <button onClick={() => handleOpenEdit(p)} className="btn btn-secondary btn-sm">
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product Item' : 'Add New Product to Inventory'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SKU / Item Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    disabled={!!editingProduct}
                    required
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Selling Price (INR ₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Current Stock Quantity *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value, 10) || 0 })}
                    disabled={!!editingProduct} // Edits should use Stock Adjustment flow
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Minimum Stock Alert Threshold *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value, 10) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Bin / Shelf Location *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ color: 'var(--text-main)' }}>Stock Level Adjustment</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{adjustingProduct.name} ({adjustingProduct.sku})</p>
              </div>
              <button onClick={() => setAdjustingProduct(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.875rem', border: '1px solid var(--border-color)' }}>
                Current Stock on Hand: <strong style={{ color: 'var(--primary)' }}>{adjustingProduct.currentStock} units</strong>
              </div>

              <div className="form-group">
                <label className="form-label">Movement Type *</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '10px', cursor: 'pointer', background: adjustData.movementType === 'IN' ? 'rgba(16, 185, 129, 0.15)' : 'var(--input-bg)' }}>
                    <input
                      type="radio"
                      name="movType"
                      checked={adjustData.movementType === 'IN'}
                      onChange={() => setAdjustData({ ...adjustData, movementType: 'IN' })}
                    />
                    <ArrowDownRight size={16} style={{ color: 'var(--accent-emerald)' }} /> <strong>Stock IN</strong>
                  </label>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '10px', cursor: 'pointer', background: adjustData.movementType === 'OUT' ? 'rgba(244, 63, 94, 0.15)' : 'var(--input-bg)' }}>
                    <input
                      type="radio"
                      name="movType"
                      checked={adjustData.movementType === 'OUT'}
                      onChange={() => setAdjustData({ ...adjustData, movementType: 'OUT' })}
                    />
                    <ArrowUpRight size={16} style={{ color: 'var(--accent-rose)' }} /> <strong>Stock OUT</strong>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity to Change *</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={adjustData.quantity}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity: parseInt(e.target.value, 10) || 1 })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Audit Reason / Justification *</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  placeholder="e.g. Vendor supply received, Damaged unit removal, Physical audit reconciliation..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setAdjustingProduct(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movements History Audit Modal */}
      {isMovementsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>Inventory Stock Movement Audit Log</h3>
              <button onClick={() => setIsMovementsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Reason</th>
                    <th>Log By</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>{m.product?.name} ({m.product?.sku})</td>
                      <td>
                        <span className={`badge ${m.movementType === 'IN' ? 'badge-confirmed' : 'badge-cancelled'}`}>
                          {m.movementType === 'IN' ? 'IN (+)' : 'OUT (-)'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800 }}>{m.quantity}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{m.reason}</td>
                      <td style={{ fontSize: '0.75rem', color: '#475569' }}>{m.createdBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setIsMovementsModalOpen(false)} className="btn btn-secondary">
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
