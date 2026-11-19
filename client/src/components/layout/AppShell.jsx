import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { NavHome3D, NavDeposit3D, NavTools3D, NavTeams3D, NavAssets3D } from '../common/PremiumIcons3D';
import { UserAvatar } from '../common/UserAvatar';
import { WarningModal } from '../common/WarningModal';
import { 
  AlertCircle, CheckCircle, Info, Bell, ArrowLeft, 
  Coins, Headphones, Send, MessageCircle, X, ExternalLink,
  User, ChevronRight
} from 'lucide-react';

export const AppShell = ({ children, hideHeader = false, hideBottomNav = false, title }) => {
  const { user, notifications, isDark, appName, supportLinks } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const mainRef = useRef(null);

  // Auto scroll to top on every route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname, location.search]);

  const currentAppName = appName || 'The FamPay';

  const displayName = user.role === 'ADMIN' 
    ? 'Super Admin' 
    : (user.fullName && !user.fullName.includes('SuperAdmin') ? user.fullName : `${currentAppName} Member`);

  const userInitials = user.fullName 
    ? user.fullName.trim().charAt(0).toUpperCase() 
    : (user.username ? user.username.trim().charAt(0).toUpperCase() : 'H');

  const navItems = [
    { to: '/', label: 'Home', IconComponent: NavHome3D },
    { to: '/deposit', label: 'Deposit', IconComponent: NavDeposit3D },
    { to: '/tool', label: 'Tool', IconComponent: NavTools3D },
    { to: '/teams', label: 'Teams', IconComponent: NavTeams3D },
    { to: '/assets', label: 'Assets', IconComponent: NavAssets3D },
  ];

  return (
    <div className="min-h-screen bg-[#060812] flex justify-center selection:bg-purple-500 selection:text-white transition-colors duration-200">
      {/* Centered Mobile Native App Container */}
      <div className={`w-full max-w-[430px] min-h-screen flex flex-col relative shadow-[0_0_60px_rgba(0,0,0,0.7)] transition-colors duration-200 ${
        isDark ? 'bg-[#0B0F19] text-slate-100' : 'bg-[#FAF9FE] text-slate-900'
      }`}>
        
        {/* Top Header - Ultra Clean Native App Style with Generous Status Bar Clearance */}
        {!hideHeader && (
          <header className={`px-4 sm:px-5 pt-12 sm:pt-14 pb-3.5 sm:pb-4 rounded-b-[28px] sm:rounded-b-[32px] relative z-40 border-b transition-all duration-200 ${
            isDark 
              ? 'bg-[#0E1528]/95 backdrop-blur-xl text-white border-slate-800 shadow-xl shadow-black/20' 
              : 'bg-white/95 backdrop-blur-xl text-slate-800 border-purple-100/90 shadow-[0_4px_25px_rgba(109,40,217,0.07)]'
          }`}>
            <div className="flex items-center justify-between gap-2.5 sm:gap-3">
              {/* Home Page: User Avatar + Account Tag + Greeting | Inner Pages: Back Button + Title */}
              {location.pathname === '/' || !title ? (
                <div 
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 cursor-pointer active:scale-95 transition-transform group"
                  title="View Profile & Account"
                >
                  <div className="relative shrink-0">
                    <UserAvatar 
                      user={user}
                      size="md" 
                      showOnlineDot={true} 
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border shadow-xs ${
                      isDark ? 'bg-purple-600 border-[#0E1528] text-white' : 'bg-[#6D28D9] border-white text-white'
                    }`}>
                      <User className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                        isDark ? 'text-purple-300' : 'text-purple-600'
                      }`}>
                        My Account
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span className="text-[10px] font-mono text-slate-400">
                        {user.uid || 'VIP'}
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-base font-black tracking-tight leading-tight mt-1 truncate flex items-center gap-1">
                      <span>{displayName}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 transition-colors shrink-0" />
                    </h2>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={() => navigate(-1)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center active:scale-95 transition-all shadow-xs shrink-0 ${
                      isDark 
                        ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-white' 
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                    }`}
                    title="Go Back"
                  >
                    <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block leading-tight ${
                      isDark ? 'text-purple-300' : 'text-purple-600'
                    }`}>
                      {currentAppName}
                    </span>
                    <h2 className="text-sm sm:text-base font-black tracking-tight leading-tight truncate">
                      {title}
                    </h2>
                  </div>
                </div>
              )}

              {/* Action Buttons: Account (User), Support (Headphones), Notifications (Bell), Token (Coins) */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* 1. Dedicated Account Button (User Profile) */}
                <button
                  onClick={() => navigate('/profile')}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center shadow-xs active:scale-95 transition-all ${
                    isDark 
                      ? 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/30 text-purple-300' 
                      : 'bg-purple-50 hover:bg-purple-100 border-purple-200/80 text-purple-700'
                  }`}
                  title="My Account"
                >
                  <User className="w-4.5 h-4.5 stroke-[2.3]" />
                </button>

                {/* 2. 24/7 VIP Customer Support Popup */}
                <button
                  onClick={() => setShowSupportModal(true)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center shadow-xs active:scale-95 transition-all ${
                    isDark 
                      ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300' 
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-600'
                  }`}
                  title="24/7 Customer Support"
                >
                  <Headphones className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>

                {/* 3. Notification Bell with Badge */}
                <button 
                  onClick={() => navigate('/notifications')}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center shadow-xs relative active:scale-95 transition-all ${
                    isDark 
                      ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300' 
                      : 'bg-amber-50 hover:bg-amber-100 border-amber-200/80 text-amber-600'
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 border border-white"></span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Support Modal Popup (PDF §2.19) */}
        {showSupportModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border space-y-5 text-center relative ${
              isDark ? 'bg-[#0E1528] border-purple-900/50 text-white' : 'bg-white border-purple-100 text-slate-900'
            }`}>
              <button
                onClick={() => setShowSupportModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/40 hover:bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-600/30">
                <Headphones className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-black tracking-tight">24/7 Official Support</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connect instantly with {currentAppName} customer support executives.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {/* Telegram Channel */}
                <a
                  href={supportLinks?.telegramChannel || supportLinks?.telegramSupport || 'https://t.me/thefampayofficial'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowSupportModal(false)}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4" />
                    <span>Official Telegram VIP</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                {/* WhatsApp Support */}
                <a
                  href={supportLinks?.whatsappSupport || 'https://wa.me/919876543210'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowSupportModal(false)}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp VIP Support</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>

              <p className="text-[10px] text-slate-500 pt-1">
                Average reply time: &lt; 2 minutes
              </p>
            </div>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main ref={mainRef} className="flex-1 overflow-y-auto no-scrollbar pb-24">
          {children}
        </main>

        {/* Global Warning Pop-up Modal */}
        <WarningModal />

        {/* FIXED BOTTOM NAVIGATION DOCK (App Style) */}
        {!hideBottomNav && (
          <nav className={`fixed bottom-0 w-full max-w-[430px] backdrop-blur-xl border-t h-16 px-2 flex items-center justify-around z-40 transition-colors duration-200 ${
            isDark 
              ? 'bg-[#0D1322]/95 border-slate-800/80 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]' 
              : 'bg-white/95 border-purple-100/90 shadow-[0_-4px_25px_rgba(109,40,217,0.09)]'
          }`}>
            {navItems.map((item) => {
              const IconComp = item.IconComponent;
              const isActive = location.pathname === item.to || (item.to.includes('?') && location.pathname + location.search === item.to);
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                    isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="mb-0.5">
                    <IconComp active={isActive} />
                  </div>
                  <span className={`text-[10.5px] tracking-tight leading-none ${
                    isActive 
                      ? isDark ? 'text-purple-400 font-black' : 'text-[#6D28D9] font-black' 
                      : isDark ? 'text-slate-400 font-bold' : 'text-slate-500 font-bold'
                  }`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        )}

      </div>
    </div>
  );
};
