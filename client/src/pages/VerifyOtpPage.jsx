import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { ShieldCheck, ArrowRight, RotateCw, Loader2, Mail } from 'lucide-react';

export const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser, showToast } = useApp();

  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || 'REGISTRATION';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (val, index) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const enteredCode = otp.join('');
    if (enteredCode.length < 6) {
      showToast('Please enter the complete 6-digit code', 'error');
      return;
    }

    setLoading(true);

    if (type === 'REGISTRATION') {
      const pendingRaw = sessionStorage.getItem('pending_registration');
      const pending = pendingRaw ? JSON.parse(pendingRaw) : null;

      if (!pending) {
        setLoading(false);
        showToast('Registration session expired. Please register again.', 'error');
        navigate('/register');
        return;
      }

      const res = await authService.register({
        ...pending,
        otp: enteredCode,
      });

      setLoading(false);

      if (res.success) {
        sessionStorage.removeItem('pending_registration');
        loginUser(res.user);
        showToast('Account verified and registered successfully!', 'success');
        navigate('/');
      } else {
        showToast(res.message || 'OTP verification failed', 'error');
      }
    } else if (type === 'FORGOT_PASSWORD') {
      const res = await authService.verifyOtp(email, enteredCode);
      setLoading(false);

      if (res.success) {
        showToast('Code verified! Set your new password.', 'success');
        navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(enteredCode)}`);
      } else {
        showToast(res.message || 'Incorrect verification code', 'error');
      }
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);

    const res = await authService.sendOtp(email, '', type);
    if (res.success) {
      showToast(`Fresh verification code sent to ${email}`, 'success');
    } else {
      showToast(res.message || 'Failed to resend code', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9FE] sm:bg-[#060812] flex justify-center items-center p-0 sm:py-6 sm:px-4">
      <div className="w-full sm:max-w-[428px] min-h-screen sm:min-h-[880px] sm:max-h-[920px] bg-surface-bg flex flex-col justify-between relative sm:rounded-[40px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_12px_#1E1638] overflow-hidden border-0 sm:border-2 border-purple-500/20 p-6">
        
        {/* Top Header */}
        <div className="pt-8 text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-100 mx-auto flex items-center justify-center text-[#6D28D9] shadow-sm">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verify Email</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-[85%] mx-auto font-medium">
              We sent a real 6-digit verification code to <strong className="text-slate-800">{email || 'your email'}</strong>
            </p>
          </div>
        </div>

        {/* OTP Input Fields */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-card space-y-4 my-auto">
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="flex justify-between gap-1.5">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-11 h-14 text-center text-xl font-black bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:bg-white transition-all shadow-inner"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 font-medium">
                {timer > 0 ? `Resend in ${timer}s` : 'Did not receive code?'}
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className={`font-bold flex items-center gap-1 ${
                  canResend ? 'text-[#6D28D9] hover:underline' : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                <RotateCw className="w-3 h-3" />
                <span>Resend Code</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6D28D9] to-indigo-800 hover:from-[#5B1EB7] hover:to-indigo-900 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-purple-900/25 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Code & Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="pb-4 text-center text-[11px] text-slate-400 font-medium">
          The FamPay Real Transactional Email Verification
        </div>

      </div>
    </div>
  );
};
