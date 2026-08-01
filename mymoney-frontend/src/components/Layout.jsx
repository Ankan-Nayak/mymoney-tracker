import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, DollarSign, Wallet } from 'lucide-react';
import { CURRENCIES } from '../utils/categories';

const Layout = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-height-screen w-full flex items-center justify-center bg-radial from-slate-900 to-black text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl border-4 border-emerald-500 border-t-transparent animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Syncing with MyMoney...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Get matching header title from location pathname
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview Dashboard';
    if (path === '/transactions') return 'Transaction History';
    if (path === '/calendar') return 'Financial Calendar';
    if (path === '/budgets') return 'Budget Tracker';
    if (path === '/goals') return 'Savings Goals';
    if (path === '/savings-investments') return 'Savings & Investment Portfolio';
    if (path === '/bills-subscriptions') return 'Bills & Recurring Subscriptions';
    if (path === '/loans-debts') return 'Loans & Debts Tracker';
    if (path === '/analytics') return 'Reports & Analytics';
    if (path === '/profile') return 'Profile Settings';
    return 'Finance Hub';
  };

  const activeCurrency = CURRENCIES.find(c => c.code === user?.currency) || { code: 'USD', symbol: '$' };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />

      {/* Mobile sidebar backdrop overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main page container */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 glass-panel border-t-0 border-x-0 rounded-none border-b border-slate-200/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-200/10 transition text-slate-600 dark:text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">
              {getHeaderTitle()}
            </h2>
          </div>

          {/* Quick Metrics Header Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <Wallet className="w-4 h-4" />
              <span>Currency: {activeCurrency.code} ({activeCurrency.symbol})</span>
            </div>
          </div>
        </header>

        {/* Dynamic page contents wrapper */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
