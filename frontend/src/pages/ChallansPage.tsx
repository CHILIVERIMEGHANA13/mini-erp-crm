import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Challan, Customer, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { generateChallanPDF } from '../services/pdf';
import { Plus, Search, FileText, Download, CheckCircle, XCircle, X, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';

export const ChallansPage: React.FC = () => {
  const { user } = useAuth();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [lineItems, setLineItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: '', quantity: 1 },
  ]);
  const [createError, setCreateError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal State
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);

  const canCreate = ['ADMIN', 'SALES'].includes(user?.role || '');
  const canUpdateStatus = ['ADMIN', 'SALES', 'ACCOUNTS'].includes(user?.role || '');

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter]);

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);

      const res = await api.getChallans(query.toString());
      setChallans(res.data || []);
    } catch (err) {
      console.error('Failed to load challans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = async () => {
    setCreateError('');
    setLineItems([{ productId: '', quantity: 1 }]);
    setSelectedCustomerId('');
    try {
      const [custRes, prodRes] = await Promise.all([
        api.getCustomers('status=Active'),
        api.getProducts(),
      ]);
      setCustomersList(custRes.data || []);
      setProductsList(prodRes.data || []);
      if (custRes.data?.length > 0) {
        setSelectedCustomerId(custRes.data[0].id);
      }
      setIsCreateModalOpen(true);
    } catch (err: any) {
      alert('Failed to load dropdown options');
    }
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: 'productId' | 'quantity', val: any) => {
    const updated = [...lineItems];
    if (field === 'quantity') {
      updated[index].quantity = Math.max(1, parseInt(val, 10) || 1);
    } else {
      updated[index].productId = val;
    }
    setLineItems(updated);
  };

  const handleCreateChallan = async (status: 'DRAFT' | 'CONFIRMED') => {
    setCreateError('');
    if (!selectedCustomerId) {
      setCreateError('Please select a customer.');
      return;
    }

    const validItems = lineItems.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      setCreateError('Please select at least one valid product.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createChallan({
        customerId: selectedCustomerId,
        items: validItems,
        status,
      });
      setIsCreateModalOpen(false);
      fetchChallans();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create sales challan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'CONFIRMED' | 'CANCELLED') => {
    try {
      await api.updateChallanStatus(id, status);
      if (selectedChallan && selectedChallan.id === id) {
        const updated = await api.getChallanById(id);
        setSelectedChallan(updated);
      }
      fetchChallans();
    } catch (err: any) {
      alert(err.message || `Failed to set status to ${status}`);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Sales Challans & Invoices</h1>
          <p className="page-subtitle">Generate dispatch notes, validate stock fulfillment, and export PDF invoices.</p>
        </div>

        {canCreate && (
          <button onClick={handleOpenCreateModal} className="btn btn-primary">
            <Plus size={16} /> Create Sales Challan
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by challan #, customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="DRAFT">DRAFT</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Challans Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Challan #</th>
              <th>Customer / Firm</th>
              <th>Items Qty</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Date Issued</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8' }}>Loading challan documents...</td>
              </tr>
            ) : challans.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8' }}>No challans found.</td>
              </tr>
            ) : (
              challans.map((ch) => (
                <tr key={ch.id}>
                  <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{ch.challanNumber}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {ch.customerSnapshot?.businessName || ch.customerSnapshot?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ch.customerSnapshot?.email}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{ch.totalQuantity} units</td>
                  <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>₹{ch.totalAmount.toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${ch.status.toLowerCase()}`}>
                      <span className="badge-dot" />
                      {ch.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {new Date(ch.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setSelectedChallan(ch)} className="btn btn-secondary btn-sm">
                        View Detail
                      </button>
                      <button onClick={() => generateChallanPDF(ch)} className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-emerald)' }}>
                        <Download size={14} /> PDF Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Sales Challan Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div>
                <h3>Create New Sales Challan</h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  Auto-generates serial number. Stock validates automatically upon confirmation.
                </p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {createError && (
              <div className="alert-banner alert-danger">
                <AlertCircle size={18} />
                <span>{createError}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Select Customer Account *</label>
              <select
                className="form-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {customersList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} ({c.name} - {c.type})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label">Challan Line Items *</label>
                <button type="button" onClick={handleAddLineItem} className="btn btn-secondary btn-sm">
                  <Plus size={14} /> Add Line Item
                </button>
              </div>

              {lineItems.map((item, index) => {
                const prod = productsList.find((p) => p.id === item.productId);
                const lineTotal = prod ? prod.unitPrice * item.quantity : 0;
                return (
                  <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }}>
                    <select
                      className="form-select"
                      style={{ flex: 2 }}
                      value={item.productId}
                      onChange={(e) => handleLineItemChange(index, 'productId', e.target.value)}
                    >
                      <option value="">-- Select Product --</option>
                      {productsList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name} (Stock: {p.currentStock}) - ₹{p.unitPrice}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      style={{ width: '90px' }}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                    />

                    <div style={{ width: '110px', fontWeight: 700, fontSize: '0.875rem', textAlign: 'right' }}>
                      ₹{lineTotal.toLocaleString()}
                    </div>

                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(index)}
                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreateChallan('DRAFT')}
                disabled={submitting}
                className="btn btn-secondary"
                style={{ color: '#d97706' }}
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleCreateChallan('CONFIRMED')}
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? 'Validating Stock...' : 'Confirm & Deduct Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challan Detail Modal */}
      {selectedChallan && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{selectedChallan.challanNumber}</h3>
                <span className={`badge badge-${selectedChallan.status.toLowerCase()}`}>
                  <span className="badge-dot" />
                  {selectedChallan.status}
                </span>
              </div>
              <button onClick={() => setSelectedChallan(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="grid-cols-2" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Billed Customer</div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selectedChallan.customerSnapshot.businessName}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{selectedChallan.customerSnapshot.name}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{selectedChallan.customerSnapshot.mobile}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Challan Info</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>Created By: <strong>{selectedChallan.createdBy}</strong></div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>Date: <strong>{new Date(selectedChallan.createdAt).toLocaleString()}</strong></div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="table-container" style={{ marginBottom: '20px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedChallan.items.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.productSnapshot.name}</td>
                      <td>{item.productSnapshot.sku}</td>
                      <td style={{ fontWeight: 700 }}>{item.quantity}</td>
                      <td>₹{item.unitPrice.toLocaleString()}</td>
                      <td style={{ fontWeight: 800 }}>₹{item.lineTotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <div>
                {canUpdateStatus && selectedChallan.status === 'DRAFT' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedChallan.id, 'CONFIRMED')}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckCircle size={14} /> Confirm & Deduct Stock
                  </button>
                )}
                {canUpdateStatus && selectedChallan.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedChallan.id, 'CANCELLED')}
                    className="btn btn-danger btn-sm"
                  >
                    <XCircle size={14} /> Cancel & Restock
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => generateChallanPDF(selectedChallan)} className="btn btn-secondary">
                  <Download size={16} /> Download PDF
                </button>
                <button onClick={() => setSelectedChallan(null)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
