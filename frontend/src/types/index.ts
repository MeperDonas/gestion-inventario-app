export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  costPrice: number;
  salePrice: number;
  taxRate: number;
  stock: number;
  minStock: number;
  imageUrl: string | null;
  categoryId: string;
  category?: Category;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  isLowStock?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  documentType: string;
  documentNumber: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  segment: "VIP" | "FREQUENT" | "OCCASIONAL" | "INACTIVE";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  saleNumber: number;
  customerId: string | null;
  customer?: Customer;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  amountPaid: number | null;
  change: number | null;
  status: "COMPLETED" | "CANCELLED" | "RETURNED_PARTIAL";
  userId: string;
  items: SaleItem[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  saleId: string;
  method: "CASH" | "CARD" | "TRANSFER";
  amount: number;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountAmount: number;
  subtotal: number;
  total: number;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  product?: Product;
  type: "PURCHASE" | "SALE" | "ADJUSTMENT_IN" | "ADJUSTMENT_OUT" | "DAMAGE" | "RETURN";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  userId: string;
  saleId: string | null;
  createdAt: string;
}

export interface Settings {
  id: string;
  companyName: string;
  currency: string;
  taxRate: number;
  invoicePrefix: string;
  printHeader: string | null;
  printFooter: string | null;
  logoUrl: string | null;
}

export interface DashboardData {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockProducts: number;
  recentSales: Array<{
    id: string;
    saleNumber: number;
    total: number;
    status: string;
    createdAt: string;
    customer?: { id: string; name: string } | null;
    items: Array<{
      id: string;
      quantity: number;
      total: number;
      product: { id: string; name: string };
    }>;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

export interface SearchProductResult {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  salePrice: number;
  stock: number;
  imageUrl: string | null;
  category: { name: string };
  isLowStock: boolean;
}

export interface SaleByPaymentMethod {
  paymentMethod: string;
  total: number;
  subtotal: number;
  count: number;
}

export interface SaleByCategory {
  category: string;
  total: number;
  quantity: number;
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  quantity: number;
  total: number;
  stock: number;
}

export interface CustomerStatistics {
  totalCustomers: number;
  activeCustomers: number;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalSales: number;
    totalRevenue: number;
  }>;
}

export interface DailySale {
  date: string;
  total: number;
  subtotal: number;
  tax: number;
  count: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "CASHIER" | "INVENTORY_USER";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
