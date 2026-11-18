import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { 
  Users, Copy, Check, Share2, Gift, Award, TrendingUp, 
  ShieldCheck, Sparkles, MessageCircle, Send, ArrowUpRight,
  UserCheck, ChevronRight, Layers, Coins
} from 'lucide-react';

export const TeamsPage = () => {
  const { user, isDark, showToast } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('ALL'); // 'ALL' | 1 | 2 | 3
  const [refData, setRefData] = useState({
    totalCount: 0,
    totalEarnings: 0,
    l1Count: 0,
    l2Count: 0,
    l3Count: 0,
    l1Earnings: 0,
    l2Earnings: 0,
    l3Earnings: 0,
    members: [],
  });

  // Unique Permanent Referral Code & Clean Invitation Link
  const referralCode = (user?.referralCode || user?.uid || 'FP10001').toUpperCase();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://thefampay.com';
  const referralUrl = `${baseUrl}/register?ref=${referralCode}`;

  useEffect(() => {
    const fetchReferralDownline = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const res = await apiService.getUserReferrals(user.id);
        if (res.success && res.data) {
          setRefData(res.data);
        }
      } catch (err) {
        console.warn('Referrals fetch notice:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralDownline();
  }, [user?.id]);

  const copyCodeOnly = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    showToast(`Referral code ${referralCode} copied!`, 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyFullLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    showToast('Referral link copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const text = `🔥 Join The FamPay with my invitation link and trade digital tokens with 24/7 instant UPI withdrawals!\n\n🔑 My Permanent Referral Code: *${referralCode}*\n🔗 Link: ${referralUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaTelegram = () => {
    const text = `🔥 Join The FamPay with my invitation link! Referral Code: ${referralCode}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const cardStyle = isDark
    ? 'bg-[#121829] border-slate-800 text-white shadow-md'
    : 'bg-white border-[#F3F0FF] text-slate-800 shadow-[0_4px_25px_rgba(109,40,217,0.05)]';

  const subBoxStyle = isDark
    ? 'bg-slate-900/60 border-slate-800'
    : 'bg-[#F9F7FE] border-purple-100/80';

  const filteredMembers = selectedTier === 'ALL' 
    ? refData.members 
    : refData.members.filter(m => m.level === Number(selectedTier));

  return (
    <AppShell title="Refer & Earn">
      <div className="p-4 space-y-4 max-w-lg mx-auto">

        {/* 1. Hero Referral Header Card */}
        <div className={`rounded-3xl p-5 text-white shadow-xl relative overflow-hidden transition-all duration-200 ${
          isDark 
            ? 'bg-gradient-to-r from-[#20123D] via-[#2F155E] to-[#180E2F] border border-purple-800/40 shadow-purple-950/40' 
            : 'bg-gradient-to-r from-[#5B1EB7] via-[#6D28D9] to-[#4C1D95] shadow-purple-900/20'
        }`}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-purple-100 uppercase tracking-wider flex items-center gap-1.5 border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Affiliate Program
              </span>
              <span className="text-xs font-black text-amber-300">
                Instant Payouts
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
              Invite Friends, Earn 3-Tier Commissions
            </h2>
            <p className="text-xs text-purple-100/90 mt-1 font-medium leading-relaxed">
              Earn lifetime commission on every downline INR deposit: 30% direct, 10% tier-2, and 5% tier-3.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/15">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-purple-200 block uppercase tracking-wider">Total Downline</span>
                <span className="text-xl font-black text-white mt-0.5 block">{refData.totalCount} Members</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-purple-200 block uppercase tracking-wider">Commission Earned</span>
                <span className="text-xl font-black text-amber-300 mt-0.5 block">
                  ₹{Number(user?.referralEarnings || refData.totalEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Permanent Unique Referral Code & Quick Share Box */}
        <div className={`rounded-3xl p-4 sm:p-5 border space-y-3 ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-600"></div>
              <h3 className="text-xs font-black tracking-tight">Your Permanent Referral Code</h3>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              isDark ? 'bg-purple-900/30 text-purple-300 border border-purple-800/40' : 'bg-purple-50 text-[#6D28D9] border border-purple-200'
            }`}>
              Unique & Lifetime
            </span>
          </div>
          
          <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${subBoxStyle}`}>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Invite Code</span>
              <span className="text-lg font-mono font-black text-[#6D28D9] dark:text-purple-300 tracking-wider">
                {referralCode}
              </span>
            </div>
            <button
              type="button"
              onClick={copyCodeOnly}
              className="bg-[#6D28D9] hover:bg-purple-700 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm active:scale-95 cursor-pointer"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={shareViaWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-900/15 transition-all active:scale-98 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={shareViaTelegram}
              className="bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-sky-900/15 transition-all active:scale-98 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Share Telegram</span>
            </button>
          </div>

          <button
            type="button"
            onClick={copyFullLink}
            className={`w-full py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 border transition-all active:scale-98 cursor-pointer ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Full Invitation Link'}</span>
          </button>
        </div>

        {/* 3. 3-Tier Commission Structure */}
        <div className={`rounded-3xl p-4 sm:p-5 border space-y-3 ${cardStyle}`}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-black text-purple-600 dark:text-purple-400 truncate">
              3-Tier Commission Structure
            </h3>
            <span className="text-[10px] font-bold text-emerald-500 shrink-0">Auto-Credited</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className={`p-2.5 rounded-2xl border text-center transition-all ${
              selectedTier === '1' ? 'border-amber-500 ring-2 ring-amber-500/30' : ''
            } ${subBoxStyle}`}>
              <span className="text-[10px] text-slate-500 font-bold block truncate">Level 1 (Direct)</span>
              <span className="text-base sm:text-lg font-black text-amber-500 block mt-0.5">30%</span>
              <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{refData.l1Count} users</span>
            </div>

            <div className={`p-2.5 rounded-2xl border text-center transition-all ${
              selectedTier === '2' ? 'border-purple-500 ring-2 ring-purple-500/30' : ''
            } ${subBoxStyle}`}>
              <span className="text-[10px] text-slate-500 font-bold block">Level 2</span>
              <span className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 block mt-0.5">10%</span>
              <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{refData.l2Count} users</span>
            </div>

            <div className={`p-2.5 rounded-2xl border text-center transition-all ${
              selectedTier === '3' ? 'border-blue-500 ring-2 ring-blue-500/30' : ''
            } ${subBoxStyle}`}>
              <span className="text-[10px] text-slate-500 font-bold block">Level 3</span>
              <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 block mt-0.5">5%</span>
              <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{refData.l3Count} users</span>
            </div>
          </div>
        </div>

        {/* 4. Team Downline List with Tier Filter */}
        <div className={`rounded-3xl p-4 sm:p-5 border space-y-3.5 ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-xs font-black">Downline Team Members</h4>
            </div>
            <span className="text-[11px] font-bold text-[#6D28D9] dark:text-purple-400">
              {filteredMembers.length} {selectedTier === 'ALL' ? 'Total' : `Tier ${selectedTier}`}
            </span>
          </div>

          {/* Tier Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs font-bold">
            {[
              { id: 'ALL', label: `All (${refData.totalCount})` },
              { id: '1', label: `L1 • 30% (${refData.l1Count})` },
              { id: '2', label: `L2 • 10% (${refData.l2Count})` },
              { id: '3', label: `L3 • 5% (${refData.l3Count})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTier(tab.id)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-black transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  selectedTier === tab.id
                    ? 'bg-[#6D28D9] text-white border-[#6D28D9] shadow-sm'
                    : isDark ? 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading downline records...</div>
          ) : filteredMembers.length === 0 ? (
            <div className={`p-6 text-center rounded-2xl border space-y-2 ${subBoxStyle}`}>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-[#6D28D9] dark:text-purple-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h5 className="text-xs font-bold">
                {selectedTier === 'ALL' ? 'No Team Members Yet' : `No Level ${selectedTier} Members Yet`}
              </h5>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Share your unique referral code or link with friends. When they register and deposit INR, they appear here and commissions credit automatically!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredMembers.map((member) => (
                <div 
                  key={member.id} 
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2 ${subBoxStyle}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                        {member.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <span className="font-black text-xs block text-slate-900 dark:text-white">
                          {member.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                            member.level === 1 
                              ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' 
                              : member.level === 2 
                              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                              : 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                          }`}>
                            Level {member.level} • {member.commissionRate}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {member.maskedPhone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-500 block">
                        +₹{Number(member.commissionEarned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
                        Commission Earned
                      </span>
                    </div>
                  </div>

                  {/* Subline Details: Total Deposited & Join Date */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[10px] text-slate-400 font-medium">
                    <span>
                      Total Deposits: <strong className="text-slate-700 dark:text-slate-300">₹{Number(member.totalDeposited || 0).toLocaleString('en-IN')}</strong>
                    </span>
                    <span>
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. How Referral System Works Guide */}
        <div className={`rounded-3xl p-4 sm:p-5 border space-y-3 ${cardStyle}`}>
          <h4 className="text-xs font-black flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>How The FamPay Multi-Tier Program Works</span>
          </h4>

          <div className="space-y-2.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <p>
                <strong className="text-slate-800 dark:text-slate-200">Share Your Link:</strong> Send your permanent code or invite link to friends & crypto traders.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <p>
                <strong className="text-slate-800 dark:text-slate-200">Friends Deposit INR:</strong> When they deposit INR to purchase tokens, our system automatically tracks the transaction.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <p>
                <strong className="text-slate-800 dark:text-slate-200">Instant Commission:</strong> 30% from direct friends, 10% from Level 2, and 5% from Level 3 are credited directly to your Available Balance!
              </p>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
};
