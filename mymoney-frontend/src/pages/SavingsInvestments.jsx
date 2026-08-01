import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CURRENCIES, INVESTMENT_TYPES } from '../utils/categories';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Trash2,
  PiggyBank,
  Wallet,
  Coins,
  History,
  Briefcase,
  X,
  Edit2
} from 'lucide-react';

const SavingsInvestments = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('SAVINGS'); // SAVINGS or INVESTMENTS

  // Savings states
  const [savingsHistory, setSavingsHistory] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [savingsModalOpen, setSavingsModalOpen] = useState(false);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [savingsNotes, setSavingsNotes] = useState('');
  const [savingsDate, setSavingsDate] = useState(new Date().toISOString().split('T')[0]);

  // Investments states
  const [investments, setInvestments] = useState([]);
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [invType, setInvType] = useState('Stocks');
  const [invName, setInvName] = useState('');
  const [invInvested, setInvInvested] = useState('');
  const [invCurrent, setInvCurrent] = useState('');
  const [invNotes, setInvNotes] = useState('');

  const currencySymbol = CURRENCIES.find(c => c.code === user?.currency)?.symbol || '$';

  // Load datasets
  const fetchSavings = async () => {
    try {
      const hRes = await api.get('/api/savings');
      const tRes = await api.get('/api/savings/total');
      setSavingsHistory(hRes.data);
      setTotalSavings(tRes.data.totalSavings || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvestments = async () => {
    try {
      const response = await api.get('/api/investments');
      setInvestments(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSavings();
    fetchInvestments();
  }, []);

  // Savings Handlers
  const handleSavingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const amountVal = parseFloat(savingsAmount);
      const payload = {
        amount: Math.abs(amountVal),
        type: amountVal >= 0 ? 'DEPOSIT' : 'WITHDRAW',
        notes: savingsNotes,
        date: savingsDate
      };
      await api.post('/api/savings', payload);
      setSavingsModalOpen(false);
      setSavingsAmount('');
      setSavingsNotes('');
      fetchSavings();
    } catch (err) {
      console.error(err);
      alert('Failed to log savings');
    }
  };

  const handleSavingsDelete = async (id) => {
    if (!window.confirm('Delete this savings record?')) return;
    try {
      await api.delete(`/api/savings/${id}`);
      fetchSavings();
    } catch (err) {
      console.error(err);
    }
  };

  // Investment Handlers
  const handleInvestmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type: invType,
        name: invName,
        investedAmount: parseFloat(invInvested),
        currentValue: parseFloat(invCurrent),
        notes: invNotes
      };

      if (editingInv) {
        await api.put(`/api/investments/${editingInv.id}`, payload);
      } else {
        await api.post('/api/investments', payload);
      }
      setInvestmentModalOpen(false);
      resetInvestmentForm();
      fetchInvestments();
    } catch (err) {
      console.error(err);
      alert('Failed to save investment');
    }
  };

  const handleInvestmentDelete = async (id) => {
    if (!window.confirm('Remove this investment listing?')) return;
    try {
      await api.delete(`/api/investments/${id}`);
      fetchInvestments();
    } catch (err) {
      console.error(err);
    }
  };

  const openInvestmentModal = (inv = null) => {
    if (inv) {
      setEditingInv(inv);
      setInvType(inv.type);
      setInvName(inv.name);
      setInvInvested(inv.investedAmount);
      setInvCurrent(inv.currentValue);
      setInvNotes(inv.notes || '');
    } else {
      setEditingInv(null);
      setInvType('Stocks');
      setInvName('');
      setInvInvested('');
      setInvCurrent('');
      setInvNotes('');
    }
    setInvestmentModalOpen(true);
  };

  const resetInvestmentForm = () => {
    setInvType('Stocks');
    setInvName('');
    setInvInvested('');
    setInvCurrent('');
    setInvNotes('');
    setEditingInv(null);
  };

  // Investment aggregates
  const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.investedAmount), 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + parseFloat(inv.currentValue), 0);
  const totalGainLoss = totalCurrentValue - totalInvested;
  const gainPct = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Tab Switcher */}
      <div className="flex p-1 rounded-2xl bg-slate-200/10 border border-slate-200/5 max-w-sm">
        <button
          onClick={() => setActiveTab('SAVINGS')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer
            ${activeTab === 'SAVINGS'
              ? 'bg-emerald-500 text-white shadow shadow-emerald-500/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
            }
          `}
        >
          <PiggyBank className="w-4 h-4" />
          <span>Savings</span>
        </button>
        <button
          onClick={() => setActiveTab('INVESTMENTS')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer
            ${activeTab === 'INVESTMENTS'
              ? 'bg-emerald-500 text-white shadow shadow-emerald-500/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
            }
          `}
        >
          <Briefcase className="w-4 h-4" />
          <span>Investments</span>
        </button>
      </div>

      {/* ==================== SAVINGS TAB ==================== */}
      {activeTab === 'SAVINGS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Card aggregates & deposit button */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="glass-card p-5 max-w-md w-full relative overflow-hidden border-l-4 border-l-emerald-500">
              <div className="absolute top-0 right-0 p-3 text-slate-500/10 dark:text-white/5">
                <PiggyBank className="w-16 h-16" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Savings Pool</p>
              <h3 className="text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">
                {currencySymbol}{Number(totalSavings).toLocaleString()}
              </h3>
            </div>

            <button
              onClick={() => setSavingsModalOpen(true)}
              className="btn-emerald flex items-center gap-2 text-xs cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Log Savings</span>
            </button>
          </div>

          {/* Savings logs history */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <History className="w-4.5 h-4.5 text-emerald-500" />
              <span>Savings History & Deposits</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-200/10 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Description / Note</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/10">
                  {savingsHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                        No deposits or withdrawal records logged.
                      </td>
                    </tr>
                  ) : (
                    savingsHistory.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-200/5 transition">
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {s.date}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase
                            ${s.amount >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}
                          `}>
                            {s.amount >= 0 ? 'Deposit' : 'Withdrawal'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 italic">
                          {s.notes || 'Savings allocation'}
                        </td>
                        <td className="px-4 py-3 text-right font-black whitespace-nowrap">
                          <span className={s.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                            {s.amount >= 0 ? '+' : ''}{currencySymbol}{Number(s.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleSavingsDelete(s.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== INVESTMENTS TAB ==================== */}
      {activeTab === 'INVESTMENTS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Card aggregates & investment button */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {/* Invested Amount */}
              <div className="glass-card p-5 relative border-l-4 border-l-indigo-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invested Capital</p>
                <h3 className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">
                  {currencySymbol}{Number(totalInvested).toLocaleString()}
                </h3>
              </div>

              {/* Current Value / Profit */}
              <div className="glass-card p-5 relative border-l-4 border-l-emerald-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Net Value</p>
                <h3 className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100 flex items-baseline gap-2">
                  <span>{currencySymbol}{Number(totalCurrentValue).toLocaleString()}</span>
                  <span className={`text-xs font-bold flex items-center gap-0.5
                    ${totalGainLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}
                  `}>
                    {totalGainLoss >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{gainPct.toFixed(1)}%</span>
                  </span>
                </h3>
              </div>
            </div>

            <button
              onClick={() => openInvestmentModal(null)}
              className="btn-emerald flex items-center gap-2 text-xs cursor-pointer shadow-lg shadow-emerald-500/10 self-start md:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Track Investment</span>
            </button>
          </div>

          {/* Investments List */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Briefcase className="w-4.5 h-4.5 text-emerald-500" />
              <span>Asset Portfolio</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-200/10 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="px-4 py-3">Asset Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Invested</th>
                    <th className="px-4 py-3 text-right">Current Value</th>
                    <th className="px-4 py-3 text-right">Profit / Loss</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/10">
                  {investments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                        No active investments logged. Buy stocks, crypto, or gold to track!
                      </td>
                    </tr>
                  ) : (
                    investments.map((inv) => {
                      const invested = parseFloat(inv.investedAmount);
                      const current = parseFloat(inv.currentValue);
                      const gainLoss = current - invested;
                      const percentage = invested > 0 ? (gainLoss / invested) * 100 : 0;

                      return (
                        <tr key={inv.id} className="hover:bg-slate-200/5 transition">
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                            <div>{inv.name}</div>
                            {inv.notes && <div className="text-[9px] text-slate-400 truncate max-w-[150px]">{inv.notes}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[9px] font-extrabold bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded-full uppercase">
                              {inv.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-medium">
                            {currencySymbol}{invested.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-medium">
                            {currencySymbol}{current.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-black">
                            <span className={gainLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                              {gainLoss >= 0 ? '+' : ''}{currencySymbol}{gainLoss.toFixed(2)}
                              <span className="text-[9px] font-bold ml-1.5">({percentage.toFixed(1)}%)</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openInvestmentModal(inv)}
                                className="p-1 rounded text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleInvestmentDelete(inv.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Log Savings Modal */}
      {savingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-500" />
                <span>Log Savings Pool</span>
              </h3>
              <button
                onClick={() => setSavingsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200/10 transition text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavingsSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Deposit / Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-xs pointer-events-none">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={savingsAmount}
                    onChange={(e) => setSavingsAmount(e.target.value)}
                    className="w-full pl-8 glass-input text-xs"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1">To withdraw savings, type in a negative number (e.g. -100)</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Allocated Date</label>
                <input
                  type="date"
                  required
                  value={savingsDate}
                  onChange={(e) => setSavingsDate(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Allocated Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. monthly backup fund"
                  value={savingsNotes}
                  onChange={(e) => setSavingsNotes(e.target.value)}
                  className="w-full glass-input text-xs resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/10">
                <button
                  type="button"
                  onClick={() => setSavingsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200/15 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200/10 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-emerald text-xs cursor-pointer">
                  Save Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Track Investment Modal */}
      {investmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-500" />
                <span>{editingInv ? 'Modify Investment Log' : 'Log Investment Asset'}</span>
              </h3>
              <button
                onClick={() => setInvestmentModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200/10 transition text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleInvestmentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Asset Type</label>
                <select
                  value={invType}
                  onChange={(e) => setInvType(e.target.value)}
                  className="w-full glass-input text-xs"
                >
                  {INVESTMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S&P 500 ETF, BTC"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Invested Capital</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={invInvested}
                    onChange={(e) => setInvInvested(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Current Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={invCurrent}
                    onChange={(e) => setInvCurrent(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Asset Notes</label>
                <textarea
                  rows="2"
                  placeholder="Additional portfolio details..."
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  className="w-full glass-input text-xs resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/10">
                <button
                  type="button"
                  onClick={() => setInvestmentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200/15 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200/10 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-emerald text-xs cursor-pointer">
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsInvestments;
