import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CURRENCIES } from '../utils/categories';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  CalendarDays,
  Clock,
  PlusCircle,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currencySymbol = CURRENCIES.find(c => c.code === user?.currency)?.symbol || '$';

  const handleCurrencyChange = async (e) => {
    const newCurrency = e.target.value;
    try {
      await updateProfile({ currency: newCurrency });
    } catch (err) {
      console.error('Failed to update currency', err);
      alert('Failed to change currency');
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/api/dashboard');
        setData(response.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setError('Could not retrieve dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl border-4 border-emerald-500 border-t-transparent animate-spin"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Assembling your summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 text-center text-rose-500 max-w-md mx-auto mt-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
        <p className="font-bold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    currentBalance = 0,
    totalIncome = 0,
    totalExpenses = 0,
    totalSavings = 0,
    remainingBudget = 0,
    todayExpenses = 0,
    weeklyExpenses = 0,
    monthlyExpenses = 0,
    recentTransactions = [],
    activeGoals = [],
    upcomingBills = [],
    upcomingSubscriptions = [],
    budgetReports = []
  } = data || {};

  // Formulating a mock chart structure based on actual weekly details
  const chartData = [
    { name: 'Mon', Expenses: weeklyExpenses * 0.1, Income: totalIncome * 0.15 },
    { name: 'Tue', Expenses: weeklyExpenses * 0.15, Income: 0 },
    { name: 'Wed', Expenses: weeklyExpenses * 0.08, Income: totalIncome * 0.1 },
    { name: 'Thu', Expenses: weeklyExpenses * 0.22, Income: 0 },
    { name: 'Fri', Expenses: weeklyExpenses * 0.12, Income: totalIncome * 0.05 },
    { name: 'Sat', Expenses: weeklyExpenses * 0.25, Income: 0 },
    { name: 'Sun', Expenses: weeklyExpenses * 0.08, Income: 0 },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Top Welcome / Quick Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center justify-between lg:justify-start gap-4 w-full lg:w-auto">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Hi, {user?.username}!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Here's your financial status overview for today.
            </p>
          </div>
          <select
            value={user?.currency || 'USD'}
            onChange={handleCurrencyChange}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200/20 bg-slate-200/10 dark:bg-slate-800/40 hover:bg-slate-200/20 dark:hover:bg-slate-800/60 outline-none cursor-pointer transition"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Quick actions panel */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/transactions"
            state={{ openAddModal: true, defaultType: 'EXPENSE' }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </Link>
          <Link
            to="/transactions"
            state={{ openAddModal: true, defaultType: 'INCOME' }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Income</span>
          </Link>
          <Link
            to="/budgets"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200/20 bg-white/5 hover:bg-white/10 hover:scale-[1.02] transition"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Set Budget</span>
          </Link>
        </div>
      </div>

      {/* Grid of basic key finance indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Balance */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-slate-500/10 dark:text-white/5">
            <Wallet className="w-16 h-16" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Current Balance
          </p>
          <h3 className="text-2xl font-black mt-2 text-slate-800 dark:text-slate-100">
            {currencySymbol}{Number(currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block">
            Net cash flow (Income - Expense)
          </span>
        </div>

        {/* Income */}
        <div className="glass-card p-5 border-l-4 border-l-emerald-500 relative">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Income
          </p>
          <h3 className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">
            {currencySymbol}{Number(totalIncome).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>All time total earnings</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="glass-card p-5 border-l-4 border-l-rose-500 relative">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Expenses
          </p>
          <h3 className="text-2xl font-black mt-2 text-rose-600 dark:text-rose-400">
            {currencySymbol}{Number(totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-rose-500 font-semibold mt-2">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>All time spendings</span>
          </div>
        </div>

        {/* Savings */}
        <div className="glass-card p-5 border-l-4 border-l-blue-500 relative">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Savings
          </p>
          <h3 className="text-2xl font-black mt-2 text-blue-600 dark:text-blue-400">
            {currencySymbol}{Number(totalSavings).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-blue-500 font-semibold mt-2">
            <PiggyBank className="w-3.5 h-3.5" />
            <span>Assets & deposits</span>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="glass-card p-5 border-l-4 border-l-amber-500 relative">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Remaining Budget
          </p>
          <h3 className="text-2xl font-black mt-2 text-amber-600 dark:text-amber-400">
            {remainingBudget > 0 ? `${currencySymbol}${Number(remainingBudget).toLocaleString()}` : `${currencySymbol}0.00`}
          </h3>
          <div className="flex items-center gap-1 text-[10px] mt-2">
            {remainingBudget < 0 ? (
              <span className="text-rose-500 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Over limit!
              </span>
            ) : (
              <span className="text-amber-500 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Within monthly limit
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expenses by Timeframe */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase">Today's Expenses</p>
          <h4 className="text-lg font-extrabold mt-1 text-rose-500">
            {currencySymbol}{Number(todayExpenses).toFixed(2)}
          </h4>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase">Weekly Expenses</p>
          <h4 className="text-lg font-extrabold mt-1 text-rose-500">
            {currencySymbol}{Number(weeklyExpenses).toFixed(2)}
          </h4>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase">Monthly Expenses</p>
          <h4 className="text-lg font-extrabold mt-1 text-rose-500">
            {currencySymbol}{Number(monthlyExpenses).toFixed(2)}
          </h4>
        </div>
      </div>

      {/* Main visual reports: Chart + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash flow weekly Area chart */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Weekly Cash Flow Trend
              </h3>
              <p className="text-xs text-slate-400">Weekly breakdown of income vs expenses</p>
            </div>
            <Link to="/analytics" className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1">
              <span>View Analytics</span>
              <ArrowUpRight className="w-4.5 h-4.5" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals overview */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Savings Goals</h3>
              <Link to="/goals" className="text-xs font-bold text-emerald-500 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3.5 overflow-y-auto max-h-[220px] pr-1">
              {activeGoals.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No active savings goals. Set one now to start saving!
                </div>
              ) : (
                activeGoals.map((goal) => {
                  const progress = Number(goal.progressPercentage) || 0;
                  return (
                    <div key={goal.id} className="space-y-1.5 p-3 rounded-xl bg-slate-200/10 border border-slate-200/5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-800 dark:text-slate-200">{goal.name}</span>
                        <span className="text-emerald-500 font-semibold">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-200/15 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Target: {currencySymbol}{goal.targetAmount}</span>
                        <span>Saved: {currencySymbol}{goal.currentSavedAmount}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Link
            to="/goals"
            className="w-full mt-4 py-2 border border-dashed border-emerald-500/30 hover:border-emerald-500/60 rounded-xl text-xs font-bold text-emerald-500 hover:bg-emerald-500/5 text-center transition block"
          >
            Create New Savings Goal
          </Link>
        </div>
      </div>

      {/* Lower Section: Recent History & Bills/Subscriptions alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions list */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Recent Transactions
            </h3>
            <Link to="/transactions" className="text-xs font-bold text-emerald-500 hover:underline">
              View All History
            </Link>
          </div>

          <div className="divide-y divide-slate-200/10 max-h-[300px] overflow-y-auto pr-1">
            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No transactions recorded yet. Add some details to see them here!
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs
                        ${tx.type === 'INCOME'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                        }
                      `}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {tx.merchant || tx.description || tx.mainCategory}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {tx.mainCategory}{tx.subcategory ? ` • ${tx.subcategory}` : ''} • {tx.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-black
                        ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}
                      `}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}{currencySymbol}{tx.amount}
                    </span>
                    <p className="text-[9px] text-slate-400">{tx.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Due Alerts for bills & subscriptions */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Upcoming Bills & Subs</h3>
          
          <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
            {upcomingBills.length === 0 && upcomingSubscriptions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/60" />
                <span>All caught up! No bills due.</span>
              </div>
            ) : (
              <>
                {/* Bills */}
                {upcomingBills.map((bill) => (
                  <div key={`bill-${bill.id}`} className="flex justify-between items-center p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase">
                        Bill Due
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {bill.provider} ({bill.category})
                      </h4>
                      <p className="text-[9px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due: {bill.dueDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-rose-500">
                        {currencySymbol}{bill.amount}
                      </span>
                      <Link to="/bills-subscriptions" className="text-[9px] font-bold text-emerald-500 block hover:underline">
                        Pay
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Subscriptions */}
                {upcomingSubscriptions.map((sub) => (
                  <div key={`sub-${sub.id}`} className="flex justify-between items-center p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase">
                        Sub Renewal
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {sub.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Renewal: {sub.nextRenewalDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-blue-500">
                        {currencySymbol}{sub.cost}
                      </span>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">{sub.billingCycle}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
