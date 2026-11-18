import React from 'react';
import { LogOut, X } from 'lucide-react';

export const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl text-center space-y-4 relative border border-purple-100 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Premium Logout Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-500/25">
          <LogOut className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Confirm Sign Out</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
            Are you sure you want to log out of your <strong className="text-purple-700">The FamPay</strong> account?
          </p>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-black shadow-md shadow-rose-900/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Yes, Logout</span>
          </button>
        </div>

      </div>
    </div>
  );
};
