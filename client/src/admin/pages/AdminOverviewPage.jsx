import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAdminTheme } from '../context/AdminThemeContext';
import { 
  Users, UserCheck, Ban, ShoppingCart, ArrowLeftRight, 
  ArrowDownLeft, ArrowUpRight, Database, TrendingUp, TrendingDown,
  UserPlus, RefreshCw, Bell, Settings, ArrowRight, X, Check, Loader2, Gift,
  Layers, Activity, ShieldCheck, Wallet, Sparkles
} from 'lucide-react';
import { apiService } from '../../services/apiService';

export const AdminOverviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useAdminTheme();

  const { allUsers, transactions, marketSettings, loadAdminData, showToast } = useApp();

  // Modals for Quick Actions
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: 'User@FamPay2026',
    inrBalance: 0,
    usdtBalance: 0,
  });

  // Price Updater State
  const [priceForm, setPriceForm] = useState({
    tokenBuyPrice: marketSettings.tokenBuyPrice || 10,
    tokenSellPrice: marketSettings.tokenSellPrice || 9.5,
    minBuyLimit: marketSettings.minBuyLimit || 500,
    minSellLimit: marketSettings.minSellLimit || 50,
  });

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  useEffect(() => {
    setPriceForm({
      tokenBuyPrice: marketSettings.tokenBuyPrice || 10,
      tokenSellPrice: marketSettings.tokenSellPrice || 9.5,
      minBuyLimit: marketSettings.minBuyLimit || 500,
      minSellLimit: marketSettings.minSellLimit || 50,
    });
  }, [marketSettings]);

  // Real Metric Computations (ZERO FAKE DATA)
  const realUsers = allUsers.filter(u => u.role !== 'ADMIN');
  const activeCount = realUsers.filter(u => u.status === 'active' && !u.accountPaused).length;
  const blockedCount = realUsers.filter(u => u.status === 'blocked').length;

  const buyOrders = transactions.filter(t => t.type === 'BUY');
  const sellOrders = transactions.filter(t => t.type === 'SELL');
  const deposits = transactions.filter(t => t.type === 'DEPOSIT');
  const withdrawals = transactions.filter(t => t.type === 'WITHDRAWAL');

  const totalDepositsSum = deposits
    .filter(t => t.status === 'COMPLETED')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const totalWithdrawalsSum = withdrawals
    .filter(t => t.status === 'COMPLETED')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const platformBalance = Math.max(0, totalDepositsSum - totalWithdrawalsSum);

  const totalReferrals = realUsers.reduce((sum, u) => sum + (Number(u.referralCount) || (u.referredBy ? 1 : 0)), 0);
  const totalReferralBonus = realUsers.reduce((sum, u) => sum + (Number(u.referralBonus) || 0), 0);

  // Filter transactions based on query params (e.g. ?filter=buy, ?filter=sell)
  const searchFilter = new URLSearchParams(location.search).get('filter');
  let filteredTransactions = transactions;
  if (searchFilter === 'buy') {
    filteredTransactions = transactions.filter(t => t.type === 'BUY');
  } else if (searchFilter === 'sell') {
    filteredTransactions = transactions.filter(t => t.type === 'SELL');
  }
  const displayTxs = filteredTransactions.slice(0, 8);

  // Quick Action: Add User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.fullName || !newUserForm.email || !newUserForm.mobile) {
      showToast('Please fill all required user fields', 'error');
      return;
    }
    setLoadingAction(true);
    try {
      const res = await apiService.registerUser({
        fullName: newUserForm.fullName,
        email: newUserForm.email,
        mobile: newUserForm.mobile,
        password: newUserForm.password,
        inrBalance: Number(newUserForm.inrBalance) || 0,
        usdtBalance: Number(newUserForm.usdtBalance) || 0,
        otp: 'ADMIN_BYPASS',
      });
      setLoadingAction(false);
      if (res.success) {
        showToast(`User ${newUserForm.fullName} created successfully!`, 'success');
        setShowAddUserModal(false);
        setNewUserForm({ fullName: '', email: '', mobile: '', password: 'User@FamPay2026', inrBalance: 0, usdtBalance: 0 });
        await loadAdminData();
      } else {
        showToast(res.message || 'Failed to create user', 'error');
      }
    } catch {
      setLoadingAction(false);
      showToast('Error creating user record', 'error');
    }
  };

  // Quick Action: Update Price
  const handleUpdatePrices = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const res = await apiService.updateSettings({
        rates: {
          ...marketSettings,
          tokenBuyPrice: Number(priceForm.tokenBuyPrice),
          tokenSellPrice: Number(priceForm.tokenSellPrice),
          minBuyLimit: Number(priceForm.minBuyLimit),
          minSellLimit: Number(priceForm.minSellLimit),
        }
      });
      setLoadingAction(false);
      if (res.success) {
        showToast('Token pricing configuration saved to Supabase!', 'success');
        setShowPriceModal(false);
        await loadAdminData();
      } else {
        showToast('Failed to update price settings', 'error');
      }
    } catch {
      setLoadingAction(false);
      showToast('Network error saving settings', 'error');
    }
  };

  // Metric Cards Data - 100% REAL LIVE COUNTS
  const metricCards = [
    {
      title: 'Total Users',
      value: realUsers.length.toLocaleString(),
      subtitle: `${activeCount} Active`,
      icon: Users,
      iconColor: 'text-blue-500',
      iconBg: isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100',
      tag: 'Verified',
      tagColor: 'text-blue-600 bg-blue-500/10'
    },
    {
      title: 'Active Accounts',
      value: activeCount.toLocaleString(),
      subtitle: realUsers.length > 0 ? `${Math.round((activeCount / realUsers.length) * 100)}% of total` : '0%',
      icon: UserCheck,
      iconColor: 'text-emerald-500',
      iconBg: isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100',
      tag: 'Live',
      tagColor: 'text-emerald-600 bg-emerald-500/10'
    },
    {
      title: 'Blocked / Paused',
      value: blockedCount.toLocaleString(),
      subtitle: 'Restricted status',
      icon: Ban,
      iconColor: 'text-rose-500',
      iconBg: isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100',
      tag: 'Security',
      tagColor: 'text-rose-600 bg-rose-500/10'
    },
    {
      title: 'Buy Orders',
      value: buyOrders.length.toLocaleString(),
      subtitle: 'Total volume executed',
      icon: ShoppingCart,
      iconColor: 'text-purple-500',
      iconBg: isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100',
      tag: 'Trading',
      tagColor: 'text-purple-600 bg-purple-500/10'
    },
    {
      title: 'Sell Orders',
      value: sellOrders.length.toLocaleString(),
      subtitle: 'Total tokens sold',
      icon: ArrowLeftRight,
      iconColor: 'text-indigo-500',
      iconBg: isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100',
      tag: 'Exchange',
      tagColor: 'text-indigo-600 bg-indigo-500/10'
    },
    {
      title: 'Total Deposits',
      value: `₹${totalDepositsSum.toLocaleString('en-IN')}`,
      subtitle: `${deposits.filter(t => t.status === 'PENDING').length} Pending queue`,
      icon: ArrowDownLeft,
      iconColor: 'text-teal-500',
      iconBg: isDark ? 'bg-teal-500/10 border-teal-500/20' : 'bg-teal-50 border-teal-100',
      tag: 'Inflow',
      tagColor: 'text-teal-600 bg-teal-500/10'
    },
    {
      title: 'Total Withdrawals',
      value: `₹${totalWithdrawalsSum.toLocaleString('en-IN')}`,
      subtitle: `${withdrawals.filter(t => t.status === 'PENDING').length} Payouts awaiting`,
      icon: ArrowUpRight,
      iconColor: 'text-amber-500',
      iconBg: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100',
      tag: 'Outflow',
      tagColor: 'text-amber-600 bg-amber-500/10'
    },
    {
      title: 'Platform Reserves',
      value: `₹${platformBalance.toLocaleString('en-IN')}`,
      subtitle: 'Net settled liquidity',
      icon: Database,
      iconColor: 'text-blue-500',
      iconBg: isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100',
      tag: 'Reserve',
      tagColor: 'text-blue-600 bg-blue-500/10'
    },
  ];

  const cardStyle = isDark
    ? 'bg-[#111C44] border-slate-800/90 shadow-md text-white'
    : 'bg-white border-slate-200/90 shadow-xs text-slate-900';

  return (
    <div className="space-y-6">
      
      {/* ======================================================== */}
      {/* 1. TOP METRIC CARDS GRID (RESPONSIVE: 2 COLS ON MOBILE)  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metricCards.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div 
              key={idx} 
              className={`p-3.5 sm:p-5 rounded-2xl border transition-all hover:scale-[1.01] ${cardStyle}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border shrink-0 ${m.iconBg}`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${m.iconColor}`} />
                </div>
                <span className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${m.tagColor}`}>
                  {m.tag}
                </span>
              </div>

              <div className="mt-3">
                <span className={`text-[11px] sm:text-xs font-semibold block truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {m.title}
                </span>
                
                <h3 className="text-lg sm:text-2xl font-black tracking-tight mt-0.5 truncate">
                  {m.value}
                </h3>

                <p className={`text-[10px] sm:text-[11px] font-medium mt-1 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {m.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 2. MIDDLE ROW: ACTIVITY CHART + QUICK ACTIONS            */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Left: Transaction Volume & Activity Summary (8 Columns) */}
        <div className={`lg:col-span-8 p-4 sm:p-6 rounded-2xl border ${cardStyle} space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Platform Volume & Order Metrics</span>
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Real-time breakdown of all registered transaction channels
              </p>
            </div>

            {/* Quick Filter Status Badges */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold">
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Buy ({buyOrders.length})
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-500">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Sell ({sellOrders.length})
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Deposit ({deposits.length})
              </span>
            </div>
          </div>

          {/* Volume Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] font-bold text-slate-400 block">Buy Vol.</span>
              <span className="text-sm font-black text-blue-500">
                ₹{buyOrders.reduce((s, t) => s + (Number(t.amount) || 0), 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] font-bold text-slate-400 block">Sell Vol.</span>
              <span className="text-sm font-black text-purple-500">
                ₹{sellOrders.reduce((s, t) => s + (Number(t.amount) || 0), 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] font-bold text-slate-400 block">Settled Deposits</span>
              <span className="text-sm font-black text-emerald-500">
                ₹{totalDepositsSum.toLocaleString('en-IN')}
              </span>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] font-bold text-slate-400 block">Paid Withdrawals</span>
              <span className="text-sm font-black text-amber-500">
                ₹{totalWithdrawalsSum.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Visual Activity Bar Representation */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>Traffic Ratio</span>
              <span>{transactions.length} Total Operations</span>
            </div>
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${transactions.length ? (buyOrders.length / transactions.length) * 100 : 25}%` }} 
                className="bg-blue-500 h-full transition-all"
                title="Buy Orders"
              />
              <div 
                style={{ width: `${transactions.length ? (sellOrders.length / transactions.length) * 100 : 25}%` }} 
                className="bg-purple-500 h-full transition-all"
                title="Sell Orders"
              />
              <div 
                style={{ width: `${transactions.length ? (deposits.length / transactions.length) * 100 : 25}%` }} 
                className="bg-emerald-500 h-full transition-all"
                title="Deposits"
              />
              <div 
                style={{ width: `${transactions.length ? (withdrawals.length / transactions.length) * 100 : 25}%` }} 
                className="bg-amber-500 h-full transition-all"
                title="Withdrawals"
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Actions (4 Columns) */}
        <div className={`lg:col-span-4 p-4 sm:p-6 rounded-2xl border ${cardStyle} space-y-3.5`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black tracking-tight">
              Quick Admin Actions
            </h3>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Instant</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Add User Button */}
            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className={`p-3.5 sm:p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 ${
                isDark 
                  ? 'bg-blue-900/20 border-blue-800/40 text-blue-300 hover:bg-blue-900/30' 
                  : 'bg-blue-50/80 border-blue-100 text-blue-800 hover:bg-blue-100/80 shadow-xs'
              }`}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs font-black">Add User</span>
            </button>

            {/* Update Token Price Button */}
            <button
              type="button"
              onClick={() => setShowPriceModal(true)}
              className={`p-3.5 sm:p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 ${
                isDark 
                  ? 'bg-emerald-900/20 border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/30' 
                  : 'bg-emerald-50/80 border-emerald-100 text-emerald-800 hover:bg-emerald-100/80 shadow-xs'
              }`}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs font-black">Token Price</span>
            </button>

            {/* Broadcast Button */}
            <button
              type="button"
              onClick={() => navigate('/admin/broadcast')}
              className={`p-3.5 sm:p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 ${
                isDark 
                  ? 'bg-purple-900/20 border-purple-800/40 text-purple-300 hover:bg-purple-900/30' 
                  : 'bg-purple-50/80 border-purple-100 text-purple-800 hover:bg-purple-100/80 shadow-xs'
              }`}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs font-black">Broadcast</span>
            </button>

            {/* Platform Settings Button */}
            <button
              type="button"
              onClick={() => navigate('/admin/settings')}
              className={`p-3.5 sm:p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 ${
                isDark 
                  ? 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/60' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 shadow-xs'
              }`}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-md shadow-slate-700/20">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs font-black">Settings</span>
            </button>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM ROW: RECENT TRANSACTIONS + PLATFORM SUMMARY     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Left: Recent Transactions (8 Columns) */}
        <div className={`lg:col-span-8 p-4 sm:p-6 rounded-2xl border ${cardStyle} space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight">
                {searchFilter ? `${searchFilter.toUpperCase()} Orders` : 'Recent Live Transactions'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {displayTxs.length > 0 ? `Showing latest ${displayTxs.length} real activities` : 'No recent transactions recorded'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 active:scale-95 transition-all"
            >
              <span>Manage Users</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px] font-bold">
            {[
              { key: null, label: 'All Operations' },
              { key: 'buy', label: 'Buy Orders' },
              { key: 'sell', label: 'Sell Orders' },
            ].map((f) => {
              const isSelected = searchFilter === f.key;
              return (
                <button
                  key={f.key || 'all'}
                  type="button"
                  onClick={() => navigate(f.key ? `/admin?filter=${f.key}` : '/admin')}
                  className={`px-3 py-1 rounded-xl border transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-black'
                      : isDark ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white' : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {displayTxs.length === 0 ? (
            <div className={`py-12 text-center rounded-xl border border-dashed ${
              isDark ? 'border-slate-800 text-slate-400 bg-slate-900/30' : 'border-slate-200 text-slate-500 bg-slate-50/50'
            }`}>
              <Activity className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
              <p className="text-xs font-bold">No transactions found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Real user buy, sell, deposit, and withdrawal records will appear here.</p>
            </div>
          ) : (
            <>
              {/* Desktop View Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b text-[11px] font-bold text-slate-400 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/10 dark:divide-slate-800/60">
                    {displayTxs.map((tx, idx) => (
                      <tr key={tx.id || idx} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/80'}`}>
                        <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 font-black text-[10px] flex items-center justify-center">
                              {(tx.userName || 'U').slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold block">{tx.userName || tx.userId || 'User'}</span>
                              <span className="text-[10px] font-mono text-slate-400">{tx.refNumber || tx.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            tx.type === 'BUY' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            tx.type === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            tx.type === 'SELL' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold">
                          ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' :
                            tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400' :
                            'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Just now'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View: Native App Cards */}
              <div className="sm:hidden space-y-2.5">
                {displayTxs.map((tx, idx) => (
                  <div 
                    key={tx.id || idx}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === 'BUY' ? 'bg-blue-500/10 text-blue-500' :
                        tx.type === 'SELL' ? 'bg-purple-500/10 text-purple-500' :
                        tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {tx.type === 'BUY' ? <ShoppingCart className="w-4 h-4" /> :
                         tx.type === 'SELL' ? <ArrowLeftRight className="w-4 h-4" /> :
                         tx.type === 'DEPOSIT' ? <ArrowDownLeft className="w-4 h-4" /> :
                         <ArrowUpRight className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black truncate">{tx.userName || 'User'}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                            tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-rose-500/10 text-rose-500'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {tx.type} • {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black block">
                        ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Platform Summary (4 Columns) */}
        <div className={`lg:col-span-4 p-4 sm:p-6 rounded-2xl border ${cardStyle} space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black tracking-tight">
              Live Exchange Rates
            </h3>
            <button
              type="button"
              onClick={() => setShowPriceModal(true)}
              className="text-xs font-bold text-blue-500 hover:text-blue-600"
            >
              Modify
            </button>
          </div>

          <div className="space-y-3">
            {/* Current Buy Price / Current Sell Price Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] font-bold text-slate-400 block">Buy Rate</span>
                <span className="text-base font-black text-blue-500">₹{priceForm.tokenBuyPrice}</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] font-bold text-slate-400 block">Sell Rate</span>
                <span className="text-base font-black text-emerald-500">₹{priceForm.tokenSellPrice}</span>
              </div>
            </div>

            {/* Min Buy / Min Sell Limit Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] font-bold text-slate-400 block">Min Buy Limit</span>
                <span className="text-xs font-black">₹{priceForm.minBuyLimit}</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] font-bold text-slate-400 block">Min Sell Limit</span>
                <span className="text-xs font-black">{priceForm.minSellLimit} Tokens</span>
              </div>
            </div>

            {/* Real Referrals Stat Card */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-blue-900/20 border-blue-800/40 text-blue-400' : 'bg-blue-50/70 border-blue-100 text-blue-700'
            }`}>
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold">Total Referred Users</span>
              </div>
              <span className="text-sm font-black">{totalReferrals}</span>
            </div>

            {/* Real Referral Bonus Card */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-emerald-900/20 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50/70 border-emerald-100 text-emerald-700'
            }`}>
              <div className="flex items-center gap-2.5">
                <Gift className="w-4 h-4" />
                <span className="text-xs font-bold">Total Referral Rewards</span>
              </div>
              <span className="text-sm font-black">₹{totalReferralBonus.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. MODALS (ADD USER & UPDATE TOKEN PRICE)                 */}
      {/* ======================================================== */}
      
      {/* Modal: Add User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 ${
            isDark ? 'bg-[#0D1527] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black">Add New User</h3>
              <button 
                type="button" 
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="user@gmail.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Mobile</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={newUserForm.mobile}
                    onChange={(e) => setNewUserForm({ ...newUserForm, mobile: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Default Password</label>
                <input
                  type="text"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold block mb-1">Initial INR Balance</label>
                  <input
                    type="number"
                    value={newUserForm.inrBalance}
                    onChange={(e) => setNewUserForm({ ...newUserForm, inrBalance: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Initial USDT Balance</label>
                  <input
                    type="number"
                    value={newUserForm.usdtBalance}
                    onChange={(e) => setNewUserForm({ ...newUserForm, usdtBalance: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5"
                >
                  {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Token Price */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border space-y-4 ${
            isDark ? 'bg-[#0D1527] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black">Configure Token Rates</h3>
              <button 
                type="button" 
                onClick={() => setShowPriceModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePrices} className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1">Buy Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={priceForm.tokenBuyPrice}
                  onChange={(e) => setPriceForm({ ...priceForm, tokenBuyPrice: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Sell Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={priceForm.tokenSellPrice}
                  onChange={(e) => setPriceForm({ ...priceForm, tokenSellPrice: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold block mb-1">Min Buy Limit (₹)</label>
                  <input
                    type="number"
                    value={priceForm.minBuyLimit}
                    onChange={(e) => setPriceForm({ ...priceForm, minBuyLimit: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Min Sell Limit (Token)</label>
                  <input
                    type="number"
                    value={priceForm.minSellLimit}
                    onChange={(e) => setPriceForm({ ...priceForm, minSellLimit: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPriceModal(false)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5"
                >
                  {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Rates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
