import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff, PlusCircle, ArrowUpRight, TrendingUp, ArrowDownLeft } from 'lucide-react';

export const BalanceCard = () => {
  const { portfolio, isDark } = useApp();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="px-4 py-2">
      {/* Main Hero Balance Card */}
      <div className={`rounded-3xl p-5 text-white shadow-xl relative overflow-hidden transition-all duration-200 ${
        isDark 
          ? 'bg-gradient-to-br from-[#1E113E] via-[#2D1663] to-[#140B2D] border border-purple-800/40 shadow-purple-950/40' 
          : 'bg-gradient-to-br from-[#6820DA] via-[#5B1EB7] to-[#431093] shadow-purple-900/25'
      }`}>
        {/* Soft Ambient Lights inside card */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-indigo-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Available Balance
            </span>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="text-purple-200 hover:text-white p-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 active:scale-95 transition-all"
              title={showBalance ? "Hide Balance" : "Show Balance"}
            >
              {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Big Amount */}
          <div className="mt-1.5 mb-4">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm font-sans">
              {showBalance ? `₹${Number(portfolio.inrBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••••'}
            </h1>
          </div>

          {/* Dual Action Buttons right inside Balance Card */}
          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            <button
              onClick={() => navigate('/deposit')}
              className="w-full py-2.5 px-3 rounded-2xl bg-white text-[#5B1EB7] font-black text-xs flex items-center justify-center gap-2 shadow-md hover:bg-purple-50 active:scale-95 transition-all"
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Deposit</span>
            </button>

            <button
              onClick={() => navigate('/withdraw')}
              className="w-full py-2.5 px-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-white/25 active:scale-95 transition-all"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>Withdraw</span>
            </button>
          </div>

          {/* Sub-Footer: The FamPay Token Holdings */}
          <div className="flex items-center justify-between pt-2.5 border-t border-white/15 text-xs">
            <span className="text-[11px] font-semibold text-purple-200">Token Holdings</span>
            <span className="font-mono font-black text-white">
              {Number(portfolio.tokenBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} FPT
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
