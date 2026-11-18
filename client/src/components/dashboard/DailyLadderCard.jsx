import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Flame } from 'lucide-react';

export const DailyLadderCard = () => {
  const { portfolio, isDark } = useApp();
  const [secondsUntilMidnight, setSecondsUntilMidnight] = useState(0);

  // Calculate seconds to midnight
  useEffect(() => {
    const calcMidnight = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
    };

    setSecondsUntilMidnight(calcMidnight());
    const interval = setInterval(() => {
      setSecondsUntilMidnight(calcMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (totalSec) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const todayDeposits = Number(portfolio?.totalDeposits || 0) % 50000;
  const targetNextTier = 10000;
  const progressPercent = Math.min(100, Math.round((todayDeposits / targetNextTier) * 100));

  const tiers = [
    {
      name: 'Tier 1',
      target: '₹500',
      reward: '+₹20',
      lightBg: 'bg-[#FFFBEB] border-2 border-[#FDE68A] shadow-xs',
      darkBg: 'bg-[#221A0F] border border-amber-900/60',
      textColor: isDark ? 'text-amber-300' : 'text-amber-700',
    },
    {
      name: 'Tier 2',
      target: '₹2.5K',
      reward: '+₹100',
      lightBg: 'bg-[#FFF7ED] border-2 border-[#FED7AA] shadow-xs',
      darkBg: 'bg-[#24150E] border border-orange-900/60',
      textColor: isDark ? 'text-orange-300' : 'text-orange-700',
    },
    {
      name: 'Tier 3',
      target: '₹10K',
      reward: '+₹500',
      lightBg: 'bg-[#FAF5FF] border-2 border-[#E9D5FF] shadow-xs',
      darkBg: 'bg-[#1D1130] border border-purple-900/60',
      textColor: isDark ? 'text-purple-300' : 'text-purple-700',
    },
    {
      name: 'VIP 4',
      target: '₹50K',
      reward: '+₹5,000',
      lightBg: 'bg-gradient-to-b from-[#FEFCE8] to-[#FEF3C7] border-2 border-[#FCD34D] shadow-xs',
      darkBg: 'bg-gradient-to-b from-[#2B1D0B] to-[#1C1408] border-2 border-amber-500/50',
      textColor: isDark ? 'text-amber-200' : 'text-amber-800',
    },
  ];

  return (
    <div className="px-4 py-2">
      <div className={`p-4 sm:p-5 rounded-3xl border relative overflow-hidden transition-all duration-200 ${
        isDark 
          ? 'bg-[#121829] border-slate-800 text-white shadow-md' 
          : 'bg-white border-[#F3F0FF] shadow-[0_8px_30px_rgba(109,40,217,0.05)] text-slate-900'
      }`}>
        
        {/* Header with Live Midnight Countdown */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
            }`}>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <h3 className={`text-xs font-black uppercase tracking-wider ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                Daily Reward Ladder
              </h3>
            </div>
          </div>

          {/* Midnight Countdown Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-black ${
            isDark 
              ? 'bg-purple-950/60 border-purple-800/50 text-purple-300' 
              : 'bg-purple-100/90 border-purple-200/90 text-[#6D28D9]'
          }`}>
            <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 stroke-[2.5]" />
            <span className="font-mono">{formatCountdown(secondsUntilMidnight)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-3.5">
          <div className="flex justify-between text-xs font-bold">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Daily Deposit Progress</span>
            <span className={`font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ₹{todayDeposits.toLocaleString('en-IN')} / ₹{targetNextTier.toLocaleString('en-IN')}
            </span>
          </div>
          <div className={`w-full h-2.5 rounded-full overflow-hidden border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200/80'
          }`}>
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${Math.max(6, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Tiers Ladder Visual - Clean, High Contrast, Fixed Colors (Zero Muddy Grey!) */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          {tiers.map((t) => (
            <div 
              key={t.name}
              className={`py-2 px-1 sm:p-2.5 rounded-2xl border transition-all overflow-hidden ${isDark ? t.darkBg : t.lightBg}`}
            >
              <span className={`text-[9px] block font-bold leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.name}
              </span>
              <span className={`text-[11px] sm:text-xs font-black block mt-0.5 font-mono whitespace-nowrap leading-tight ${t.textColor}`}>
                {t.target}
              </span>
              <span className={`text-[9.5px] sm:text-[10px] font-black block mt-0.5 font-mono whitespace-nowrap leading-tight ${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              }`}>
                {t.reward}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
