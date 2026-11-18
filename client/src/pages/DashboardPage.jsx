import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { ReferralHomeCard } from '../components/dashboard/ReferralHomeCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { MyOverviewCard } from '../components/dashboard/MyOverviewCard';
import { EarningsPeriodCard } from '../components/dashboard/EarningsPeriodCard';
import { DailyLadderCard } from '../components/dashboard/DailyLadderCard';
import { PendingOrderAlert } from '../components/dashboard/PendingOrderAlert';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { BannerPopupModal } from '../components/dashboard/BannerPopupModal';
import { useApp } from '../context/AppContext';
import { Sparkles, Trophy, ShieldCheck, ArrowRight } from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, tasks, isDark } = useApp();
  const activeTask = tasks.find(t => t.status === 'AVAILABLE' || t.status === 'ACTIVE');

  return (
    <AppShell>
      <div className="space-y-1">
        {/* Mandatory Home Announcement Popup Modal (If Active) */}
        <BannerPopupModal />

        {/* 1. HERO WALLET BALANCE CARD (Available Balance, Quick Add/Cash Out) */}
        <BalanceCard />

        {/* 2. PRIMARY QUICK ACTIONS & TRADE (3D Glossy Icons: Buy, Sell, Deposit, Withdraw) */}
        <QuickActions />

        {/* 3. PROMINENT REFER & EARN CARD (30% Lifetime Commission, 1-Click Copy & WhatsApp Share) */}
        <ReferralHomeCard />

        {/* 4. PENDING RESERVATION ORDER ALERT (Shown only if user has active order) */}
        <PendingOrderAlert />

        {/* 5. MY OVERVIEW CARDS (Total Deposits & Total Earnings with 3D Artwork) */}
        <MyOverviewCard />

        {/* 6. EARNINGS SUMMARY CARD (Today / Week / All Time Filter with High Contrast Fixed Colors) */}
        <EarningsPeriodCard />

        {/* 7. DAILY REWARD LADDER (With Live Midnight 00:00:00 Countdown Timer & Fixed Tier Colors) */}
        <DailyLadderCard />

        {/* 7. LUCKY SPIN WHEEL REWARD TEASER */}
        <div className="px-4 py-1.5">
          <div 
            onClick={() => navigate('/lucky-spin')}
            className={`rounded-2xl p-3 text-white shadow-md flex items-center justify-between cursor-pointer active:scale-98 transition-all ${
              isDark 
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 border border-amber-500/30' 
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                <Trophy className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-100 block leading-tight">LUCKY SPIN WHEEL</span>
                <h4 className="text-xs font-black text-white leading-tight">
                  {user.spinChances > 0 ? `You have ${user.spinChances} Free Spin Available!` : 'Trade to Unlock Free Spins'}
                </h4>
              </div>
            </div>

            <button className="bg-white text-amber-800 font-black text-[11px] px-3.5 py-1.5 rounded-xl shadow-xs active:scale-95 shrink-0">
              Play Now
            </button>
          </div>
        </div>

        {/* 8. REWARD TASK (If Assigned) */}
        {activeTask && (
          <div className="px-4 py-1">
            <div 
              onClick={() => navigate('/tasks')}
              className={`rounded-2xl p-3 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-all border ${
                isDark 
                  ? 'bg-purple-950/40 border-purple-800/50 text-purple-200' 
                  : 'bg-purple-50 border-purple-200 rounded-2xl text-purple-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-purple-400 block leading-tight">REWARD TASK</span>
                  <h5 className={`text-[11px] font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {activeTask.title} (+₹{activeTask.rewardInr || activeTask.reward || 100})
                  </h5>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-black text-purple-400 shrink-0">
                <span>Submit Proof</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        )}

        {/* 9. RECENT TRANSACTIONS ACTIVITY FEED */}
        <RecentTransactions />
      </div>
    </AppShell>
  );
};
