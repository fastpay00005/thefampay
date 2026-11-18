import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Loader2, Zap, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide administrative email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.login(email.trim(), password);
      setLoading(false);

      if (res.success && res.user && res.user.role === 'ADMIN') {
        const token = res.token || `admin_token_${Date.now()}`;
        localStorage.setItem('fampay_admin_token', token);
        localStorage.setItem('fampay_token', token);
        localStorage.setItem('fampay_admin_user', JSON.stringify(res.user));
        navigate('/admin');
      } else if (res.success && res.user && res.user.role !== 'ADMIN') {
        setError('Access Denied: Account does not possess administrative privileges.');
      } else {
        setError(res.message || 'Invalid Administrative Credentials. Access Restricted.');
      }
    } catch {
      setLoading(false);
      setError('Administrative authentication server unreachable. Make sure the backend server is running.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080E1E] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#0D1527] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        
        {/* Brand Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
          <Zap className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">The FamPay Admin</h1>
          <p className="text-xs text-slate-400 mt-1">Authorized Management Portal</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@thefampay.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Security Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white absolute right-3 top-3"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Authenticate Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-slate-500 font-medium">
          The FamPay Super Admin Console • Real-time database controls
        </p>

      </div>
    </div>
  );
};
