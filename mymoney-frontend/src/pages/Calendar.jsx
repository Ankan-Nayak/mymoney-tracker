import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { API_BASE_URL } from '../services/api';
import { CURRENCIES } from '../utils/categories';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar as CalendarIcon,
  X,
  Eye,
  FileText
} from 'lucide-react';

const Calendar = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Date selection states
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayTransactions, setSelectedDayTransactions] = useState([]);
  const [viewReceiptUrl, setViewReceiptUrl] = useState('');

  const currencySymbol = CURRENCIES.find(c => c.code === user?.currency)?.symbol || '$';

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/transactions');
        setTransactions(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return days;
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // Sunday is 0
    return firstDay;
  };

  // Process days
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);
  const days = [];

  // Padding days from previous month
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }

  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getDailyTransactions = (dayNumber) => {
    if (!dayNumber) return [];
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(dayNumber).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    return transactions.filter(t => t.date === formattedDate);
  };

  const getDailySums = (dayNumber) => {
    const dayTx = getDailyTransactions(dayNumber);
    let income = 0;
    let expense = 0;

    dayTx.forEach(t => {
      if (t.type === 'INCOME') {
        income += parseFloat(t.amount);
      } else {
        expense += parseFloat(t.amount);
      }
    });

    return { income, expense, count: dayTx.length };
  };

  const handleDayClick = (dayNumber) => {
    if (!dayNumber) return;
    const dayTx = getDailyTransactions(dayNumber);
    setSelectedDay(dayNumber);
    setSelectedDayTransactions(dayTx);
  };

  // Summaries
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const monthYear = `${monthName} ${currentDate.getFullYear()}`;

  // Calculate monthly aggregates
  const monthlyTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
  });

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const monthlyExpense = monthlyTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Calendar Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View aggregated cash flows and transactions calendar-wise.
          </p>
        </div>

        {/* Month Picker */}
        <div className="flex items-center gap-4 bg-slate-200/10 border border-slate-200/5 px-4 py-2 rounded-2xl">
          <button onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-slate-200/10 transition cursor-pointer">
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 min-w-[120px] text-center">
            {monthYear}
          </span>
          <button onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-slate-200/10 transition cursor-pointer">
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Monthly summary widget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase">Monthly Net Flow</p>
          <h4 className={`text-base font-extrabold mt-1 ${(monthlyIncome - monthlyExpense) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {(monthlyIncome - monthlyExpense) >= 0 ? '+' : '-'}{currencySymbol}{Math.abs(monthlyIncome - monthlyExpense).toFixed(2)}
          </h4>
        </div>
        <div className="glass-card p-4 text-center border-l-4 border-emerald-500">
          <p className="text-xs text-slate-500 font-semibold uppercase">Total Earnings ({monthName})</p>
          <h4 className="text-base font-extrabold mt-1 text-emerald-500">
            +{currencySymbol}{monthlyIncome.toFixed(2)}
          </h4>
        </div>
        <div className="glass-card p-4 text-center border-l-4 border-rose-500">
          <p className="text-xs text-slate-500 font-semibold uppercase">Total Spending ({monthName})</p>
          <h4 className="text-base font-extrabold mt-1 text-rose-500">
            -{currencySymbol}{monthlyExpense.toFixed(2)}
          </h4>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-panel p-6">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days grid */}
        {loading ? (
          <div className="py-24 text-center text-slate-500">
            <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-2"></div>
            Loading calendar...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[80px] md:min-h-[100px] bg-slate-200/5 rounded-xl opacity-30 border border-transparent"
                  />
                );
              }

              const { income, expense, count } = getDailySums(day);
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[80px] md:min-h-[100px] p-2 glass-card flex flex-col justify-between cursor-pointer hover:bg-slate-200/10 transition border duration-150 relative
                    ${isToday ? 'border-emerald-500/70 ring-2 ring-emerald-500/10' : 'border-slate-200/5'}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-bold leading-none p-1 rounded
                      ${isToday ? 'bg-emerald-500 text-white font-extrabold' : 'text-slate-500 dark:text-slate-300'}
                    `}>
                      {day}
                    </span>
                    {count > 0 && (
                      <span className="text-[8px] font-semibold bg-slate-200/15 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                        {count} tx
                      </span>
                    )}
                  </div>

                  {/* Income/Expense summary badges */}
                  <div className="space-y-0.5 mt-2 select-none">
                    {income > 0 && (
                      <div className="text-[9px] font-bold text-emerald-500 leading-none truncate">
                        +{currencySymbol}{income.toFixed(0)}
                      </div>
                    )}
                    {expense > 0 && (
                      <div className="text-[9px] font-bold text-rose-500 leading-none truncate">
                        -{currencySymbol}{expense.toFixed(0)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Day Transactions Dialog */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-500" />
                <span>Transactions for {currentDate.toLocaleString('default', { month: 'long' })} {selectedDay}, {currentDate.getFullYear()}</span>
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 rounded-lg hover:bg-slate-200/10 transition text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-200/10">
              {selectedDayTransactions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No records saved on this date.
                </div>
              ) : (
                selectedDayTransactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs
                        ${tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}
                      `}>
                        {tx.type === 'INCOME' ? '+' : '-'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {tx.mainCategory} {tx.subcategory && `• ${tx.subcategory}`}
                        </h4>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span>{tx.time}</span>
                          <span>•</span>
                          <span>{tx.paymentMethod}</span>
                          {tx.receiptImage && (
                            <button
                              onClick={() => setViewReceiptUrl(`${API_BASE_URL}${tx.receiptImage}`)}
                              className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5 hover:underline"
                            >
                              <Eye className="w-3 h-3" /> View receipt
                            </button>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-black ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{currencySymbol}{tx.amount}
                      </span>
                      {tx.merchant && <p className="text-[9px] text-slate-400">{tx.merchant}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-200/10">
              <button
                onClick={() => setSelectedDay(null)}
                className="px-4 py-2 border border-slate-200/15 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200/10 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Receipt Image Attachment Modal */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full glass-panel p-4 flex flex-col items-center">
            <button
              onClick={() => setViewReceiptUrl('')}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-black/45 text-white hover:bg-black/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-emerald-500" />
              <span>Receipt Proof Attachment</span>
            </h3>
            <img
              src={viewReceiptUrl}
              alt="Receipt Attachment"
              className="max-h-[75vh] w-auto object-contain rounded-xl border border-white/10 shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
