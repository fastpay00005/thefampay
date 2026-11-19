import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { signInWithGoogle } from '../services/supabaseClient';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Sparkles } from 'lucide-react';

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

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appName, loginUser, showToast } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
      showToast(`Welcome back to ${appName}!`, 'success');
      navigate(from, { replace: true });
    } else {
      showToast(res.message || 'Invalid credentials. Please verify your details.', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setGoogleLoading(false);
      console.error('Google Sign-In Error:', err);
      if (err.message?.includes('provider is not enabled')) {
        showToast('Google Sign-In is not enabled yet in Supabase. Please configure it or use Email/Password.', 'error');
      } else {
        showToast(err.message || 'Failed to initiate Google Sign-In', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9FE] sm:bg-[#060812] flex justify-center items-center p-0 sm:py-6 sm:px-4 select-none">
      {/* Centered Mobile Device Frame (Edge-to-edge on mobile, sleek frame on desktop) */}
      <div className="w-full sm:max-w-[430px] min-h-screen sm:min-h-0 sm:max-h-[92vh] bg-[#FAF9FE] flex flex-col justify-between relative sm:rounded-[36px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_12px_#1E1638] sm:border-2 sm:border-purple-500/20 overflow-y-auto no-scrollbar">
        
        {/* Top Hero Branded Header (Separated from top edge with rounded corners) */}
        <div className="pt-3.5 sm:pt-4 px-3 sm:px-4 shrink-0">
          <div className="relative bg-gradient-to-br from-[#5B1EB7] via-[#6D28D9] to-[#3B0764] text-white pt-6 pb-5 px-5 rounded-[28px] sm:rounded-[32px] shadow-lg shadow-purple-950/20 overflow-hidden border border-purple-400/20">
            {/* Ambient Lighting Orbs */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* The FamPay Official Logo Icon */}
              <img 
                src="/favicon.svg" 
                onError={(e) => { e.currentTarget.src = '/apple-touch-icon.png'; }}
                alt="The FamPay Logo" 
                style={{ width: '46px', height: '46px', maxWidth: '46px', maxHeight: '46px' }}
                className="w-11 h-11 max-w-[46px] max-h-[46px] rounded-2xl shadow-hero mb-2 object-contain border border-white/20 p-0.5 bg-purple-900/40 shrink-0" 
              />
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                {appName}
              </h1>
              <p className="text-xs text-purple-200/90 font-medium mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Instant Digital Wallet & Token Exchange</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form Body Area */}
        <div className="px-5 sm:px-6 py-4 flex-1 flex flex-col justify-center space-y-3.5">
          
          {/* Segmented Switcher (Sign In vs Register) */}
          <div className="flex bg-slate-200/80 p-1 rounded-2xl">
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

          <div className="text-left pt-0.5">
            <h2 className="text-base font-extrabold text-slate-900">Welcome Back</h2>
            <p className="text-xs text-slate-500">Sign in to access your wallet & trading dashboard</p>
          </div>

          {/* 1-Click Sign In with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full bg-white hover:bg-slate-50 active:scale-98 border border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2.5 text-xs disabled:opacity-60 cursor-pointer"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#6D28D9]" />
                <span className="text-slate-600 font-semibold">Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-0.5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or sign in with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Email or Mobile Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="name@thefampay.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 sm:py-3 text-xs font-semibold text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 sm:top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-slate-700">Password</label>
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
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 sm:py-3 text-xs font-semibold text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent transition-all"
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
              disabled={loading || googleLoading}
              className="w-full bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-indigo-700 hover:opacity-95 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-purple-900/25 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-70 cursor-pointer mt-1"
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

          {/* Quick Register Link */}
          <div className="pt-1 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-black text-[#6D28D9] hover:underline">
                Create Account &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="px-6 pb-6 pt-2 text-center shrink-0">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-Bit SSL Encrypted • Zero-KYC Protected</span>
          </div>
        </div>

      </div>
    </div>
  );
};
