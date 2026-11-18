import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { apiService } from '../services/apiService';
import { 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  Lock, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Coins,
  ChevronRight,
  Building2,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const TokenCashOutPage = () => {
  const { user, isDark, showToast, marketSettings, refreshUserData } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') === 'buy' ? 'buy' : 'sell';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [inrCashOutAmount, setInrCashOutAmount] = useState('');
  const [buyCalcAmount, setBuyCalcAmount] = useState('1000');
  const [autoSell, setAutoSell] = useState(true);
  const [userAccounts, setUserAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [sellRequests, setSellRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 4-Digit Transaction PIN Modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);

  const tokenRate = marketSettings?.tokenSellPrice || 100.0;
  const availableBal = Number(user?.inrBalance || 0);

  // Derived "My Token" per Spec: Available Balance * tokenRate / 100 or balance / tokenRate
  // Spec Section 2.10: "My Token is a derived value: Available Balance * tokenRate"
  const myTokenDerived = (availableBal / tokenRate).toFixed(4);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [accRes, reqRes] = await Promise.all([
        apiService.getToolAccounts(user.id),
        apiService.getMySellRequests(user.id)
      ]);
      if (accRes.success) {
        const approved = (accRes.accounts || []).filter(a => a.status === 'APPROVED');
        setUserAccounts(approved);
        const primary = approved.find(a => a.isPrimary) || approved[0];
        if (primary) setSelectedAccountId(primary.id);
      }
      if (reqRes.success) {
        setSellRequests(reqRes.requests || []);
      }
    } catch (err) {
      console.error('Error loading token data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleCashOutClick = (e) => {
    e.preventDefault();
    const amount = Number(inrCashOutAmount);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid cash out amount', 'error');
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

    // Open PIN prompt
    setPin('');
    setShowPinModal(true);
  };

  const handleConfirmPinAndSubmit = async (e) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      showToast('Please enter 4-digit PIN', 'error');
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

      // 2. Submit Sell Request
      const res = await apiService.submitSellRequest({
        userId: user.id,
        inrAmount: Number(inrCashOutAmount),
        tokenRate,
        payoutAccountId: selectedAccountId
      });

      if (res.success) {
        showToast('Cash out request submitted! Funds reserved.', 'success');
        setInrCashOutAmount('');
        if (refreshUserData) await refreshUserData();
        await loadData();
      } else {
        showToast(res.message || 'Failed to submit cash out', 'error');
      }
    } catch (err) {
      showToast('Submission error. Check network.', 'error');
    } finally {
      setVerifyingPin(false);
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Token & Cash Out">
      <div className="px-4 py-5 space-y-5">

        {/* 1. Live Token Rate Ticker & My Token Card */}
        <div className={`p-5 rounded-3xl border relative overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-br from-[#131127] via-[#211540] to-[#0D0B18] border-purple-900/50 shadow-xl' 
            : 'bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 text-white border-purple-400/30 shadow-lg shadow-purple-600/20'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-full text-[9.5px] sm:text-[10px] font-black uppercase tracking-tight bg-white/15 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5 shrink-0">
              <Coins className="w-3.5 h-3.5 text-amber-300" /> Live Rate
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-bold text-purple-200">Auto Sell:</span>
              <button
                onClick={() => setAutoSell(!autoSell)}
                className={`w-10 h-5 sm:w-11 sm:h-6 rounded-full transition-colors relative p-0.5 ${autoSell ? 'bg-emerald-400' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white shadow-md transform transition-transform ${autoSell ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-purple-200 block">Token Payout Rate</span>
              <span className="text-2xl font-black text-white tracking-tight mt-0.5 block">
                ₹{tokenRate.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-purple-200 block">Derived My Token</span>
              <span className="text-2xl font-black text-amber-300 tracking-tight mt-0.5 block">
                {myTokenDerived} <span className="text-xs text-white">TKN</span>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-purple-100">
            <span>Available INR Balance:</span>
            <span className="font-black text-white">₹{availableBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* 2. TAB SWITCHER: Buy Token vs Sell Token (Cash Out) (PDF §2.10) */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('buy')}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'buy'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Buy Token</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sell')}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'sell'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sell Token (Cash Out)</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* BUY TOKEN TAB CONTENT (PDF §2.10 & §4.6)                 */}
        {/* ======================================================== */}
        {activeTab === 'buy' && (
          <div className="space-y-4 animate-in fade-in">
            {/* How It Works Explainer */}
            <div className={`p-5 rounded-3xl border space-y-3 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-black">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    How Token Purchases Work
                  </h3>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                    Automatic Generation
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Per {appName || 'The FamPay'} protocol, <strong>JTokens (BTOKEN)</strong> are generated automatically upon approving an INR Deposit.
                You get <strong>100% Available Balance</strong> to trade or withdraw, PLUS <strong>Tokens (Deposit ÷ ₹{tokenRate.toFixed(2)})</strong> added directly to your portfolio!
              </p>

              {/* Calculator Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">Try Calculator Amount (₹):</span>
                  <input
                    type="number"
                    value={buyCalcAmount}
                    onChange={(e) => setBuyCalcAmount(e.target.value)}
                    className="w-24 text-right px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-black text-white focus:outline-none"
                  />
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-purple-300 font-semibold">Tokens Generated:</span>
                  <span className="font-black text-emerald-400 text-sm">
                    {tokenRate > 0 ? (Number(buyCalcAmount || 0) / tokenRate).toFixed(2) : 0} TKN
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Packages Shortcuts */}
            <div className="space-y-2.5">
              <h4 className={`text-xs font-black uppercase tracking-wider px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Available Deposit Packages (Acquire Tokens)
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { inr: 500, tokens: (500 / tokenRate).toFixed(1), bonus: '+2%' },
                  { inr: 1000, tokens: (1000 / tokenRate).toFixed(1), bonus: '+3%' },
                  { inr: 2000, tokens: (2000 / tokenRate).toFixed(1), bonus: '+4%' },
                  { inr: 5000, tokens: (5000 / tokenRate).toFixed(1), bonus: '+5%' }
                ].map((pkg) => (
                  <div
                    key={pkg.inr}
                    onClick={() => navigate('/deposit')}
                    className={`p-3.5 rounded-2xl border cursor-pointer active:scale-95 transition-all group ${
                      isDark ? 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-white">₹{pkg.inr}</span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                        {pkg.bonus}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold block mt-1">
                      ≈ {pkg.tokens} Tokens
                    </span>
                  </div>
                ))}
              </div>

              {/* Primary Direct CTA to Deposit Page */}
              <button
                type="button"
                onClick={() => navigate('/deposit')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-black text-xs shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                <span>Proceed to Deposit Packages</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SELL TOKEN TAB CONTENT (CASH OUT)                        */}
        {/* ======================================================== */}
        {activeTab === 'sell' && (
          <div className="space-y-5 animate-in fade-in">
        {/* Payout Account Verification Status Reminder */}
        {userAccounts.length === 0 ? (
          <div className={`p-4 rounded-3xl border flex items-center justify-between ${
            isDark ? 'bg-amber-950/20 border-amber-900/50 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">No Approved Payout Account</p>
                <p className="opacity-90">Add and verify your UPI ID in the Tool tab before cashing out.</p>
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

        {/* 3. Cash Out Action Form */}
        <div className={`p-5 rounded-3xl border space-y-4 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Instant Cash Out / Sell
            </h2>
            <span className="text-[11px] text-purple-400 font-bold">24/7 IMPS/UPI Payout</span>
          </div>

          <form onSubmit={handleCashOutClick} className="space-y-4">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                <span>Amount to Cash Out (INR)</span>
                <span 
                  onClick={() => setInrCashOutAmount(availableBal.toString())}
                  className="text-purple-400 cursor-pointer hover:underline"
                >
                  MAX: ₹{availableBal}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-base">₹</span>
                <input
                  type="number"
                  min="100"
                  step="1"
                  required
                  placeholder="Enter amount (min ₹100)"
                  value={inrCashOutAmount}
                  onChange={(e) => setInrCashOutAmount(e.target.value)}
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
                  Payout Destination (Verified Account)
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
              disabled={submitting || availableBal <= 0 || userAccounts.length === 0}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-600/25 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {submitting ? 'Processing...' : 'Cash Out to Account'}
            </button>
          </form>
        </div>

        {/* 4. Cash Out Requests Queue History */}
        <div className="space-y-3">
          <h3 className={`text-xs font-black uppercase tracking-wider px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Recent Cash Out History ({sellRequests.length})
          </h3>

          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
              Loading requests...
            </div>
          ) : sellRequests.length === 0 ? (
            <div className={`p-6 rounded-3xl border text-center ${
              isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <p className="text-xs font-semibold">No cash out requests yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sellRequests.map((req) => {
                const isCompleted = req.status === 'COMPLETED';
                const isPending = req.status === 'PENDING';
                const isRejected = req.status === 'REJECTED';

                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">
                          ₹{req.inrAmount}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {req.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {req.payoutDetails?.upiId || req.payoutDetails?.accountNumber || 'UPI Payout'}
                      </p>
                      {req.payoutUtr && (
                        <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                          UTR: {req.payoutUtr}
                        </span>
                      )}
                      {isRejected && req.adminNotes && (
                        <span className="text-[10px] text-rose-400 block mt-0.5">
                          Refund Reason: {req.adminNotes}
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
                          <Clock className="w-3 h-3" /> Processing
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
    )}

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

            <h3 className="text-center font-black text-base">Enter Transaction PIN</h3>
            <p className="text-center text-xs text-slate-400 mt-1">
              Confirm your 4-digit security PIN to authorize this cash out of ₹{inrCashOutAmount}.
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

