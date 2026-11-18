import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminTheme } from '../context/AdminThemeContext';
import { apiService } from '../../services/apiService';
import { 
  Send, 
  Users, 
  User, 
  Bell, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  Gift, 
  History, 
  Trash2, 
  Search,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

export const AdminBroadcastPage = () => {
  const { isDark } = useAdminTheme();
  const { allUsers, adminSendNotification, showToast } = useApp();

  const [targetType, setTargetType] = useState('ALL'); // 'ALL' | 'SPECIFIC'
  const [targetUserId, setTargetUserId] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserObj, setSelectedUserObj] = useState(null);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History State
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await apiService.adminGetBroadcastHistory();
      if (res.success && res.notifications) {
        setHistory(res.notifications);
      }
    } catch (e) {
      console.warn('Failed to load broadcast history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Quick Preset Templates
  const templates = [
    {
      id: 'bonus',
      icon: '🎁',
      name: 'Deposit Bonus',
      title: '🎁 Special 10% Deposit Bonus Active!',
      message: 'Get an extra 10% token reward bonus on all UPI and Bank deposits made today! Bonus tokens are credited automatically.'
    },
    {
      id: 'rates',
      icon: '⚡',
      name: 'Rate Boost',
      title: '⚡ Exchange Rates Boosted!',
      message: 'Live token cash-out and purchase rates have been updated. Trade tokens instantly with 0% liquidation fee and instant settlement.'
    },
    {
      id: 'upgrade',
      icon: '⚠️',
      name: 'System Maintenance',
      title: '⚠️ Payout Pipeline Upgraded & Active',
      message: 'The FamPay high-speed withdrawal server has been upgraded. Instant UPI & Bank cash-outs are active 24/7 with zero delay.'
    },
    {
      id: 'security',
      icon: '🛡️',
      name: 'Security Alert',
      title: '🛡️ Security Action Required: Link Payout Tool',
      message: 'Please add and verify your UPI ID or Bank account in the Tool tab to ensure fast, seamless 24/7 withdrawals.'
    },
    {
      id: 'spin',
      icon: '🎡',
      name: 'Free Spin Gift',
      title: '🎉 Complimentary Lucky Wheel Spin Credited!',
      message: 'Congratulations! Your account has received a free lucky spin. Head over to the Lucky Spin section to win instant cash prizes!'
    }
  ];

  const applyTemplate = (tpl) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    showToast(`Applied preset: ${tpl.name}`, 'info');
  };

  // Filter users for Specific User selector
  const filteredUsers = allUsers.filter(u => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    const name = (u.fullName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const mobile = (u.mobile || '').toLowerCase();
    const uid = (u.uid || u.id || '').toLowerCase();
    const ref = (u.referralCode || '').toLowerCase();
    return name.includes(q) || email.includes(q) || mobile.includes(q) || uid.includes(q) || ref.includes(q);
  }).slice(0, 8);

  const handleSelectUser = (u) => {
    setSelectedUserObj(u);
    setTargetUserId(u.id || u.uid);
    setUserSearchQuery('');
  };

  const handleClearSelectedUser = () => {
    setSelectedUserObj(null);
    setTargetUserId('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Title and message are required', 'error');
      return;
    }
    if (targetType === 'SPECIFIC' && !targetUserId) {
      showToast('Please select or enter target user UID', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.adminBroadcast({
        targetType,
        targetUserId: targetType === 'SPECIFIC' ? targetUserId : null,
        title: title.trim(),
        message: message.trim(),
      });

      if (res.success) {
        showToast('Notification dispatched & saved to Supabase successfully!', 'success');
        setTitle('');
        setMessage('');
        setSelectedUserObj(null);
        setTargetUserId('');
        await loadHistory();
      } else {
        showToast(res.message || 'Failed to dispatch notification', 'error');
      }
    } catch {
      showToast('Error dispatching notification', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBroadcast = async (id) => {
    if (!window.confirm('Delete this broadcast notification?')) return;
    try {
      const res = await apiService.adminDeleteBroadcast(id);
      if (res.success) {
        showToast('Notification deleted', 'info');
        setHistory(prev => prev.filter(n => n.id !== id));
      }
    } catch {
      showToast('Failed to delete notification', 'error');
    }
  };

  const cardStyle = isDark
    ? 'bg-[#111C44] border-slate-800 shadow-md text-white'
    : 'bg-white border-slate-200/90 shadow-xs text-slate-800';

  const inputStyle = isDark
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          <span>Targeted Broadcast & Push Notifications</span>
        </h2>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Dispatch real-time announcements, promotional reward alerts, or direct messages to specific members
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Broadcast Form */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Quick Preset Templates Bar */}
          <div className={`p-4 rounded-2xl border space-y-2.5 ${cardStyle}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick Message Templates</span>
              </span>
              <span className="text-[10px] text-slate-400">1-Click Auto-Fill</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800/80 border-slate-700 hover:border-blue-500 text-slate-200 hover:text-white' 
                      : 'bg-slate-100 border-slate-200 hover:border-blue-400 text-slate-700 hover:text-slate-900 shadow-2xs'
                  }`}
                >
                  <span>{tpl.icon}</span>
                  <span>{tpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Dispatch Form */}
          <form onSubmit={handleSubmit} className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${cardStyle}`}>
            
            {/* Target Audience Selector */}
            <div>
              <label className="text-xs font-bold block mb-1.5">Target Audience</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTargetType('ALL')}
                  className={`py-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    targetType === 'ALL' 
                      ? 'border-blue-500 bg-blue-500/20 text-blue-500 font-black shadow-xs' 
                      : isDark ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Broadcast to All</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('SPECIFIC')}
                  className={`py-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    targetType === 'SPECIFIC' 
                      ? 'border-blue-500 bg-blue-500/20 text-blue-500 font-black shadow-xs' 
                      : isDark ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Specific User</span>
                </button>
              </div>
            </div>

            {/* If Specific User Selected: Smart Search & Dropdown */}
            {targetType === 'SPECIFIC' && (
              <div className="space-y-2 p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5">
                <label className="text-xs font-bold block text-blue-500">
                  Target User Selection (UID / Name / Phone)
                </label>

                {selectedUserObj ? (
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-blue-200'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs">{selectedUserObj.fullName || 'Member'}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                          {selectedUserObj.uid || selectedUserObj.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {selectedUserObj.email || selectedUserObj.mobile || 'No contact info'} • Bal: ₹{Number(selectedUserObj.inrBalance || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSelectedUser}
                      className="text-xs text-rose-500 hover:underline font-bold px-2 py-1"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by Name, UID, Phone or Email..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-xs border ${inputStyle}`}
                      />
                    </div>

                    {/* Quick user selection pills */}
                    <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-700/20">
                      {filteredUsers.length === 0 ? (
                        <p className="text-[11px] text-slate-400 text-center py-2">No matching users found</p>
                      ) : (
                        filteredUsers.map(u => (
                          <div
                            key={u.id}
                            onClick={() => handleSelectUser(u)}
                            className="p-2 rounded-lg hover:bg-blue-500/10 cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <div>
                              <span className="font-bold block">{u.fullName || 'Member'}</span>
                              <span className="text-[10px] text-slate-400 font-mono">UID: {u.uid || u.id} • {u.mobile || u.email || ''}</span>
                            </div>
                            <span className="text-[10px] font-bold text-blue-500 bg-blue-500/15 px-2 py-0.5 rounded">
                              Select
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 block mb-1">Or enter manual UID / Email:</span>
                      <input
                        type="text"
                        placeholder="e.g. FP-89201"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2 text-xs border ${inputStyle}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-bold block mb-1">Notification Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Special Weekend Trade Cashback Active!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-bold border ${inputStyle}`}
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Message Body</label>
              <textarea
                rows={4}
                required
                placeholder="Type full broadcast text here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs leading-relaxed border ${inputStyle}`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Dispatching Broadcast...' : 'Dispatch Notification Live'}</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Broadcast History */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
              <History className="w-4 h-4" />
              <span>Dispatched Notifications ({history.length})</span>
            </h3>
            <button
              type="button"
              onClick={loadHistory}
              className="text-[10px] font-bold text-slate-400 hover:text-blue-500 cursor-pointer"
            >
              Refresh
            </button>
          </div>

          <div className={`p-4 rounded-2xl border space-y-3 max-h-[600px] overflow-y-auto ${cardStyle}`}>
            {loadingHistory ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                Loading broadcast records...
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No past broadcasts found.
              </div>
            ) : (
              history.map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border space-y-1.5 relative ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.targetType === 'ALL'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {item.targetType === 'ALL' ? '● ALL USERS' : `UID: ${item.targetUserId || 'SPECIFIC'}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </span>
                      <button
                        onClick={() => handleDeleteBroadcast(item.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        title="Delete Notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-black">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium line-clamp-3">
                    {item.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
