import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MoneyBag3D, ChartTrend3D } from '../common/Icons3D';

export const MyOverviewCard = () => {
  const { portfolio, isDark } = useApp();
  const navigate = useNavigate();

  const totalDeposits = Number(portfolio?.totalDeposits || 0);
  const totalEarnings = Number(portfolio?.totalEarnings || 0);

  return (
    <div className="px-4 py-2">
      {/* Header Row: Title & Stats link */}
      <div className="flex items-center justify-between mb-2.5">
        <h3 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          My Overview
        </h3>
        <button 
          onClick={() => navigate('/assets')}
          className="text-xs font-black text-[#6D28D9] dark:text-purple-400 hover:underline active:scale-95 transition-all"
        >
          Stats
        </button>
      </div>

      {/* 2-Card Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Total Deposits with 3D Golden Money Pot */}
        <div 
          onClick={() => navigate('/deposit')}
          className={`p-3.5 sm:p-4 rounded-3xl border cursor-pointer active:scale-98 transition-all duration-200 group flex flex-col justify-between overflow-hidden ${
            isDark 
              ? 'bg-[#121829] border-slate-800/80 shadow-md hover:border-slate-700' 
              : 'bg-white border-[#F3F0FF] shadow-[0_8px_30px_rgba(109,40,217,0.05)] hover:border-purple-200'
          }`}
        >
          <div className="w-11 h-11 flex items-center justify-start group-hover:scale-108 transition-transform duration-200">
            <MoneyBag3D className="w-10 h-10 drop-shadow-sm" />
          </div>

          <div className="mt-2.5">
            <h4 className={`text-lg sm:text-xl font-black tracking-tight leading-tight truncate ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              ₹{totalDeposits.toLocaleString('en-IN')}
            </h4>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mt-0.5 truncate">
              Total Deposits
            </span>
          </div>
        </div>

        {/* Card 2: Total Earnings with 3D Glossy Trend Chart */}
        <div 
          onClick={() => navigate('/assets')}
          className={`p-3.5 sm:p-4 rounded-3xl border cursor-pointer active:scale-98 transition-all duration-200 group flex flex-col justify-between overflow-hidden ${
            isDark 
              ? 'bg-[#121829] border-slate-800/80 shadow-md hover:border-slate-700' 
              : 'bg-white border-[#F3F0FF] shadow-[0_8px_30px_rgba(109,40,217,0.05)] hover:border-purple-200'
          }`}
        >
          <div className="w-11 h-11 flex items-center justify-start group-hover:scale-108 transition-transform duration-200">
            <ChartTrend3D className="w-10 h-10 drop-shadow-sm" />
          </div>

          <div className="mt-2.5">
            <h4 className={`text-lg sm:text-xl font-black tracking-tight leading-tight truncate ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              ₹{totalEarnings.toLocaleString('en-IN')}
            </h4>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mt-0.5 truncate">
              Total Earnings
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

