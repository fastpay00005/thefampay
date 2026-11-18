import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const ToastNotification = () => {
  const { toast, setToast } = useApp();

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <aside 
      aria-label="Notification"
      className="fixed top-3 inset-x-0 mx-auto w-full max-w-[360px] px-3 z-[999999] pointer-events-none transition-all duration-300 ease-out"
    >
      <div 
        className={`w-full pointer-events-auto p-3 sm:p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl text-white text-xs font-bold flex items-center gap-2.5 border transition-all ${
          isError 
            ? 'bg-rose-600/95 border-rose-400/40 shadow-rose-900/40' 
            : isInfo 
            ? 'bg-indigo-600/95 border-indigo-400/40 shadow-indigo-900/40' 
            : 'bg-emerald-600/95 border-emerald-400/40 shadow-emerald-900/40'
        }`}
      >
        <div className="shrink-0">
          {isError ? (
            <AlertCircle className="w-4 h-4 text-white" />
          ) : isInfo ? (
            <Info className="w-4 h-4 text-white" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-white" />
          )}
        </div>

        <p className="flex-1 text-[11px] sm:text-xs font-semibold leading-snug break-words pr-1 min-w-0">
          {toast.message}
        </p>

        {setToast && (
          <button 
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 active:scale-90 transition-all shrink-0"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
};
