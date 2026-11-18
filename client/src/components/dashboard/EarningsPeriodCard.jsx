import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp } from 'lucide-react';

export const EarningsPeriodCard = () => {
  const { portfolio, isDark } = useApp();
  const [period, setPeriod] = useState('ALL'); // 'TODAY', 'WEEK', 'ALL'

  // Dynamic values based on selected period
  const multiplier = period === 'TODAY' ? 0.15 : period === 'WEEK' ? 0.45 : 1.0;
  
  const baseEarnings = Number(portfolio?.totalEarnings || 0);
  const teamCommission = (baseEarnings * 0.5 * multiplier).toFixed(2);
  const depositBonus = (baseEarnings * 0.3 * multiplier).toFixed(2);
  const tradeEarnings = (baseEarnings * 0.2 * multiplier).toFixed(2);
  const totalPeriodEarnings = (Number(teamCommission) + Number(depositBonus) + Number(tradeEarnings)).toFixed(2);

  return (
    <div className="px-4 py-2">
      <div className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 ${
        isDark 
          ? 'bg-[#121829] border-slate-800 text-white shadow-md' 
          : 'bg-white border-[#F3F0FF] shadow-[0_8px_30px_rgba(109,40,217,0.05)] text-slate-900'
      }`}>
        
        {/* Header & 3-Period Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-[#6D28D9]'
            }`}>
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className={`text-xs font-black uppercase tracking-wider ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                Earnings Summary
              </h3>
            </div>
          </div>

          {/* Toggle buttons: Today / Week / All Time (High contrast, vibrant purple active) */}
          <div className={`flex rounded-xl p-1 border text-[11px] font-black ${
            isDark 
              ? 'bg-slate-950 border-slate-800' 
              : 'bg-[#F5F3FF] border-[#E9D5FF]'
          }`}>
            <button
              onClick={() => setPeriod('TODAY')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                period === 'TODAY' 
                  ? 'bg-[#7C3AED] text-white shadow-xs font-black' 
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-purple-800/80 hover:text-purple-950'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriod('WEEK')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                period === 'WEEK' 
                  ? 'bg-[#7C3AED] text-white shadow-xs font-black' 
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-purple-800/80 hover:text-purple-950'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                period === 'ALL' 
                  ? 'bg-[#7C3AED] text-white shadow-xs font-black' 
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-purple-800/80 hover:text-purple-950'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Big Total for Period */}
        <div className="mb-4">
          <span className={`text-xs font-bold block ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {period === 'TODAY' ? "Today's Total Earnings" : period === 'WEEK' ? "This Week's Total Earnings" : 'All Time Total Earnings'}
          </span>
          <span className={`text-2xl sm:text-3xl font-black tracking-tight mt-0.5 block ${
            isDark ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            +₹{Number(totalPeriodEarnings).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* 3 Metrics Split - Fixed Vibrant Colors (Zero Dull Grey!) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Commission */}
          <div className={`text-center p-2 sm:p-2.5 rounded-2xl border transition-all ${
            isDark 
              ? 'bg-[#1E1238] border-purple-800/60' 
              : 'bg-[#FAF5FF] border-[#E9D5FF] shadow-xs'
          }`}>
            <span className={`text-[10px] sm:text-[11px] font-bold block leading-tight ${
              isDark ? 'text-purple-300' : 'text-purple-700'
            }`}>
              Commission
            </span>
            <span className={`text-xs sm:text-sm font-black mt-1 block font-mono leading-tight ${
              isDark ? 'text-purple-400' : 'text-[#6D28D9]'
            }`}>
              ₹{teamCommission}
            </span>
          </div>

          {/* Deposit Bonus */}
          <div className={`text-center p-2 sm:p-2.5 rounded-2xl border transition-all ${
            isDark 
              ? 'bg-[#0F1B2E] border-blue-800/60' 
              : 'bg-[#EFF6FF] border-[#BFDBFE] shadow-xs'
          }`}>
            <span className={`text-[10px] sm:text-[11px] font-bold block leading-tight ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Deposit Bonus
            </span>
            <span className={`text-xs sm:text-sm font-black mt-1 block font-mono leading-tight ${
              isDark ? 'text-blue-400' : 'text-[#2563EB]'
            }`}>
              ₹{depositBonus}
            </span>
          </div>

          {/* Trade Profit */}
          <div className={`text-center p-2 sm:p-2.5 rounded-2xl border transition-all ${
            isDark 
              ? 'bg-[#24170B] border-amber-800/60' 
              : 'bg-[#FFFBEB] border-[#FDE68A] shadow-xs'
          }`}>
            <span className={`text-[10px] sm:text-[11px] font-bold block leading-tight ${
              isDark ? 'text-amber-300' : 'text-amber-700'
            }`}>
              Trade Profit
            </span>
            <span className={`text-xs sm:text-sm font-black mt-1 block font-mono leading-tight ${
              isDark ? 'text-amber-400' : 'text-[#D97706]'
            }`}>
              ₹{tradeEarnings}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
