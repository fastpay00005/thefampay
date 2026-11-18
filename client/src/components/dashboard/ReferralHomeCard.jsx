import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Copy, Check, Share2, ArrowRight, Sparkles, MessageCircle, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ReferralHomeCard = () => {
  const { user, isDark, showToast } = useApp();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const refCode = user?.referralCode || user?.userCode || 'FP-INVITE';
  const inviteUrl = `${window.location.origin}/register?ref=${refCode}`;

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    showToast('Referral code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = (e) => {
    e.stopPropagation();
    const shareMessage = encodeURIComponent(
      `🔥 Join The FamPay & Earn Daily!\n\nUse my Referral Code: *${refCode}*\nSign up here: ${inviteUrl}\n\nGet instant deposit bonuses and withdraw directly to your UPI!`
    );
    window.open(`https://api.whatsapp.com/send?text=${shareMessage}`, '_blank');
  };

  return (
    <div className="px-4 py-2">
      <div className={`p-4 sm:p-5 rounded-3xl border relative overflow-hidden transition-all duration-200 ${
        isDark 
          ? 'bg-gradient-to-br from-[#1E1238] via-[#2A1552] to-[#160D2C] border-purple-800/40 shadow-xl shadow-purple-950/30 text-white' 
          : 'bg-gradient-to-br from-[#6820DA] via-[#7C3AED] to-[#5B1EB7] text-white border-purple-400/30 shadow-lg shadow-purple-600/20'
      }`}>
        
        {/* Soft Ambient Lights inside card */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          
          {/* Top Tag & Team Link */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-400/30 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-300" />
              Refer & Earn Program
            </span>
            <button 
              onClick={() => navigate('/teams')}
              className="text-xs font-black text-purple-200 hover:text-white flex items-center gap-1 transition-colors"
            >
              My Network <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Headline */}
          <h3 className="text-base sm:text-lg font-black text-white leading-tight">
            Earn 30% Lifetime Referral Commission
          </h3>
          <p className="text-xs text-purple-100/90 mt-1 leading-snug">
            Share your code with friends. You earn instant cash bonuses on every deposit they make!
          </p>

          {/* 3 Tier Commission Pills */}
          <div className="grid grid-cols-3 gap-2 my-3">
            <div className="py-1.5 px-1.5 sm:px-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <span className="text-[10px] text-purple-200 font-bold block truncate">Level 1 (Direct)</span>
              <span className="text-sm font-black text-amber-300 block">30%</span>
            </div>
            <div className="py-1.5 px-1.5 sm:px-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <span className="text-[10px] text-purple-200 font-bold block truncate">Level 2</span>
              <span className="text-sm font-black text-white block">10%</span>
            </div>
            <div className="py-1.5 px-1.5 sm:px-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <span className="text-[10px] text-purple-200 font-bold block truncate">Level 3</span>
              <span className="text-sm font-black text-white block">5%</span>
            </div>
          </div>

          {/* Code Bar + Actions */}
          <div className="p-2 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 pl-2 w-full sm:w-auto">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-purple-200 font-bold block">Your Referral Code</span>
                <span className="font-mono text-sm font-black text-white tracking-widest block">
                  {refCode}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <button
                onClick={handleCopyCode}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-white text-purple-900 hover:bg-purple-50 font-black text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
