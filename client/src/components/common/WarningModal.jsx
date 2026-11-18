import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, X, ExternalLink, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WarningModal = () => {
  const { warningModal, closeWarningModal, supportLinks, isDark } = useApp();
  const navigate = useNavigate();

  if (!warningModal.isOpen) return null;

  const handleAction = () => {
    closeWarningModal();
    if (warningModal.actionText && warningModal.actionText.includes('Verification')) {
      navigate('/tasks');
    } else {
      window.open(supportLinks.telegramSupport || supportLinks.whatsappSupport || supportLinks.telegramChannel || 'https://t.me/thefampayofficial', '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className={`w-full max-w-xs rounded-3xl p-6 shadow-2xl border text-center relative overflow-hidden transition-all ${
        isDark ? 'bg-[#0F172A] border-slate-800 text-white' : 'bg-white border-rose-100 text-slate-900'
      }`}>
        {/* Ambient Top Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-rose-500/15 rounded-full blur-xl pointer-events-none" />

        <button 
          type="button"
          onClick={closeWarningModal}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 p-1 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Warning Icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-sm animate-pulse">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <h3 className={`text-base font-black tracking-tight leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {warningModal.title || 'Action Restricted'}
        </h3>

        <p className={`text-xs font-medium mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {warningModal.message}
        </p>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={handleAction}
            className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-rose-900/20 active:scale-98 transition-all text-xs flex items-center justify-center gap-1.5"
          >
            <span>{warningModal.actionText || 'Contact Support'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={closeWarningModal}
            className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-300 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
