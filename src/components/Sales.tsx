import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Eye, Search } from 'lucide-react';
import type { Sale, SaleItem, Customer, Product } from '../types';
import { fetchSales, addSale, addSaleItem, fetchSaleItems, deleteSale, fetchCustomers, fetchProducts } from '../utils/api';

interface InvoiceItem {
  product_id: number | null;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<number | null>(null);
  const [detailItems, setDetailItems] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({ customer_id: 0, discount: 0, paid_amount: 0, date: new Date().toISOString().split('T')[0], notes: '' });
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([{ product_id: null, product_name: '', quantity: 1, unit_price: 0 }]);

  const load = () => {
    Promise.all([fetchSales(), fetchCustomers(), fetchProducts()])
      .then(([s, c, p]) => { setSales(s); setCustomers(c); setProducts(p); })
      .catch((e) => console.error('Failed to load sales:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const totalAmount = invoiceItems.reduce((sum, it) => sum + it.quantity * it.unit_price, 0) - form.discount;

  const handleSave = async () => {
    if (invoiceItems.every((i) => !i.product_name.trim())) return;
    const saleId = await addSale({
      customer_id: form.customer_id || null,
      total_amount: totalAmount,
      paid_amount: form.paid_amount,
      discount: form.discount,
      status: form.paid_amount >= totalAmount ? 'پرداخت شده' : 'بدهکار',
      date: form.date,
      notes: form.notes,
    });
    for (const item of invoiceItems) {
      if (!item.product_name.trim()) continue;
      await addSaleItem({
        sale_id: saleId,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      });
    }
    setShowModal(false);
    setInvoiceItems([{ product_id: null, product_name: '', quantity: 1, unit_price: 0 }]);
    setForm({ customer_id: 0, discount: 0, paid_amount: 0, date: new Date().toISOString().split('T')[0], notes: '' });
    load();
  };

  const handleViewDetail = async (saleId: number) => {
    const items = await fetchSaleItems(saleId);
    setDetailItems(items);
    setShowDetail(saleId);
  };

  const handleDelete = async (id: number) => {
    await deleteSale(id);
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  const addInvoiceRow = () => {
    setInvoiceItems([...invoiceItems, { product_id: null, product_name: '', quantity: 1, unit_price: 0 }]);
  };

  const updateInvoiceItem = (idx: number, field: string, value: string | number) => {
    const updated = [...invoiceItems];
    if (field === 'product_id') {
      const pid = Number(value);
      const p = products.find((pr) => pr.id === pid);
      updated[idx] = { ...updated[idx], product_id: pid, product_name: p?.name ?? '', unit_price: p?.price ?? 0 };
    } else {
      (updated[idx] as Record<string, string | number | null>)[field] = value;
    }
    setInvoiceItems(updated);
  };

  const removeInvoiceItem = (idx: number) => {
    if (invoiceItems.length <= 1) return;
    setInvoiceItems(invoiceItems.filter((_, i) => i !== idx));
  };

  const filtered = sales.filter((s) => (s.customer_name ?? '').includes(search) || s.date.includes(search));

  if (loading) return <div className="flex items-center justify-center h-full"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">فروش و فاکتور</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={16} /> فاکتور جدید
        </button>
      </div>
      <label className="input input-bordered input-sm flex items-center gap-2 mb-4 w-64">
        <Search className="h-[1em] opacity-50" />
        <input type="search" className="grow" placeholder="جستجو..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>شماره</th><th>مشتری</th><th>تاریخ</th><th>مبلغ کل</th><th>پرداخت</th><th>تخفیف</th><th>وضعیت</th><th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>INV-{s.id}</td>
                <td className="font-medium">{s.customer_name || 'مشتری عمومی'}</td>
                <td>{s.date}</td>
                <td>{s.total_amount.toLocaleString()} ؋</td>
                <td>{s.paid_amount.toLocaleString()} ؋</td>
                <td>{s.discount.toLocaleString()} ؋</td>
                <td>
                  <span className={`badge ${s.status === 'پرداخت شده' ? 'badge-success' : 'badge-warning'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="flex gap-1">
                  <button className="btn btn-ghost btn-xs" onClick={() => handleViewDetail(s.id)}><Eye size={14} /></button>
                  <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="text-center text-base-content/60">فاکتوری وجود ندارد</td></tr>}
          </tbody>
        </table>
      </div>

      {/* New Invoice Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <button className="btn btn-sm btn-circle btn-ghost absolute left-2 top-2" onClick={() => setShowModal(false)}><X size={16} /></button>
            <h3 className="font-bold text-lg mb-4">فاکتور جدید</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select className="select select-bordered" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: Number(e.target.value) })}>
                  <option value={0}>مشتری عمومی</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input className="input input-bordered" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>

              <div className="divider text-sm">اقلام فاکتور</div>
              {invoiceItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select className="select select-bordered select-sm flex-1" value={item.product_id ?? 0} onChange={(e) => updateInvoiceItem(idx, 'product_id', e.target.value)}>
                    <option value={0}>محصول...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.price.toLocaleString()}؋)</option>)}
                  </select>
                  <input className="input input-bordered input-sm w-20" type="number" placeholder="تعداد" value={item.quantity || ''} onChange={(e) => updateInvoiceItem(idx, 'quantity', Number(e.target.value))} />
                  <input className="input input-bordered input-sm w-28" type="number" placeholder="قیمت" value={item.unit_price || ''} onChange={(e) => updateInvoiceItem(idx, 'unit_price', Number(e.target.value))} />
                  <span className="text-sm w-24 text-left">{(item.quantity * item.unit_price).toLocaleString()} ؋</span>
                  <button className="btn btn-ghost btn-xs text-error" onClick={() => removeInvoiceItem(idx)}><X size={14} /></button>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={addInvoiceRow}><Plus size={14} /> افزودن ردیف</button>

              <div className="grid grid-cols-2 gap-3">
                <input className="input input-bordered" type="number" placeholder="تخفیف" value={form.discount || ''} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} />
                <input className="input input-bordered" type="number" placeholder="مبلغ پرداختی" value={form.paid_amount || ''} onChange={(e) => setForm({ ...form, paid_amount: Number(e.target.value) })} />
              </div>
              <div className="text-left font-bold text-lg">جمع: {totalAmount.toLocaleString()} ؋</div>
              <textarea className="textarea textarea-bordered w-full" placeholder="یادداشت" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>انصراف</button>
              <button className="btn btn-primary" onClick={handleSave}>ثبت فاکتور</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}

      {/* Detail Modal */}
      {showDetail !== null && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button className="btn btn-sm btn-circle btn-ghost absolute left-2 top-2" onClick={() => setShowDetail(null)}><X size={16} /></button>
            <h3 className="font-bold text-lg mb-4">جزئیات فاکتور INV-{showDetail}</h3>
            <table className="table table-sm">
              <thead><tr><th>محصول</th><th>تعداد</th><th>قیمت واحد</th><th>جمع</th></tr></thead>
              <tbody>
                {detailItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit_price.toLocaleString()} ؋</td>
                    <td>{item.total_price.toLocaleString()} ؋</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowDetail(null)}>بستن</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDetail(null)} />
        </div>
      )}
    </div>
  );
};
