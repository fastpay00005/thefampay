import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  KeyRound, 
  Clock, 
  Search, 
  Building2, 
  Smartphone,
  AlertTriangle,
  Filter
} from 'lucide-react';

export const AdminUpiReviewPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Action Modals
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [actionType, setActionType] = useState(''); // 'APPROVE', 'REJECT', 'ASK_CODE'
  const [adminNotes, setAdminNotes] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchAccounts = async () => {
    try {
      const res = await apiService.adminGetUpiAccounts();
      if (res.success) {
        setAccounts(res.accounts || []);
      }
    } catch (e) {
      console.error('Error fetching upi accounts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenActionModal = (acc, type) => {
    setSelectedAccount(acc);
    setActionType(type);
    setAdminNotes('');
    setCustomCode(Math.floor(1000 + Math.random() * 9000).toString());
  };

  const handleExecuteAction = async (e) => {
    e.preventDefault();
    if (!selectedAccount) return;

    setSubmittingAction(true);
    try {
      const res = await apiService.adminActionUpiAccount(
        selectedAccount.id,
        actionType,
        adminNotes.trim(),
        actionType === 'ASK_CODE' ? customCode.trim() : ''
      );

      if (res.success) {
        showNotification(`Account ${actionType === 'APPROVE' ? 'APPROVED' : actionType === 'ASK_CODE' ? 'Challenged with Code ' + customCode : 'REJECTED'}`);
        setSelectedAccount(null);
        await fetchAccounts();
      } else {
        alert(res.message || 'Action failed');
      }
    } catch (err) {
      alert('Error updating account status');
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesStatus = statusFilter === 'ALL' || acc.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      acc.holderName?.toLowerCase().includes(query) ||
      acc.upiId?.toLowerCase().includes(query) ||
      acc.accountNumber?.includes(query) ||
      acc.userName?.toLowerCase().includes(query) ||
      acc.userEmail?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">

        {/* Toast alert */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400">Total Accounts</span>
            <div className="text-2xl font-black text-white mt-1">{accounts.length}</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-blue-500/30">
            <span className="text-xs font-bold text-blue-400">Pending Review</span>
            <div className="text-2xl font-black text-blue-400 mt-1">
              {accounts.filter(a => a.status === 'PENDING_REVIEW').length}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30">
            <span className="text-xs font-bold text-amber-400">Code Required</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {accounts.filter(a => a.status === 'CODE_REQUIRED').length}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30">
            <span className="text-xs font-bold text-emerald-400">Approved Accounts</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {accounts.filter(a => a.status === 'APPROVED').length}
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by holder, UPI, user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'PENDING_REVIEW', 'CODE_REQUIRED', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === st 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Accounts Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Holder Name</th>
                  <th className="p-4">Account Details</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Verification Code</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 animate-pulse">
                      Loading provider accounts...
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      No accounts found matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{acc.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{acc.userEmail || acc.userUid}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          acc.accountType === 'BANK' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-400'
                        }`}>
                          {acc.accountType}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white">
                        {acc.holderName}
                        {acc.isPrimary && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-amber-500/15 text-amber-400 font-black">
                            PRIMARY
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono">
                        {acc.accountType === 'UPI' ? (
                          <span className="text-purple-300 font-bold">{acc.upiId}</span>
                        ) : (
                          <div>
                            <div>{acc.bankName} - {acc.accountNumber}</div>
                            <div className="text-[10px] text-slate-400">IFSC: {acc.ifscCode}</div>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {acc.status === 'APPROVED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Approved
                          </span>
                        )}
                        {acc.status === 'PENDING_REVIEW' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            Pending Review
                          </span>
                        )}
                        {acc.status === 'CODE_REQUIRED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Code Required
                          </span>
                        )}
                        {acc.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            Declined
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-amber-400">
                        {acc.verificationCode ? `Code: ${acc.verificationCode}` : '—'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {acc.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleOpenActionModal(acc, 'APPROVE')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all"
                            >
                              Approve
                            </button>
                          )}
                          {acc.status !== 'APPROVED' && acc.status !== 'CODE_REQUIRED' && (
                            <button
                              onClick={() => handleOpenActionModal(acc, 'ASK_CODE')}
                              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition-all flex items-center gap-1"
                            >
                              <KeyRound className="w-3 h-3" /> Ask Code
                            </button>
                          )}
                          {acc.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleOpenActionModal(acc, 'REJECT')}
                              className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-[11px] transition-all"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Action Dialog Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
            <h3 className="font-black text-base">
              {actionType === 'APPROVE' ? 'Approve Account' : actionType === 'ASK_CODE' ? 'Challenge with Verification Code' : 'Reject Account'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Account: {selectedAccount.holderName} ({selectedAccount.upiId || selectedAccount.accountNumber})
            </p>

            <form onSubmit={handleExecuteAction} className="space-y-4 mt-5">
              {actionType === 'ASK_CODE' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Verification Code (Give this code to user)
                  </label>
                  <input
                    type="text"
                    required
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="w-full text-center font-mono font-black text-xl py-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 focus:border-amber-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Admin Note / Reason (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Notes visible to admin or reason for rejection"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAccount(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs text-white transition-all ${
                    actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-500' : actionType === 'ASK_CODE' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {submittingAction ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

