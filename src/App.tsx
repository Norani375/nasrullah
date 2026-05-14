import { useState } from 'react';
import type { Page } from './types';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { RawMaterials } from './components/RawMaterials';
import { Products } from './components/Products';
import { Hardware } from './components/Hardware';
import { Production } from './components/Production';
import { Sales } from './components/Sales';
import { Customers } from './components/Customers';
import { Expenses } from './components/Expenses';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'raw-materials': return <RawMaterials />;
      case 'products': return <Products />;
      case 'hardware': return <Hardware />;
      case 'production': return <Production />;
      case 'sales': return <Sales />;
      case 'customers': return <Customers />;
      case 'expenses': return <Expenses />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-base-100">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={() => setIsLoggedIn(false)} />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
}
