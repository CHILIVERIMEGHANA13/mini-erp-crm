export type UserRole = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  type: 'Retail' | 'Wholesale' | 'Distributor';
  address: string;
  status: 'Lead' | 'Active' | 'Inactive';
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  customerNotes?: CustomerNote[];
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdBy: string;
  createdAt: string;
  product?: {
    name: string;
    sku: string;
    category: string;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  movements?: StockMovement[];
}

export interface CustomerSnapshot {
  id: string;
  name: string;
  businessName: string;
  email: string;
  mobile: string;
  gstNumber?: string;
  address: string;
  type: string;
}

export interface ProductSnapshot {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  location: string;
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productSnapshot: ProductSnapshot;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerSnapshot: CustomerSnapshot;
  totalQuantity: number;
  totalAmount: number;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items: ChallanItem[];
  customer?: Partial<Customer>;
}

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalChallans: number;
  confirmedChallans: number;
  totalRevenue: number;
}
