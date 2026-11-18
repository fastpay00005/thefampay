import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useApp } from '../context/AppContext';
import { Sparkles, Trophy, Award, Zap, ArrowRight, RotateCw } from 'lucide-react';

export const LuckySpinPage = () => {
  const { user, portfolio, playLuckySpin, isDark } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);

  const cardStyle = isDark
    ? 'bg-[#121829] border-slate-800 text-white shadow-md'
    : 'bg-white border-purple-100 text-slate-800 shadow-[0_4px_20px_rgba(109,40,217,0.05)]';

  const prizes = [
    { label: '₹50', value: 50, color: '#8B5CF6' },
    { label: '₹100', value: 100, color: '#EC4899' },
    { label: '₹200', value: 200, color: '#10B981' },
    { label: '₹500', value: 500, color: '#F59E0B' },
    { label: '₹25', value: 25, color: '#3B82F6' },
    { label: 'Try Again', value: 0, color: '#64748B' },
    { label: '₹150', value: 150, color: '#14B8A6' },
    { label: '₹300', value: 300, color: '#E11D48' },
  ];

  const handleSpinClick = () => {
    if (user.spinChances <= 0 || isSpinning) return;

    setIsSpinning(true);
    setWonPrize(null);

    // Pick random index & calculate degrees
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const extraRotations = 5 * 360; // 5 full turns
    const segmentAngle = 360 / prizes.length;
    const finalAngle = extraRotations + (prizeIndex * segmentAngle) + (segmentAngle / 2);

    setRotation(prev => prev + finalAngle);

    setTimeout(async () => {
      setIsSpinning(false);
      const prize = await playLuckySpin();
      setWonPrize(prize);
    }, 4000);
  };

  const currentVolume = (user.tradingVolume || 0) % 10000;
  const progressPercent = Math.min(100, (currentVolume / 10000) * 100);

  return (
    <AppShell title="Lucky Spin Wheel">
      <div className="p-4 space-y-4">

        {/* Hero Header Card */}
        <div className="bg-gradient-to-r from-purple-800 via-[#6D28D9] to-indigo-900 rounded-3xl p-5 text-white shadow-hero text-center relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-200 block mb-1">
              THE FAMPAY REWARDS
            </span>
            <h2 className="text-2xl font-black flex items-center justify-center gap-1.5 leading-tight">
              Lucky Spin Wheel 🎡
            </h2>
            <p className="text-xs text-purple-100 font-medium mt-1 max-w-[85%] mx-auto">
              Get 1 Free Spin chance for every ₹10,000 INR or $100 USDT completed trade volume!
            </p>

            {/* Available Spins Badge */}
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-2xl shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span className="text-xs font-black text-white">
                Available Spins: <span className="text-amber-300 text-sm font-black">{user.spinChances || 0}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Trade Progress Meter */}
        <div className={`rounded-3xl p-4 border space-y-2 ${cardStyle}`}>
          <div className="flex justify-between items-center text-xs">
            <span className={`font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>Next Spin Milestone</span>
            <span className="font-bold text-purple-400 font-mono">₹{currentVolume.toLocaleString('en-IN')} / ₹10,000</span>
          </div>

          <div className={`w-full h-2.5 rounded-full overflow-hidden p-0.5 border ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'
          }`}>
            <div 
              className="bg-gradient-to-r from-[#6D28D9] to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-400 font-medium">
            Trade ₹{(10000 - currentVolume).toLocaleString('en-IN')} more to automatically earn your next free spin!
          </p>
        </div>

        {/* Wheel Container */}
        <div className={`rounded-3xl p-6 border text-center relative overflow-hidden flex flex-col items-center ${cardStyle}`}>
          
          {/* Wheel Pointer */}
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-500 z-30 -mb-3 drop-shadow-md" />

          {/* Rotating Wheel Canvas Box */}
          <div className="relative w-64 h-64 my-2">
            <div
              className="w-full h-full rounded-full border-4 border-amber-400 shadow-2xl overflow-hidden relative transition-transform cubic-bezier"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: isSpinning ? '4s' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.2, 1)',
              }}
            >
              {prizes.map((p, idx) => {
                const angle = 360 / prizes.length;
                const rotate = angle * idx;
                return (
                  <div
                    key={idx}
                    className="absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left flex items-center justify-center font-black text-white text-xs select-none shadow-xs"
                    style={{
                      transform: `rotate(${rotate}deg)`,
                      backgroundColor: p.color,
                      clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                    }}
                  >
                    <span 
                      className="absolute -top-1 right-8 text-[11px] font-black transform rotate-45"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {p.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Center Spin Button Hub */}
            <button
              onClick={handleSpinClick}
              disabled={isSpinning || user.spinChances <= 0}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 border-white shadow-xl flex flex-col items-center justify-center text-white font-black text-xs z-20 active:scale-95 transition-all ${
                user.spinChances > 0 
                  ? 'bg-gradient-to-tr from-amber-500 to-amber-600 hover:scale-105'
                  : 'bg-slate-400 cursor-not-allowed opacity-80'
              }`}
            >
              <RotateCw className={`w-4 h-4 mb-0.5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-tighter">SPIN</span>
            </button>
          </div>

          {/* Status / Win Announcement */}
          {wonPrize !== null && !isSpinning && (
            <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-bounce">
              {wonPrize > 0 ? `🎉 Awesome! You won ₹${wonPrize} in cash reward!` : 'Better luck next time! Trade to get more spins.'}
            </div>
          )}

          <div className="mt-4 w-full">
            <button
              onClick={handleSpinClick}
              disabled={isSpinning || user.spinChances <= 0}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-xs shadow-lg transition-all ${
                user.spinChances > 0
                  ? 'bg-[#6D28D9] hover:bg-purple-700 text-white shadow-purple-900/25 active:scale-98'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {isSpinning ? 'Spinning Wheel...' : user.spinChances > 0 ? 'Spin the Wheel Now' : 'Complete ₹10k Trade to Unlock Spin'}
            </button>
          </div>

        </div>

      </div>
    </AppShell>
  );
};
