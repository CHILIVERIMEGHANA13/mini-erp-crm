import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Customer, CustomerNote } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, User, Phone, Mail, Building, FileText, Calendar, Clock, X, MessageSquarePlus } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals / Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteFollowUp, setNewNoteFollowUp] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    type: 'Wholesale' as 'Retail' | 'Wholesale' | 'Distributor',
    address: '',
    status: 'Lead' as 'Lead' | 'Active' | 'Inactive',
    followUpDate: '',
    notes: '',
  });

  const canEdit = ['ADMIN', 'SALES'].includes(user?.role || '');

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, typeFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);
      if (typeFilter) query.append('type', typeFilter);

      const res = await api.getCustomers(query.toString());
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      type: 'Wholesale',
      address: '',
      status: 'Lead',
      followUpDate: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email,
      businessName: customer.businessName,
      gstNumber: customer.gstNumber || '',
      type: customer.type,
      address: customer.address,
      status: customer.status,
      followUpDate: customer.followUpDate || '',
      notes: customer.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, formData);
      } else {
        await api.createCustomer(formData);
      }
      setIsAddModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to save customer');
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      const detailed = await api.getCustomerById(id);
      setSelectedCustomer(detailed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNoteText.trim()) return;

    try {
      await api.addFollowUpNote(selectedCustomer.id, {
        note: newNoteText,
        followUpDate: newNoteFollowUp || undefined,
      });
      setNewNoteText('');
      setNewNoteFollowUp('');
      handleViewDetail(selectedCustomer.id);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to add follow-up note');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Customer CRM Directory</h1>
          <p className="page-subtitle">Manage wholesale accounts, leads, and follow-up communications.</p>
        </div>

        {canEdit && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Add New Customer
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by name, mobile, email, GST, or business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '160px' }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Account Types</option>
          <option value="Retail">Retail</option>
          <option value="Wholesale">Wholesale</option>
          <option value="Distributor">Distributor</option>
        </select>

        <select
          className="form-select"
          style={{ width: '160px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Lead">Lead</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Contact Person</th>
              <th>Type</th>
              <th>Status</th>
              <th>Follow-up Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>Loading customer list...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>No customers found.</td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.businessName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {c.gstNumber ? `GST: ${c.gstNumber}` : 'No GST provided'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.mobile} • {c.email}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>
                      {c.type}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${c.status.toLowerCase()}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.followUpDate ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: '#2563eb', fontWeight: 600 }}>
                        <Calendar size={14} />
                        {c.followUpDate}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>None</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleViewDetail(c.id)} className="btn btn-secondary btn-sm">
                        View Details
                      </button>
                      {canEdit && (
                        <button onClick={() => handleOpenEdit(c)} className="btn btn-secondary btn-sm">
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Customer Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCustomer ? 'Edit Customer Record' : 'Add New Customer'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer}>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Contact Person Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Business / Firm Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">GST Number (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    placeholder="e.g. 27AAACA12341ZV"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Type *</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="Lead">Lead</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Next Follow-Up Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Office / Shipping Address *</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              {!editingCustomer && (
                <div className="form-group">
                  <label className="form-label">Initial Notes / Observations</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail & Timeline Drawer */}
      {selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>{selectedCustomer.businessName}</h3>
                <span className={`badge badge-${selectedCustomer.status.toLowerCase()}`} style={{ marginTop: '4px' }}>
                  {selectedCustomer.status} • {selectedCustomer.type}
                </span>
              </div>
              <button onClick={() => setSelectedCustomer(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="grid-cols-2" style={{ marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Contact Person</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedCustomer.name}</div>
                <div style={{ fontSize: '0.8125rem', color: '#475569' }}>📞 {selectedCustomer.mobile}</div>
                <div style={{ fontSize: '0.8125rem', color: '#475569' }}>✉️ {selectedCustomer.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>GSTIN Number</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedCustomer.gstNumber || 'N/A'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>Address</div>
                <div style={{ fontSize: '0.8125rem', color: '#475569' }}>{selectedCustomer.address}</div>
              </div>
            </div>

            {/* Follow-Up Timeline Section */}
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquarePlus size={18} color="#2563eb" /> CRM Follow-Up Timeline & Notes
              </h4>

              {canEdit && (
                <form onSubmit={handleAddNote} style={{ marginBottom: '20px', background: '#ffffff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="Add follow-up notes, client request, meeting feedback..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Next Follow-Up Date:</span>
                      <input
                        type="date"
                        className="form-input"
                        style={{ width: '160px', padding: '4px 8px', fontSize: '0.75rem' }}
                        value={newNoteFollowUp}
                        onChange={(e) => setNewNoteFollowUp(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Post Follow-Up Note
                    </button>
                  </div>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                {selectedCustomer.customerNotes?.length === 0 ? (
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center', padding: '12px' }}>No notes logged yet.</div>
                ) : (
                  selectedCustomer.customerNotes?.map((note: CustomerNote) => (
                    <div key={note.id} style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: '#334155' }}>{note.createdBy}</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{note.note}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setSelectedCustomer(null)} className="btn btn-secondary">
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
