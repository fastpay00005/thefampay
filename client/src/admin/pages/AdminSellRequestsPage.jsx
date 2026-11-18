import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Building2, 
  Smartphone,
  ArrowUpRight,
  Filter
} from 'lucide-react';

export const AdminSellRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(''); // 'APPROVE' | 'REJECT'
  const [payoutUtr, setPayoutUtr] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchSellRequests = async () => {
    try {
      const res = await apiService.adminGetSellRequests();
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (e) {
      console.error('Error fetching sell requests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellRequests();
  }, []);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenModal = (req, action) => {
    setSelectedRequest(req);
    setActionType(action);
    setPayoutUtr('');
    setAdminNotes('');
  };

  const handleExecuteAction = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (actionType === 'APPROVE' && !payoutUtr.trim()) {
      alert('Please enter bank/UPI transaction UTR reference');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiService.adminActionSellRequest(
        selectedRequest.id,
        actionType,
        payoutUtr.trim(),
        adminNotes.trim()
      );

      if (res.success) {
        showNotification(
          actionType === 'APPROVE'
            ? `Cash Out #${selectedRequest.id} marked as SETTLED!`
            : `Cash Out #${selectedRequest.id} REJECTED & REFUNDED to user wallet!`
        );
        setSelectedRequest(null);
        await fetchSellRequests();
      } else {
        alert(res.message || 'Action failed');
      }
    } catch (err) {
      alert('Network error executing cash out action');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      req.id?.toLowerCase().includes(query) ||
      req.userName?.toLowerCase().includes(query) ||
      req.userEmail?.toLowerCase().includes(query) ||
      req.payoutDetails?.upiId?.toLowerCase().includes(query) ||
      req.payoutDetails?.holderName?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">

        {/* Toast */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400">Total Cash Outs</span>
            <div className="text-2xl font-black text-white mt-1">{requests.length}</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30">
            <span className="text-xs font-bold text-amber-400">Pending Settlement</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {requests.filter(r => r.status === 'PENDING').length}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30">
            <span className="text-xs font-bold text-emerald-400">Total Settled Volume</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              ₹{requests.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + r.inrAmount, 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, user, UPI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'PENDING', 'COMPLETED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Request ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payout Account</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Settlement UTR</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 animate-pulse">
                      Loading cash out requests...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      No cash out requests found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-purple-400">
                        {req.id}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white">{req.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{req.userEmail}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-black text-sm text-emerald-400">₹{req.inrAmount}</div>
                        <div className="text-[10px] text-slate-400">{req.tokenAmount} Tokens</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white">{req.payoutDetails?.holderName}</div>
                        <div className="text-[11px] font-mono text-purple-300">
                          {req.payoutDetails?.upiId || `${req.payoutDetails?.bankName} ••${req.payoutDetails?.accountNumber?.slice(-4)}`}
                        </div>
                      </td>
                      <td className="p-4">
                        {req.status === 'COMPLETED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Settled
                          </span>
                        )}
                        {req.status === 'PENDING' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                            Pending Payout
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            Refunded
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-300">
                        {req.payoutUtr || '—'}
                      </td>
                      <td className="p-4 text-right">
                        {req.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenModal(req, 'APPROVE')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all"
                            >
                              Settle Payout
                            </button>
                            <button
                              onClick={() => handleOpenModal(req, 'REJECT')}
                              className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-[11px] transition-all"
                            >
                              Reject & Refund
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Settle / Reject Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
            <h3 className="font-black text-base">
              {actionType === 'APPROVE' ? 'Mark Cash Out as Settled' : 'Reject & Refund Balance'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Request: ₹{selectedRequest.inrAmount} for {selectedRequest.userName}
            </p>

            <form onSubmit={handleExecuteAction} className="space-y-4 mt-5">
              {actionType === 'APPROVE' ? (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Bank / UPI Transaction UTR (Required)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 12-digit payment UTR"
                    value={payoutUtr}
                    onChange={(e) => setPayoutUtr(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs">
                  ⚠️ Rejecting this request will immediately refund <strong>₹{selectedRequest.inrAmount}</strong> back to the user's available wallet balance.
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Admin Note / Reason
                </label>
                <textarea
                  rows="2"
                  placeholder="Optional note visible to user"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs text-white transition-all ${
                    actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {submitting ? 'Processing...' : actionType === 'APPROVE' ? 'Confirm Settle' : 'Refund Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

