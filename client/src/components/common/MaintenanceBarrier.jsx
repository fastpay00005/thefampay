import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Wrench, Clock, Send, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';

export const MaintenanceBarrier = ({ children }) => {
  const { maintenance, checkMaintenance, appName, isDark } = useApp();
  const location = useLocation();
  const [checking, setChecking] = useState(false);

  // Allow admin routes and admin users to bypass maintenance barrier
  const isAdminRoute = location.pathname.startsWith('/admin');
  const hasAdminSession = Boolean(localStorage.getItem('fampay_admin_token'));

  if (isAdminRoute || hasAdminSession || !maintenance?.isEnabled) {
    return <>{children}</>;
  }

  const handleRefresh = async () => {
    setChecking(true);
    try {
      if (checkMaintenance) await checkMaintenance();
    } finally {
      setTimeout(() => setChecking(false), 600);
    }
  };

  const currentAppName = appName || 'The FamPay';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-[#070A14] text-white' : 'bg-gradient-to-br from-purple-50 via-slate-50 to-indigo-50 text-slate-900'
    }`}>
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Maintenance Card Container */}
      <div className={`w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl relative z-10 text-center space-y-5 animate-in zoom-in-95 duration-300 ${
        isDark 
          ? 'bg-[#0E1528]/90 border-slate-800 backdrop-blur-md shadow-purple-950/40' 
          : 'bg-white/95 border-purple-100 shadow-[0_20px_50px_rgba(109,40,217,0.12)]'
      }`}>
        {/* Animated 3D Wrench/Tool Badge */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 opacity-20 animate-pulse" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Wrench className="w-8 h-8 animate-bounce" />
          </div>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>Scheduled System Upgrade</span>
        </div>

        {/* Heading */}
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Under Maintenance
          </h1>
          <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-1">
            {currentAppName} Secure Network
          </p>
        </div>

        {/* Admin Custom Announcement Message */}
        <div className={`p-4 rounded-2xl border text-xs font-medium leading-relaxed ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-purple-50/60 border-purple-200/60 text-slate-700'
        }`}>
          {maintenance.message || 'System upgrade is currently in progress. All user funds and balances are 100% secure. Operations will resume shortly.'}
        </div>

        {/* Scheduled End Time (If set by admin) */}
        {maintenance.scheduledEnd && (
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 text-purple-500" />
            <span>Expected Resumption: {new Date(maintenance.scheduledEnd).toLocaleString()}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Refresh Status Button */}
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-black text-xs shadow-lg shadow-purple-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking Status...' : 'Check If Maintenance Finished'}</span>
          </button>

          {/* Telegram VIP Support Link */}
          <a
            href="https://t.me/thefampayofficial"
            target="_blank"
            rel="noreferrer"
            className={`w-full py-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isDark 
                ? 'bg-slate-900/60 border-slate-800 text-blue-400 hover:bg-slate-800' 
                : 'bg-slate-100 border-slate-200 text-blue-600 hover:bg-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Join Official Telegram VIP Support</span>
          </a>
        </div>

        {/* Security Assurance Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
          <span>Zero-KYC Protected & Funds Fully Backed</span>
        </div>
      </div>
    </div>
  );
};
