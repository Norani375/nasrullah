import React, { useState, useEffect } from 'react';
import { Package, Box, Users, ShoppingCart, Receipt, Factory, TrendingUp, AlertTriangle } from 'lucide-react';
import { fetchDashboardStats } from '../utils/api';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalSales: 0,
    totalExpenses: 0,
    lowStockMaterials: 0,
    activeProduction: 0,
    totalRevenue: 0,
    totalCost: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((err) => console.error('Failed to fetch dashboard stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const cards = [
    { label: 'کل محصولات', value: stats.totalProducts, icon: <Box size={24} />, color: 'text-primary' },
    { label: 'مشتریان', value: stats.totalCustomers, icon: <Users size={24} />, color: 'text-secondary' },
    { label: 'تعداد فروش', value: stats.totalSales, icon: <ShoppingCart size={24} />, color: 'text-success' },
    { label: 'کل درآمد', value: `${stats.totalRevenue.toLocaleString()} ؋`, icon: <TrendingUp size={24} />, color: 'text-info' },
    { label: 'کل مصارف', value: `${stats.totalExpenses.toLocaleString()} ؋`, icon: <Receipt size={24} />, color: 'text-warning' },
    { label: 'تولید فعال', value: stats.activeProduction, icon: <Factory size={24} />, color: 'text-accent' },
    { label: 'کمبود موجودی', value: stats.lowStockMaterials, icon: <AlertTriangle size={24} />, color: 'text-error' },
    { label: 'سود خالص', value: `${(stats.totalRevenue - stats.totalCost).toLocaleString()} ؋`, icon: <Package size={24} />, color: 'text-success' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">داشبورد مدیریت</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="card bg-base-200 stat-card">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/60 text-sm">{card.label}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={card.color}>{card.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
