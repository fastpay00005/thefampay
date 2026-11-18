import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminTheme } from '../context/AdminThemeContext';
import { ArrowDownLeft, Check, X, Image, Clock, CheckCircle, Eye, ExternalLink, Copy, Coins, Filter } from 'lucide-react';

export const AdminDepositsPage = () => {
  const { isDark } = useAdminTheme();
  const { transactions, loadAdminData, adminApproveDeposit, adminRejectDeposit, marketSettings, showToast } = useApp();
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);
  const [currencyFilter, setCurrencyFilter] = useState('ALL'); // 'ALL' | 'INR' | 'USDT' | 'PENDING'

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const allDeposits = transactions.filter(t => t.type === 'DEPOSIT');

  const filteredDeposits = allDeposits.filter(dep => {
    if (currencyFilter === 'INR') return dep.currency === 'INR';
    if (currencyFilter === 'USDT') return dep.currency === 'USDT';
    if (currencyFilter === 'PENDING') return dep.status === 'PENDING';
    return true;
  });

  const cardStyle = isDark
    ? 'bg-[#111C44] border-slate-800 shadow-md text-white'
    : 'bg-white border-slate-200/90 shadow-xs text-slate-800';

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    if (showToast) showToast(`${label} copied to clipboard!`, 'info');
  };

  const usdtRate = Number(marketSettings?.usdtInrRate || 88.5);

  return (
    <div className="space-y-6">
      
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
            <span>Deposit Review & Approval Queue</span>
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Per PDF Spec 3.7: Audit INR (UPI/Bank) & USDT on-chain deposits. Approving credits INR Available Balance.
          </p>
        </div>

        {/* Filter Pills */}
        <div className={`p-1 rounded-xl border flex items-center gap-1 text-xs font-bold ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setCurrencyFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currencyFilter === 'ALL'
                ? 'bg-purple-600 text-white font-black shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({allDeposits.length})
          </button>
          <button
            onClick={() => setCurrencyFilter('INR')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currencyFilter === 'INR'
                ? 'bg-purple-600 text-white font-black shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🇮🇳 INR
          </button>
          <button
            onClick={() => setCurrencyFilter('USDT')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currencyFilter === 'USDT'
                ? 'bg-emerald-600 text-white font-black shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            💎 USDT
          </button>
          <button
            onClick={() => setCurrencyFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currencyFilter === 'PENDING'
                ? 'bg-amber-600 text-white font-black shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ⏳ Pending
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredDeposits.length === 0 ? (
          <div className={`p-10 text-center rounded-2xl border text-xs text-slate-400 ${cardStyle}`}>
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 text-blue-500" />
            <p className="font-bold">No deposit records match filter "{currencyFilter}".</p>
            <p className="text-[11px] text-slate-400 mt-0.5">New user deposit submissions will appear here for verification.</p>
          </div>
        ) : (
          filteredDeposits.map((dep) => {
            const hasProof = dep.proofUrl || dep.proof;
            const isUrl = hasProof && (hasProof.startsWith('http') || hasProof.startsWith('data:'));
            const isUsdt = dep.currency === 'USDT';
            const convertedInr = isUsdt ? (Number(dep.amount || 0) * usdtRate).toLocaleString('en-IN') : null;

            return (
              <div 
                key={dep.id} 
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${cardStyle}`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-lg sm:text-xl font-black ${isUsdt ? 'text-cyan-400' : 'text-emerald-500'}`}>
                      {isUsdt ? `${Number(dep.amount || 0)} USDT` : `₹${Number(dep.amount || 0).toLocaleString('en-IN')}`}
                    </span>

                    {isUsdt && (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        ≈ ₹{convertedInr} INR Credit
                      </span>
                    )}

                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      isUsdt ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' :
                      isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {dep.channelLabel || dep.method || (isUsdt ? 'USDT On-Chain' : 'UPI Deposit')}
                    </span>

                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      dep.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' :
                      dep.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30 animate-pulse' :
                      'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                    }`}>
                      {dep.status}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-2">
                    <span>User: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{dep.userName || dep.userId}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {isUsdt ? 'TxHash:' : 'UTR:'} 
                      <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{dep.refNumber || dep.id}</strong>
                      <button 
                        type="button"
                        onClick={() => copyToClipboard(dep.refNumber || dep.id, isUsdt ? 'TxHash' : 'UTR')}
                        className="text-purple-400 hover:text-purple-300 p-0.5"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </span>
                    <span>•</span>
                    <span>{new Date(dep.createdAt || Date.now()).toLocaleTimeString()}</span>
                  </div>

                  {hasProof && (
                    <div className="flex items-center gap-2 pt-1">
                      {isUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedProofUrl(dep.proofUrl || dep.proof)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-95 ${
                            isDark 
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20' 
                              : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Receipt Screenshot</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Receipt Attached</span>
                      )}
                    </div>
                  )}
                </div>

                {dep.status === 'PENDING' ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => adminRejectDeposit(dep.id)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-black text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => adminApproveDeposit(dep.id)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Credit</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Processed</span>
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Proof Image Viewer Modal */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-3xl p-5 max-w-lg w-full max-h-[90vh] flex flex-col space-y-3 border shadow-2xl ${
            isDark ? 'bg-[#0D1527] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-500" />
                <span>Deposit Receipt Verification</span>
              </h3>
              <button 
                type="button"
                onClick={() => setSelectedProofUrl(null)} 
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto rounded-2xl bg-black/40 flex items-center justify-center p-2 border border-slate-800/50">
              <img 
                src={selectedProofUrl} 
                alt="Receipt Proof" 
                className="max-h-[60vh] w-auto object-contain rounded-xl"
              />
            </div>
            <button
              type="button"
              onClick={() => setSelectedProofUrl(null)}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              Close Viewer
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
