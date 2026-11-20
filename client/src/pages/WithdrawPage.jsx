import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { apiService } from '../services/apiService';
import { 
  ArrowUpRight, 
  ArrowDownLeft,
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Building2,
  Smartphone,
  ChevronRight,
  ExternalLink,
  History,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WithdrawPage = () => {
  const { user, isDark, showToast, marketSettings, refreshUserData } = useApp();
  const navigate = useNavigate();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [userAccounts, setUserAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 4-Digit Transaction PIN Modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);

  const availableBal = Number(user?.inrBalance || 0);
  const minLimit = Number(marketSettings?.minWithdrawalLimit || 100);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [accRes, txRes] = await Promise.all([
        apiService.getToolAccounts(user.id),
        apiService.getUserTransactions(user.id)
      ]);

      if (accRes.success) {
        const approved = (accRes.accounts || []).filter(a => a.status === 'APPROVED');
        setUserAccounts(approved);
        const primary = approved.find(a => a.isPrimary) || approved[0];
        if (primary) setSelectedAccountId(primary.id);
      }

      if (txRes.success) {
        const wdList = (txRes.transactions || []).filter(t => t.type === 'WITHDRAWAL');
        setWithdrawals(wdList);
      }
    } catch (err) {
      console.error('Error loading withdraw data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleWithdrawClick = (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount < minLimit) {
      showToast(`Minimum withdrawal amount is ₹${minLimit}`, 'error');
      return;
    }
    if (amount > availableBal) {
      showToast(`Insufficient balance. Maximum available: ₹${availableBal}`, 'error');
      return;
    }
    if (userAccounts.length === 0) {
      showToast('Please add and verify a payout account in the Tool tab first!', 'error');
      navigate('/tool');
      return;
    }

    setPin('');
    setShowPinModal(true);
  };

  const handleConfirmPinAndSubmit = async (e) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      showToast('Please enter your 4-digit Transaction PIN', 'error');
      return;
    }

    setVerifyingPin(true);
    try {
      // 1. Verify PIN
      const pinRes = await apiService.verifyPin(user.id, pin);
      if (!pinRes.success) {
        showToast(pinRes.message || 'Incorrect Transaction PIN', 'error');
        setVerifyingPin(false);
        return;
      }

      setShowPinModal(false);
      setSubmitting(true);

      const targetAcc = userAccounts.find(a => a.id === selectedAccountId) || userAccounts[0];
      const destinationDetails = targetAcc?.accountType === 'UPI' 
        ? `UPI: ${targetAcc?.upiId} (${targetAcc?.holderName})` 
        : `Bank: ••${targetAcc?.accountNumber?.slice(-4)} (${targetAcc?.holderName})`;

      // 2. Submit Withdrawal
      const res = await apiService.submitWithdrawal({
        userId: user.id,
        amount: Number(withdrawAmount),
        currency: 'INR',
        method: targetAcc?.accountType || 'UPI',
        destinationDetails,
        pin
      });

      if (res.success) {
        showToast('Withdrawal submitted! Funds reserved for payout.', 'success');
        setWithdrawAmount('');
        if (refreshUserData) await refreshUserData();
        await loadData();
      } else {
        showToast(res.message || 'Failed to submit withdrawal', 'error');
      }
    } catch (err) {
      showToast('Withdrawal network error. Check connection.', 'error');
    } finally {
      setVerifyingPin(false);
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Withdraw INR">
      <div className="px-4 py-5 space-y-5">

        {/* Dedicated Dual-Page Segmented Tab Switcher (Deposit vs Withdraw) */}
        <div className={`p-1 rounded-2xl border flex items-center gap-1 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200/80'
        }`}>
          <button
            onClick={() => navigate('/deposit')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              location.pathname === '/deposit'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5] text-[#5B1EB7] dark:text-purple-400" />
            <span>Deposit Funds</span>
          </button>

          <button
            onClick={() => navigate('/withdraw')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              location.pathname === '/withdraw'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] text-emerald-600 dark:text-emerald-400" />
            <span>Withdraw Funds</span>
          </button>
        </div>

        {/* 1. Spendable Balance Card */}
        <div className={`p-5 rounded-3xl text-white shadow-xl relative overflow-hidden transition-all duration-200 ${
          isDark 
            ? 'bg-gradient-to-br from-[#1E113E] via-[#2D1663] to-[#140B2D] border border-purple-800/40 shadow-purple-950/40' 
            : 'bg-gradient-to-br from-[#6820DA] via-[#5B1EB7] to-[#431093] shadow-purple-900/25'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200">Spendable Available Balance</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/20">
              24/7 Payouts
            </span>
          </div>

          <div className="mt-3">
            <span className="text-3xl font-black text-white tracking-tight">
              ₹{availableBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-purple-200">
            <span>Minimum Payout: ₹{minLimit}</span>
            <span>Zero Withdrawal Fee</span>
          </div>
        </div>

        {/* 2. Payout Account Verification Status Alert */}
        {userAccounts.length === 0 ? (
          <div className={`p-4 rounded-3xl border flex items-center justify-between ${
            isDark ? 'bg-amber-950/20 border-amber-900/50 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">No Verified Payout Destination</p>
                <p className="opacity-90">Add and verify your UPI ID in the Tool tab before requesting payouts.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/tool')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md shrink-0 active:scale-95 transition-all"
            >
              Open Tool
            </button>
          </div>
        ) : null}

        {/* 3. Withdrawal Form Card */}
        <div className={`p-5 rounded-3xl border space-y-4 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              INR Payout Request
            </h2>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Instant IMPS/UPI
            </span>
          </div>

          <form onSubmit={handleWithdrawClick} className="space-y-4">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                <span>Withdrawal Amount (₹)</span>
                <span 
                  onClick={() => setWithdrawAmount(availableBal.toString())}
                  className="text-purple-400 cursor-pointer hover:underline"
                >
                  MAX: ₹{availableBal}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-base">₹</span>
                <input
                  type="number"
                  min={minLimit}
                  step="1"
                  required
                  placeholder={`Enter amount (min ₹${minLimit})`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className={`w-full pl-8 pr-4 py-3 rounded-2xl text-sm font-black outline-none border transition-all ${
                    isDark ? 'bg-slate-950/80 border-slate-800 focus:border-purple-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-purple-500 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Select Destination Account */}
            {userAccounts.length > 0 && (
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  Verified Payout Destination
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold outline-none border ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  {userAccounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.accountType === 'UPI' ? `UPI: ${a.upiId} (${a.holderName})` : `Bank: ••${a.accountNumber?.slice(-4)} (${a.holderName})`} {a.isPrimary ? '★ Primary' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || availableBal < minLimit || userAccounts.length === 0}
              className="w-full py-3.5 rounded-2xl bg-[#5B1EB7] hover:bg-[#4C189D] text-white font-extrabold text-sm shadow-md active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              {submitting ? 'Processing Payout...' : 'Submit Withdrawal Request'}
            </button>
          </form>
        </div>

        {/* 4. Recent Withdrawal Records */}
        <div className="space-y-3">
          <h3 className={`text-xs font-black uppercase tracking-wider px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Recent Withdrawal History ({withdrawals.length})
          </h3>

          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
              Loading withdrawals...
            </div>
          ) : withdrawals.length === 0 ? (
            <div className={`p-6 rounded-3xl border text-center ${
              isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <p className="text-xs font-semibold">No withdrawal requests yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {withdrawals.map((w) => {
                const isCompleted = w.status === 'COMPLETED';
                const isPending = w.status === 'PENDING';
                const isRejected = w.status === 'REJECTED';

                return (
                  <div
                    key={w.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">
                          ₹{w.amount}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {w.refNumber || w.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {w.channelLabel || 'UPI Payout'}
                      </p>
                      {isRejected && w.adminNotes && (
                        <span className="text-[10px] text-rose-400 block mt-0.5">
                          Refund Reason: {w.adminNotes}
                        </span>
                      )}
                    </div>

                    <div>
                      {isCompleted && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Settled
                        </span>
                      )}
                      {isPending && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3" /> Under Review
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Refunded
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 4-Digit Security PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-xs rounded-3xl p-6 border shadow-2xl ${
            isDark ? 'bg-[#0E1322] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-center font-black text-base">Enter Security PIN</h3>
            <p className="text-center text-xs text-slate-400 mt-1">
              Confirm your 4-digit transaction PIN to authorize this withdrawal of ₹{withdrawAmount}.
            </p>

            <form onSubmit={handleConfirmPinAndSubmit} className="space-y-4 mt-5">
              <input
                type="password"
                maxLength={4}
                autoFocus
                required
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full text-center tracking-[12px] text-2xl font-black py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:border-purple-500 outline-none"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingPin}
                  className="flex-1 py-3 rounded-2xl bg-purple-600 text-white font-black text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all disabled:opacity-50"
                >
                  {verifyingPin ? 'Verifying...' : 'Authorize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppShell>
  );
};
