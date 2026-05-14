import type { RawMaterial, Product, HardwareItem, Customer, Expense, Sale, SaleItem, ProductionOrder } from '../types';

async function apiCall<T>(action: string, params?: unknown): Promise<T> {
  const res = await fetch('/api/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, params }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
}

export const fetchRawMaterials = () => apiCall<RawMaterial[]>('fetchRawMaterials');
export const addRawMaterial = (m: Omit<RawMaterial, 'id' | 'created_at' | 'updated_at'>) => apiCall<void>('addRawMaterial', m);
export const updateRawMaterial = (id: number, m: Partial<RawMaterial>) => apiCall<void>('updateRawMaterial', { id, ...m });
export const deleteRawMaterial = (id: number) => apiCall<void>('deleteRawMaterial', { id });

export const fetchProducts = () => apiCall<Product[]>('fetchProducts');
export const addProduct = (p: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => apiCall<void>('addProduct', p);
export const updateProduct = (id: number, p: Partial<Product>) => apiCall<void>('updateProduct', { id, ...p });
export const deleteProduct = (id: number) => apiCall<void>('deleteProduct', { id });

export const fetchHardware = () => apiCall<HardwareItem[]>('fetchHardware');
export const addHardware = (h: Omit<HardwareItem, 'id' | 'created_at' | 'updated_at'>) => apiCall<void>('addHardware', h);
export const updateHardware = (id: number, h: Partial<HardwareItem>) => apiCall<void>('updateHardware', { id, ...h });
export const deleteHardware = (id: number) => apiCall<void>('deleteHardware', { id });

export const fetchCustomers = () => apiCall<Customer[]>('fetchCustomers');
export const addCustomer = (c: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => apiCall<void>('addCustomer', c);
export const updateCustomer = (id: number, c: Partial<Customer>) => apiCall<void>('updateCustomer', { id, ...c });
export const deleteCustomer = (id: number) => apiCall<void>('deleteCustomer', { id });

export const fetchExpenses = () => apiCall<Expense[]>('fetchExpenses');
export const addExpense = (e: Omit<Expense, 'id' | 'created_at'>) => apiCall<void>('addExpense', e);
export const deleteExpense = (id: number) => apiCall<void>('deleteExpense', { id });

export const fetchSales = () => apiCall<Sale[]>('fetchSales');
export const addSale = async (s: { customer_id: number | null; total_amount: number; paid_amount: number; discount: number; status: string; date: string; notes: string }): Promise<number> => {
  const result = await apiCall<{ id: number }>('addSale', s);
  return result.id;
};
export const addSaleItem = (item: Omit<SaleItem, 'id'>) => apiCall<void>('addSaleItem', item);
export const fetchSaleItems = (saleId: number) => apiCall<SaleItem[]>('fetchSaleItems', { sale_id: saleId });
export const deleteSale = (id: number) => apiCall<void>('deleteSale', { id });

export const fetchProduction = () => apiCall<ProductionOrder[]>('fetchProduction');
export const addProduction = (p: { product_id: number | null; product_name: string; quantity: number; status: string; start_date: string; notes: string }) => apiCall<void>('addProduction', p);
export const updateProduction = (id: number, p: Partial<ProductionOrder>) => apiCall<void>('updateProduction', { id, ...p });
export const deleteProduction = (id: number) => apiCall<void>('deleteProduction', { id });

export const fetchDashboardStats = () => apiCall<{
  totalProducts: number;
  totalCustomers: number;
  totalSales: number;
  totalExpenses: number;
  lowStockMaterials: number;
  activeProduction: number;
  totalRevenue: number;
  totalCost: number;
}>('fetchDashboardStats');
