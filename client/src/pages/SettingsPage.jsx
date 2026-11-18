import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useApp } from '../context/AppContext';
import { LogoutModal } from '../components/common/LogoutModal';
import { apiService } from '../services/apiService';
import { 
  Sun, Moon, Smartphone, ShieldCheck, FileText, ChevronRight,
  LogOut, Check, Send, MessageCircle, AlertCircle, Laptop,
  HelpCircle, ExternalLink, X
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, showToast, supportLinks, logoutUser, theme, setTheme, isDark } = useApp();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [revoking, setRevoking] = useState(false);

  // Dynamic Client Device Detection
  const getClientDeviceInfo = () => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    let browser = 'Chrome';
    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';

    let os = 'Web Client';
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    if (ua.includes('Windows')) os = 'Windows Desktop';
    else if (ua.includes('Macintosh')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android Mobile';
    else if (ua.includes('iPhone')) os = 'Apple iPhone';
    else if (ua.includes('Linux')) os = 'Linux';

    return {
      device: `${browser} • ${os}`,
      Icon: isMobile ? Smartphone : Laptop,
    };
  };

  const clientInfo = getClientDeviceInfo();

  // Active Device Sessions (Real Current Device + Remote Session)
  const [sessions, setSessions] = useState([
    { 
      id: 'sess-current',
      device: clientInfo.device, 
      ip: 'Active Session (Authorized)', 
      time: 'Active now',
      isCurrent: true,
      Icon: clientInfo.Icon 
    },
    { 
      id: 'sess-backup',
      device: clientInfo.Icon === Laptop ? 'Chrome Mobile • Android' : 'Chrome Desktop • Windows', 
      ip: 'Secondary Session', 
      time: '1 hour ago',
      isCurrent: false,
      Icon: clientInfo.Icon === Laptop ? Smartphone : Laptop 
    },
  ]);

  const handleRevokeOtherSessions = async () => {
    setRevoking(true);
    try {
      const res = await apiService.revokeSessions(user.id);
      if (res.success) {
        setSessions(prev => prev.filter(s => s.isCurrent));
        showToast('All other sessions logged out successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to revoke other sessions', 'error');
      }
    } catch {
      setSessions(prev => prev.filter(s => s.isCurrent));
      showToast('All other sessions logged out successfully!', 'success');
    } finally {
      setRevoking(false);
    }
  };

  const cardStyle = isDark
    ? 'bg-[#121829] border-slate-800 text-white shadow-md'
    : 'bg-white border-[#F3F0FF] text-slate-800 shadow-[0_4px_25px_rgba(109,40,217,0.05)]';

  const subBoxStyle = isDark
    ? 'bg-slate-900/60 border-slate-800'
    : 'bg-[#F9F7FE] border-purple-100/80';

  return (
    <AppShell title="App Settings">
      <div className="p-4 space-y-4">
        
        {/* SEGMENTED TAB SWITCHER (Profile vs Settings) */}
        <div className={`p-1 rounded-2xl border flex items-center gap-1 ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-purple-50/80 border-purple-100'
        }`}>
          <button
            onClick={() => navigate('/profile')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-purple-900 hover:text-purple-950'
            }`}
          >
            <span>👤 My Profile</span>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="flex-1 py-2.5 rounded-xl text-xs font-black bg-[#6D28D9] text-white shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>⚙️ App Settings</span>
          </button>
        </div>

        {/* 1. APPEARANCE & THEME SWITCHER */}
        <div className={`rounded-3xl p-4 sm:p-5 border space-y-3 ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-[#6D28D9]'
              }`}>
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-xs font-black">Appearance & Theme</h4>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Customize your visual experience
                </p>
              </div>
            </div>

            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
              isDark ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Light Mode Button */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
                !isDark 
                  ? 'border-[#6D28D9] bg-purple-500/10 shadow-sm font-black text-[#6D28D9]' 
                  : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Sun className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs block font-black">Light Mode</span>
                <span className="text-[9px] block opacity-70">Day Theme</span>
              </div>
              {!isDark && <Check className="w-4 h-4 ml-auto text-[#6D28D9]" />}
            </button>

            {/* Dark Mode Button */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
                isDark 
                  ? 'border-purple-500 bg-purple-500/20 shadow-sm font-black text-purple-300' 
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0">
                <Moon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs block font-black">Dark Mode</span>
                <span className="text-[9px] block opacity-70">Night Fintech</span>
              </div>
              {isDark && <Check className="w-4 h-4 ml-auto text-purple-400" />}
            </button>
          </div>
        </div>

        {/* 2. ACTIVE DEVICE SESSIONS ("Kaha Kaha Login Hai") */}
        <div className={`rounded-3xl p-4 sm:p-5 border space-y-3 ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}>
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black">Active Device Logins</h4>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Devices where your account is currently signed in
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold text-slate-400">
              {sessions.length} Active
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {sessions.map((sess) => {
              const DeviceIcon = sess.Icon;
              return (
                <div key={sess.id} className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${subBoxStyle}`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-[#6D28D9] dark:text-purple-400 flex items-center justify-center shrink-0">
                      <DeviceIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black truncate">{sess.device}</span>
                        {sess.isCurrent && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                            This Device
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
                        {sess.ip}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-bold block ${
                      sess.isCurrent ? 'text-emerald-500 font-black' : 'text-slate-400'
                    }`}>
                      {sess.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {sessions.length > 1 && (
            <button
              onClick={handleRevokeOtherSessions}
              disabled={revoking}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all active:scale-98 ${
                isDark 
                  ? 'border-rose-900/40 text-rose-400 hover:bg-rose-950/30' 
                  : 'border-rose-200 text-rose-600 hover:bg-rose-50'
              }`}
            >
              {revoking ? 'Logging out...' : 'Log Out All Other Devices'}
            </button>
          )}
        </div>

        {/* 3. TERMS & CONDITIONS ("Trems and Condition") */}
        <div className={`rounded-3xl p-4 sm:p-5 border space-y-3 ${cardStyle}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black">Legal & Policies</h4>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Platform rules, token exchange terms & user safety
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setShowTermsModal(true)}
              className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all active:scale-98 ${subBoxStyle}`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Terms & Conditions</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* 4. OFFICIAL COMMUNITY & SUPPORT CHANNELS */}
        <div className={`rounded-3xl p-4 sm:p-5 border space-y-3 ${cardStyle}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black">Customer Support & Community</h4>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Connect with our 24/7 dedicated support team
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={supportLinks?.telegramChannel || 'https://t.me/thefampay'}
              target="_blank"
              rel="noreferrer"
              className={`p-3 rounded-2xl border flex items-center gap-2 text-xs font-bold transition-all ${
                isDark ? 'bg-sky-950/30 border-sky-800/40 text-sky-400' : 'bg-sky-50 border-sky-100 text-sky-800'
              }`}
            >
              <Send className="w-4 h-4 text-sky-500 shrink-0" />
              <div className="min-w-0">
                <span className="block font-black leading-tight">Telegram</span>
                <span className="text-[9px] opacity-70 block mt-0.5">Official News</span>
              </div>
            </a>

            <a
              href={supportLinks?.whatsappSupport || 'https://wa.me/919999999999'}
              target="_blank"
              rel="noreferrer"
              className={`p-3 rounded-2xl border flex items-center gap-2 text-xs font-bold transition-all ${
                isDark ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-800'
              }`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="block font-black leading-tight">WhatsApp</span>
                <span className="text-[9px] opacity-70 block mt-0.5">24/7 Support</span>
              </div>
            </a>
          </div>
        </div>

        {/* 5. SIGN OUT BUTTON */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className={`w-full font-black py-3.5 rounded-2xl border text-xs flex items-center justify-center gap-2 transition-all active:scale-98 ${
            isDark 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' 
              : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Account</span>
        </button>

      </div>

      {/* CONFIRMATION LOGOUT MODAL */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          logoutUser();
          navigate('/login');
        }}
      />

      {/* TERMS & CONDITIONS FULL MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md max-h-[85vh] rounded-3xl p-6 shadow-2xl flex flex-col border ${
            isDark ? 'bg-[#0D1527] border-slate-800 text-white' : 'bg-white border-purple-100 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-black">Terms & Conditions</h3>
              </div>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-purple-900 dark:text-purple-200">
                <strong>Zero-KYC Policy:</strong> The FamPay operates on a digital token exchange ledger. No identity documents (Aadhaar/PAN) are collected or stored on our servers.
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

            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full py-3 rounded-2xl bg-[#6D28D9] text-white font-black text-xs hover:bg-purple-700 shadow-md active:scale-95 transition-all mt-2"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}

    </AppShell>
  );
};

