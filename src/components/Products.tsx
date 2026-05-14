import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X, Search } from 'lucide-react';
import type { Product } from '../types';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '../utils/api';

const emptyForm = { name: '', category: '', price: 0, cost: 0, stock: 0, description: '' };

export const Products: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const load = () => {
    fetchProducts()
      .then(setItems)
      .catch((e) => console.error('Failed to load products:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editId) {
      await updateProduct(editId, form);
    } else {
      await addProduct(form);
    }
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
    load();
  };

  const handleEdit = (item: Product) => {
    setEditId(item.id);
    setForm({ name: item.name, category: item.category, price: item.price, cost: item.cost, stock: item.stock, description: item.description });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    await deleteProduct(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = items.filter((i) => i.name.includes(search) || i.category.includes(search));

  if (loading) return <div className="flex items-center justify-center h-full"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">محصولات</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditId(null); setForm(emptyForm); setShowModal(true); }}>
          <Plus size={16} /> افزودن
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
              <th>#</th><th>نام</th><th>دسته‌بندی</th><th>قیمت فروش</th><th>قیمت تمام‌شده</th><th>موجودی</th><th>سود</th><th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td className="font-medium">{item.name}</td>
                <td><span className="badge badge-sm">{item.category || '-'}</span></td>
                <td>{item.price.toLocaleString()} ؋</td>
                <td>{item.cost.toLocaleString()} ؋</td>
                <td>{item.stock}</td>
                <td className="text-success">{(item.price - item.cost).toLocaleString()} ؋</td>
                <td className="flex gap-1">
                  <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(item)}><Edit size={14} /></button>
                  <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="text-center text-base-content/60">موردی یافت نشد</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button className="btn btn-sm btn-circle btn-ghost absolute left-2 top-2" onClick={() => setShowModal(false)}><X size={16} /></button>
            <h3 className="font-bold text-lg mb-4">{editId ? 'ویرایش محصول' : 'افزودن محصول'}</h3>
            <div className="space-y-3">
              <input className="input input-bordered w-full" placeholder="نام محصول" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <select className="select select-bordered w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">دسته‌بندی...</option>
                <option>مبل</option><option>میز</option><option>صندلی</option><option>کمد</option><option>تخت</option><option>سایر</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input className="input input-bordered" type="number" placeholder="قیمت فروش" value={form.price || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                <input className="input input-bordered" type="number" placeholder="قیمت تمام‌شده" value={form.cost || ''} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
              </div>
              <input className="input input-bordered w-full" type="number" placeholder="موجودی" value={form.stock || ''} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              <textarea className="textarea textarea-bordered w-full" placeholder="توضیحات" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>انصراف</button>
              <button className="btn btn-primary" onClick={handleSave}>ذخیره</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
};
