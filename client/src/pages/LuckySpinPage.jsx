import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Trophy, 
  Award, 
  Zap, 
  RotateCw, 
  ShoppingCart, 
  Coins, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Clock, 
  ArrowRight, 
  Plus, 
  Minus, 
  Wallet, 
  X,
  History,
  TrendingUp,
  Gift
} from 'lucide-react';

export const LuckySpinPage = () => {
  const { user, isDark, showToast, refreshUserData } = useApp();
  const navigate = useNavigate();

  // Spin Configuration State
  const [spinConfig, setSpinConfig] = useState({
    enabled: true,
    spinPrice: 50,
    welcomeFreeSpins: 1,
    prizes: [
      { id: 'p1', label: '₹10 Cash', value: 10, type: 'cash', color: '#7C3AED', textColor: '#FFFFFF' },
      { id: 'p2', label: '₹25 Cash', value: 25, type: 'cash', color: '#EC4899', textColor: '#FFFFFF' },
      { id: 'p3', label: '₹50 Cash', value: 50, type: 'cash', color: '#10B981', textColor: '#FFFFFF' },
      { id: 'p4', label: '₹100 Cash', value: 100, type: 'cash', color: '#F59E0B', textColor: '#FFFFFF' },
      { id: 'p5', label: 'Better Luck', value: 0, type: 'empty', color: '#64748B', textColor: '#FFFFFF' },
      { id: 'p6', label: '₹200 Cash', value: 200, type: 'cash', color: '#06B6D4', textColor: '#FFFFFF' },
      { id: 'p7', label: '₹500 Jackpot', value: 500, type: 'cash', color: '#EF4444', textColor: '#FFFFFF' },
      { id: 'p8', label: '₹5 Bonus', value: 5, type: 'cash', color: '#8B5CF6', textColor: '#FFFFFF' },
    ]
  });

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(null);
  const [winModalData, setWinModalData] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Buy Spin Modal State
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedPackCount, setSelectedPackCount] = useState(1);
  const [isBuying, setIsBuying] = useState(false);

  // History Tab & Live Winners
  const [activeTab, setActiveTab] = useState('wheel'); // 'wheel' | 'history'
  const [userHistory, setUserHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Live winners simulated ticker for excitement
  const [recentWinners, setRecentWinners] = useState([
    { id: '1', user: 'FP-8192', prize: '₹500', time: '1m ago', color: 'text-amber-400' },
    { id: '2', user: 'FP-4301', prize: '₹100', time: '3m ago', color: 'text-emerald-400' },
    { id: '3', user: 'FP-9023', prize: '₹50', time: '5m ago', color: 'text-purple-400' },
    { id: '4', user: 'FP-1149', prize: '₹200', time: '8m ago', color: 'text-blue-400' },
  ]);

  // Audio Synthesizer Functions (Pure Web Audio API - zero assets required)
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(550, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {}
  };

  const playWinSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + idx * 0.09;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.18, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.55);
      });
    } catch {}
  };

  // Fetch Wheel Configuration from Admin Backend
  const loadConfig = async () => {
    try {
      const res = await apiService.getSpinConfig();
      if (res && res.success && res.prizes && res.prizes.length >= 2) {
        setSpinConfig(res);
      }
    } catch (err) {
      console.warn('Failed to load spin config:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const loadHistory = async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      const res = await apiService.getUserSpinHistory(user.id);
      if (res && res.success) {
        setUserHistory(res.history || []);
      }
    } catch (err) {
      console.warn('History fetch error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadConfig();
    loadHistory();
  }, [user?.id]);

  // Execute Spin Action
  const handleSpinClick = async () => {
    if (isSpinning) return;

    if (spinConfig.enabled === false) {
      showToast('Lucky Spin Wheel is currently paused by Admin.', 'error');
      return;
    }

    if (!user?.spinChances || user.spinChances <= 0) {
      setShowBuyModal(true);
      return;
    }

    setIsSpinning(true);
    setWinModalData(null);

    // Play initial tick audio
    playTickSound();

    try {
      // Call backend to determine verified winning prize based on admin odds
      const res = await apiService.executeSpin(user.id);

      if (!res || !res.success) {
        setIsSpinning(false);
        showToast(res?.message || 'Spin failed to execute', 'error');
        return;
      }

      const prizes = spinConfig.prizes;
      const numSegments = prizes.length;
      const segmentAngle = 360 / numSegments;
      const winningIndex = res.winningIndex !== undefined ? res.winningIndex : 0;

      // Calculate degrees so top pointer lands exactly at the center of the winning segment
      // Top pointer is at 0/360 degrees (top vertical = 270 in standard math, but wheel starts at 0 at top)
      // Segment i occupies [i * segmentAngle, (i + 1) * segmentAngle]
      // To bring segment center to 0 deg: rotation offset = 360 - (winningIndex * segmentAngle + segmentAngle / 2)
      const currentMod = rotation % 360;
      const extraRotations = 7 * 360; // 7 energetic full spins
      const targetSegmentCenter = 360 - (winningIndex * segmentAngle + segmentAngle / 2);
      const angleToAdd = extraRotations + ((targetSegmentCenter - currentMod + 360) % 360);
      const finalRotation = rotation + angleToAdd;

      setRotation(finalRotation);

      // Sound ticker loop during spin
      let ticksInterval = setInterval(() => {
        playTickSound();
      }, 150);

      setTimeout(() => {
        clearInterval(ticksInterval);
        ticksInterval = setInterval(() => {
          playTickSound();
        }, 320);
      }, 2500);

      // Spin completes after 4.5s
      setTimeout(async () => {
        clearInterval(ticksInterval);
        setIsSpinning(false);
        setActiveSegmentIndex(winningIndex);
        await refreshUserData();
        loadHistory();

        if (res.wonAmount > 0) {
          playWinSound();
        }

        setWinModalData({
          wonAmount: res.wonAmount,
          wonPrize: res.wonPrize,
          message: res.message,
          remainingSpins: res.remainingSpins
        });
      }, 4500);

    } catch (err) {
      setIsSpinning(false);
      showToast('Network error while spinning', 'error');
    }
  };

  // Buy Spin Packages Handler
  const handleBuySpins = async () => {
    if (!user?.id) return;

    if (spinConfig.enabled === false) {
      showToast('Spin purchases are temporarily paused by Admin.', 'error');
      return;
    }

    const pricePerSpin = spinConfig.spinPrice || 50;
    const totalCost = selectedPackCount * pricePerSpin;

    if (Number(user.inrBalance || 0) < totalCost) {
      showToast(`Insufficient balance! ₹${totalCost.toLocaleString('en-IN')} needed.`, 'error');
      return;
    }

    setIsBuying(true);
    try {
      const res = await apiService.buySpins(user.id, selectedPackCount);
      if (res.success) {
        showToast(`🎉 Purchased ${selectedPackCount} Spin(s) successfully!`, 'success');
        await refreshUserData();
        setShowBuyModal(false);
      } else {
        showToast(res.message || 'Purchase failed', 'error');
      }
    } catch (err) {
      showToast('Transaction failed', 'error');
    } finally {
      setIsBuying(false);
    }
  };

  const cardStyle = isDark
    ? 'bg-[#121829] border-slate-800 text-white shadow-xl'
    : 'bg-white border-purple-100 text-slate-800 shadow-[0_10px_30px_rgba(109,40,217,0.06)]';

  const prizes = spinConfig.prizes;
  const numSegments = prizes.length;
  const segmentAngle = 360 / numSegments;
  const spinPrice = spinConfig.spinPrice || 50;

  return (
    <AppShell title="Lucky Spin & Win">
      <div className="p-4 space-y-4 max-w-lg mx-auto pb-24">

        {/* 1. HERO HEADER WITH LIVE SOUND & STATS */}
        <div className="bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#31104B] rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden border border-purple-400/20">
          
          {/* Background glowing orb accents */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-1">
                <Sparkles className="w-3 h-3 animate-spin text-amber-300" />
                <span>Instant Cash Rewards</span>
              </span>
              <h1 className="text-2xl font-black tracking-tight leading-tight flex items-center gap-2">
                <span>Lucky Spin Wheel</span>
                <span className="text-xl">🎡</span>
              </h1>
              <p className="text-xs text-purple-200 font-medium mt-0.5">
                Spin to win real cash credited straight to your digital wallet!
              </p>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-purple-200 active:scale-95 transition-all"
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          {/* Quick Info Badges: Spins Remaining & Price */}
          <div className="mt-4 grid grid-cols-2 gap-2 relative z-10">
            <div className="bg-black/25 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-purple-200 font-bold block uppercase tracking-wide">Available Spins</span>
                <span className="text-lg font-black text-amber-300 flex items-center gap-1">
                  {user.spinChances || 0}
                  {user.spinChances > 0 && <span className="text-[10px] font-bold text-emerald-300 px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-400/30">READY</span>}
                </span>
              </div>
              <RotateCw className="w-6 h-6 text-purple-300/60" />
            </div>

            <div className="bg-black/25 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-purple-200 font-bold block uppercase tracking-wide">Spin Price</span>
                <span className="text-lg font-black text-white">₹{spinPrice} <span className="text-[11px] text-purple-300 font-normal">/ spin</span></span>
              </div>
              <button
                onClick={() => setShowBuyModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 font-black text-[11px] shadow-sm active:scale-95 transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>Buy</span>
              </button>
            </div>
          </div>

          {/* Free Spin Notice for New Users */}
          {user.spinChances > 0 && !user.hasSpunBefore && (
            <div className="mt-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl px-3 py-1.5 flex items-center gap-2 text-[11px] text-emerald-200 font-bold">
              <Gift className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>You have 1 Welcome Free Spin ready to use! No deposit required.</span>
            </div>
          )}

          {/* Admin Paused Alert Banner */}
          {spinConfig.enabled === false && (
            <div className="mt-3 bg-amber-500/25 border border-amber-400/40 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-amber-200 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Lucky Spin Wheel is temporarily paused by Admin. Please check back shortly.</span>
            </div>
          )}
        </div>

        {/* 2. SUB NAVIGATION TABS (Wheel vs History) */}
        <div className={`p-1 rounded-2xl border flex items-center gap-1 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-purple-50/80 border-purple-100'
        }`}>
          <button
            onClick={() => setActiveTab('wheel')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'wheel'
                ? 'bg-[#6D28D9] text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-purple-900 hover:text-purple-950'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Spin Wheel</span>
          </button>

          <button
            onClick={() => { setActiveTab('history'); loadHistory(); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#6D28D9] text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-purple-900 hover:text-purple-950'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>My Rewards History</span>
          </button>
        </div>

        {/* 3. WHEEL VIEW */}
        {activeTab === 'wheel' ? (
          <div className="space-y-4">
            
            {/* WHEEL CARD */}
            <div className={`rounded-3xl p-6 border text-center relative overflow-hidden flex flex-col items-center shadow-xl ${cardStyle}`}>
              
              {/* Wheel Outer Header Tag */}
              <div className="mb-2 flex items-center justify-between w-full px-2">
                <span className="text-[11px] font-black uppercase text-amber-500 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>Win up to ₹500</span>
                </span>

                <button
                  onClick={() => setShowBuyModal(true)}
                  className="text-[11px] font-bold text-purple-500 hover:text-purple-600 flex items-center gap-1"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Buy Spins (₹{spinPrice})</span>
                </button>
              </div>

              {/* WHEEL CONTAINER WITH METALLIC RING & LIGHT BULBS */}
              <div className="relative my-4 flex items-center justify-center select-none">
                
                {/* TOP METALLIC POINTER / TICKER */}
                <div className="absolute -top-3 z-30 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-b from-amber-200 to-amber-500 border-2 border-white shadow-md -mb-2 z-10" />
                  <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-500 transition-transform duration-75" />
                </div>

                {/* OUTER GOLDEN RING WITH AMBER LED LIGHTS */}
                <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full p-2.5 bg-gradient-to-tr from-amber-600 via-amber-300 to-yellow-600 shadow-[0_0_35px_rgba(245,158,11,0.35)] relative flex items-center justify-center">
                  
                  {/* Outer Golden Studs (16 Decorative Bulbs) */}
                  {[...Array(16)].map((_, i) => {
                    const deg = (360 / 16) * i;
                    const isLit = i % 2 === (isSpinning ? 0 : 1);
                    return (
                      <div
                        key={i}
                        className={`absolute w-2.5 h-2.5 rounded-full border border-amber-900/40 shadow-xs transition-colors duration-300 ${
                          isLit ? 'bg-amber-100 shadow-[0_0_6px_#FEF3C7]' : 'bg-amber-700/80'
                        }`}
                        style={{
                          transform: `rotate(${deg}deg) translate(0, -145px) rotate(-${deg}deg)`,
                        }}
                      />
                    );
                  })}

                  {/* ROTATING SVG WHEEL */}
                  <div
                    className="w-full h-full rounded-full overflow-hidden shadow-inner relative transition-transform"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transitionDuration: isSpinning ? '4.5s' : '0s',
                      transitionTimingFunction: 'cubic-bezier(0.12, 0.8, 0.15, 1)',
                    }}
                  >
                    <svg viewBox="0 0 400 400" className="w-full h-full">
                      <g transform="translate(200, 200)">
                        {prizes.map((p, idx) => {
                          const angle = 360 / numSegments;
                          const startAngle = (angle * idx - 90) * (Math.PI / 180);
                          const endAngle = (angle * (idx + 1) - 90) * (Math.PI / 180);
                          const radius = 200;

                          const x1 = radius * Math.cos(startAngle);
                          const y1 = radius * Math.sin(startAngle);
                          const x2 = radius * Math.cos(endAngle);
                          const y2 = radius * Math.sin(endAngle);

                          const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

                          // Mid angle for text positioning
                          const textAngleDeg = angle * idx + angle / 2;
                          const textAngleRad = (textAngleDeg - 90) * (Math.PI / 180);
                          const textRadius = 135;
                          const textX = textRadius * Math.cos(textAngleRad);
                          const textY = textRadius * Math.sin(textAngleRad);

                          return (
                            <g key={p.id || idx}>
                              {/* Pie Wedge Segment */}
                              <path
                                d={pathData}
                                fill={p.color || '#7C3AED'}
                                stroke="#FFFFFF"
                                strokeWidth="2.5"
                              />

                              {/* Segment Label (Rotated for crisp legibility) */}
                              <text
                                x={textX}
                                y={textY}
                                fill={p.textColor || '#FFFFFF'}
                                fontSize="15"
                                fontWeight="900"
                                textAnchor="middle"
                                dominantBaseline="central"
                                transform={`rotate(${textAngleDeg}, ${textX}, ${textY})`}
                                style={{
                                  textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                                  letterSpacing: '-0.3px',
                                  fontFamily: 'system-ui, sans-serif'
                                }}
                              >
                                {p.label}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                  </div>

                  {/* CENTER METALLIC SPIN HUB BUTTON */}
                  <button
                    onClick={handleSpinClick}
                    disabled={isSpinning || spinConfig.enabled === false}
                    className={`absolute z-20 w-20 h-20 rounded-full border-4 border-white shadow-[0_6px_20px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center text-white active:scale-95 transition-all ${
                      spinConfig.enabled === false
                        ? 'bg-slate-700 cursor-not-allowed opacity-80'
                        : isSpinning
                        ? 'bg-slate-700 cursor-not-allowed opacity-90'
                        : user.spinChances > 0
                        ? 'bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 hover:scale-105 text-slate-950 font-black shadow-amber-500/40'
                        : 'bg-gradient-to-tr from-purple-600 to-indigo-600 hover:scale-105 font-black shadow-purple-600/30'
                    }`}
                  >
                    <RotateCw className={`w-5 h-5 mb-0.5 ${isSpinning ? 'animate-spin' : ''} ${user.spinChances > 0 && spinConfig.enabled !== false ? 'text-slate-950' : 'text-white'}`} />
                    <span className="text-[11px] font-black uppercase tracking-tight">
                      {spinConfig.enabled === false ? 'PAUSED' : isSpinning ? 'SPINNING' : user.spinChances > 0 ? 'SPIN' : 'BUY'}
                    </span>
                  </button>

                </div>

              </div>

              {/* ACTION BUTTON & STATUS */}
              <div className="w-full mt-3 space-y-2">
                {spinConfig.enabled === false ? (
                  <div className="w-full py-3.5 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 text-center">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Wheel is paused by Admin. Spins are temporarily unavailable.</span>
                  </div>
                ) : user.spinChances > 0 ? (
                  <button
                    onClick={handleSpinClick}
                    disabled={isSpinning}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>{isSpinning ? 'Wheel is Spinning...' : `Spin Now (${user.spinChances} Chance${user.spinChances > 1 ? 's' : ''} Left)`}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowBuyModal(true)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6D28D9] to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm shadow-lg shadow-purple-900/25 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Get Spins (₹{spinPrice} each)</span>
                  </button>
                )}

                {/* Wallet Balance Display */}
                <div className="flex items-center justify-between text-xs px-2 pt-1">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Your Wallet Balance:</span>
                  <span className="font-mono font-black text-emerald-500">
                    ₹{Number(user.inrBalance || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

            </div>

            {/* 4. BUY SPINS QUICK SELECTOR BANNER */}
            <div className={`rounded-3xl p-4 border flex items-center justify-between ${cardStyle}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black">Need More Spins?</h4>
                  <p className="text-[11px] text-slate-400">Buy 1 spin for just ₹{spinPrice} from your wallet balance.</p>
                </div>
              </div>

              <button
                onClick={() => setShowBuyModal(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shrink-0 shadow-sm active:scale-95 transition-all"
              >
                Buy Now
              </button>
            </div>

            {/* 5. LIVE ACTIVITY FEED OF RECENT WINNERS */}
            <div className={`rounded-3xl p-4 border space-y-3 ${cardStyle}`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Live Winners Activity</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE</span>
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentWinners.map((w) => (
                  <div key={w.id} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-bold text-[10px]">
                        FP
                      </div>
                      <span className="font-mono font-bold">{w.user}</span>
                      <span className="text-slate-400 text-[10px]">won</span>
                      <span className={`font-black ${w.color}`}>{w.prize}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {w.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. TRANSPARENT RULES CARD */}
            <div className={`rounded-3xl p-4 border space-y-2 text-xs ${cardStyle}`}>
              <h4 className="font-black text-xs flex items-center gap-1.5 text-amber-500">
                <Award className="w-4 h-4" />
                <span>Spin & Win Rules</span>
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc pl-4 leading-relaxed">
                <li>Every new verified user gets <strong>1 complimentary Free Spin</strong> upon account setup.</li>
                <li>Additional spin chances can be purchased anytime for <strong>₹{spinPrice} per spin</strong> using wallet balance.</li>
                <li>Cash prizes won from Lucky Spin are <strong>instantly credited</strong> to your INR wallet and eligible for 24/7 UPI withdrawal.</li>
                <li>Outcomes are mathematically randomized and verified on secure servers.</li>
              </ul>
            </div>

          </div>
        ) : (
          /* ========================================= */
          /* 4. USER PERSONAL SPIN HISTORY TAB         */
          /* ========================================= */
          <div className="space-y-3">
            <div className={`rounded-3xl p-4 border ${cardStyle}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black flex items-center gap-1.5">
                  <History className="w-4 h-4 text-purple-400" />
                  <span>My Spin Records</span>
                </h3>
                <span className="text-[10px] text-slate-400">Showing last 20 spins</span>
              </div>

              {loadingHistory ? (
                <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <RotateCw className="w-5 h-5 animate-spin text-purple-500" />
                  <span>Loading spin history...</span>
                </div>
              ) : userHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                  <Trophy className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
                  <p className="font-bold">No spins played yet!</p>
                  <p className="text-[11px]">Spin the wheel now to test your luck and earn instant rewards.</p>
                  <button
                    onClick={() => setActiveTab('wheel')}
                    className="mt-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                  >
                    Go to Wheel
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {userHistory.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                          item.prizeValue > 0
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}>
                          {item.prizeValue > 0 ? '₹' : '✕'}
                        </div>
                        <div>
                          <span className="font-black block">{item.prizeLabel}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono font-black text-xs ${
                          item.prizeValue > 0 ? 'text-emerald-500' : 'text-slate-400'
                        }`}>
                          {item.prizeValue > 0 ? `+₹${item.prizeValue}` : 'No Reward'}
                        </span>
                        <span className="block text-[9px] text-emerald-400 font-bold">COMPLETED</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BUY SPINS MODAL / DRAWER                                 */}
        {/* ======================================================== */}
        {showBuyModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
              isDark ? 'bg-[#151D36] border-slate-700 text-white' : 'bg-white border-purple-100 text-slate-800'
            }`}>
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Buy Spin Chances</h3>
                    <span className="text-[10px] text-slate-400">Instant credit to account</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowBuyModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Wallet Balance Strip */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-purple-50/60 border-purple-100'
              }`}>
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-400">Available Wallet Balance:</span>
                </div>
                <span className="font-mono font-black text-emerald-500">
                  ₹{Number(user.inrBalance || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Package Quick Selectors */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block">Select Package:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { count: 1, label: '1 Spin', popular: false },
                    { count: 3, label: '3 Spins', popular: false },
                    { count: 5, label: '5 Spins', popular: true },
                    { count: 10, label: '10 Spins', popular: false },
                  ].map((pkg) => {
                    const isSelected = selectedPackCount === pkg.count;
                    const cost = pkg.count * spinPrice;
                    return (
                      <button
                        key={pkg.count}
                        type="button"
                        onClick={() => setSelectedPackCount(pkg.count)}
                        className={`p-3 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500/10 shadow-sm ring-1 ring-purple-500'
                            : isDark ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700' : 'border-slate-200 bg-slate-50 hover:border-purple-200'
                        }`}
                      >
                        {pkg.popular && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full text-[8px] font-black bg-amber-400 text-slate-950 uppercase">
                            POPULAR
                          </span>
                        )}
                        <span className="text-xs font-black block">{pkg.label}</span>
                        <span className="text-xs font-mono font-bold text-amber-500">₹{cost}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Custom Count:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPackCount(Math.max(1, selectedPackCount - 1))}
                    className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-mono font-black">{selectedPackCount}</span>
                  <button
                    onClick={() => setSelectedPackCount(selectedPackCount + 1)}
                    className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Total & Checkout */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">Total Amount:</span>
                  <span className="font-mono font-black text-amber-500 text-base">
                    ₹{(selectedPackCount * spinPrice).toLocaleString('en-IN')}
                  </span>
                </div>

                {Number(user.inrBalance || 0) < (selectedPackCount * spinPrice) ? (
                  <div className="space-y-2">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Insufficient wallet balance to buy this package.</span>
                    </div>
                    <button
                      onClick={() => navigate('/deposit')}
                      className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Deposit INR to Wallet</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleBuySpins}
                    disabled={isBuying}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-purple-900/30 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    {isBuying ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Confirm Purchase (₹{selectedPackCount * spinPrice})</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* WIN CELEBRATION MODAL                                    */}
        {/* ======================================================== */}
        {winModalData && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200 relative overflow-hidden ${
              isDark ? 'bg-[#151D36] border-purple-500/40 text-white' : 'bg-white border-purple-200 text-slate-800'
            }`}>
              
              {/* Confetti Background Sparkles */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

              {/* Prize Icon */}
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/30 animate-bounce">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
                  {winModalData.wonAmount > 0 ? 'CONGRATULATIONS!' : 'NICE TRY!'}
                </span>
                <h3 className="text-2xl font-black">
                  {winModalData.wonAmount > 0 ? `You Won ${winModalData.wonPrize?.label}!` : 'Better Luck Next Time!'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {winModalData.wonAmount > 0 
                    ? `₹${winModalData.wonAmount} has been credited directly to your Fast Pay wallet balance.`
                    : 'Spin again to win cash rewards up to ₹500!'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {user.spinChances > 0 ? (
                  <button
                    onClick={() => {
                      setWinModalData(null);
                      handleSpinClick();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Spin Again ({user.spinChances} Left)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setWinModalData(null);
                      setShowBuyModal(true);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-[#6D28D9] text-white font-black text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Buy More Spins (₹{spinPrice})</span>
                  </button>
                )}

                <button
                  onClick={() => setWinModalData(null)}
                  className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-400 hover:text-white transition-all"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
};
