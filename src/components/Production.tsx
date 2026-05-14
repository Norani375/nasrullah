import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { ProductionOrder, Product } from '../types';
import { fetchProduction, addProduction, updateProduction, deleteProduction, fetchProducts } from '../utils/api';

export const Production: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ product_id: 0, product_name: '', quantity: 1, status: 'در حال تولید', start_date: new Date().toISOString().split('T')[0], notes: '' });

  const load = () => {
    Promise.all([fetchProduction(), fetchProducts()])
      .then(([o, p]) => { setOrders(o); setProducts(p); })
      .catch((e) => console.error('Failed to load production:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.product_name.trim()) return;
    await addProduction({
      product_id: form.product_id || null,
      product_name: form.product_name,
      quantity: form.quantity,
      status: form.status,
      start_date: form.start_date,
      notes: form.notes,
    });
    setShowModal(false);
    load();
  };

  const handleStatusChange = async (id: number, status: string) => {
    const endDate = status === 'تکمیل شده' ? new Date().toISOString().split('T')[0] : '';
    await updateProduction(id, { status, end_date: endDate });
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteProduction(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'تکمیل شده': return <span className="badge badge-success gap-1"><CheckCircle size={12} />{status}</span>;
      case 'در حال تولید': return <span className="badge badge-warning gap-1"><Clock size={12} />{status}</span>;
      case 'لغو شده': return <span className="badge badge-error gap-1"><AlertCircle size={12} />{status}</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">فرمولاسیون و تولید</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={16} /> سفارش تولید جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="card bg-base-200 p-3">
          <p className="text-base-content/60 text-sm">در حال تولید</p>
          <p className="text-2xl font-bold text-warning">{orders.filter((o) => o.status === 'در حال تولید').length}</p>
        </div>
        <div className="card bg-base-200 p-3">
          <p className="text-base-content/60 text-sm">تکمیل شده</p>
          <p className="text-2xl font-bold text-success">{orders.filter((o) => o.status === 'تکمیل شده').length}</p>
        </div>
        <div className="card bg-base-200 p-3">
          <p className="text-base-content/60 text-sm">کل سفارشات</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>#</th><th>محصول</th><th>تعداد</th><th>وضعیت</th><th>شروع</th><th>پایان</th><th>یادداشت</th><th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr key={o.id}>
                <td>{idx + 1}</td>
                <td className="font-medium">{o.product_name}</td>
                <td>{o.quantity}</td>
                <td>{statusBadge(o.status)}</td>
                <td>{o.start_date}</td>
                <td>{o.end_date || '-'}</td>
                <td className="max-w-32 truncate">{o.notes || '-'}</td>
                <td className="flex gap-1">
                  {o.status === 'در حال تولید' && (
                    <button className="btn btn-success btn-xs" onClick={() => handleStatusChange(o.id, 'تکمیل شده')}>تکمیل</button>
                  )}
                  <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDelete(o.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={8} className="text-center text-base-content/60">سفارش تولیدی وجود ندارد</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button className="btn btn-sm btn-circle btn-ghost absolute left-2 top-2" onClick={() => setShowModal(false)}><X size={16} /></button>
            <h3 className="font-bold text-lg mb-4">سفارش تولید جدید</h3>
            <div className="space-y-3">
              <select
                className="select select-bordered w-full"
                value={form.product_id}
                onChange={(e) => {
                  const pid = Number(e.target.value);
                  const p = products.find((pr) => pr.id === pid);
                  setForm({ ...form, product_id: pid, product_name: p?.name ?? '' });
                }}
              >
                <option value={0}>انتخاب محصول...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {form.product_id === 0 && (
                <input className="input input-bordered w-full" placeholder="یا نام محصول جدید..." value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
              )}
              <div className="grid grid-cols-2 gap-3">
                <input className="input input-bordered" type="number" placeholder="تعداد" value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
                <input className="input input-bordered" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <textarea className="textarea textarea-bordered w-full" placeholder="یادداشت" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>انصراف</button>
              <button className="btn btn-primary" onClick={handleSave}>ثبت سفارش</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
};
