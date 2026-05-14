import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X, Search } from 'lucide-react';
import type { HardwareItem } from '../types';
import { fetchHardware, addHardware, updateHardware, deleteHardware } from '../utils/api';

const emptyForm = { name: '', unit: 'عدد', quantity: 0, price_per_unit: 0, category: '', min_stock: 0 };

export const Hardware: React.FC = () => {
  const [items, setItems] = useState<HardwareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const load = () => {
    fetchHardware()
      .then(setItems)
      .catch((e) => console.error('Failed to load hardware:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editId) {
      await updateHardware(editId, form);
    } else {
      await addHardware(form);
    }
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
    load();
  };

  const handleEdit = (item: HardwareItem) => {
    setEditId(item.id);
    setForm({ name: item.name, unit: item.unit, quantity: item.quantity, price_per_unit: item.price_per_unit, category: item.category, min_stock: item.min_stock });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    await deleteHardware(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = items.filter((i) => i.name.includes(search) || i.category.includes(search));

  if (loading) return <div className="flex items-center justify-center h-full"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">اجناس خورد / ابزار</h2>
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
              <th>#</th><th>نام</th><th>دسته</th><th>واحد</th><th>موجودی</th><th>قیمت واحد</th><th>ارزش کل</th><th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id} className={item.quantity <= item.min_stock ? 'bg-error/10' : ''}>
                <td>{idx + 1}</td>
                <td className="font-medium">{item.name}</td>
                <td><span className="badge badge-sm">{item.category || '-'}</span></td>
                <td>{item.unit}</td>
                <td>{item.quantity}</td>
                <td>{item.price_per_unit.toLocaleString()} ؋</td>
                <td>{(item.quantity * item.price_per_unit).toLocaleString()} ؋</td>
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
            <h3 className="font-bold text-lg mb-4">{editId ? 'ویرایش' : 'افزودن ابزار/خورد'}</h3>
            <div className="space-y-3">
              <input className="input input-bordered w-full" placeholder="نام" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="select select-bordered" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">دسته...</option>
                  <option>پیچ و مهره</option><option>چسب</option><option>رنگ</option><option>ابزار برقی</option><option>ابزار دستی</option><option>سایر</option>
                </select>
                <select className="select select-bordered" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option>عدد</option><option>بسته</option><option>کیلو</option><option>لیتر</option><option>متر</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="input input-bordered" type="number" placeholder="موجودی" value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
                <input className="input input-bordered" type="number" placeholder="قیمت واحد" value={form.price_per_unit || ''} onChange={(e) => setForm({ ...form, price_per_unit: Number(e.target.value) })} />
              </div>
              <input className="input input-bordered w-full" type="number" placeholder="حداقل موجودی" value={form.min_stock || ''} onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })} />
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
