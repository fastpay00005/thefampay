import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { signInWithGoogle } from '../services/supabaseClient';
import { User, Mail, Smartphone, Lock, Gift, ArrowRight, Loader2 } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { appName, showToast } = useApp();

  const refCodeFromUrl = searchParams.get('ref') || searchParams.get('invite') || '';

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: refCodeFromUrl,
    agreeTerms: true,
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref') || searchParams.get('invite');
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref.trim() }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      showToast('Please agree to the Terms & Conditions to proceed', 'error');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }
    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);

    // Call Real Brevo Email OTP dispatch API
    const res = await authService.sendOtp(formData.email, formData.fullName, 'REGISTRATION');
    setLoading(false);

    if (res.success) {
      // Store temporary registration state in session
      sessionStorage.setItem('pending_registration', JSON.stringify(formData));
      
      showToast(`Verification code sent to ${formData.email}! Check your email inbox.`, 'success');
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}&type=REGISTRATION`);
    } else {
      showToast(res.message || 'Failed to dispatch verification code', 'error');
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle(formData.referralCode);
    } catch (err) {
      setGoogleLoading(false);
      console.error('Google Sign-Up Error:', err);
      if (err.message?.includes('provider is not enabled')) {
        showToast('Google Sign-In is not enabled yet in Supabase. Please configure it or use Email registration.', 'error');
      } else {
        showToast(err.message || 'Failed to initiate Google Sign-Up', 'error');
      }
    }
  };

  return (
    <div className="min-h-[100dvh] w-full desktop-ambient-bg flex justify-center items-center p-3 sm:py-6 sm:px-4 overflow-y-auto">
      <div className="w-full sm:max-w-[420px] bg-surface-bg flex flex-col justify-center relative sm:rounded-[36px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_12px_#1E1638] border-0 sm:border-2 border-purple-500/20 p-3 sm:p-5 my-auto">
        
        {/* Top Header */}
        <div className="text-center space-y-0.5 mb-2.5 pt-0.5 sm:pt-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#6D28D9] to-indigo-600 mx-auto flex items-center justify-center text-white font-black text-base sm:text-lg shadow-md mb-1">
            FP
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">Create Account</h1>
          <p className="text-[10px] sm:text-[11px] text-slate-500">{appName} Digital Wallet Registration</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-purple-100 shadow-card space-y-2.5">
          {/* Quick Segmented Switcher (Sign In vs Register) */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <Link
              to="/login"
              className="flex-1 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-purple-700 transition-all text-center"
            >
              Sign In
            </Link>
            <button
              type="button"
              className="flex-1 py-1.5 rounded-lg text-xs font-black bg-white text-slate-900 shadow-xs transition-all"
            >
              Register
            </button>
          </div>

          {/* 1-Click Sign up with Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full bg-white hover:bg-slate-50 active:scale-98 border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 text-xs disabled:opacity-60 cursor-pointer"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6D28D9]" />
                <span className="text-slate-600 font-medium">Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 py-0.5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or register manually</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleRegister} className="space-y-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  name="fullName"
                  placeholder="e.g. Aarav Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  name="mobile"
                  placeholder="+91 98765 43210"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <Smartphone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Email Address (For OTP)</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Confirm</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Referral Code (Optional)</label>
              <div className="relative">
                <input
                  type="text"
                  name="referralCode"
                  placeholder="Enter referral code"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase().trim() })}
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#6D28D9] ${
                    formData.referralCode 
                      ? 'bg-purple-50/70 border border-purple-300 text-[#6D28D9]' 
                      : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal'
                  }`}
                />
                <Gift className={`w-3.5 h-3.5 absolute left-3 top-2.5 transition-colors ${
                  formData.referralCode ? 'text-[#6D28D9]' : 'text-slate-400'
                }`} />
              </div>
              {formData.referralCode && (
                <span className="text-[9px] text-purple-700 font-semibold mt-0.5 block pl-1">
                  ✓ Referral code applied
                </span>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-600 font-semibold cursor-pointer">
              <input
                type="checkbox"
                id="terms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-3.5 h-3.5 rounded text-[#6D28D9] focus:ring-[#6D28D9]"
              />
              <label htmlFor="terms" className="cursor-pointer select-none">
                I agree to the <span className="text-[#6D28D9] font-bold">Terms & Conditions</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-gradient-to-r from-[#6D28D9] to-indigo-800 hover:from-[#5B1EB7] hover:to-indigo-900 text-white font-extrabold py-2.5 rounded-xl shadow-lg shadow-purple-900/25 active:scale-98 transition-all flex items-center justify-center gap-1.5 text-xs disabled:opacity-70 cursor-pointer mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching Email OTP...</span>
                </>
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Integrated Immediate Sign In Callout */}
          <div className="pt-1.5 text-center border-t border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium">
              Already registered?{' '}
              <Link to="/login" className="font-black text-[#6D28D9] hover:underline">
                Sign In &rarr;
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
