import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '../context/AdminThemeContext';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { 
  RotateCw, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  Sparkles, 
  Trophy, 
  Gift, 
  TrendingUp, 
  DollarSign, 
  Users, 
  HelpCircle,
  Eye,
  RefreshCw,
  Search,
  Check,
  X
} from 'lucide-react';

export const AdminSpinPage = () => {
  const { isDark } = useAdminTheme();
  const { showToast } = useApp();

  // Settings State
  const [enabled, setEnabled] = useState(true);
  const [spinPrice, setSpinPrice] = useState(50);
  const [welcomeFreeSpins, setWelcomeFreeSpins] = useState(1);
  const [minTradingVolume, setMinTradingVolume] = useState(10000);
  const [prizes, setPrizes] = useState([]);
  
  // Stats & Logs
  const [stats, setStats] = useState({
    totalSpinsPlayed: 0,
    totalSpinRevenue: 0,
    totalPrizesPaid: 0,
    netProfit: 0,
    recentSpins: []
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'prizes' | 'gift' | 'logs'

  // Prize Modal State
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [editingPrizeId, setEditingPrizeId] = useState(null);
  const [prizeLabel, setPrizeLabel] = useState('');
  const [prizeValue, setPrizeValue] = useState(50);
  const [prizeWeight, setPrizeWeight] = useState(10);
  const [prizeColor, setPrizeColor] = useState('#8B5CF6');
  const [prizeType, setPrizeType] = useState('cash');

  // Gift Spins to User State
  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [giftCount, setGiftCount] = useState(1);
  const [giftNote, setGiftNote] = useState('Bonus reward from Admin');
  const [isGifting, setIsGifting] = useState(false);

  // Load Admin Spin Configuration & Stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, statsRes, usersRes] = await Promise.all([
        apiService.adminGetSpinSettings(),
        apiService.adminGetSpinStats(),
        apiService.adminGetUsers()
      ]);

      if (settingsRes && settingsRes.success && settingsRes.settings) {
        const s = settingsRes.settings;
        setEnabled(s.enabled !== false);
        setSpinPrice(s.spinPrice || 50);
        setWelcomeFreeSpins(s.welcomeFreeSpins !== undefined ? s.welcomeFreeSpins : 1);
        setMinTradingVolume(s.minTradingVolumeForSpin || 10000);
        setPrizes(s.prizes || []);
      }

      if (statsRes && statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }

      if (usersRes && usersRes.success && usersRes.users) {
        setUsersList(usersRes.users);
      }
    } catch (err) {
      console.warn('Failed to load admin spin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save General Wheel Configuration
  const handleSaveGeneralSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiService.adminUpdateSpinSettings({
        enabled,
        spinPrice: Number(spinPrice),
        welcomeFreeSpins: Number(welcomeFreeSpins),
        minTradingVolumeForSpin: Number(minTradingVolume),
        prizes
      });

      if (res.success) {
        showToast('Lucky Spin settings saved successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to save settings', 'error');
      }
    } catch {
      showToast('Error saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Prize Modal for Add or Edit
  const handleOpenAddPrize = () => {
    setEditingPrizeId(null);
    setPrizeLabel('');
    setPrizeValue(50);
    setPrizeWeight(15);
    setPrizeColor('#8B5CF6');
    setPrizeType('cash');
    setShowPrizeModal(true);
  };

  const handleOpenEditPrize = (p) => {
    setEditingPrizeId(p.id);
    setPrizeLabel(p.label);
    setPrizeValue(p.value);
    setPrizeWeight(p.weight || 10);
    setPrizeColor(p.color || '#8B5CF6');
    setPrizeType(p.type || (p.value > 0 ? 'cash' : 'empty'));
    setShowPrizeModal(true);
  };

  // Save Single Prize
  const handleSavePrize = (e) => {
    e.preventDefault();
    if (!prizeLabel.trim()) {
      showToast('Prize label is required', 'error');
      return;
    }

    const val = Math.max(0, Number(prizeValue) || 0);
    const weight = Math.max(1, Number(prizeWeight) || 1);

    if (editingPrizeId) {
      // Edit existing
      setPrizes(prev => prev.map(p => {
        if (p.id === editingPrizeId) {
          return {
            ...p,
            label: prizeLabel.trim(),
            value: val,
            weight,
            color: prizeColor,
            textColor: '#FFFFFF',
            type: prizeType
          };
        }
        return p;
      }));
    } else {
      // Add new
      const newPrize = {
        id: `p_${Date.now()}`,
        label: prizeLabel.trim(),
        value: val,
        weight,
        color: prizeColor,
        textColor: '#FFFFFF',
        type: prizeType
      };
      setPrizes(prev => [...prev, newPrize]);
    }

    setShowPrizeModal(false);
    showToast('Prize segment updated in list! Click Save to apply.', 'info');
  };

  // Delete Prize
  const handleDeletePrize = (id) => {
    if (prizes.length <= 2) {
      showToast('At least 2 prizes are required for the wheel', 'error');
      return;
    }
    setPrizes(prev => prev.filter(p => p.id !== id));
    showToast('Prize segment removed. Click Save to apply.', 'info');
  };

  // Reset to Recommended Defaults
  const handleResetDefaults = () => {
    if (!window.confirm('Reset wheel prizes to recommended default set?')) return;
    const defaults = [
      { id: 'p1', label: '₹10 Cash', value: 10, type: 'cash', color: '#7C3AED', textColor: '#FFFFFF', weight: 28 },
      { id: 'p2', label: '₹25 Cash', value: 25, type: 'cash', color: '#EC4899', textColor: '#FFFFFF', weight: 24 },
      { id: 'p3', label: '₹50 Cash', value: 50, type: 'cash', color: '#10B981', textColor: '#FFFFFF', weight: 18 },
      { id: 'p4', label: '₹100 Cash', value: 100, type: 'cash', color: '#F59E0B', textColor: '#FFFFFF', weight: 12 },
      { id: 'p5', label: 'Better Luck', value: 0, type: 'empty', color: '#64748B', textColor: '#FFFFFF', weight: 10 },
      { id: 'p6', label: '₹200 Cash', value: 200, type: 'cash', color: '#06B6D4', textColor: '#FFFFFF', weight: 5 },
      { id: 'p7', label: '₹500 Jackpot', value: 500, type: 'cash', color: '#EF4444', textColor: '#FFFFFF', weight: 2 },
      { id: 'p8', label: '₹5 Bonus', value: 5, type: 'cash', color: '#8B5CF6', textColor: '#FFFFFF', weight: 1 }
    ];
    setPrizes(defaults);
    setSpinPrice(50);
    setWelcomeFreeSpins(1);
    showToast('Reset to default prizes! Click Save to commit.', 'info');
  };

  // Gift Spins to User
  const handleGiftSpins = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      showToast('Please select a user to gift spins to', 'error');
      return;
    }

    setIsGifting(true);
    try {
      const res = await apiService.adminGiftSpins(selectedUserId, giftCount, giftNote);
      if (res.success) {
        showToast(res.message || 'Spins granted successfully!', 'success');
        setSelectedUserId('');
        setGiftCount(1);
        await fetchData();
      } else {
        showToast(res.message || 'Failed to gift spins', 'error');
      }
    } catch {
      showToast('Error granting spins', 'error');
    } finally {
      setIsGifting(false);
    }
  };

  // Calculate Total Weights for Chance %
  const totalWeight = prizes.reduce((sum, p) => sum + (Number(p.weight) || 1), 0);

  const cardStyle = isDark
    ? 'bg-[#111C44] border-slate-800 shadow-md text-white'
    : 'bg-white border-slate-200/90 shadow-xs text-slate-800';

  const inputStyle = isDark
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500';

  const filteredUsers = usersList.filter(u => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.uid && u.uid.toLowerCase().includes(q)) ||
      (u.mobile && u.mobile.includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl">
      
      {/* 1. TOP HEADER & LIVE CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <RotateCw className="w-6 h-6 text-purple-500" />
            <span>Lucky Spin Wheel Control Center</span>
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Configure price per spin (₹50), welcome free spins, prize segments, probabilities, and user rewards
          </p>
        </div>

        {/* Global Spin Master Toggle */}
        <div className={`p-2.5 rounded-2xl border flex items-center gap-3 shrink-0 ${cardStyle}`}>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">Master Switch</span>
            <span className={`text-xs font-black ${enabled ? 'text-emerald-500' : 'text-rose-500'}`}>
              {enabled ? 'WHEEL ACTIVE' : 'WHEEL DISABLED'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 active:scale-95 ${
              enabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
              enabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Spins</span>
            <RotateCw className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-xl font-black">{stats.totalSpinsPlayed || 0}</div>
          <span className="text-[10px] text-slate-400">All-time spins executed</span>
        </div>

        <div className={`p-4 rounded-2xl border ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Spin Purchases</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-black text-amber-500">
            ₹{(stats.totalSpinRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">Revenue from bought spins</span>
        </div>

        <div className={`p-4 rounded-2xl border ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prizes Paid Out</span>
            <Trophy className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-black text-emerald-500">
            ₹{(stats.totalPrizesPaid || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">Credited to user balances</span>
        </div>

        <div className={`p-4 rounded-2xl border ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Profit</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`mt-2 text-xl font-black ${
            (stats.netProfit || 0) >= 0 ? 'text-blue-500' : 'text-rose-500'
          }`}>
            ₹{(stats.netProfit || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">Revenue minus payouts</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className={`p-1.5 rounded-2xl border flex flex-wrap items-center gap-1.5 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        {[
          { id: 'settings', label: 'Wheel & Price Rules', icon: Coins },
          { id: 'prizes', label: `Prize Segments (${prizes.length})`, icon: Trophy },
          { id: 'gift', label: 'Gift Spins to User', icon: Gift },
          { id: 'logs', label: 'Recent Spin Activity', icon: RotateCw },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: WHEEL & PRICE RULES                               */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className={`lg:col-span-2 p-5 sm:p-6 rounded-2xl border space-y-5 ${cardStyle}`}>
            <h3 className="text-sm font-black flex items-center gap-2">
              <Coins className="w-4 h-4 text-purple-500" />
              <span>Core Spin Pricing & Free Chances Configuration</span>
            </h3>

            <div className="space-y-4 text-xs">
              
              {/* Spin Buy Price */}
              <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-xs text-purple-400">Spin Buy Price (INR)</label>
                  <span className="text-[10px] font-bold text-purple-400 uppercase">Per Single Spin</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={spinPrice}
                    onChange={(e) => setSpinPrice(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm font-black font-mono ${inputStyle}`}
                    placeholder="50"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Deducted directly from user wallet balance when buying a spin chance. Recommended: <strong>₹50</strong>.
                </p>
              </div>

              {/* Welcome Free Spins */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-xs text-emerald-400">Welcome Free Spins on Signup/First Login</label>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">One-Time Gift</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={welcomeFreeSpins}
                  onChange={(e) => setWelcomeFreeSpins(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-black font-mono ${inputStyle}`}
                  placeholder="1"
                />
                <p className="text-[11px] text-slate-400 leading-normal">
                  Automatically granted only ONCE upon first login or registration. Users will <strong>never receive free spins again</strong> on subsequent logins.
                </p>
              </div>

              {/* Min Trading Volume Bonus Milestone */}
              <div className="space-y-1.5">
                <label className="font-bold block">Trading Volume Milestone for Extra Free Spin (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={minTradingVolume}
                  onChange={(e) => setMinTradingVolume(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono ${inputStyle}`}
                  placeholder="10000"
                />
                <p className="text-[11px] text-slate-400">
                  Optional trader incentive: gives 1 bonus spin whenever a user completes ₹10,000 in trading volume.
                </p>
              </div>

            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
              >
                Reset Defaults
              </button>

              <button
                type="button"
                onClick={handleSaveGeneralSettings}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md active:scale-98 transition-all flex items-center gap-2"
              >
                {isSaving ? <RotateCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save All Changes</span>
              </button>
            </div>
          </div>

          {/* Quick Preview Card */}
          <div className={`p-5 rounded-2xl border space-y-4 flex flex-col items-center justify-center text-center ${cardStyle}`}>
            <h4 className="text-xs font-black uppercase text-purple-400">Live Wheel Preview</h4>
            
            {/* SVG Wheel Mini Preview */}
            <div className="w-48 h-48 rounded-full border-4 border-amber-400 shadow-xl overflow-hidden relative">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <g transform="translate(200, 200)">
                  {prizes.map((p, idx) => {
                    const angle = 360 / prizes.length;
                    const startAngle = (angle * idx - 90) * (Math.PI / 180);
                    const endAngle = (angle * (idx + 1) - 90) * (Math.PI / 180);
                    const radius = 200;

                    const x1 = radius * Math.cos(startAngle);
                    const y1 = radius * Math.sin(startAngle);
                    const x2 = radius * Math.cos(endAngle);
                    const y2 = radius * Math.sin(endAngle);

                    const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

                    return (
                      <path
                        key={p.id || idx}
                        d={pathData}
                        fill={p.color || '#7C3AED'}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    );
                  })}
                </g>
              </svg>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-[9px] font-black text-slate-900 shadow-md">
                SPIN
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p className="font-bold text-white">{prizes.length} Active Segments</p>
              <p>Spin Price: <span className="font-black text-amber-400">₹{spinPrice}</span></p>
              <p>Welcome Free Spins: <span className="font-black text-emerald-400">{welcomeFreeSpins}</span></p>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PRIZE SEGMENTS MANAGER                           */}
      {/* ======================================================== */}
      {activeTab === 'prizes' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black">Wheel Segments & Probability Weights</h3>
              <p className="text-xs text-slate-400">Higher weight = higher chance of landing on that prize</p>
            </div>

            <button
              onClick={handleOpenAddPrize}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Segment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {prizes.map((p, idx) => {
              const weightVal = Number(p.weight) || 1;
              const chancePercent = ((weightVal / totalWeight) * 100).toFixed(1);
              return (
                <div
                  key={p.id || idx}
                  className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 relative overflow-hidden ${cardStyle}`}
                >
                  {/* Top Color Accent Strip */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: p.color || '#7C3AED' }}
                  />

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0"
                        style={{ backgroundColor: p.color || '#7C3AED' }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-black text-sm">{p.label}</h4>
                        <span className="text-[10px] text-slate-400">
                          Reward: <strong className="text-emerald-400">₹{p.value}</strong> ({p.type})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditPrize(p)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
                        title="Edit Prize"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePrize(p.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                        title="Delete Prize"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Probability Meter */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Weight: <strong>{weightVal}</strong></span>
                      <span className="font-mono font-black text-purple-400">{chancePercent}% Win Rate</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(5, chancePercent))}%` }}
                      />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveGeneralSettings}
              disabled={isSaving}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md active:scale-98 transition-all flex items-center gap-2"
            >
              {isSaving ? <RotateCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Commit & Save Prize Segments</span>
            </button>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: GIFT SPINS TO USER                                */}
      {/* ======================================================== */}
      {activeTab === 'gift' && (
        <div className={`p-5 sm:p-6 rounded-2xl border max-w-xl space-y-4 ${cardStyle}`}>
          <div>
            <h3 className="text-sm font-black flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500" />
              <span>Manually Gift Spin Chances to Any User</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a user to add bonus spins instantly. User will receive an in-app notification.
            </p>
          </div>

          <form onSubmit={handleGiftSpins} className="space-y-4 text-xs">
            {/* Search User */}
            <div className="space-y-1">
              <label className="font-bold block">Search & Select User</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or UID..."
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs ${inputStyle}`}
                />
              </div>

              {/* User Dropdown Selector */}
              <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.slice(0, 10).map((u) => {
                  const isSelected = selectedUserId === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-purple-600/15 text-purple-400 font-black'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div>
                        <span className="font-bold block">{u.fullName || 'User'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{u.email} (UID: {u.uid || u.id})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-amber-400 font-mono font-bold block">
                          Current: {u.spinChances || 0} spins
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-purple-500 ml-auto" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spin Count */}
            <div className="space-y-1">
              <label className="font-bold block">Number of Spins to Gift</label>
              <input
                type="number"
                min="1"
                max="100"
                value={giftCount}
                onChange={(e) => setGiftCount(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono font-bold ${inputStyle}`}
              />
            </div>

            {/* Note / Message */}
            <div className="space-y-1">
              <label className="font-bold block">Reason / Notification Message</label>
              <input
                type="text"
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                placeholder="e.g. VIP Promotion Gift"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs ${inputStyle}`}
              />
            </div>

            <button
              type="submit"
              disabled={isGifting || !selectedUserId}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGifting ? <RotateCw className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
              <span>Grant Spins to User</span>
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: RECENT SPIN ACTIVITY LOGS                        */}
      {/* ======================================================== */}
      {activeTab === 'logs' && (
        <div className={`p-5 rounded-2xl border space-y-3 ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black flex items-center gap-1.5">
              <RotateCw className="w-4 h-4 text-purple-400" />
              <span>Real-Time Spin Logs (Last 50 Spins)</span>
            </h3>
            <button
              onClick={fetchData}
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          {!stats.recentSpins || stats.recentSpins.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No spins logged yet. Once users play the wheel, live records will show here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    <th className="pb-2">User</th>
                    <th className="pb-2">Prize Awarded</th>
                    <th className="pb-2">Cash Value</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.recentSpins.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5">
                        <span className="font-bold block">{s.userName || 'Trader'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{s.userEmail}</span>
                      </td>
                      <td className="py-2.5 font-black">{s.prizeLabel}</td>
                      <td className="py-2.5 font-mono font-bold">
                        {s.prizeValue > 0 ? (
                          <span className="text-emerald-400">+₹{s.prizeValue}</span>
                        ) : (
                          <span className="text-slate-400">₹0</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          s.prizeValue > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {s.prizeType || 'cash'}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400 text-[10px]">
                        {new Date(s.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD / EDIT PRIZE MODAL                                   */}
      {/* ======================================================== */}
      {showPrizeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-[#151D36] border-slate-700 text-white' : 'bg-white border-purple-100 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black">
                {editingPrizeId ? 'Edit Prize Segment' : 'Add New Prize Segment'}
              </h3>
              <button
                onClick={() => setShowPrizeModal(false)}
                className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePrize} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Segment Label (Shown on Wheel)</label>
                <input
                  type="text"
                  required
                  value={prizeLabel}
                  onChange={(e) => setPrizeLabel(e.target.value)}
                  placeholder="e.g. ₹50 Cash or Better Luck"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${inputStyle}`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Cash Value (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={prizeValue}
                  onChange={(e) => setPrizeValue(e.target.value)}
                  placeholder="0 for Try Again"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold ${inputStyle}`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Probability Weight (1 - 100)</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={prizeWeight}
                  onChange={(e) => setPrizeWeight(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold ${inputStyle}`}
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Higher weight = higher chance of landing. Low weight = jackpot rarity.
                </span>
              </div>

              <div>
                <label className="font-bold block mb-1">Segment Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={prizeColor}
                    onChange={(e) => setPrizeColor(e.target.value)}
                    className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={prizeColor}
                    onChange={(e) => setPrizeColor(e.target.value)}
                    className={`flex-1 px-3 py-1.5 rounded-xl border text-xs font-mono ${inputStyle}`}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrizeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs"
                >
                  Apply Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

