import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { API_BASE_URL } from '../services/api';
import { useLocation } from 'react-router-dom';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS
} from '../utils/categories';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  RotateCcw,
  UploadCloud,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Undo2,
  Calendar
} from 'lucide-react';

const Transactions = () => {
  const { user } = useAuth();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Toast notification for Undo Delete
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Search & Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterTag, setFilterTag] = useState('');

  // Sorting
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [formType, setFormType] = useState('EXPENSE'); // EXPENSE or INCOME
  const [formAmount, setFormAmount] = useState('');
  const [formMainCat, setFormMainCat] = useState('');
  const [formSubCat, setFormSubCat] = useState('');
  const [formCustomCat, setFormCustomCat] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formMerchant, setFormMerchant] = useState('');
  const [formPayment, setFormPayment] = useState('Cash');
  const [formCurrency, setFormCurrency] = useState(user?.currency || 'USD');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTags, setFormTags] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // View Receipt Modal state
  const [viewReceiptUrl, setViewReceiptUrl] = useState('');

  const currencySymbol = CURRENCIES.find(c => c.code === user?.currency)?.symbol || '$';

  // Check if routed from dashboard quick action
  useEffect(() => {
    if (location.state?.openAddModal) {
      setFormType(location.state.defaultType || 'EXPENSE');
      openModal(null);
    }
  }, [location]);

  // Fetch transactions on load / filter change
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = '/api/transactions/filter?';
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (filterSubcategory) params.append('subcategory', filterSubcategory);
      if (filterPayment) params.append('paymentMethod', filterPayment);
      if (filterMinAmount) params.append('minAmount', filterMinAmount);
      if (filterMaxAmount) params.append('maxAmount', filterMaxAmount);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);
      if (filterCurrency) params.append('currency', filterCurrency);
      if (filterTag) params.append('tag', filterTag);
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(url + params.toString());
      setTransactions(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve transaction records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchQuery, filterCategory, filterSubcategory, filterPayment, filterMinAmount, filterMaxAmount, filterStartDate, filterEndDate, filterCurrency, filterTag]);

  // Soft Delete Handler with Undo Toast
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/transactions/${id}`);
      // Remove local copy from active list immediately
      const deletedTx = transactions.find(t => t.id === id);
      setTransactions(prev => prev.filter(t => t.id !== id));

      // Trigger Undo Toast
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setToast({
        id,
        message: `Transaction deleted successfully`,
        data: deletedTx
      });

      // Clear toast after 5 seconds
      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
      }, 5000);

    } catch (err) {
      console.error(err);
      alert('Delete request failed');
    }
  };

  // Undo soft delete
  const handleUndoDelete = async () => {
    if (!toast) return;
    const { id } = toast;
    try {
      await api.put(`/api/transactions/${id}/restore`);
      setToast(null);
      fetchTransactions(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Could not restore transaction');
    }
  };

  // Modal Open Handler
  const openModal = (tx = null) => {
    if (tx) {
      setEditingTx(tx);
      setFormType(tx.type);
      setFormAmount(tx.amount);
      setFormMainCat(tx.mainCategory);
      setFormSubCat(tx.subcategory);
      setFormCustomCat(tx.customCategory || '');
      setFormDesc(tx.description || '');
      setFormNotes(tx.notes || '');
      setFormMerchant(tx.merchant || '');
      setFormPayment(tx.paymentMethod);
      setFormCurrency(tx.currency);
      setFormDate(tx.date);
      setFormTags(tx.tags || '');
      setPreviewUrl(tx.receiptImage ? `${API_BASE_URL}${tx.receiptImage}` : '');
    } else {
      setEditingTx(null);
      setFormAmount('');
      setFormMainCat('');
      setFormSubCat('');
      setFormCustomCat('');
      setFormDesc('');
      setFormNotes('');
      setFormMerchant('');
      setFormPayment('Cash');
      setFormCurrency(user?.currency || 'USD');
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormTags('');
      setSelectedFile(null);
      setPreviewUrl('');
    }
    setModalOpen(true);
  };

  // Form Submit Handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formMainCat) {
      alert('Please select a main category');
      return;
    }

    const txPayload = {
      type: formType,
      amount: parseFloat(formAmount),
      mainCategory: formMainCat,
      subcategory: formSubCat,
      customCategory: formMainCat === 'Other' || formSubCat === 'Other' || formMainCat === 'Others' ? formCustomCat : '',
      description: formDesc,
      notes: formNotes,
      merchant: formMerchant,
      paymentMethod: formPayment,
      currency: formCurrency,
      date: formDate,
      tags: formTags
    };

    const formData = new FormData();
    formData.append('transaction', JSON.stringify(txPayload));
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      if (editingTx) {
        await api.put(`/api/transactions/${editingTx.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/api/transactions', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setModalOpen(false);
      fetchTransactions();
    } catch (err) {
      console.error(err);
      alert('Failed to save transaction');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Category change wrapper to reset subcategory
  const handleMainCatChange = (cat) => {
    setFormMainCat(cat);
    setFormSubCat('');
    setFormCustomCat('');
  };

  // Reset Filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilterCategory('');
    setFilterSubcategory('');
    setFilterPayment('');
    setFilterMinAmount('');
    setFilterMaxAmount('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterCurrency('');
    setFilterTag('');
  };

  // Sorting Handler
  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'amount') {
      aVal = parseFloat(aVal);
      bVal = parseFloat(bVal);
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginated List
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 pb-12 relative animate-in fade-in duration-300">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log, modify, track expense and earnings slips.
          </p>
        </div>
        <button
          onClick={() => {
            setFormType('EXPENSE');
            openModal(null);
          }}
          className="btn-emerald flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Quick search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search merchant, description, category or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 glass-input text-sm"
            />
          </div>

          {/* Toggle advance filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer
                ${showFilters
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'border-slate-200/20 bg-white/5 text-slate-600 dark:text-slate-300'
                }
              `}
            >
              <Filter className="w-4 h-4" />
              <span>Advanced Filters</span>
            </button>
            {(filterCategory || filterSubcategory || filterPayment || filterMinAmount || filterMaxAmount || filterStartDate || filterEndDate || filterCurrency || filterTag) && (
              <button
                onClick={resetFilters}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Collapsible advanced filters form */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 pt-4 border-t border-slate-200/10 animate-in slide-in-from-top-4 duration-200">
            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Main Category</label>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setFilterSubcategory('');
                }}
                className="w-full glass-input text-xs py-1.5"
              >
                <option value="">All Categories</option>
                {Object.keys(EXPENSE_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                {INCOME_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Subcategory Select (only populated if EXPENSE category is chosen) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Subcategory</label>
              <select
                value={filterSubcategory}
                onChange={(e) => setFilterSubcategory(e.target.value)}
                disabled={!filterCategory || !EXPENSE_CATEGORIES[filterCategory]}
                className="w-full glass-input text-xs py-1.5 disabled:opacity-40"
              >
                <option value="">All Subcategories</option>
                {filterCategory &&
                  EXPENSE_CATEGORIES[filterCategory] &&
                  EXPENSE_CATEGORIES[filterCategory].map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
              </select>
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Method</label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full glass-input text-xs py-1.5"
              >
                <option value="">All Methods</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Currency */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Currency</label>
              <select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                className="w-full glass-input text-xs py-1.5"
              >
                <option value="">All Currencies</option>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tag</label>
              <input
                type="text"
                placeholder="e.g. vacation"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full glass-input text-xs py-1.5"
              />
            </div>

            {/* Amount range */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Min Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={filterMinAmount}
                onChange={(e) => setFilterMinAmount(e.target.value)}
                className="w-full glass-input text-xs py-1.5"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Max Amount</label>
              <input
                type="number"
                placeholder="99999"
                value={filterMaxAmount}
                onChange={(e) => setFilterMaxAmount(e.target.value)}
                className="w-full glass-input text-xs py-1.5"
              />
            </div>

            {/* Dates */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full glass-input text-xs py-1.5"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">End Date</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full glass-input text-xs py-1.5"
              />
            </div>
          </div>
        )}
      </div>

      {/* Transactions Data Table */}
      <div className="glass-panel overflow-hidden border border-slate-200/10 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-200/5 border-b border-slate-200/10 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-200/5 select-none" onClick={() => handleSort('date')}>
                  Date & Time {sortField === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-6 py-4">Category & Subcategory</th>
                <th className="px-6 py-4">Merchant / Details</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-200/5 select-none text-right" onClick={() => handleSort('amount')}>
                  Amount {sortField === 'amount' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-6 py-4 text-center">Receipt</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/10">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-2"></div>
                    Retrieving transaction table...
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No transactions match your query parameters.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const txCurrencySymbol = currencySymbol;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-200/5 transition duration-150">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{tx.date}</div>
                        <div className="text-[10px] text-slate-400">{tx.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {tx.mainCategory}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {tx.subcategory || 'Income Stream'}
                          {tx.customCategory && (
                            <span className="ml-1.5 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              Custom: {tx.customCategory}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {tx.merchant || 'N/A'}
                        </div>
                        {tx.description && <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{tx.description}</div>}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {tx.paymentMethod}
                      </td>
                      <td className="px-6 py-4">
                        {tx.tags ? (
                          <div className="flex flex-wrap gap-1">
                            {tx.tags.split(',').map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] font-semibold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full"
                              >
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-black">
                        <span className={tx.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}>
                          {tx.type === 'INCOME' ? '+' : '-'}{txCurrencySymbol}{Number(tx.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {tx.receiptImage ? (
                          <button
                            onClick={() => setViewReceiptUrl(`${API_BASE_URL}${tx.receiptImage}`)}
                            className="p-1 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition cursor-pointer"
                            title="View Receipt"
                          >
                            <Eye className="w-4.5 h-4.5 mx-auto" />
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No attachment</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openModal(tx)}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition cursor-pointer"
                            title="Delete"
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

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/10 bg-slate-200/5 text-xs text-slate-500 font-semibold select-none">
            <span>
              Showing Page {currentPage} of {totalPages} ({transactions.length} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200/20 hover:bg-slate-200/10 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200/20 hover:bg-slate-200/10 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Undo Delete Toast alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl glass-panel border-emerald-500/30 flex items-center justify-between gap-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-w-sm w-full">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{toast.message}</p>
            <p className="text-[10px] text-slate-400">You have 5 seconds to undo this action.</p>
          </div>
          <button
            onClick={handleUndoDelete}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-extrabold shadow shadow-emerald-500/20 hover:bg-emerald-600 transition cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
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

      {/* Add / Edit Transaction Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                <span>{editingTx ? 'Edit Transaction Details' : 'Record Transaction'}</span>
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
              {/* Type Switch (Expense / Income) */}
              <div className="flex p-1 rounded-xl bg-slate-200/10 border border-slate-200/5">
                <button
                  type="button"
                  onClick={() => {
                    setFormType('EXPENSE');
                    setFormMainCat('');
                    setFormSubCat('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition
                    ${formType === 'EXPENSE'
                      ? 'bg-rose-500 text-white shadow shadow-rose-500/10'
                      : 'text-slate-400 hover:text-slate-200'
                    }
                  `}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormType('INCOME');
                    setFormMainCat('');
                    setFormSubCat('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition
                    ${formType === 'INCOME'
                      ? 'bg-emerald-500 text-white shadow shadow-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-200'
                    }
                  `}
                >
                  Income
                </button>
              </div>

              {/* Amount and Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Amount</label>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Currency</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full glass-input text-xs"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Mappings */}
              <div className="grid grid-cols-2 gap-3">
                {/* Main Category */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Food, Travel, Rent"
                    value={formMainCat}
                    onChange={(e) => setFormMainCat(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>

                {/* Subcategory */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Subcategory (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Pizza, Taxi, Electricity"
                    value={formSubCat}
                    onChange={(e) => setFormSubCat(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              {/* Merchant & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Merchant / Source</label>
                  <input
                    type="text"
                    placeholder="e.g. Walmart, Client"
                    value={formMerchant}
                    onChange={(e) => setFormMerchant(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Method</label>
                  <select
                    value={formPayment}
                    onChange={(e) => setFormPayment(e.target.value)}
                    className="w-full glass-input text-xs"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Tags */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Transaction Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tags</label>
                  <input
                    type="text"
                    placeholder="e.g. rent, bills (comma separated)"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              {/* Description & Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Additional details..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full glass-input text-xs resize-none"
                />
              </div>

              {/* Receipt File Upload */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Receipt Proof Image</label>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-full border border-dashed border-slate-200/20 hover:border-emerald-500/50 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-200/5 transition flex flex-col items-center gap-1.5"
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="Receipt preview" className="w-32 h-20 object-contain rounded border border-slate-200/10" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl('');
                        }}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 text-slate-400" />
                      <span className="text-[10px] text-slate-400">Click to upload invoice or bill receipt image (max 5MB)</span>
                    </>
                  )}
                </div>
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
