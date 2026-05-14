import React from 'react';
import { LayoutDashboard, Package, Box, Wrench, Factory, ShoppingCart, Users, Receipt, LogOut } from 'lucide-react';
import type { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const menuItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard size={20} /> },
  { page: 'raw-materials', label: 'مواد اولیه', icon: <Package size={20} /> },
  { page: 'products', label: 'محصولات', icon: <Box size={20} /> },
  { page: 'hardware', label: 'اجناس خورد/ابزار', icon: <Wrench size={20} /> },
  { page: 'production', label: 'تولید', icon: <Factory size={20} /> },
  { page: 'sales', label: 'فروش و فاکتور', icon: <ShoppingCart size={20} /> },
  { page: 'customers', label: 'مشتریان', icon: <Users size={20} /> },
  { page: 'expenses', label: 'مصارف دکان', icon: <Receipt size={20} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onLogout }) => {
  return (
    <div className="w-56 bg-base-200 h-full flex flex-col border-l border-base-300">
      <div className="p-4 border-b border-base-300">
        <h2 className="text-lg font-bold text-primary">🪑 نصرالله فرنیچر</h2>
        <p className="text-xs text-base-content/60 mt-1">سیستم مدیریت یکپارچه</p>
      </div>
      <ul className="menu p-2 flex-1 gap-1">
        {menuItems.map((item) => (
          <li key={item.page}>
            <button
              className={`flex items-center gap-3 sidebar-item ${currentPage === item.page ? 'active bg-primary text-primary-content' : ''}`}
              onClick={() => onNavigate(item.page)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="p-2 border-t border-base-300">
        <button className="btn btn-ghost btn-sm w-full justify-start gap-2 text-error" onClick={onLogout}>
          <LogOut size={16} />
          خروج
        </button>
      </div>
    </div>
  );
};
