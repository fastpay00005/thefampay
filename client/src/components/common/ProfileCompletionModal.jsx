import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { Smartphone, User, ShieldCheck, ArrowRight, Loader2, Clock, X } from 'lucide-react';

export const ProfileCompletionModal = () => {
  const { user, loginUser, showToast, appName } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only apply to logged-in users who are not Admin
    if (!user?.isLoggedIn || !user?.id || user?.role === 'ADMIN') {
      setIsOpen(false);
      return;
    }

    // If user already has a valid mobile number, no popup needed
    const hasMobile = Boolean(user.mobile && user.mobile.trim() !== '');
    if (hasMobile) {
      setIsOpen(false);
      return;
    }

    // Check if 24 hours have elapsed since account creation
    const createdTimestamp = user.createdAt ? new Date(user.createdAt).getTime() : 0;
    const hoursElapsed = (Date.now() - createdTimestamp) / (1000 * 60 * 60);

    // Check if user snoozed the reminder within the last hour
    const snoozedUntil = parseInt(localStorage.getItem('fampay_profile_snooze') || '0', 10);
    const isSnoozed = Date.now() < snoozedUntil;

    // Check for explicit test trigger in sessionStorage
    const isTestTriggered = sessionStorage.getItem('fampay_trigger_profile_modal') === 'true';

    // Show popup if 24 hours have passed OR explicitly triggered for test
    if ((hoursElapsed >= 24 || isTestTriggered) && !isSnoozed) {
      setFullName(user.fullName && user.fullName !== 'FamPay User' ? user.fullName : '');
      setIsOpen(true);
    }
  }, [user]);

  const handleSnooze = () => {
    // Snooze for 2 hours
    localStorage.setItem('fampay_profile_snooze', (Date.now() + 2 * 60 * 60 * 1000).toString());
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanName = fullName.trim();
    const cleanMobile = mobile.replace(/\D/g, '');

    if (!cleanName) {
      showToast('Please enter your full name', 'error');
      return;
    }

    if (cleanMobile.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await apiService.updateUserProfile(user.id, {
        fullName: cleanName,
        mobile: `+91 ${cleanMobile}`
      });

      setLoading(false);

      if (res.success && res.user) {
        sessionStorage.removeItem('fampay_trigger_profile_modal');
        localStorage.removeItem('fampay_profile_snooze');
        loginUser(res.user);
        showToast('Profile completed and secured successfully!', 'success');
        setIsOpen(false);
      } else {
        showToast(res.message || 'Failed to update profile. Please try again.', 'error');
      }
    } catch (err) {
      setLoading(false);
      console.error('[Profile Update Error]:', err);
      showToast('Server connection error. Please try again.', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[400px] bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 relative space-y-4">
        
        {/* Top Dismiss / Snooze */}
        <button
          type="button"
          onClick={handleSnooze}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          title="Remind me later"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6D28D9] to-indigo-600 mx-auto flex items-center justify-center text-white shadow-hero border border-white/20">
            <Smartphone className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Complete Your Profile</h2>
          <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>24-Hour Account Verification</span>
          </div>
          <p className="text-xs text-slate-500 max-w-[90%] mx-auto font-medium pt-1">
            Welcome to {appName}! Please update your contact details to protect your digital wallet and unlock instant withdrawals.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Legal Name</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:bg-white transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile Number</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-bold text-slate-500 select-none">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-13 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:bg-white transition-all font-mono"
              />
              <Smartphone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 pl-1">Used for payment confirmations & security</p>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#6D28D9] to-indigo-700 hover:opacity-95 text-white font-extrabold py-3 rounded-2xl shadow-lg shadow-purple-900/25 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-70 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Details...</span>
              </>
            ) : (
              <>
                <span>Save & Secure Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Snooze Option */}
          <button
            type="button"
            onClick={handleSnooze}
            className="w-full py-2 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors text-center cursor-pointer"
          >
            Remind me later
          </button>
        </form>

        {/* Security Footer */}
        <div className="pt-1 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero-KYC Protected • Encrypted Storage</span>
          </div>
        </div>

      </div>
    </div>
  );
};
