import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminTheme } from '../context/AdminThemeContext';
import { 
  Users, Lock, Unlock, RefreshCw, Search, Edit3, 
  ShieldOff, ShieldCheck, Check, Play, Pause, ArrowDownLeft,
  ArrowUpRight, AlertTriangle, X, Phone, Mail, KeyRound, UserCheck, Ban, Gift,
  ShoppingCart, Shield
} from 'lucide-react';

export const AdminUsersPage = () => {
  const { isDark } = useAdminTheme();

  const { 
    allUsers, 
    loadAdminData, 
    adminResetPin, 
    adminToggleFundLock, 
    adminToggleSellAllowed, 
    adminToggleDepositAllowed,
    adminToggleAccountPaused,
    adminUpdateUserStatus,
    adminAdjustBalance,
    showToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingUser, setEditingUser] = useState(null);
  const [modalTab, setModalTab] = useState('GIFT'); // 'GIFT' or 'DIRECT'
  const [editInr, setEditInr] = useState('');
  const [editUsdt, setEditUsdt] = useState('');
  const [giftAmount, setGiftAmount] = useState('500');
  const [giftNote, setGiftNote] = useState('Special Surprise Gift 🎁');

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const regularUsers = allUsers.filter(u => u.role !== 'ADMIN');

  const filtered = regularUsers.filter(u => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      u.fullName?.toLowerCase().includes(term) ||
      u.uid?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.mobile?.includes(term) ||
      u.referralCode?.toLowerCase().includes(term) ||
      u.referredBy?.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return u.status === 'active' && !u.accountPaused;
    if (statusFilter === 'PAUSED') return u.accountPaused;
    if (statusFilter === 'BLOCKED') return u.status === 'blocked';
    if (statusFilter === 'LOCKED') return u.fundLocked || u.pinLocked;

    return true;
  });

  const openBalanceModal = (u, defaultTab = 'GIFT') => {
    setEditingUser(u);
    setModalTab(defaultTab);
    setEditInr(u.inrBalance || 0);
    setEditUsdt(u.usdtBalance || 0);
    setGiftAmount('500');
    setGiftNote('Special Surprise Gift 🎁');
  };

  const handleSaveBalance = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    const success = await adminAdjustBalance(editingUser.id, {
      inrBalance: Number(editInr),
      usdtBalance: Number(editUsdt),
      giftNote: giftNote.trim() || undefined
    });
    if (success) {
      setEditingUser(null);
    }
  };

  const handleCreditGift = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    const numGift = Number(giftAmount);
    if (!numGift || numGift <= 0) {
      showToast('Please enter a valid gift amount', 'error');
      return;
    }
    const success = await adminAdjustBalance(editingUser.id, {
      isGift: true,
      giftAmount: numGift,
      giftNote: giftNote.trim() || undefined
    });
    if (success) {
      setEditingUser(null);
    }
  };

  const cardStyle = isDark
    ? 'bg-[#111C44] border-slate-800 shadow-md text-white'
    : 'bg-white border-slate-200/90 shadow-xs text-slate-800';

  return (
    <div className="space-y-6">
      
      {/* Page Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>User Accounts & Permissions</span>
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Live control over balances, trading status, fund lock & security PIN
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search UID, Name, Email, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold border transition-all ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500' 
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 shadow-xs'
            }`}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Filter Tabs (Horizontal Scrollable on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
        {[
          { key: 'ALL', label: `All Users (${regularUsers.length})` },
          { key: 'ACTIVE', label: `Active (${regularUsers.filter(u => u.status === 'active' && !u.accountPaused).length})` },
          { key: 'PAUSED', label: `Paused (${regularUsers.filter(u => u.accountPaused).length})` },
          { key: 'BLOCKED', label: `Blocked (${regularUsers.filter(u => u.status === 'blocked').length})` },
          { key: 'LOCKED', label: `Locked (${regularUsers.filter(u => u.fundLocked || u.pinLocked).length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl border whitespace-nowrap transition-all active:scale-95 ${
              statusFilter === tab.key
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 font-extrabold'
                : isDark 
                ? 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-2xs'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile Card-Based User List (App Feel) */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border text-xs text-slate-400 ${cardStyle}`}>
            No users found matching your search.
          </div>
        ) : (
          filtered.map((u) => (
            <div key={u.id} className={`p-4 rounded-2xl border space-y-3 ${cardStyle}`}>
              {/* Header: User Info & Balance */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 font-black text-sm flex items-center justify-center shrink-0">
                    {(u.fullName || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="font-black text-sm block truncate">{u.fullName}</span>
                    <span className="text-[10px] text-blue-500 font-mono font-bold block">UID: {u.uid}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{u.email}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-emerald-500 block">
                    ₹{Number(u.inrBalance || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    ${u.usdtBalance || 0} USDT
                  </span>
                </div>
              </div>

              {/* Referral & Network Strip */}
              <div className={`p-2.5 rounded-xl border text-[11px] grid grid-cols-3 gap-2 text-center ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-purple-50/70 border-purple-100'
              }`}>
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Ref Code</span>
                  <span className="font-mono font-black text-purple-600 dark:text-purple-400 text-xs">
                    {u.referralCode || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Invited By</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-xs truncate block">
                    {u.referredBy || 'Direct'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Team / Earned</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                    {u.referralCount || 0} (₹{Number(u.referralEarnings || 0).toLocaleString('en-IN')})
                  </span>
                </div>
              </div>

              {/* Wallet Actions Bar */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openBalanceModal(u, 'GIFT')}
                  className="flex-1 py-1.5 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Send Gift ₹</span>
                </button>
                <button
                  type="button"
                  onClick={() => openBalanceModal(u, 'DIRECT')}
                  className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                    isDark ? 'border-slate-700 bg-slate-800/80 text-blue-400 hover:bg-slate-800' : 'border-slate-200 bg-slate-100 text-blue-600 hover:bg-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Balance</span>
                </button>
              </div>

              {/* Status Badges Grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                {/* Account Status */}
                <button
                  type="button"
                  onClick={() => adminUpdateUserStatus(u.id, u.status === 'blocked' ? 'active' : 'blocked')}
                  className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    u.status === 'blocked'
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 font-black'
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  }`}
                >
                  {u.status === 'blocked' ? <Ban className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                  <span>{u.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'}</span>
                </button>

                {/* Account Pause */}
                <button
                  type="button"
                  onClick={() => adminToggleAccountPaused(u.id, u.accountPaused ?? false)}
                  className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    u.accountPaused
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 font-black'
                      : isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  {u.accountPaused ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-500" />}
                  <span>{u.accountPaused ? 'Account Paused' : 'Account Normal'}</span>
                </button>

                {/* Sell Permission */}
                <button
                  type="button"
                  onClick={() => adminToggleSellAllowed(u.id, u.sellAllowed ?? true)}
                  className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    u.sellAllowed !== false
                      ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/30 font-black'
                  }`}
                >
                  <ShoppingCart className="w-3 h-3" />
                  <span>Sell: {u.sellAllowed !== false ? 'ALLOWED' : 'PAUSED'}</span>
                </button>

                {/* Fund Lock */}
                <button
                  type="button"
                  onClick={() => adminToggleFundLock(u.id, u.fundLocked ?? false)}
                  className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    u.fundLocked 
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 font-black' 
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  }`}
                >
                  {u.fundLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span>Funds: {u.fundLocked ? 'LOCKED' : 'UNLOCKED'}</span>
                </button>
              </div>

              {/* PIN Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <div className="flex items-center gap-1.5 font-mono text-slate-400">
                  <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                  <span>PIN: <strong className="text-blue-500">{u.pinLocked ? 'LOCKED' : (u.transactionPin || '1234')}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={() => adminResetPin(u.id, '1234')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset to 1234</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className={`hidden sm:block overflow-x-auto rounded-2xl border ${cardStyle}`}>
        <table className="w-full text-left text-xs">
          <thead className={`border-b text-[11px] font-black uppercase tracking-wider ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <tr>
              <th className="py-3.5 px-4">User Details</th>
              <th className="py-3.5 px-4">Referral & Team</th>
              <th className="py-3.5 px-4">Wallet Balances</th>
              <th className="py-3.5 px-4">Account Status</th>
              <th className="py-3.5 px-4">Trading Permissions</th>
              <th className="py-3.5 px-4">Fund Security</th>
              <th className="py-3.5 px-4">Security PIN</th>
              <th className="py-3.5 px-4 text-right">Reset Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y font-medium ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}>
                  
                  {/* User Details */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 font-black text-xs flex items-center justify-center shrink-0">
                        {(u.fullName || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className={`font-black block truncate text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {u.fullName}
                        </span>
                        <span className="text-[10px] text-blue-500 font-mono font-bold block">
                          UID: {u.uid}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {u.email} • {u.mobile}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Referral & Team Network */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Code:</span>
                        <span className="text-xs font-mono font-black text-purple-600 dark:text-purple-400">
                          {u.referralCode || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">By:</span>
                        <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                          {u.referredBy || 'Direct'}
                        </span>
                      </div>
                      <div className="text-[10px] font-black text-emerald-500">
                        {u.referralCount || 0} downline • ₹{Number(u.referralEarnings || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </td>

                  {/* Wallet Balances */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="font-black text-emerald-500 block text-xs">
                          ₹{Number(u.inrBalance || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          ${u.usdtBalance || 0} USDT
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openBalanceModal(u, 'GIFT')}
                          className="px-2.5 py-1 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-black flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                          title="Add Gift / Reward Funds"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>Gift</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openBalanceModal(u, 'DIRECT')}
                          className={`p-1.5 rounded-xl border text-blue-500 transition-colors active:scale-95 ${
                            isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Adjust Direct Balances"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Account Status (Active / Paused / Blocked) */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      <button
                        type="button"
                        onClick={() => adminUpdateUserStatus(u.id, u.status === 'blocked' ? 'active' : 'blocked')}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1 transition-all active:scale-95 ${
                          u.status === 'blocked'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                        }`}
                      >
                        {u.status === 'blocked' ? <Ban className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        <span>{u.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'}</span>
                      </button>

                      {/* Account Pause Toggle */}
                      <button
                        type="button"
                        onClick={() => adminToggleAccountPaused(u.id, u.accountPaused ?? false)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all active:scale-95 ${
                          u.accountPaused 
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {u.accountPaused ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 text-emerald-500" />}
                        <span>{u.accountPaused ? 'Paused' : 'Normal'}</span>
                      </button>
                    </div>
                  </td>

                  {/* Trading Permissions (Sell & Deposit) */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => adminToggleSellAllowed(u.id, u.sellAllowed ?? true)}
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border flex items-center gap-1 transition-all active:scale-95 ${
                          u.sellAllowed !== false
                            ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        }`}
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Sell: {u.sellAllowed !== false ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => adminToggleDepositAllowed(u.id, u.depositAllowed ?? true)}
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border flex items-center gap-1 transition-all active:scale-95 ${
                          u.depositAllowed !== false
                            ? 'bg-sky-500/10 text-sky-500 border-sky-500/30'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        }`}
                      >
                        <ArrowDownLeft className="w-3 h-3" />
                        <span>Deposit: {u.depositAllowed !== false ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>
                  </td>

                  {/* Fund Security (Lock/Unlock) */}
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => adminToggleFundLock(u.id, u.fundLocked ?? false)}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1.5 active:scale-95 ${
                        u.fundLocked 
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-xs' 
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      }`}
                    >
                      {u.fundLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      <span>{u.fundLocked ? 'LOCKED' : 'UNLOCKED'}</span>
                    </button>
                  </td>

                  {/* PIN State */}
                  <td className="py-3.5 px-4">
                    {u.pinLocked ? (
                      <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-lg inline-flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>LOCKED (3 Fails)</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono font-bold flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-blue-500" />
                        <span>{u.transactionPin || '1234'}</span>
                      </span>
                    )}
                  </td>

                  {/* 1-Click Reset PIN */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => adminResetPin(u.id, '1234')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 ml-auto active:scale-95"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Gift Funds & Balance Control */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className={`w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border space-y-4 my-auto transition-all ${
              isDark ? 'bg-[#0D1527] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black">Wallet & Gift Funds Manager</h3>
                  <p className="text-[10px] text-slate-400">Credit rewards or adjust live wallet balances</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info Strip */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="min-w-0">
                <span className="font-black text-xs block truncate">{editingUser.fullName}</span>
                <span className="text-[10px] text-blue-500 font-mono font-bold block">{editingUser.uid} • {editingUser.email}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block font-semibold">Current Balance</span>
                <span className="text-xs font-black text-emerald-500">
                  ₹{Number(editingUser.inrBalance || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 block font-bold">
                  ${editingUser.usdtBalance || 0} USDT
                </span>
              </div>
            </div>

            {/* Mode Switch Tabs */}
            <div className={`grid grid-cols-2 p-1 rounded-xl border text-xs font-black ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setModalTab('GIFT')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                  modalTab === 'GIFT'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Add Gift / Bonus</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('DIRECT')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                  modalTab === 'DIRECT'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Direct Edit</span>
              </button>
            </div>

            {/* TAB 1: ADD GIFT / BONUS */}
            {modalTab === 'GIFT' && (
              <form onSubmit={handleCreditGift} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-extrabold block mb-1.5 text-slate-400">
                    Quick Preset Amounts:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['100', '250', '500', '1000', '2000', '5000'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setGiftAmount(preset)}
                        className={`py-1.5 rounded-xl border text-xs font-black transition-all active:scale-95 ${
                          giftAmount === preset
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : isDark 
                            ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        +₹{Number(preset).toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold block mb-1">
                    Amount to Credit (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter gift amount..."
                    value={giftAmount}
                    onChange={(e) => setGiftAmount(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm font-black focus:ring-2 focus:ring-amber-500 transition-all ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold block mb-1">
                    Gift Title / Notification Message
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Special Surprise Gift 🎁"
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-amber-500 transition-all ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                {/* Calculation Summary Box */}
                <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
                  isDark ? 'bg-amber-500/5 border-amber-500/20 text-amber-200/90' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex justify-between font-black">
                    <span>New Balance after Gift:</span>
                    <span className="text-emerald-500">
                      ₹{(Number(editingUser.inrBalance || 0) + Number(giftAmount || 0)).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    ⚡ Auto-records a <strong>REWARD</strong> transaction and delivers instant <strong>"🎁 Surprise Gift Credited!"</strong> notification to user.
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                      isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-black hover:bg-amber-600 shadow-md shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Credit ₹{Number(giftAmount || 0).toLocaleString('en-IN')} Gift Now</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: DIRECT BALANCE EDIT */}
            {modalTab === 'DIRECT' && (
              <form onSubmit={handleSaveBalance} className="space-y-3.5">
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-extrabold block mb-1">Set INR Balance (₹)</label>
                    <input
                      type="number"
                      value={editInr}
                      onChange={(e) => setEditInr(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm font-black focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-extrabold block mb-1">Set USDT Balance ($)</label>
                    <input
                      type="number"
                      value={editUsdt}
                      onChange={(e) => setEditUsdt(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm font-black focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-extrabold block mb-1">Admin Note / Reason (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Account Balance Correction"
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                      isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 shadow-md shadow-blue-600/25 active:scale-95 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
