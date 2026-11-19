import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { Lock, ArrowRight, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useApp();

  const email = searchParams.get('email') || '';
  const otp = searchParams.get('otp') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    const res = await authService.resetPassword(email, otp, newPassword);
    setLoading(false);

    if (res.success) {
      showToast('Password reset successfully! Please sign in with your new password.', 'success');
      navigate('/login');
    } else {
      showToast(res.message || 'Failed to reset password. OTP may be invalid or expired.', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9FE] sm:bg-[#060812] flex justify-center items-center p-0 sm:py-6 sm:px-4">
      <div className="w-full sm:max-w-[428px] min-h-screen sm:min-h-[880px] sm:max-h-[920px] bg-surface-bg flex flex-col justify-between relative sm:rounded-[40px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_12px_#1E1638] overflow-hidden border-0 sm:border-2 border-purple-500/20 p-6">
        
        {/* Top Header */}
        <div className="pt-8 text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-100 mx-auto flex items-center justify-center text-[#6D28D9] shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Set New Password</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-[80%] mx-auto font-medium">
              Create a new secure password for <strong className="text-slate-800">{email}</strong>
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-card space-y-4 my-auto">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6D28D9] to-indigo-800 hover:from-[#5B1EB7] hover:to-indigo-900 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-purple-900/25 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save Password & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="pb-4 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D28D9] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

