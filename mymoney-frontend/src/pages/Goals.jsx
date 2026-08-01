import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CURRENCIES, GOAL_TYPES } from '../utils/categories';
import {
  Plus,
  Target,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  X,
  Coins
} from 'lucide-react';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Form states (Create Goal)
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formCurrent, setFormCurrent] = useState('0');
  const [formDate, setFormDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [customGoalName, setCustomGoalName] = useState('');

  // Fund Form states
  const [fundAmount, setFundAmount] = useState('');

  const currencySymbol = CURRENCIES.find(c => c.code === user?.currency)?.symbol || '$';

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/goals/progress');
      setGoals(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this savings goal?')) return;
    try {
      await api.delete(`/api/goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formName === 'Other' ? customGoalName : formName,
        targetAmount: parseFloat(formTarget),
        currentSavedAmount: parseFloat(formCurrent || 0),
        targetDate: formDate,
        notes: formNotes
      };
      await api.post('/api/goals', payload);
      setModalOpen(false);
      resetCreateForm();
      fetchGoals();
    } catch (err) {
      console.error(err);
      alert('Failed to create savings goal');
    }
  };

  const handleFundSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGoal || !fundAmount) return;
    try {
      await api.post(`/api/goals/${selectedGoal.id}/add-funds?amount=${parseFloat(fundAmount)}`);
      setFundModalOpen(false);
      setFundAmount('');
      setSelectedGoal(null);
      fetchGoals();
    } catch (err) {
      console.error(err);
      alert('Failed to save deposit');
    }
  };

  const resetCreateForm = () => {
    setFormName('');
    setFormTarget('');
    setFormCurrent('0');
    setFormDate('');
    setFormNotes('');
    setCustomGoalName('');
  };

  const openFundModal = (goal) => {
    setSelectedGoal(goal);
    setFundModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define target milestones, add deposit funds, and visual savings logs.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-emerald flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Grid List of Goals */}
      {loading ? (
        <div className="h-[30vh] w-full flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 text-sm">
          No savings goals configured. Add a laptop, car, or vacation goal above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const pct = Number(goal.progressPercentage) || 0;
            const isCompleted = pct >= 100;

            return (
              <div
                key={goal.id}
                className={`glass-panel p-5 space-y-4 border flex flex-col justify-between transition-all duration-200
                  ${isCompleted
                    ? 'border-emerald-500/30 bg-emerald-500/5 shadow-md shadow-emerald-500/5'
                    : 'border-slate-200/10 hover:shadow-lg'
                  }
                `}
              >
                <div>
                  {/* Goal Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs
                        ${isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200/10 text-slate-500'}
                      `}>
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {goal.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase">
                          Target Date: {goal.targetDate || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Remove Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Description / Notes */}
                  {goal.notes && (
                    <p className="text-[11px] text-slate-400 bg-slate-200/5 p-2 rounded-lg mt-3.5 border border-slate-200/5 italic">
                      "{goal.notes}"
                    </p>
                  )}
                </div>

                {/* Progress Indicators */}
                <div className="space-y-3.5 mt-4">
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-200/15 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500
                          ${isCompleted ? 'bg-emerald-500' : 'bg-emerald-400'}
                        `}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-semibold">{pct.toFixed(0)}% Saved</span>
                      <span className="font-extrabold text-slate-700 dark:text-slate-200">
                        {currencySymbol}{Number(goal.currentSavedAmount).toLocaleString()} / {currencySymbol}{Number(goal.targetAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions / Deposit */}
                  <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-200/5">
                    <span className="text-[10px] text-slate-400">
                      Remaining: {currencySymbol}{Math.max(Number(goal.targetAmount) - Number(goal.currentSavedAmount), 0).toLocaleString()}
                    </span>

                    {!isCompleted ? (
                      <button
                        onClick={() => openFundModal(goal)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1 hover:bg-emerald-600 transition shadow shadow-emerald-500/10 cursor-pointer animate-pulse"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Add Funds</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Set Goal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500 animate-bounce" />
                <span>Establish Savings Goal</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200/10 transition text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Type Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Goal Type</label>
                <select
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full glass-input text-xs"
                >
                  <option value="">Select Goal Type</option>
                  {GOAL_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Custom Goal (Other option toggled) */}
              {formName === 'Other' && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-150">
                  <label className="text-[10px] font-bold text-slate-400 uppercase text-emerald-500">
                    Custom Goal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter custom goal"
                    value={customGoalName}
                    onChange={(e) => setCustomGoalName(e.target.value)}
                    className="w-full glass-input text-xs border-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Targets */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Amount</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Current Savings</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formCurrent}
                    onChange={(e) => setFormCurrent(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notes / Reason</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Buying a new workstation"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full glass-input text-xs resize-none"
                />
              </div>

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
                  Activate Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {fundModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-500 animate-spin" />
                <span>Save Funds: {selectedGoal.name}</span>
              </h3>
              <button
                onClick={() => setFundModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200/10 transition text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFundSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Deposit Amount</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none font-bold text-xs">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    autoFocus
                    placeholder="0.00"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="w-full pl-8 glass-input text-xs"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/10">
                <button
                  type="button"
                  onClick={() => setFundModalOpen(false)}
                  className="px-4 py-2 border border-slate-200/15 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200/10 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-emerald text-xs cursor-pointer">
                  Deposit Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
