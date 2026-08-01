import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CURRENCIES } from '../utils/categories';
import {
  Plus,
  Trash2,
  Calendar,
  HandCoins,
  Search,
  CheckCircle,
  Coins,
  History,
  Clock,
  X,
  User
} from 'lucide-react';

const LoansDebts = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPerson, setSearchPerson] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('ALL'); // ALL, PENDING, COMPLETED

  // Modal states (Create/Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [formPerson, setFormPerson] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState('LENT'); // LENT, BORROWED
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState('');
  const [formPaid, setFormPaid] = useState('0');
  const [formNotes, setFormNotes] = useState('');

  // Repayment states
  const [repayModalOpen, setRepayModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');

  const currencySymbol = CURRENCIES.find(c => c.code === user?.currency)?.symbol || '$';

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/loans');
      setLoans(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this loan tracker record?')) return;
    try {
      await api.delete(`/api/loans/${id}`);
      fetchLoans();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        personName: formPerson,
        amount: parseFloat(formAmount),
        type: formType,
        loanDate: formDate,
        dueDate: formDueDate,
        amountPaid: parseFloat(formPaid || 0),
        notes: formNotes
      };
      await api.post('/api/loans', payload);
      setModalOpen(false);
      resetForm();
      fetchLoans();
    } catch (err) {
      console.error(err);
      alert('Failed to save loan entry');
    }
  };

  const handleRepaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedLoan || !repayAmount) return;
    try {
      await api.post(`/api/loans/${selectedGoalForRepay().id}/pay?amount=${parseFloat(repayAmount)}`);
      setRepayModalOpen(false);
      setRepayAmount('');
      setSelectedLoan(null);
      fetchLoans();
    } catch (err) {
      console.error(err);
      alert('Repayment registration failed');
    }
  };

  const selectedGoalForRepay = () => selectedLoan;

  const resetForm = () => {
    setFormPerson('');
    setFormAmount('');
    setFormType('LENT');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDueDate('');
    setFormPaid('0');
    setFormNotes('');
  };

  // Filter calculations
  const filteredLoans = loans.filter((loan) => {
    const matchesPerson = loan.personName.toLowerCase().includes(searchPerson.toLowerCase());
    const matchesStatus =
      filterCompleted === 'ALL' ||
      (filterCompleted === 'COMPLETED' && loan.completed) ||
      (filterCompleted === 'PENDING' && !loan.completed);
    return matchesPerson && matchesStatus;
  });

  // Balance aggregates
  const totalLentPending = loans
    .filter(l => l.type === 'LENT' && !l.completed)
    .reduce((sum, l) => sum + (parseFloat(l.amount) - parseFloat(l.amountPaid)), 0);

  const totalBorrowedPending = loans
    .filter(l => l.type === 'BORROWED' && !l.completed)
    .reduce((sum, l) => sum + (parseFloat(l.amount) - parseFloat(l.amountPaid)), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Balances Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="glass-card p-5 border-l-4 border-l-emerald-500 relative">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lent (Receivables)</p>
          <h3 className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
            {currencySymbol}{totalLentPending.toLocaleString()}
          </h3>
          <span className="text-[10px] text-slate-400 mt-2 block">Money others owe you</span>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-rose-500 relative">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Borrowed (Payables)</p>
          <h3 className="text-2xl font-black mt-1 text-rose-600 dark:text-rose-400">
            {currencySymbol}{totalBorrowedPending.toLocaleString()}
          </h3>
          <span className="text-[10px] text-slate-400 mt-2 block">Money you owe others</span>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-indigo-500 relative sm:col-span-2 lg:col-span-1 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Outstanding Balance</p>
            <h3 className={`text-2xl font-black mt-1 ${(totalLentPending - totalBorrowedPending) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {currencySymbol}{(totalLentPending - totalBorrowedPending).toLocaleString()}
            </h3>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-emerald flex items-center gap-2 text-xs cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Loan Track</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by contact person name..."
            value={searchPerson}
            onChange={(e) => setSearchPerson(e.target.value)}
            className="w-full pl-10 glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'PENDING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterCompleted(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer
                ${filterCompleted === st
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'border-slate-200/10 text-slate-400 hover:text-slate-200'
                }
              `}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Loans Grid List */}
      {loading ? (
        <div className="h-[20vh] w-full flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 text-sm">
          No matching loan or debt records. Keep track of money borrowed or lent!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredLoans.map((loan) => {
            const amount = parseFloat(loan.amount);
            const paid = parseFloat(loan.amountPaid);
            const remaining = amount - paid;
            const isCompleted = loan.completed;
            const isLent = loan.type === 'LENT';

            const pct = amount > 0 ? (paid / amount) * 100 : 0;

            return (
              <div
                key={loan.id}
                className={`glass-panel p-5 flex flex-col justify-between border transition-all duration-200
                  ${isCompleted
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : isLent
                      ? 'border-emerald-500/10 hover:shadow-lg'
                      : 'border-rose-500/10 hover:shadow-lg'
                  }
                `}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs
                        ${isCompleted
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : isLent
                            ? 'bg-emerald-500/10 text-emerald-500 animate-pulse'
                            : 'bg-rose-500/10 text-rose-500 animate-pulse'
                        }
                      `}>
                        <User className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {loan.personName}
                        </h4>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase
                          ${isLent ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}
                        `}>
                          {isLent ? 'Money Lent' : 'Money Borrowed'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(loan.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {loan.notes && (
                    <p className="text-[10px] text-slate-400 italic bg-slate-200/5 p-2 rounded mt-3">
                      "{loan.notes}"
                    </p>
                  )}
                </div>

                <div className="space-y-3.5 mt-6 pt-3.5 border-t border-slate-200/5">
                  {/* Progress of repayment */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-200/15 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500
                          ${isCompleted
                            ? 'bg-emerald-500'
                            : isLent
                              ? 'bg-emerald-400'
                              : 'bg-rose-400'
                          }
                        `}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-semibold">Repaid: {pct.toFixed(0)}%</span>
                      <span className="font-extrabold text-slate-700 dark:text-slate-200">
                        {currencySymbol}{paid.toFixed(2)} / {currencySymbol}{amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Due Date: {loan.dueDate || 'N/A'}
                    </span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">
                      Balance: {currencySymbol}{remaining.toFixed(2)}
                    </span>
                  </div>

                  {!isCompleted ? (
                    <button
                      onClick={() => openFundModal(loan)}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow shadow-emerald-500/10"
                    >
                      <Coins className="w-4 h-4" />
                      <span>Record Installment Repayment</span>
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-extrabold text-center flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Fully Completed & Settled</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Loan Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-emerald-500" />
                <span>Track Borrow / Lend Deal</span>
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
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Person Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe, Bank Name"
                  value={formPerson}
                  onChange={(e) => setFormPerson(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Deal Direction</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('LENT')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition
                      ${formType === 'LENT'
                        ? 'bg-emerald-500 text-white'
                        : 'border border-slate-200/10 text-slate-400 hover:text-slate-200'
                      }
                    `}
                  >
                    Money Lent (Receivable)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('BORROWED')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition
                      ${formType === 'BORROWED'
                        ? 'bg-emerald-500 text-white'
                        : 'border border-slate-200/10 text-slate-400 hover:text-slate-200'
                      }
                    `}
                  >
                    Money Borrowed (Payable)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Total Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Paid / Settled initial</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formPaid}
                    onChange={(e) => setFormPaid(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Reason / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Notes..."
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
                  Activate Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repay Installment Modal */}
      {repayModalOpen && selectedGoalForRepay() && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-500 animate-pulse" />
                <span>Log Settle: {selectedGoalForRepay().personName}</span>
              </h3>
              <button
                onClick={() => setRepayModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200/10 transition text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRepaySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Repayment Amount</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-xs pointer-events-none">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    autoFocus
                    placeholder="0.00"
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    className="w-full pl-8 glass-input text-xs"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/10">
                <button
                  type="button"
                  onClick={() => setRepayModalOpen(false)}
                  className="px-4 py-2 border border-slate-200/15 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200/10 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-emerald text-xs cursor-pointer">
                  Save Settle installment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoansDebts;
