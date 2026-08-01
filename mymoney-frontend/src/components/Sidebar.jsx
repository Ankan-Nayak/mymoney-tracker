import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Calendar,
  PieChart,
  Target,
  TrendingUp,
  Receipt,
  HandCoins,
  BarChart3,
  User,
  LogOut,
  Sun,
  Moon,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/budgets', label: 'Budgets', icon: PieChart },
    { to: '/goals', label: 'Savings Goals', icon: Target },
    { to: '/savings-investments', label: 'Savings & Investments', icon: TrendingUp },
    { to: '/bills-subscriptions', label: 'Bills & Subscriptions', icon: Receipt },
    { to: '/loans-debts', label: 'Loans & Debts', icon: HandCoins },
    { to: '/analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/profile', label: 'Profile Settings', icon: User },
  ];

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 z-40 w-64 glass-sidebar transition-transform duration-300 transform flex flex-col justify-between
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
    >
      <div>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-extrabold text-xl">M</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                MyMoney
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">
                Finance Hub
              </p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-200/20 transition"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="px-4 py-6 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => toggleSidebar(false)} // Close sidebar on mobile select
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group
                ${isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/15'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/10 hover:text-slate-900 dark:hover:text-slate-100'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 
                      ${isActive ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}
                    `}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-200/20 space-y-3">
        {/* Theme and Logout Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium border border-slate-200/20 hover:bg-slate-200/10 transition text-slate-700 dark:text-slate-300"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl border border-slate-200/20 hover:bg-red-500/10 hover:text-red-500 transition text-slate-500 dark:text-slate-400"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Summary */}
        {user && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-200/10 border border-slate-200/5">
            <img
              src={user.profilePicture ? `${API_BASE_URL}${user.profilePicture}` : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`}
              alt="Avatar"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/20"
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`;
              }}
            />
            <div className="overflow-hidden">
              <h2 className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                {user.username}
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
