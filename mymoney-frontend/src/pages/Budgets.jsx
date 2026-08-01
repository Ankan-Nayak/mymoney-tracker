import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CURRENCIES, EXPENSE_CATEGORIES } from '../utils/categories';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Sliders,
  DollarSign,
  Info,
  X
} from 'lucide-react';

const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [formCategory, setFormCategory] = useState('ALL'); // ALL (overall) or specific category
  const [formLimit, setFormLimit] = useState('');
  const [formType, setFormType] = useState('MONTHLY'); // WEEKLY, MONTHLY
  const [formMonth, setFormMonth] = useState(new Date().getMonth() + 1);
  const [formYear, setFormYear] = useState(new Date().getFullYear());

  const currencySymbol = CURRENCIES.find(c => c.code === user?.currency)?.symbol || '$';

  const fetchData = async () => {
    setLoading(true);
    try {
      const bRes = await api.get('/api/budgets');
      const rRes = await api.get(`/api/budgets/report?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`);
      setBudgets(bRes.data);
      setReports(rRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget limit?')) return;
    try {
      await api.delete(`/api/budgets/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const budgetPayload = {
        category: formCategory,
        limitAmount: parseFloat(formLimit),
        type: formType,
        month: parseInt(formMonth),
        year: parseInt(formYear)
      };
      await api.post('/api/budgets', budgetPayload);
      setModalOpen(false);
      setFormLimit('');
      setFormCategory('ALL');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to set budget. An active limit for this category might already exist.');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set spending guardrails by week, month, or specific categories.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-emerald flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>Configure Budget</span>
        </button>
      </div>

      {/* Budget Limit Status Gauge Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Active Budget Tracking ({new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()})
        </h3>

        {loading ? (
          <div className="h-[20vh] w-full flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400 text-sm">
            No active budget limits configured. Add one above to prevent overspending!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reports.map((report, idx) => {
              const spent = Number(report.spentAmount) || 0;
              const limit = Number(report.limitAmount) || 0;
              const remaining = Number(report.remainingAmount) || 0;
              const pct = Number(report.percentageUsed) || 0;
              const category = report.category || 'ALL';

              const isNearing = pct >= 80 && pct < 100;
              const isExceeded = pct >= 100;

              // Find matching database budget ID to allow deletion
              const matchingBudget = budgets.find(b => b.category === category);

              return (
                <div
                  key={`${category}-${idx}`}
                  className={`glass-panel p-5 space-y-4 border relative transition-all duration-200
                    ${isExceeded
                      ? 'border-rose-500/30 bg-rose-500/5 shadow-md shadow-rose-500/5'
                      : isNearing
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-slate-200/10'
                    }
                  `}
                >
                  {/* Category Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {category === 'ALL' ? 'Overall Monthly Budget' : `${category} Category`}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Type: {matchingBudget?.type || 'MONTHLY'}
                      </p>
                    </div>

                    {matchingBudget && (
                      <button
                        onClick={() => handleDelete(matchingBudget.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Remove Limit"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>

                  {/* Gauge bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-200/15 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500
                          ${isExceeded
                            ? 'bg-rose-500'
                            : isNearing
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }
                        `}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-semibold">{pct.toFixed(0)}% Used</span>
                      <span className="font-extrabold text-slate-700 dark:text-slate-200">
                        {currencySymbol}{spent.toFixed(2)} / {currencySymbol}{limit.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Summary details & warnings */}
                  <div className="flex justify-between items-center text-[10px]">
                    <div>
                      {isExceeded ? (
                        <span className="text-rose-500 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Exceeded limit by {currencySymbol}{Math.abs(remaining).toFixed(2)}!
                        </span>
                      ) : isNearing ? (
                        <span className="text-amber-500 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Warning! Nearing spending limit.
                        </span>
                      ) : (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Under budget limit. Safe.
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400">
                      Remaining: {remaining >= 0 ? `${currencySymbol}${remaining.toFixed(2)}` : `-${currencySymbol}${Math.abs(remaining).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Set Budget Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-500" />
                <span>Configure Budget Limit</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200/10 transition text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Category</label>
                <select
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full glass-input text-xs"
                >
                  <option value="ALL">Overall Limit (All spends)</option>
                  {Object.keys(EXPENSE_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>{cat} Category</option>
                  ))}
                </select>
              </div>

              {/* Limit Amount */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Spend Limit Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tracking Interval</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('MONTHLY')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition
                      ${formType === 'MONTHLY'
                        ? 'bg-emerald-500 text-white'
                        : 'border border-slate-200/10 text-slate-400 hover:text-slate-200'
                      }
                    `}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('WEEKLY')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition
                      ${formType === 'WEEKLY'
                        ? 'bg-emerald-500 text-white'
                        : 'border border-slate-200/10 text-slate-400 hover:text-slate-200'
                      }
                    `}
                  >
                    Weekly
                  </button>
                </div>
              </div>

              {/* Month/Year selector (Only if Monthly is active) */}
              {formType === 'MONTHLY' && (
                <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-150">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Month</label>
                    <select
                      value={formMonth}
                      onChange={(e) => setFormMonth(e.target.value)}
                      className="w-full glass-input text-xs"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {new Date(2020, m - 1).toLocaleString('default', { month: 'short' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Year</label>
                    <select
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      className="w-full glass-input text-xs"
                    >
                      {[2026, 2027, 2028].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200/15 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200/10 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-emerald text-xs cursor-pointer">
                  Activate Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
