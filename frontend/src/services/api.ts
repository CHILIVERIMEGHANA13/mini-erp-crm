const API_BASE = '/api';

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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'An unexpected API error occurred');
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request<any>('/auth/me'),

  // Dashboard
  getStats: () => request<any>('/dashboard/stats'),

  // Customers
  getCustomers: (params: string = '') => request<any>(`/customers?${params}`),
  getCustomerById: (id: string) => request<any>(`/customers/${id}`),
  createCustomer: (customerData: any) => request<any>('/customers', { method: 'POST', body: JSON.stringify(customerData) }),
  updateCustomer: (id: string, customerData: any) => request<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(customerData) }),
  addFollowUpNote: (id: string, noteData: any) => request<any>(`/customers/${id}/notes`, { method: 'POST', body: JSON.stringify(noteData) }),

  // Products
  getProducts: (params: string = '') => request<any>(`/products?${params}`),
  getProductById: (id: string) => request<any>(`/products/${id}`),
  createProduct: (productData: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(productData) }),
  updateProduct: (id: string, productData: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
  adjustStock: (id: string, data: { quantity: number; movementType: 'IN' | 'OUT'; reason: string }) =>
    request<any>(`/products/${id}/adjust-stock`, { method: 'POST', body: JSON.stringify(data) }),
  getStockMovements: () => request<any>('/products/movements'),

  // Challans
  getChallans: (params: string = '') => request<any>(`/challans?${params}`),
  getChallanById: (id: string) => request<any>(`/challans/${id}`),
  createChallan: (challanData: any) => request<any>('/challans', { method: 'POST', body: JSON.stringify(challanData) }),
  updateChallanStatus: (id: string, status: 'CONFIRMED' | 'CANCELLED') =>
    request<any>(`/challans/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
