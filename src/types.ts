export type Page =
  | 'dashboard'
  | 'raw-materials'
  | 'products'
  | 'hardware'
  | 'production'
  | 'sales'
  | 'customers'
  | 'expenses';

export interface RawMaterial {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  price_per_unit: number;
  supplier: string;
  min_stock: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface HardwareItem {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  price_per_unit: number;
  category: string;
  min_stock: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  balance: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  created_at: string;
}

export interface Sale {
  id: number;
  customer_id: number | null;
  customer_name?: string;
  total_amount: number;
  paid_amount: number;
  discount: number;
  status: string;
  date: string;
  notes: string;
  created_at: string;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ProductionOrder {
  id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  status: string;
  start_date: string;
  end_date: string;
  notes: string;
  created_at: string;
}

export interface ProductionMaterial {
  id: number;
  production_id: number;
  material_id: number | null;
  material_name: string;
  quantity_used: number;
}
