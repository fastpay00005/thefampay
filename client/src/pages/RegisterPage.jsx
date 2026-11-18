import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { User, Mail, Smartphone, Lock, Gift, ArrowRight, Loader2 } from 'lucide-react';

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

  return (
    <div className="min-h-screen desktop-ambient-bg flex justify-center items-center p-0 sm:py-6 sm:px-4">
      <div className="w-full sm:max-w-[428px] min-h-screen sm:min-h-[880px] sm:max-h-[920px] bg-surface-bg flex flex-col justify-between relative sm:rounded-[40px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_12px_#1E1638] overflow-hidden border-0 sm:border-2 border-purple-500/20 p-6 overflow-y-auto no-scrollbar">
        
        {/* Top Header */}
        <div className="pt-4 text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6D28D9] to-indigo-600 mx-auto flex items-center justify-center text-white font-black text-lg shadow-md mb-1">
            FP
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-500">{appName} Digital Wallet Registration</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-card space-y-3 my-3">
          <form onSubmit={handleRegister} className="space-y-2.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  name="fullName"
                  placeholder="e.g. Aarav Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  name="mobile"
                  placeholder="+91 98765 43210"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address (For OTP)</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Referral Code (Optional)</label>
              <div className="relative">
                <input
                  type="text"
                  name="referralCode"
                  placeholder="Enter referral code (Optional)"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase().trim() })}
                  className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-xs font-mono font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#6D28D9] ${
                    formData.referralCode 
                      ? 'bg-purple-50/70 border border-purple-300 text-[#6D28D9]' 
                      : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal'
                  }`}
                />
                <Gift className={`w-4 h-4 absolute left-3.5 top-3 transition-colors ${
                  formData.referralCode ? 'text-[#6D28D9]' : 'text-slate-400'
                }`} />
              </div>
              {formData.referralCode && (
                <span className="text-[10px] text-purple-700 font-semibold mt-1 block pl-1">
                  ✓ Referral code applied
                </span>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 font-semibold cursor-pointer">
              <input
                type="checkbox"
                id="terms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 rounded text-[#6D28D9] focus:ring-[#6D28D9]"
              />
              <label htmlFor="terms" className="cursor-pointer select-none">
                I agree to the <span className="text-[#6D28D9] font-bold">Terms & Conditions</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6D28D9] to-indigo-800 hover:from-[#5B1EB7] hover:to-indigo-900 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-purple-900/25 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs mt-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Email OTP...</span>
                </>
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="pb-4 text-center">
          <p className="text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-extrabold text-[#6D28D9] hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
