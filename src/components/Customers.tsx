import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X, Search, Phone, MapPin } from 'lucide-react';
import type { Customer } from '../types';
import { fetchCustomers, addCustomer, updateCustomer, deleteCustomer } from '../utils/api';

const emptyForm = { name: '', phone: '', address: '', balance: 0, notes: '' };

export const Customers: React.FC = () => {
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const load = () => {
    fetchCustomers()
      .then(setItems)
      .catch((e) => console.error('Failed to load customers:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editId) {
      await updateCustomer(editId, form);
    } else {
      await addCustomer(form);
    }
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
    load();
  };

  const handleEdit = (item: Customer) => {
    setEditId(item.id);
    setForm({ name: item.name, phone: item.phone, address: item.address, balance: item.balance, notes: item.notes });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    await deleteCustomer(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = items.filter((i) => i.name.includes(search) || i.phone.includes(search));

  if (loading) return <div className="flex items-center justify-center h-full"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">مدیریت مشتریان</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditId(null); setForm(emptyForm); setShowModal(true); }}>
          <Plus size={16} /> مشتری جدید
        </button>
      </div>
      <label className="input input-bordered input-sm flex items-center gap-2 mb-4 w-64">
        <Search className="h-[1em] opacity-50" />
        <input type="search" className="grow" placeholder="جستجو..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="card bg-base-200">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <h3 className="card-title text-base">{c.name}</h3>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(c)}><Edit size={14} /></button>
                  <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              {c.phone && <p className="flex items-center gap-1 text-sm text-base-content/60"><Phone size={14} /> {c.phone}</p>}
              {c.address && <p className="flex items-center gap-1 text-sm text-base-content/60"><MapPin size={14} /> {c.address}</p>}
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-base-content/60">مانده حساب:</span>
                <span className={`font-bold ${c.balance >= 0 ? 'text-success' : 'text-error'}`}>
                  {c.balance.toLocaleString()} ؋
                </span>
              </div>
              {c.notes && <p className="text-xs text-base-content/40 mt-1">{c.notes}</p>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="col-span-full text-center text-base-content/60">مشتری‌ای یافت نشد</p>}
      </div>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button className="btn btn-sm btn-circle btn-ghost absolute left-2 top-2" onClick={() => setShowModal(false)}><X size={16} /></button>
            <h3 className="font-bold text-lg mb-4">{editId ? 'ویرایش مشتری' : 'مشتری جدید'}</h3>
            <div className="space-y-3">
              <input className="input input-bordered w-full" placeholder="نام مشتری" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input input-bordered w-full" placeholder="شماره تلفن" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="input input-bordered w-full" placeholder="آدرس" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <input className="input input-bordered w-full" type="number" placeholder="مانده حساب" value={form.balance || ''} onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })} />
              <textarea className="textarea textarea-bordered w-full" placeholder="یادداشت" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
