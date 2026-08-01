import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { API_BASE_URL } from '../services/api';
import { CURRENCIES, SUBSCRIPTION_SERVICES, BILL_TYPES } from '../utils/categories';
import {
  Plus,
  Trash2,
  Calendar,
  CreditCard,
  Receipt,
  Clock,
  CheckCircle,
  X,
  FileText,
  UploadCloud,
  Eye,
  AlertCircle
} from 'lucide-react';

const BillsSubscriptions = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('BILLS'); // BILLS or SUBSCRIPTIONS

  // Subscriptions states
  const [subscriptions, setSubscriptions] = useState([]);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subName, setSubName] = useState('Netflix');
  const [customSubName, setCustomSubName] = useState('');
  const [subCost, setSubCost] = useState('');
  const [subDate, setSubDate] = useState('');
  const [subCycle, setSubCycle] = useState('MONTHLY'); // MONTHLY, YEARLY
  const [subNotes, setSubNotes] = useState('');

  // Bills states
  const [bills, setBills] = useState([]);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [billCategory, setBillCategory] = useState('Electricity');
  const [customBillCategory, setCustomBillCategory] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billProvider, setBillProvider] = useState('');
  const [billNotes, setBillNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // View Receipt attachment state
  const [viewReceiptUrl, setViewReceiptUrl] = useState('');

  const currencySymbol = CURRENCIES.find(c => c.code === user?.currency)?.symbol || '$';

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/api/subscriptions');
      setSubscriptions(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBills = async () => {
    try {
      const response = await api.get('/api/bills');
      setBills(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchBills();
  }, []);

  // Subscriptions Handlers
  const handleSubSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: subName === 'Others' ? customSubName : subName,
        cost: parseFloat(subCost),
        renewalDate: subDate,
        billingCycle: subCycle,
        notes: subNotes
      };
      await api.post('/api/subscriptions', payload);
      setSubModalOpen(false);
      resetSubForm();
      fetchSubscriptions();
    } catch (err) {
      console.error(err);
      alert('Failed to save subscription');
    }
  };

  const handleSubDelete = async (id) => {
    if (!window.confirm('Delete subscription tracker?')) return;
    try {
      await api.delete(`/api/subscriptions/${id}`);
      fetchSubscriptions();
    } catch (err) {
      console.error(err);
    }
  };

  const resetSubForm = () => {
    setSubName('Netflix');
    setCustomSubName('');
    setSubCost('');
    setSubDate('');
    setSubCycle('MONTHLY');
    setSubNotes('');
  };

  // Bills Handlers
  const handleBillSubmit = async (e) => {
    e.preventDefault();
    const billPayload = {
      category: billCategory === 'Others' ? customBillCategory : billCategory,
      amount: parseFloat(billAmount),
      dueDate: billDueDate,
      provider: billProvider,
      notes: billNotes
    };

    const formData = new FormData();
    formData.append('bill', JSON.stringify(billPayload));
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      await api.post('/api/bills', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBillModalOpen(false);
      resetBillForm();
      fetchBills();
    } catch (err) {
      console.error(err);
      alert('Failed to save bill');
    }
  };

  const handleBillPay = async (id) => {
    try {
      await api.put(`/api/bills/${id}/pay`);
      fetchBills();
    } catch (err) {
      console.error(err);
      alert('Could not record payment');
    }
  };

  const handleBillDelete = async (id) => {
    if (!window.confirm('Remove this bill tracker?')) return;
    try {
      await api.delete(`/api/bills/${id}`);
      fetchBills();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetBillForm = () => {
    setBillCategory('Electricity');
    setCustomBillCategory('');
    setBillAmount('');
    setBillDueDate('');
    setBillProvider('');
    setBillNotes('');
    setSelectedFile(null);
    setPreviewUrl('');
  };

  // Subscriptions total per month calculation
  const totalSubCostPerMonth = subscriptions.reduce((sum, s) => {
    const cost = parseFloat(s.cost);
    return sum + (s.billingCycle === 'MONTHLY' ? cost : cost / 12);
  }, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Tabs */}
      <div className="flex p-1 rounded-2xl bg-slate-200/10 border border-slate-200/5 max-w-sm">
        <button
          onClick={() => setActiveTab('BILLS')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer
            ${activeTab === 'BILLS'
              ? 'bg-emerald-500 text-white shadow shadow-emerald-500/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
            }
          `}
        >
          <Receipt className="w-4 h-4" />
          <span>Bills due</span>
        </button>
        <button
          onClick={() => setActiveTab('SUBSCRIPTIONS')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer
            ${activeTab === 'SUBSCRIPTIONS'
              ? 'bg-emerald-500 text-white shadow shadow-emerald-500/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
            }
          `}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscriptions</span>
        </button>
      </div>

      {/* ==================== BILLS TAB ==================== */}
      {activeTab === 'BILLS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitor recurring utilities and invoices. Upload receipts as proof of payment.
              </p>
            </div>
            <button
              onClick={() => setBillModalOpen(true)}
              className="btn-emerald flex items-center gap-2 text-xs cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Record Bill Due</span>
            </button>
          </div>

          {/* Bills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {bills.length === 0 ? (
              <div className="glass-panel p-12 text-center text-slate-400 text-sm md:col-span-3">
                No active bills tracker. Keep your utility due dates in check here!
              </div>
            ) : (
              bills.map((bill) => {
                const isPaid = bill.paid;
                const isOverdue = !isPaid && new Date(bill.dueDate) < new Date();

                return (
                  <div
                    key={bill.id}
                    className={`glass-panel p-5 flex flex-col justify-between border transition
                      ${isPaid
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : isOverdue
                          ? 'border-rose-500/30 bg-rose-500/5 animate-pulse'
                          : 'border-slate-200/10 hover:shadow-lg'
                      }
                    `}
                  >
                    <div>
                      {/* Bill Category Header */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase
                            ${isPaid
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : isOverdue
                                ? 'bg-rose-500/10 text-rose-500'
                                : 'bg-amber-500/10 text-amber-500'
                            }
                          `}>
                            {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                          </span>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2">
                            {bill.provider} ({bill.category})
                          </h4>
                        </div>

                        <button
                          onClick={() => handleBillDelete(bill.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {bill.notes && (
                        <p className="text-[10px] text-slate-400 italic mt-3 bg-slate-200/5 p-2 rounded">
                          "{bill.notes}"
                        </p>
                      )}
                    </div>

                    <div className="space-y-4 mt-6 pt-3.5 border-t border-slate-200/5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Due: {bill.dueDate}
                        </span>
                        <span className="font-black text-slate-800 dark:text-slate-200">
                          {currencySymbol}{Number(bill.amount).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2.5">
                        {bill.billImage ? (
                          <button
                            onClick={() => setViewReceiptUrl(`${API_BASE_URL}${bill.billImage}`)}
                            className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Eye className="w-4 h-4" /> View Invoice
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">No invoice upload</span>
                        )}

                        {!isPaid && (
                          <button
                            onClick={() => handleBillPay(bill.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold shadow-sm shadow-emerald-500/10 transition cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==================== SUBSCRIPTIONS TAB ==================== */}
      {activeTab === 'SUBSCRIPTIONS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Cost Summary Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="glass-card p-5 max-w-sm w-full border-l-4 border-l-blue-500">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Subscriptions / month</p>
              <h3 className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">
                {currencySymbol}{totalSubCostPerMonth.toFixed(2)}
              </h3>
            </div>

            <button
              onClick={() => setSubModalOpen(true)}
              className="btn-emerald flex items-center gap-2 text-xs cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Record Subscription</span>
            </button>
          </div>

          {/* Subscriptions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {subscriptions.length === 0 ? (
              <div className="glass-panel p-12 text-center text-slate-400 text-sm md:col-span-3">
                No active recurring subscriptions logged. Track Netflix, Spotify renewals here!
              </div>
            ) : (
              subscriptions.map((sub) => {
                const subCostVal = parseFloat(sub.cost);
                const nextRenewal = sub.nextRenewalDate || sub.renewalDate;

                return (
                  <div key={sub.id} className="glass-panel p-5 flex flex-col justify-between border border-slate-200/10 hover:shadow-lg transition">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-extrabold bg-blue-500/10 text-blue-500 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase">
                            {sub.billingCycle}
                          </span>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2">
                            {sub.name}
                          </h4>
                        </div>

                        <button
                          onClick={() => handleSubDelete(sub.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {sub.notes && (
                        <p className="text-[10px] text-slate-400 italic bg-slate-200/5 p-2 rounded">
                          "{sub.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs mt-6 pt-3.5 border-t border-slate-200/5 font-semibold">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Renewal: {nextRenewal}
                      </span>
                      <span className="font-extrabold text-slate-700 dark:text-slate-200">
                        {currencySymbol}{subCostVal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Record Bill Modal */}
      {billModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-500" />
                <span>Track Bill Invoice</span>
              </h3>
              <button
                onClick={() => setBillModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200/10 transition text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBillSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Bill Category</label>
                <select
                  value={billCategory}
                  onChange={(e) => setBillCategory(e.target.value)}
                  className="w-full glass-input text-xs"
                >
                  {BILL_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {billCategory === 'Others' && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-150">
                  <label className="text-[10px] font-bold text-slate-400 uppercase text-emerald-500">
                    Custom Bill Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter custom category"
                    value={customBillCategory}
                    onChange={(e) => setCustomBillCategory(e.target.value)}
                    className="w-full glass-input text-xs border-emerald-500/30"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Provider / Utility Company</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Comcast, PG&E"
                  value={billProvider}
                  onChange={(e) => setBillProvider(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Amount Due</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Due Date</label>
                  <input
                    type="date"
                    required
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Additional details..."
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  className="w-full glass-input text-xs resize-none"
                />
              </div>

              {/* Upload Proof Invoice File */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Invoice Copy Image</label>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-full border border-dashed border-slate-200/20 hover:border-emerald-500/50 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-200/5 transition flex flex-col items-center gap-1.5"
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
                      <img src={previewUrl} alt="Bill invoice preview" className="w-24 h-16 object-contain rounded" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl('');
                        }}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-500 text-white"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5 text-slate-400" />
                      <span className="text-[10px] text-slate-400">Click to upload bill slip</span>
                    </>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/10">
                <button
                  type="button"
                  onClick={() => setBillModalOpen(false)}
                  className="px-4 py-2 border border-slate-200/15 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200/10 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-emerald text-xs cursor-pointer">
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Subscription Modal */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                <span>Track Subscription</span>
              </h3>
              <button
                onClick={() => setSubModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200/10 transition text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Service Provider</label>
                <select
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full glass-input text-xs"
                >
                  {SUBSCRIPTION_SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {subName === 'Others' && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-150">
                  <label className="text-[10px] font-bold text-slate-400 uppercase text-emerald-500">
                    Custom Subscription Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter custom service"
                    value={customSubName}
                    onChange={(e) => setCustomSubName(e.target.value)}
                    className="w-full glass-input text-xs border-emerald-500/30"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Billing Cycle</label>
                  <select
                    value={subCycle}
                    onChange={(e) => setSubCycle(e.target.value)}
                    className="w-full glass-input text-xs"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={subCost}
                    onChange={(e) => setSubCost(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Renewal Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={subDate}
                  onChange={(e) => setSubDate(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. shared family plan"
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  className="w-full glass-input text-xs resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/10">
                <button
                  type="button"
                  onClick={() => setSubModalOpen(false)}
                  className="px-4 py-2 border border-slate-200/15 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200/10 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-emerald text-xs cursor-pointer">
                  Save Subscription
                </button>
              </div>
            </form>
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
              <span>Bill Attachment Copy</span>
            </h3>
            <img
              src={viewReceiptUrl}
              alt="Invoice Attachment"
              className="max-h-[75vh] w-auto object-contain rounded-xl border border-white/10 shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsSubscriptions;
