import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { Mail, ArrowLeft, ArrowRight, KeyRound, Loader2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter your registered email address', 'error');
      return;
    }

    setLoading(true);
    const res = await authService.sendOtp(email, '', 'FORGOT_PASSWORD');
    setLoading(false);

    if (res.success) {
      showToast(`Password reset code sent to ${email}. Check your email inbox.`, 'success');
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&type=FORGOT_PASSWORD`);
    } else {
      showToast(res.message || 'Email not found or service error', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9FE] sm:bg-[#060812] flex justify-center items-center p-0 sm:py-6 sm:px-4">
      <div className="w-full sm:max-w-[428px] min-h-screen sm:min-h-[880px] sm:max-h-[920px] bg-surface-bg flex flex-col justify-between relative sm:rounded-[40px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_12px_#1E1638] overflow-hidden border-0 sm:border-2 border-purple-500/20 p-6">
        
        {/* Top Header */}
        <div className="pt-8 text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-100 mx-auto flex items-center justify-center text-[#6D28D9] shadow-sm">
            <KeyRound className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Recover Password</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-[80%] mx-auto font-medium">
              Enter your registered email address to receive an official 6-digit password reset code via Brevo.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-card space-y-4 my-auto">
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Registered Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@thefampay.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
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
                  <span>Dispatching Reset Code...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
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
