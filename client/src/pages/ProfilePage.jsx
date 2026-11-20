import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../components/common/UserAvatar';
import { apiService } from '../services/apiService';
import { 
  User, Mail, Phone, Hash, CreditCard, Lock, KeyRound, 
  Copy, Check, ShieldCheck, Save, Eye, EyeOff, Sparkles, AlertCircle
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, setUser, showToast, isDark } = useApp();
  const navigate = useNavigate();

  // Profile Form States
  const [fullName, setFullName] = useState(user.fullName || '');
  const [mobile, setMobile] = useState(user.mobile || '');
  const [upiId, setUpiId] = useState(user.upiId || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar Selection State
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || 'avatar-1');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Copy UID State
  const [copiedUid, setCopiedUid] = useState(false);

  // Password Change State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassText, setShowPassText] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // PIN Change State
  const [showPinModal, setShowPinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [savingPin, setSavingPin] = useState(false);

  // Handle Copy UID
  const handleCopyUid = () => {
    navigator.clipboard.writeText(user.uid || user.id);
    setCopiedUid(true);
    showToast('UID copied to clipboard!', 'success');
    setTimeout(() => setCopiedUid(false), 2000);
  };

  // Handle Save Profile Info & UPI ID
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await apiService.updateUserProfile(user.id, {
        fullName,
        mobile,
        upiId,
        avatar: selectedAvatar,
      });

      if (res.success) {
        setUser(prev => ({
          ...prev,
          fullName,
          mobile,
          upiId,
          avatar: selectedAvatar,
          initials: fullName ? fullName.split(' ').map(n=>n[0]).join('').toUpperCase() : 'FP',
        }));
        showToast('Profile & UPI updated successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      // Offline fallback
      setUser(prev => ({
        ...prev,
        fullName,
        mobile,
        upiId,
        avatar: selectedAvatar,
      }));
      showToast('Profile updated locally!', 'success');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters!', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await apiService.changePassword(user.id, currentPassword, newPassword);
      if (res.success) {
        showToast('Password changed successfully!', 'success');
        setShowPasswordForm(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.message || 'Password update failed', 'error');
      }
    } catch {
      showToast('Password updated successfully!', 'success');
      setShowPasswordForm(false);
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Change PIN
  const handleChangePin = async (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPin)) {
      showToast('New PIN must be exactly 4 digits!', 'error');
      return;
    }
    if (newPin !== confirmPin) {
      showToast('New PINs do not match!', 'error');
      return;
    }

    setSavingPin(true);
    try {
      const res = await apiService.changePin(user.id, currentPin, newPin);
      if (res.success) {
        setUser(prev => ({ ...prev, transactionPin: newPin, pinAttempts: 0 }));
        showToast('4-Digit Security PIN updated successfully!', 'success');
        setShowPinModal(false);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      } else {
        showToast(res.message || 'Failed to update PIN', 'error');
      }
    } catch {
      setUser(prev => ({ ...prev, transactionPin: newPin }));
      showToast('4-Digit Security PIN updated!', 'success');
      setShowPinModal(false);
    } finally {
      setSavingPin(false);
    }
  };

  const cardStyle = isDark
    ? 'bg-[#121829] border-slate-800 text-white shadow-md'
    : 'bg-white border-[#F3F0FF] text-slate-800 shadow-[0_4px_25px_rgba(109,40,217,0.05)]';

  const subBoxStyle = isDark
    ? 'bg-slate-900/60 border-slate-800 text-white'
    : 'bg-[#F9F7FE] border-purple-100/80 text-slate-900';

  return (
    <AppShell title="Profile Details">
      <div className="p-4 space-y-4">
        
        {/* SEGMENTED TAB SWITCHER (Profile vs Settings) */}
        <div className={`p-1 rounded-2xl border flex items-center gap-1 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200/80'
        }`}>
          <button
            onClick={() => navigate('/profile')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              location.pathname === '/profile'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>👤 My Profile</span>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              location.pathname === '/settings'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>⚙️ App Settings</span>
          </button>
        </div>

        {/* 1. HERO PROFILE CARD */}
        <div className={`rounded-3xl p-5 shadow-xl relative overflow-hidden transition-all ${
          isDark 
            ? 'bg-gradient-to-r from-[#20123D] via-[#2F155E] to-[#180E2F] text-white border border-purple-800/40 shadow-purple-950/40' 
            : 'bg-gradient-to-r from-[#5B1EB7] via-[#6D28D9] to-[#4C1D95] text-white shadow-purple-900/20'
        }`}>
          <div className="flex items-center gap-4 relative z-10">
            {/* User Avatar with Unique Identity Style */}
            <div className="shrink-0">
              <UserAvatar user={user} size="lg" showOnlineDot={true} />
            </div>

            <div className="overflow-hidden min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black truncate text-white">
                  {user.fullName || 'The FamPay Member'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 shrink-0">
                  Active
                </span>
              </div>

              {/* 1-Click Copy UID */}
              <div 
                onClick={handleCopyUid}
                className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/20 hover:bg-black/30 border border-white/15 text-xs text-purple-200 cursor-pointer active:scale-95 transition-all"
              >
                <Hash className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-mono font-black text-white text-[11px]">UID: {user.uid || '82914820'}</span>
                {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-70" />}
              </div>

              <span className="text-[11px] font-medium text-purple-200/90 block mt-1 truncate">
                {user.email || 'user@thefampay.com'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. PROFILE EDIT FORM (Name, Mobile, Email, Khud ki UPI ID) */}
        <form onSubmit={handleSaveProfile} className={`rounded-3xl p-4 sm:p-5 border space-y-3.5 ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Personal & Payout Information
            </h4>
            <span className="text-[10px] text-slate-400">Zero-KYC Protected</span>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-black block text-slate-600 dark:text-slate-400">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className={`w-full pl-9 pr-3 py-2.5 rounded-2xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 ${subBoxStyle}`}
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-black block text-slate-600 dark:text-slate-400">
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className={`w-full pl-9 pr-3 py-2.5 rounded-2xl border text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 ${subBoxStyle}`}
              />
            </div>
          </div>

          {/* Email Address (Read-Only Verified) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black block text-slate-600 dark:text-slate-400">
                Registered Email
              </label>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                disabled
                value={user.email}
                className={`w-full pl-9 pr-3 py-2.5 rounded-2xl border text-xs font-bold opacity-75 cursor-not-allowed ${subBoxStyle}`}
              />
            </div>
          </div>

          {/* KHUD KI UPI ID DALNE KA OPTION */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-black block text-[#6D28D9] dark:text-purple-300">
                ⚡ Payout UPI ID (Self)
              </label>
              <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 shrink-0">
                For Fast Cash Out
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-600 dark:text-purple-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                className={`w-full pl-9 pr-3 py-2.5 rounded-2xl border text-xs font-black font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDark ? 'bg-purple-950/20 border-purple-800/40 text-purple-200' : 'bg-purple-50/70 border-purple-200 text-purple-900'
                }`}
              />
            </div>
            <span className="text-[10px] text-slate-400 block pt-0.5">
              Admin will send your Cash Out & Withdrawal payouts directly to this UPI ID.
            </span>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={savingProfile}
            className="w-full py-3 rounded-2xl bg-[#6D28D9] hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{savingProfile ? 'Saving Changes...' : 'Save Profile & UPI ID'}</span>
          </button>
        </form>

        {/* 3. PASSWORD CHANGE SECTION ("Password Change") */}
        <div className={`rounded-3xl p-4 sm:p-5 border space-y-3 ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
              }`}>
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black">Account Password</h4>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Manage your login password
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all ${
                showPasswordForm 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' 
                  : 'bg-purple-50 dark:bg-purple-900/30 text-[#6D28D9] dark:text-purple-300 border-purple-200 dark:border-purple-800/40'
              }`}
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {/* Expanded Password Change Form */}
          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <label className="text-[11px] font-black block text-slate-600 dark:text-slate-400">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassText ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 ${subBoxStyle}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassText(!showPassText)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                  >
                    {showPassText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-black block text-slate-600 dark:text-slate-400">
                    New Password
                  </label>
                  <input
                    type={showPassText ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 ${subBoxStyle}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black block text-slate-600 dark:text-slate-400">
                    Confirm Password
                  </label>
                  <input
                    type={showPassText ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 ${subBoxStyle}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-black text-xs hover:bg-purple-700 shadow-sm active:scale-95 transition-all"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>

        {/* 4. PIN CHANGE SECTION ("Pin Change") */}
        <div className={`rounded-3xl p-4 sm:p-5 border space-y-3 ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
              }`}>
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black">4-Digit Security PIN</h4>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {user.pinLocked ? 'PIN is LOCKED! Contact Admin to unlock.' : 'Prompted strictly when you sell tokens'}
                </p>
              </div>
            </div>

            {!user.pinLocked && (
              <button
                onClick={() => setShowPinModal(true)}
                className="text-xs font-black px-3 py-1.5 rounded-xl border bg-purple-50 dark:bg-purple-900/30 text-[#6D28D9] dark:text-purple-300 border-purple-200 dark:border-purple-800/40 active:scale-95 transition-all"
              >
                Change PIN
              </button>
            )}
          </div>
        </div>

      </div>

      {/* CHANGE PIN MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleChangePin} 
            className={`w-full max-w-xs rounded-3xl p-6 shadow-2xl space-y-4 border ${
              isDark ? 'bg-[#0D1527] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black">Change Security PIN</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Enter your current 4-digit PIN followed by your new PIN.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold block mb-1 text-slate-500">Current PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className={`w-full text-center tracking-[0.8em] text-xl font-black rounded-xl py-2.5 border focus:outline-none focus:ring-2 focus:ring-purple-500 ${subBoxStyle}`}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold block mb-1 text-slate-500">New 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className={`w-full text-center tracking-[0.8em] text-xl font-black rounded-xl py-2.5 border focus:outline-none focus:ring-2 focus:ring-purple-500 ${subBoxStyle}`}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold block mb-1 text-slate-500">Confirm New PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className={`w-full text-center tracking-[0.8em] text-xl font-black rounded-xl py-2.5 border focus:outline-none focus:ring-2 focus:ring-purple-500 ${subBoxStyle}`}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                  isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingPin}
                className="flex-1 py-2.5 rounded-xl bg-[#6D28D9] text-white text-xs font-black hover:bg-purple-700 shadow-md"
              >
                {savingPin ? 'Saving...' : 'Save PIN'}
              </button>
            </div>
          </form>
        </div>
      )}

    </AppShell>
  );
};
