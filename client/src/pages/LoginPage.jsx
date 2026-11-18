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
    <div className="min-h-screen desktop-ambient-bg flex justify-center items-center p-0 sm:py-6 sm:px-4">
      <div className="w-full sm:max-w-[428px] min-h-screen sm:min-h-[880px] sm:max-h-[920px] bg-surface-bg flex flex-col justify-between relative sm:rounded-[40px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_12px_#1E1638] overflow-hidden border-0 sm:border-2 border-purple-500/20 p-6">
        
        {/* Top Branding Header */}
        <div className="pt-8 text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#6D28D9] to-indigo-600 mx-auto flex items-center justify-center shadow-hero text-white font-black text-2xl tracking-tighter border border-white/20">
            FP
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{appName}</h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Secure Fast Digital Wallet & Exchange</p>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-card space-y-4 my-auto">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Sign In</h2>
            <p className="text-xs text-slate-400 mt-0.5">Please authenticate to access your portfolio</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email or Mobile Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="name@thefampay.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
        </div>

        {/* Footer Link to Register */}
        <div className="pb-4 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-extrabold text-[#6D28D9] hover:underline">
              Create Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
