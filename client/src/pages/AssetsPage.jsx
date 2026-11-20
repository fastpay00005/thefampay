import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { 
  ArrowDownLeft, 
  RefreshCw, 
  ShieldCheck, 
  Send, 
  FileText, 
  ChevronRight, 
  Copy, 
  Check, 
  ExternalLink,
  CircleDollarSign,
  Coins,
  X
} from 'lucide-react';
import { UserAvatar } from '../components/common/UserAvatar';
import { useNavigate } from 'react-router-dom';

export const AssetsPage = () => {
  const { user, portfolio, isDark, showToast, refreshUserData } = useApp();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showTgModal, setShowTgModal] = useState(false);
  const [tgInput, setTgInput] = useState(user?.telegramHandle || '');
  const [savingTg, setSavingTg] = useState(false);

  // Formatted User Identities: W<UserID>
  const userNumericId = user?.uid?.replace(/\D/g, '') || user?.id?.replace(/\D/g, '') || '10008899';
  const walletIdentity = `W${userNumericId}`;

  const copyIdentity = () => {
    navigator.clipboard.writeText(walletIdentity);
    setCopied(true);
    showToast('Wallet Identity copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveTelegram = async (e) => {
    e.preventDefault();
    if (!tgInput.trim()) {
      showToast('Please enter your Telegram handle', 'error');
      return;
    }
    setSavingTg(true);
    try {
      const res = await apiService.bindTelegramHandle(user.id, tgInput);
      if (res.success) {
        showToast('Telegram handle bound successfully!', 'success');
        setShowTgModal(false);
        if (refreshUserData) await refreshUserData();
      } else {
        showToast(res.message || 'Failed to bind Telegram handle', 'error');
      }
    } catch {
      showToast('Network error binding handle', 'error');
    } finally {
      setSavingTg(false);
    }
  };

  const inrBal = Number(user?.inrBalance ?? portfolio?.inrBalance ?? 0);
  const tokenBal = Number(user?.tokenBalance ?? portfolio?.tokenBalance ?? 0);
  const totalEarnings = Number(user?.referralEarnings ?? portfolio?.totalEarnings ?? 0);

  return (
    <AppShell title="Assets Center">
      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">

        {/* 1. Header Profile & Asset Overview Card */}
        <div className={`p-5 rounded-3xl border relative overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-br from-[#121629] via-[#1B1736] to-[#0D101E] border-slate-800 shadow-xl' 
            : 'bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 text-white border-purple-400/30 shadow-lg shadow-purple-600/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => navigate('/profile')}
                className="cursor-pointer active:scale-95 transition-transform"
                title="View Profile"
              >
                <UserAvatar user={user} size="md" showOnlineDot={true} />
              </div>
              <div>
                <h2 className="text-base font-black text-white leading-tight">
                  {user?.fullName || 'The FamPay Member'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-purple-200">
                    ID: {userNumericId}
                  </span>
                  <button 
                    onClick={copyIdentity}
                    className="px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-[10px] font-black tracking-wider text-purple-100 flex items-center gap-1 border border-white/20 active:scale-95 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {walletIdentity}
                  </button>
                </div>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              ● VERIFIED
            </span>
          </div>

          {/* Portfolio Balance Stats */}
          <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] font-semibold text-purple-200 block truncate">Available INR</span>
              <span className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5 block truncate">
                ₹{inrBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-purple-200 block truncate">Token Assets</span>
              <span className="text-lg sm:text-xl font-black text-emerald-300 tracking-tight mt-0.5 block truncate">
                {tokenBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-purple-200 block truncate">Total Earnings</span>
              <span className="text-lg sm:text-xl font-black text-amber-300 tracking-tight mt-0.5 block truncate">
                ₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Telegram Handle Row (PDF §2.9 Tg.No bind) */}
        <div className={`p-4 rounded-3xl border flex items-center justify-between ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Telegram Handle (Tg.No)
              </span>
              <span className={`text-xs font-black ${user?.telegramHandle ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-500 italic'}`}>
                {user?.telegramHandle || 'Not bound yet'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setTgInput(user?.telegramHandle || '');
              setShowTgModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white font-black text-xs transition-all active:scale-95 cursor-pointer"
          >
            {user?.telegramHandle ? 'Edit' : 'Bind'}
          </button>
        </div>

        {/* 2. Action Shortcuts Bar */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => navigate('/deposit')}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              isDark ? 'bg-slate-900/80 border-slate-800 hover:border-purple-600/40 text-slate-100' : 'bg-white border-slate-200 shadow-sm text-slate-900'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-black">Deposit</span>
          </button>

          <button
            onClick={() => navigate('/withdraw')}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              isDark ? 'bg-slate-900/80 border-slate-800 hover:border-purple-600/40 text-slate-100' : 'bg-white border-slate-200 shadow-sm text-slate-900'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-400 flex items-center justify-center font-black">
              <Coins className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-black">Withdraw</span>
          </button>

          <button
            onClick={() => navigate('/token?tab=sell')}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              isDark ? 'bg-slate-900/80 border-slate-800 hover:border-purple-600/40 text-slate-100' : 'bg-white border-slate-200 shadow-sm text-slate-900'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center font-black">
              <RefreshCw className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-black">Cash Out</span>
          </button>

          <button
            onClick={() => navigate('/tool')}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              isDark ? 'bg-slate-900/80 border-slate-800 hover:border-purple-600/40 text-slate-100' : 'bg-white border-slate-200 shadow-sm text-slate-900'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 dark:text-blue-400 flex items-center justify-center font-black">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-black">Payout Tool</span>
          </button>
        </div>

        {/* 3. Real Financial Records & Ledger */}
        <div className="space-y-2">
          <h3 className={`text-xs font-black uppercase tracking-wider px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Financial Records
          </h3>

          <div className={`rounded-3xl border overflow-hidden divide-y ${
            isDark ? 'bg-slate-900/60 border-slate-800 divide-slate-800' : 'bg-white border-slate-200 divide-slate-100 shadow-sm'
          }`}>
            <div 
              onClick={() => navigate('/deposit')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-purple-500/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Deposit History</h4>
                  <p className="text-[10px] text-slate-400">All deposit orders & transaction receipts</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div 
              onClick={() => navigate('/withdraw')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-purple-500/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Withdrawal History</h4>
                  <p className="text-[10px] text-slate-400">Track pending and settled UPI payouts</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div 
              onClick={() => navigate('/token')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-purple-500/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Exchange & Cash Out Orders</h4>
                  <p className="text-[10px] text-slate-400">Buy, sell, and payout settlement requests</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div 
              onClick={() => navigate('/teams')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-purple-500/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 dark:text-blue-400 flex items-center justify-center">
                  <CircleDollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Team Commissions</h4>
                  <p className="text-[10px] text-slate-400">30% / 10% / 5% multi-tier downline earnings</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div 
              onClick={() => navigate('/tool')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-purple-500/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Payout Accounts & Verification</h4>
                  <p className="text-[10px] text-slate-400">Manage approved UPI IDs and bank payout accounts</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* 4. Support & Telegram Community */}
        <div className="space-y-2">
          <h3 className={`text-xs font-black uppercase tracking-wider px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Community & Support
          </h3>

          <div className={`p-4 rounded-3xl border flex items-center justify-between ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-500 dark:text-blue-400 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Official Telegram VIP</h4>
                <p className="text-[10px] text-slate-400">24/7 dedicated support & live updates</p>
              </div>
            </div>
            <a
              href="https://t.me/thefampayofficial"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1"
            >
              Join <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>

      {/* Telegram Handle Bind Modal (PDF §2.9) */}
      {showTgModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl relative space-y-4 ${
            isDark ? 'bg-[#0E1528] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setShowTgModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/40 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-black text-base">Bind Telegram Username</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your Telegram username to connect for priority notifications and agent support.
              </p>
            </div>

            <form onSubmit={handleSaveTelegram} className="space-y-4 pt-1">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-black text-sm">@</span>
                <input
                  type="text"
                  required
                  placeholder="your_telegram_username"
                  value={tgInput.replace(/^@/, '')}
                  onChange={(e) => setTgInput(e.target.value)}
                  className={`w-full pl-9 pr-4 py-3 rounded-2xl text-xs font-bold outline-none border transition-all ${
                    isDark ? 'bg-slate-950/80 border-slate-800 focus:border-blue-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTgModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTg}
                  className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingTg ? 'Saving...' : 'Save Tg.No'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppShell>
  );
};
