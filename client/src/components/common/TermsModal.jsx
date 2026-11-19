import React from 'react';
import { FileText, X, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TermsModal = ({ isOpen, onClose, onAgree }) => {
  const { isDark, appName } = useApp();
  const currentAppName = appName || 'The FamPay';

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md max-h-[85vh] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col border ${
          isDark ? 'bg-[#0D1527] border-slate-800 text-white' : 'bg-white border-purple-100 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">Terms & Conditions</h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Official Platform Rules</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-purple-900 dark:text-purple-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong>Zero-KYC Policy:</strong> {currentAppName} operates on a digital token exchange ledger. No identity documents (Aadhaar/PAN) are collected or stored on our servers.
            </div>
          </div>

          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-xs mb-1">1. Scope of Service & Virtual Balances</h4>
            <p>
              All monetary deposits made by users are credited directly into official authorized Administrator bank accounts. The balance displayed on this portal acts as a virtual digital exchange ledger for token buy, sell, and commission calculations.
            </p>
          </div>

          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-xs mb-1">2. Deposit Verification & Orders</h4>
            <p>
              Users must submit accurate 12-digit UTR numbers and valid transaction receipts. Any duplicate UTR or fraudulent receipt submission will lead to immediate account suspension and blacklisting.
            </p>
          </div>

          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-xs mb-1">3. Cash Out & Settlement Timelines</h4>
            <p>
              When a user initiates a Cash Out or Token Sell request, funds are reserved from their available ledger and verified manually by the Admin team. Approved settlements are dispatched directly to the user's verified UPI account within 15 to 30 minutes.
            </p>
          </div>

          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-xs mb-1">4. Referral Commission Terms</h4>
            <p>
              Referral bonuses (30% Level 1, 10% Level 2, 5% Level 3) are credited only upon the successful verification and approval of real INR deposits made by downline users.
            </p>
          </div>

          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-xs mb-1">5. Security & 4-Digit PIN</h4>
            <p>
              Users are solely responsible for keeping their 4-digit security transaction PIN confidential. Exceeding 3 failed PIN attempts locks the PIN automatically, requiring Administrator intervention to reset.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            if (onAgree) onAgree();
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#6D28D9] to-indigo-700 text-white font-black text-xs hover:opacity-95 shadow-lg shadow-purple-900/25 active:scale-98 transition-all mt-2"
        >
          I Understand & Agree
        </button>
      </div>
    </div>
  );
};
