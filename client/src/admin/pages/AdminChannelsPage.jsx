import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminTheme } from '../context/AdminThemeContext';
import { apiService } from '../../services/apiService';
import { Building2, QrCode, ShieldCheck, Plus, Trash2, Edit2, Save, Zap } from 'lucide-react';

export const AdminChannelsPage = () => {
  const { isDark } = useAdminTheme();
  const { showToast } = useApp();

  const [channels, setChannels] = useState([]);
  const [label, setLabel] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [holderName, setHolderName] = useState('');

  // UPI Form
  const [upiId, setUpiId] = useState('');
  const [upiLabel, setUpiLabel] = useState('VIP Instant UPI');

  // Crypto Form
  const [trc20Address, setTrc20Address] = useState('');
  const [bep20Address, setBep20Address] = useState('');

  // Edit Modal State
  const [editingChannel, setEditingChannel] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editIfscCode, setEditIfscCode] = useState('');
  const [editHolderName, setEditHolderName] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const loadChannels = async () => {
    try {
      const res = await apiService.adminGetChannels();
      if (res.success && res.channels) {
        setChannels(res.channels);
        const upi = res.channels.find(c => c.type === 'UPI');
        if (upi) setUpiId(upi.upiId || '');

        const trc = res.channels.find(c => c.cryptoChain === 'TRC20');
        if (trc) setTrc20Address(trc.walletAddress || '');

        const bep = res.channels.find(c => c.cryptoChain === 'BEP20');
        if (bep) setBep20Address(bep.walletAddress || '');
      }
    } catch (err) {
      console.warn('Failed to load channels from database:', err);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  const handleAddBank = async (e) => {
    e.preventDefault();
    if (!bankName || !accountNumber) {
      showToast('Bank Name and Account Number are required', 'error');
      return;
    }

    const res = await apiService.adminAddChannel({
      type: 'BANK',
      label: label || 'Standard Bank Channel',
      bankName,
      accountNumber,
      ifscCode,
      holderName,
      isActive: true,
      minDeposit: 1000,
      extraRewardPercent: 2,
    });

    if (res.success) {
      showToast('New bank payment channel added!', 'success');
      setLabel('');
      setBankName('');
      setAccountNumber('');
      setIfscCode('');
      setHolderName('');
      loadChannels();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment channel?')) return;
    const res = await apiService.adminDeleteChannel(id);
    if (res.success) {
      showToast('Channel removed successfully', 'info');
      loadChannels();
    }
  };

  const startEditChannel = (channel) => {
    setEditingChannel(channel);
    setEditLabel(channel.label || '');
    setEditBankName(channel.bankName || '');
    setEditAccountNumber(channel.accountNumber || '');
    setEditIfscCode(channel.ifscCode || '');
    setEditHolderName(channel.holderName || '');
    setEditIsActive(channel.isActive !== false);
  };

  const handleUpdateBank = async (e) => {
    e.preventDefault();
    if (!editingChannel) return;
    try {
      const res = await apiService.adminUpdateChannel(editingChannel.id, {
        label: editLabel.trim(),
        bankName: editBankName.trim(),
        accountNumber: editAccountNumber.trim(),
        ifscCode: editIfscCode.trim().toUpperCase(),
        holderName: editHolderName.trim(),
        isActive: editIsActive,
      });
      if (res.success) {
        showToast('Payment channel updated successfully in Supabase!', 'success');
        setEditingChannel(null);
        await loadChannels();
      } else {
        showToast(res.message || 'Failed to update channel', 'error');
      }
    } catch {
      showToast('Error updating payment channel', 'error');
    }
  };

  const handleSaveUpi = async (e) => {
    e.preventDefault();
    if (!upiId) return;

    const existingUpi = channels.find(c => c.type === 'UPI');
    if (existingUpi) {
      await apiService.adminUpdateChannel(existingUpi.id, {
        upiId,
        label: upiLabel,
      });
    } else {
      await apiService.adminAddChannel({
        type: 'UPI',
        label: upiLabel,
        upiId,
        isActive: true,
      });
    }
    showToast('UPI Channel updated with Auto-QR!', 'success');
    loadChannels();
  };

  const handleSaveCrypto = async (e) => {
    e.preventDefault();
    const existingTrc = channels.find(c => c.cryptoChain === 'TRC20');
    if (existingTrc && trc20Address) {
      await apiService.adminUpdateChannel(existingTrc.id, { walletAddress: trc20Address });
    }
    const existingBep = channels.find(c => c.cryptoChain === 'BEP20');
    if (existingBep && bep20Address) {
      await apiService.adminUpdateChannel(existingBep.id, { walletAddress: bep20Address });
    }
    showToast('USDT receiving addresses saved!', 'success');
    loadChannels();
  };

  const bankChannels = channels.filter(c => c.type === 'BANK');

  const cardStyle = isDark
    ? 'bg-[#111C44] border-slate-800 shadow-md text-white'
    : 'bg-white border-slate-200/90 shadow-xs text-slate-800';

  const inputStyle = isDark
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <span>Payment Gateways & Receiving Channels</span>
        </h2>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Configure official bank accounts, dynamic QR UPI, and multi-chain digital receiving wallets
        </p>
      </div>

      {/* Active Bank Channels */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
          <Building2 className="w-4 h-4" />
          <span>Active Bank Channels ({bankChannels.length})</span>
        </h3>

        {bankChannels.length === 0 ? (
          <div className={`p-6 text-center rounded-2xl border text-xs text-slate-400 ${cardStyle}`}>
            No bank accounts configured yet. Add your first bank account below.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankChannels.map((b) => (
              <div key={b.id} className={`p-4 rounded-2xl border space-y-3 relative transition-all ${cardStyle}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block ${
                      isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {b.label}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      b.isActive !== false
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                    }`}>
                      {b.isActive !== false ? '● ACTIVE' : '○ PAUSED'}
                    </span>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => startEditChannel(b)}
                      className="text-slate-400 hover:text-blue-500 transition-colors p-1.5 rounded-lg hover:bg-blue-500/10 cursor-pointer"
                      title="Edit Channel Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(b.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                      title="Remove Channel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black">{b.bankName}</h4>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    A/C: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{b.accountNumber}</strong>
                  </p>
                  <p className="text-xs font-mono text-slate-400">
                    IFSC: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{b.ifscCode}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">A/C Holder: <span className="font-semibold">{b.holderName || 'Not Set'}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Bank Channel Form */}
      <form onSubmit={handleAddBank} className={`p-4 sm:p-6 rounded-2xl border space-y-4 max-w-2xl ${cardStyle}`}>
        <h3 className="text-sm font-black flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-500" />
          <span>Add New Bank Channel</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-bold block mb-1">Channel Label</label>
            <input
              type="text"
              placeholder="e.g. VIP Primary Account"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs border ${inputStyle}`}
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Bank Name</label>
            <input
              type="text"
              required
              placeholder="e.g. HDFC Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs border ${inputStyle}`}
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Account Number</label>
            <input
              type="text"
              required
              placeholder="e.g. 5010023456789"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs border font-mono ${inputStyle}`}
            />
          </div>

          <div>
            <label className="font-bold block mb-1">IFSC Code</label>
            <input
              type="text"
              placeholder="e.g. HDFC0001234"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs border font-mono ${inputStyle}`}
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="font-bold block mb-1">Account Holder Name</label>
          <input
            type="text"
            placeholder="e.g. The FamPay Corporate"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            className={`w-full rounded-xl px-3 py-2 text-xs border ${inputStyle}`}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Save Bank Channel</span>
        </button>
      </form>

      {/* UPI & Crypto Config Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* UPI Auto-QR */}
        <form onSubmit={handleSaveUpi} className={`p-4 sm:p-5 rounded-2xl border space-y-3 text-xs ${cardStyle}`}>
          <div className="flex items-center gap-2 text-purple-500 font-black">
            <QrCode className="w-4 h-4" />
            <span>Automatic Dynamic UPI QR</span>
          </div>

          <div>
            <label className="font-bold block mb-1">UPI ID (VPA)</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. thefampay@yesbank"
              className={`w-full rounded-xl px-3 py-2 text-xs font-mono border ${inputStyle}`}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Update UPI Configuration</span>
          </button>
        </form>

        {/* Crypto Wallets */}
        <form onSubmit={handleSaveCrypto} className={`p-4 sm:p-5 rounded-2xl border space-y-3 text-xs ${cardStyle}`}>
          <div className="flex items-center gap-2 text-emerald-500 font-black">
            <ShieldCheck className="w-4 h-4" />
            <span>Multi-Chain USDT Addresses</span>
          </div>

          <div>
            <label className="font-bold block mb-1">TRC20 (Tron) Receiving Address</label>
            <input
              type="text"
              value={trc20Address}
              onChange={(e) => setTrc20Address(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-[11px] font-mono border ${inputStyle}`}
              placeholder="T..."
            />
          </div>

          <div>
            <label className="font-bold block mb-1">BEP20 (BSC) Receiving Address</label>
            <input
              type="text"
              value={bep20Address}
              onChange={(e) => setBep20Address(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-[11px] font-mono border ${inputStyle}`}
              placeholder="0x..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Update USDT Addresses</span>
          </button>
        </form>

      </div>

      {/* ======================================================== */}
      {/* EDIT CHANNEL MODAL (Zero-Error Live Backend Sync)       */}
      {/* ======================================================== */}
      {editingChannel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl relative ${
            isDark ? 'bg-[#0E1322] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <h3 className="text-base font-black">Edit Payment Channel</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingChannel(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateBank} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Channel Label</label>
                  <input
                    type="text"
                    required
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${inputStyle}`}
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${inputStyle}`}
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    value={editAccountNumber}
                    onChange={(e) => setEditAccountNumber(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-mono border ${inputStyle}`}
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={editIfscCode}
                    onChange={(e) => setEditIfscCode(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-mono border ${inputStyle}`}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Account Holder Full Name</label>
                <input
                  type="text"
                  required
                  value={editHolderName}
                  onChange={(e) => setEditHolderName(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputStyle}`}
                />
              </div>

              {/* Status Toggle */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="font-black block">Channel Status</span>
                  <span className="text-[10px] text-slate-400">Enable or disable this payment channel for deposits</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 active:scale-95 ${
                    editIsActive ? 'bg-emerald-600' : 'bg-slate-400 dark:bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                    editIsActive ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingChannel(null)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
