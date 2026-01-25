// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Enums matching Prisma schema
export type Role = "ADMIN";
export type Category = "FOOD" | "DRINK";
export type PaymentStatus = "PENDING" | "PAID" | "CANCELLED";
export type PaymentMethod = "CASH" | "QRIS";

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  imageUrl?: string | null;
  stock: number;
  minStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: Category;
  search?: string;
  isActive?: boolean;
}

// Product CRUD Request Types
export interface CreateProductRequest {
  name: string;
  price: number;
  category: Category;
  imageUrl?: string | null;
  stock?: number;
  minStock?: number;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  category?: Category;
  imageUrl?: string | null;
  stock?: number;
  minStock?: number;
  isActive?: boolean;
}

// Transaction Types
export interface TransactionItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  category: Category;
}

export interface Transaction {
  id: string;
  transactionCode: string;
  userId: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  items: TransactionItem[];
}

export interface CreateTransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  category: Category;
}

export interface CreateTransactionRequest {
  items: CreateTransactionItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  paymentMethod: PaymentMethod;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}

export interface TodayTransactionsResponse {
  transactions: Transaction[];
  summary: {
    count: number;
    total: number;
  };
}

// Report Types
export interface DashboardSummary {
  todayRevenue: number;
  todayTransactions: number;
  totalProducts: number;
  lowStockProducts: number;
  recentTransactions: Transaction[];
}

// Business Settings Types
export interface BusinessSettings {
  id?: string;
  businessName: string | null;
  address: string | null;
  taxRate: number;
  updatedAt?: string;
}

export interface UpdateBusinessSettingsRequest {
  businessName?: string;
  address?: string;
  taxRate?: number;
}
