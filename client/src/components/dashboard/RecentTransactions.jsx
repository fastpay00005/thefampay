import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowDownLeft, ArrowUpRight, Zap, Gift, CheckCircle2, Clock, XCircle, ArrowRight, RefreshCw } from 'lucide-react';

export const RecentTransactions = () => {
  const { transactions, isDark } = useApp();
  const navigate = useNavigate();

  const getTxnIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
          </div>
        );
      case 'TOKEN_BUY':
      case 'BUY':
        return (
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Zap className="w-5 h-5 stroke-[2.5]" />
          </div>
        );
      case 'TOKEN_SELL':
      case 'SELL':
        return (
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
            <RefreshCw className="w-5 h-5 stroke-[2.5]" />
          </div>
        );
      case 'WITHDRAWAL':
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        );
      case 'REFERRAL_BONUS':
      case 'SPIN_WIN':
      case 'GIFT':
        return (
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
            <Gift className="w-5 h-5 stroke-[2.5]" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-slate-500/15 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-500/20">
            <Zap className="w-5 h-5 stroke-[2.5]" />
          </div>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-2.5 h-2.5" /> Completed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Clock className="w-2.5 h-2.5" /> Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            <XCircle className="w-2.5 h-2.5" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const cardStyle = isDark
    ? 'bg-[#121829] border-slate-800 shadow-md text-white'
    : 'bg-white border-[#F3F0FF] shadow-[0_8px_25px_rgba(109,40,217,0.04)] text-slate-800';

  return (
    <div className="px-4 py-2 pb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Recent Transactions
        </h3>
        <button 
          onClick={() => navigate('/assets')}
          className={`text-xs font-bold hover:underline flex items-center gap-1 ${
            isDark ? 'text-purple-400' : 'text-[#6D28D9]'
          }`}
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className={`rounded-3xl p-3 border space-y-2 transition-all ${cardStyle}`}>
        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">
            No transaction records yet. Start trading or deposit to view history.
          </div>
        ) : (
          transactions.slice(0, 4).map((txn) => {
            const isCredit = txn.type === 'DEPOSIT' || txn.type === 'REFERRAL_BONUS' || txn.type === 'SPIN_WIN';
            return (
              <div 
                key={txn.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl transition-colors ${
                  isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getTxnIcon(txn.type)}
                  <div>
                    <h4 className="text-xs font-black leading-snug">
                      {txn.channelLabel || txn.title || txn.type}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 block font-mono mt-0.5">
                      {txn.createdAt ? new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : txn.timestamp} • {txn.method || 'System'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-black block font-mono ${
                    isCredit 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {isCredit ? '+' : '-'}₹{Number(txn.amountInr || txn.amount || 0).toLocaleString('en-IN')}
                  </span>
                  <div className="mt-0.5">
                    {getStatusBadge(txn.status)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
