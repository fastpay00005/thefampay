import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appName, loginUser, showToast } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('Please enter both identifier and password', 'error');
      return;
    }

    setLoading(true);
    const res = await authService.login(identifier, password);
    setLoading(false);

    if (res.success && res.user) {
      loginUser(res.user);
      showToast('Signed in successfully to The FamPay!', 'success');
      navigate(from, { replace: true });
    } else {
      showToast(res.message || 'Invalid credentials. Please verify your details.', 'error');
    }
  };

  return (
    <div className="min-h-[100dvh] desktop-ambient-bg flex justify-center items-center p-3 sm:py-6 sm:px-4">
      <div className="w-full sm:max-w-[420px] bg-surface-bg flex flex-col justify-center relative sm:rounded-[40px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_12px_#1E1638] overflow-hidden border-0 sm:border-2 border-purple-500/20 p-4 sm:p-6">
        
        {/* Top Branding Header */}
        <div className="text-center space-y-1 mb-3 sm:mb-4 pt-1 sm:pt-2">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#6D28D9] to-indigo-600 mx-auto flex items-center justify-center shadow-hero text-white font-black text-xl sm:text-2xl tracking-tighter border border-white/20">
            FP
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{appName}</h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Secure Fast Digital Wallet & Exchange</p>
          </div>
        </div>

        {/* Login Form Box with Integrated Tabs & Inline Register Link */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-purple-100 shadow-card space-y-3.5">
          {/* Quick Segmented Switcher (Sign In vs Register) */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              className="flex-1 py-2 rounded-xl text-xs font-black bg-white text-slate-900 shadow-xs transition-all"
            >
              Sign In
            </button>
            <Link
              to="/register"
              className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-purple-700 transition-all text-center"
            >
              Register
            </Link>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">Sign In to Your Account</h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Please authenticate to access your portfolio</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email or Mobile Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="name@thefampay.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 sm:py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 sm:top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-bold text-[#6D28D9] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 sm:py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 sm:top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 sm:top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6D28D9] to-indigo-800 hover:from-[#5B1EB7] hover:to-indigo-900 text-white font-extrabold py-3 sm:py-3.5 rounded-2xl shadow-lg shadow-purple-900/25 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Integrated Immediate Register Callout (Always in-view without scrolling) */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-black text-[#6D28D9] hover:underline">
                Create Account &rarr;
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
