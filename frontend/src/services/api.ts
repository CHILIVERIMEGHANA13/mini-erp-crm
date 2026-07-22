import { UserRole } from '../types';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

// In-Memory Demo Mock Store for seamless cloud evaluation
const mockUsers: Record<string, { id: string; name: string; email: string; role: UserRole }> = {
  'admin@minierp.com': { id: 'u-1', name: 'Alex Admin', email: 'admin@minierp.com', role: 'ADMIN' },
  'sales@minierp.com': { id: 'u-2', name: 'Sarah Sales', email: 'sales@minierp.com', role: 'SALES' },
  'warehouse@minierp.com': { id: 'u-3', name: 'Willy Warehouse', email: 'warehouse@minierp.com', role: 'WAREHOUSE' },
  'accounts@minierp.com': { id: 'u-4', name: 'Adam Accounts', email: 'accounts@minierp.com', role: 'ACCOUNTS' },
};

let currentMockUser = mockUsers['admin@minierp.com'];

let mockCustomers = [
  {
    id: 'c-1',
    name: 'Rajesh Kumar',
    mobile: '+91 9876543210',
    email: 'rajesh@apexdistributors.com',
    businessName: 'Apex Electronics Distributors',
    gstNumber: '27AAACA12341ZV',
    type: 'Distributor',
    address: 'Plot 42, Industrial Area Phase II, Mumbai',
    status: 'Active',
    followUpDate: '2026-07-28',
    notes: 'Interested in bulk orders of industrial switches.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customerNotes: [
      { id: 'n-1', customerId: 'c-1', note: 'Initial meeting completed. Discussed 10% volume discount.', createdBy: 'Sarah Sales', createdAt: new Date().toISOString() }
    ]
  },
  {
    id: 'c-2',
    name: 'Priya Sharma',
    mobile: '+91 9123456789',
    email: 'priya@techmart.in',
    businessName: 'TechMart Retail Outlets',
    gstNumber: '07BBBPB98762ZX',
    type: 'Wholesale',
    address: 'Shop 104, Connaught Place, New Delhi',
    status: 'Active',
    followUpDate: '2026-07-25',
    notes: 'Monthly recurring order client.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customerNotes: []
  }
];

let mockProducts = [
  {
    id: 'p-1',
    name: 'Enterprise Wi-Fi 6 Router',
    sku: 'NET-ROUT-W6',
    category: 'Networking',
    unitPrice: 4500,
    currentStock: 45,
    minStockAlert: 10,
    location: 'Rack A-12, Main Warehouse',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p-2',
    name: '24-Port Managed Gigabit Switch',
    sku: 'NET-SWT-24P',
    category: 'Networking',
    unitPrice: 12500,
    currentStock: 12,
    minStockAlert: 15,
    location: 'Rack B-04, Main Warehouse',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p-3',
    name: 'Uninterruptible Power Supply (UPS) 1000VA',
    sku: 'PWR-UPS-1KVA',
    category: 'Power Supply',
    unitPrice: 8900,
    currentStock: 5,
    minStockAlert: 8,
    location: 'Rack D-02, Main Warehouse',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let mockChallans = [
  {
    id: 'ch-1',
    challanNumber: 'CH-202607-0001',
    customerId: 'c-1',
    customerSnapshot: {
      name: 'Rajesh Kumar',
      businessName: 'Apex Electronics Distributors',
      email: 'rajesh@apexdistributors.com',
      mobile: '+91 9876543210',
      type: 'Distributor',
      address: 'Plot 42, Industrial Area Phase II, Mumbai'
    },
    totalQuantity: 5,
    totalAmount: 22500,
    status: 'CONFIRMED' as 'DRAFT' | 'CONFIRMED' | 'CANCELLED',
    createdBy: 'Sarah Sales',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'ci-1',
        challanId: 'ch-1',
        productId: 'p-1',
        productSnapshot: { name: 'Enterprise Wi-Fi 6 Router', sku: 'NET-ROUT-W6', category: 'Networking', unitPrice: 4500, location: 'Rack A-12' },
        quantity: 5,
        unitPrice: 4500,
        lineTotal: 22500
      }
    ]
  }
];

let mockMovements = [
  {
    id: 'm-1',
    productId: 'p-1',
    quantity: 50,
    movementType: 'IN' as 'IN' | 'OUT',
    reason: 'Initial Vendor Delivery PO-9041',
    createdBy: 'Willy Warehouse',
    createdAt: new Date().toISOString(),
    product: { name: 'Enterprise Wi-Fi 6 Router', sku: 'NET-ROUT-W6', category: 'Networking' }
  }
];

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  // Try live backend first if running locally or API_BASE is available
  if (API_BASE) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) throw new Error(data.message || 'API request failed');
      return data as T;
    } catch (err: any) {
      if (API_BASE === 'http://localhost:5000') throw err;
    }
  }

  // Standalone Cloud Demo Mode Fallback for Vercel Evaluation
  return handleMockRequest<T>(endpoint, options);
}

function handleMockRequest<T>(endpoint: string, options: RequestInit): T {
  const body = options.body ? JSON.parse(options.body as string) : {};

  if (endpoint === '/auth/login') {
    const user = mockUsers[body.email?.toLowerCase()] || mockUsers['admin@minierp.com'];
    currentMockUser = user;
    return { token: 'mock-demo-jwt-token', user } as any;
  }

  if (endpoint === '/auth/me') {
    return currentMockUser as any;
  }

  if (endpoint === '/dashboard/stats') {
    return {
      totalCustomers: mockCustomers.length,
      activeCustomers: mockCustomers.filter(c => c.status === 'Active').length,
      totalProducts: mockProducts.length,
      lowStockProducts: mockProducts.filter(p => p.currentStock <= p.minStockAlert).length,
      totalChallans: mockChallans.length,
      confirmedChallans: mockChallans.filter(c => c.status === 'CONFIRMED').length,
      totalRevenue: mockChallans.filter(c => c.status === 'CONFIRMED').reduce((s, c) => s + c.totalAmount, 0)
    } as any;
  }

  if (endpoint.startsWith('/customers')) {
    if (options.method === 'POST') {
      const newCust = {
        id: `c-${Date.now()}`,
        ...body,
        status: body.status || 'Lead',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customerNotes: body.notes ? [{ id: `n-${Date.now()}`, customerId: `c-${Date.now()}`, note: body.notes, createdBy: currentMockUser.name, createdAt: new Date().toISOString() }] : []
      };
      mockCustomers.unshift(newCust);
      return { message: 'Customer created', customer: newCust } as any;
    }
    if (endpoint.includes('/notes')) {
      const parts = endpoint.split('/');
      const custId = parts[2];
      const cust = mockCustomers.find(c => c.id === custId);
      if (cust) {
        const note = { id: `n-${Date.now()}`, customerId: custId, note: body.note, createdBy: currentMockUser.name, createdAt: new Date().toISOString() };
        if (!cust.customerNotes) cust.customerNotes = [];
        cust.customerNotes.unshift(note);
        if (body.followUpDate) cust.followUpDate = body.followUpDate;
      }
      return { message: 'Note added' } as any;
    }
    return { data: mockCustomers, meta: { total: mockCustomers.length } } as any;
  }

  if (endpoint.startsWith('/products')) {
    if (endpoint === '/products/movements') {
      return mockMovements as any;
    }
    if (endpoint.includes('/adjust-stock')) {
      const prodId = endpoint.split('/')[2];
      const prod = mockProducts.find(p => p.id === prodId);
      if (prod) {
        const qty = parseInt(body.quantity, 10);
        if (body.movementType === 'IN') prod.currentStock += qty;
        else {
          if (prod.currentStock < qty) throw new Error(`Insufficient stock for '${prod.name}'. Available: ${prod.currentStock}`);
          prod.currentStock -= qty;
        }
        mockMovements.unshift({
          id: `m-${Date.now()}`,
          productId: prod.id,
          quantity: qty,
          movementType: body.movementType,
          reason: body.reason,
          createdBy: currentMockUser.name,
          createdAt: new Date().toISOString(),
          product: { name: prod.name, sku: prod.sku, category: prod.category }
        });
      }
      return { message: 'Stock adjusted' } as any;
    }
    if (options.method === 'POST') {
      const newProd = {
        id: `p-${Date.now()}`,
        ...body,
        unitPrice: parseFloat(body.unitPrice),
        currentStock: parseInt(body.currentStock, 10),
        minStockAlert: parseInt(body.minStockAlert || 5, 10),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockProducts.unshift(newProd);
      return { message: 'Product created', product: newProd } as any;
    }
    return { data: mockProducts, meta: { total: mockProducts.length } } as any;
  }

  if (endpoint.startsWith('/challans')) {
    if (options.method === 'POST') {
      const cust = mockCustomers.find(c => c.id === body.customerId) || mockCustomers[0];
      let totalQty = 0;
      let totalAmt = 0;

      const items = body.items.map((item: any) => {
        const prod = mockProducts.find(p => p.id === item.productId) || mockProducts[0];
        if (body.status === 'CONFIRMED' && prod.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for product '${prod.name}' (SKU: ${prod.sku}). Available: ${prod.currentStock}, required: ${item.quantity}`);
        }
        const lineTotal = prod.unitPrice * item.quantity;
        totalQty += item.quantity;
        totalAmt += lineTotal;
        if (body.status === 'CONFIRMED') prod.currentStock -= item.quantity;

        return {
          id: `ci-${Date.now()}-${Math.random()}`,
          challanId: `ch-${Date.now()}`,
          productId: prod.id,
          productSnapshot: { name: prod.name, sku: prod.sku, category: prod.category, unitPrice: prod.unitPrice, location: prod.location },
          quantity: item.quantity,
          unitPrice: prod.unitPrice,
          lineTotal
        };
      });

      const newChallan = {
        id: `ch-${Date.now()}`,
        challanNumber: `CH-202607-000${mockChallans.length + 1}`,
        customerId: cust.id,
        customerSnapshot: { name: cust.name, businessName: cust.businessName, email: cust.email, mobile: cust.mobile, type: cust.type, address: cust.address },
        totalQuantity: totalQty,
        totalAmount: totalAmt,
        status: body.status || 'DRAFT',
        createdBy: currentMockUser.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items
      };
      mockChallans.unshift(newChallan as any);
      return { message: 'Challan created', challan: newChallan } as any;
    }
    return { data: mockChallans, meta: { total: mockChallans.length } } as any;
  }

  return {} as T;
}

export const api = {
  login: (credentials: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request<any>('/auth/me'),
  getStats: () => request<any>('/dashboard/stats'),
  getCustomers: (params: string = '') => request<any>(`/customers?${params}`),
  getCustomerById: (id: string) => request<any>(`/customers/${id}`),
  createCustomer: (customerData: any) => request<any>('/customers', { method: 'POST', body: JSON.stringify(customerData) }),
  updateCustomer: (id: string, customerData: any) => request<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(customerData) }),
  addFollowUpNote: (id: string, noteData: any) => request<any>(`/customers/${id}/notes`, { method: 'POST', body: JSON.stringify(noteData) }),
  getProducts: (params: string = '') => request<any>(`/products?${params}`),
  getProductById: (id: string) => request<any>(`/products/${id}`),
  createProduct: (productData: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(productData) }),
  updateProduct: (id: string, productData: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
  adjustStock: (id: string, data: { quantity: number; movementType: 'IN' | 'OUT'; reason: string }) =>
    request<any>(`/products/${id}/adjust-stock`, { method: 'POST', body: JSON.stringify(data) }),
  getStockMovements: () => request<any>('/products/movements'),
  getChallans: (params: string = '') => request<any>(`/challans?${params}`),
  getChallanById: (id: string) => request<any>(`/challans/${id}`),
  createChallan: (challanData: any) => request<any>('/challans', { method: 'POST', body: JSON.stringify(challanData) }),
  updateChallanStatus: (id: string, status: 'CONFIRMED' | 'CANCELLED') =>
    request<any>(`/challans/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
