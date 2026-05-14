import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Search } from 'lucide-react';
import type { Expense } from '../types';
import { fetchExpenses, addExpense, deleteExpense } from '../utils/api';

const categories = ['عمومی', 'اجاره', 'حقوق', 'برق و آب', 'حمل و نقل', 'تعمیرات', 'خرید ابزار', 'سایر'];

export const Expenses: React.FC = () => {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', amount: 0, category: 'عمومی', date: new Date().toISOString().split('T')[0], description: '' });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const load = () => {
    fetchExpenses()
      .then(setItems)
      .catch((e) => console.error('Failed to load expenses:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title.trim() || form.amount <= 0) return;
    await addExpense(form);
    setShowModal(false);
    setForm({ title: '', amount: 0, category: 'عمومی', date: new Date().toISOString().split('T')[0], description: '' });
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteExpense(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = items.filter((i) => {
    const matchSearch = i.title.includes(search) || i.description.includes(search);
    const matchCat = !filterCat || i.category === filterCat;
    return matchSearch && matchCat;
  });

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  if (loading) return <div className="flex items-center justify-center h-full"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">مصارف دکان</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={16} /> ثبت مصرف
        </button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <label className="input input-bordered input-sm flex items-center gap-2 w-64">
          <Search className="h-[1em] opacity-50" />
          <input type="search" className="grow" placeholder="جستجو..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <select className="select select-bordered select-sm" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">همه دسته‌ها</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-2 mr-auto">
          <span className="text-base-content/60 text-sm">جمع:</span>
          <span className="font-bold text-warning">{totalFiltered.toLocaleString()} ؋</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>#</th><th>عنوان</th><th>دسته</th><th>مبلغ</th><th>تاریخ</th><th>توضیحات</th><th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, idx) => (
              <tr key={e.id}>
                <td>{idx + 1}</td>
                <td className="font-medium">{e.title}</td>
                <td><span className="badge badge-sm">{e.category}</span></td>
                <td className="text-warning">{e.amount.toLocaleString()} ؋</td>
                <td>{e.date}</td>
                <td className="max-w-40 truncate">{e.description || '-'}</td>
                <td>
                  <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDelete(e.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-base-content/60">مصرفی ثبت نشده</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button className="btn btn-sm btn-circle btn-ghost absolute left-2 top-2" onClick={() => setShowModal(false)}><X size={16} /></button>
            <h3 className="font-bold text-lg mb-4">ثبت مصرف جدید</h3>
            <div className="space-y-3">
              <input className="input input-bordered w-full" placeholder="عنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className="input input-bordered" type="number" placeholder="مبلغ" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
                <select className="select select-bordered" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <input className="input input-bordered w-full" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <textarea className="textarea textarea-bordered w-full" placeholder="توضیحات" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>انصراف</button>
              <button className="btn btn-primary" onClick={handleSave}>ثبت</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
};
