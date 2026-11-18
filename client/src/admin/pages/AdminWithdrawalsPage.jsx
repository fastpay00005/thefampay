import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminTheme } from '../context/AdminThemeContext';
import { ArrowUpRight, Check, X, Building2, CheckCircle2, Clock } from 'lucide-react';

export const AdminWithdrawalsPage = () => {
  const { isDark } = useAdminTheme();
  const { transactions, loadAdminData, adminApproveWithdrawal } = useApp();

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const withdrawals = transactions.filter(t => t.type === 'WITHDRAWAL');

  const cardStyle = isDark
    ? 'bg-[#111C44] border-slate-800 shadow-md text-white'
    : 'bg-white border-slate-200/90 shadow-xs text-slate-800';

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-amber-500" />
          <span>Withdrawal Payout Queue</span>
        </h2>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Review user withdrawal requests and mark bank / UPI settlements complete
        </p>
      </div>

      <div className="space-y-3">
        {withdrawals.length === 0 ? (
          <div className={`p-10 text-center rounded-2xl border text-xs text-slate-400 ${cardStyle}`}>
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 text-blue-500" />
            <p className="font-bold">No withdrawal payout records found in queue.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">User payout requests will appear here when submitted.</p>
          </div>
        ) : (
          withdrawals.map((wth) => (
            <div 
              key={wth.id} 
              className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${cardStyle}`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg sm:text-xl font-black text-amber-500">
                    ₹{Number(wth.amount || 0).toLocaleString('en-IN')}
                  </span>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    wth.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' :
                    wth.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30 animate-pulse' :
                    'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                  }`}>
                    {wth.status}
                  </span>
                </div>

                <div className="text-xs font-mono flex items-center gap-1.5 text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">Payout: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{wth.channelLabel || wth.destination || 'Bank Account / UPI'}</strong></span>
                </div>

                <span className="text-[10px] text-slate-400 block font-mono">
                  User: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{wth.userName || wth.userId}</strong> • Ref: {wth.refNumber || wth.id} • {new Date(wth.createdAt || Date.now()).toLocaleTimeString()}
                </span>
              </div>

              {wth.status === 'PENDING' ? (
                <button
                  type="button"
                  onClick={() => adminApproveWithdrawal(wth.id)}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Settled & Complete</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Settled & Paid</span>
                </span>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
