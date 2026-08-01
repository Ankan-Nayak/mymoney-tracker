import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CURRENCIES } from '../utils/categories';
import {
  FileSpreadsheet,
  Download,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#64748b'];

const Analytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const currencySymbol = CURRENCIES.find(c => c.code === user?.currency)?.symbol || '$';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/api/reports/analytics');
        setData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get('/api/reports/export/csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mymoney_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('CSV Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] w-full flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const { expenseByCategory = {}, incomeByCategory = {}, monthlyComparison = [] } = data || {};

  // Formulate data structure for Recharts
  const expenseData = Object.keys(expenseByCategory).map((cat) => ({
    name: cat,
    value: parseFloat(expenseByCategory[cat])
  }));

  const incomeData = Object.keys(incomeByCategory).map((cat) => ({
    name: cat,
    value: parseFloat(incomeByCategory[cat])
  }));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View expense breakdowns, category metrics, and download statement exports.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="btn-emerald flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 disabled:opacity-50"
        >
          {exporting ? (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
          ) : (
            <FileSpreadsheet className="w-4.5 h-4.5" />
          )}
          <span>Export Transactions CSV</span>
        </button>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Distribution */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <PieIcon className="w-4.5 h-4.5 text-rose-500" />
            <span>Expense Distribution</span>
          </h3>
          <div className="h-64 flex items-center justify-center">
            {expenseData.length === 0 ? (
              <p className="text-xs text-slate-400">No expense records found to compile.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${currencySymbol}${Number(value).toFixed(2)}`} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Income Distribution */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <PieIcon className="w-4.5 h-4.5 text-emerald-500" />
            <span>Income Distribution</span>
          </h3>
          <div className="h-64 flex items-center justify-center">
            {incomeData.length === 0 ? (
              <p className="text-xs text-slate-400">No earnings records found to compile.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${currencySymbol}${Number(value).toFixed(2)}`} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="glass-panel p-5 space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4.5 h-4.5 text-emerald-500" />
            <span>Monthly Cash Flow Comparison</span>
          </h3>
          <div className="h-72">
            {monthlyComparison.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-20">No monthly summaries recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip formatter={(value) => `${currencySymbol}${Number(value).toFixed(2)}`} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="income" name="Earnings" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Spendings" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
