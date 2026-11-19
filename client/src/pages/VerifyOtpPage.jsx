import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { ShieldCheck, ArrowRight, RotateCw, Loader2, Mail, Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';

export const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser, showToast, appName } = useApp();

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

  // Handle Full Clipboard Paste (e.g. "678934" pasted into any box)
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData ? e.clipboardData.getData('text') : '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    const newOtp = ['', '', '', '', '', ''];
    for (let i = 0; i < digits.length; i++) {
      newOtp[i] = digits[i];
    }
    setOtp(newOtp);

    // Focus the box following the last pasted digit (or last box)
    const focusIndex = Math.min(digits.length, 5);
    const targetInput = document.getElementById(`otp-input-${focusIndex}`);
    if (targetInput) {
      targetInput.focus();
      targetInput.select();
    }
  };

  // Handle Input Changes & Mobile Keyboard Autofill
  const handleChange = (e, index) => {
    const val = e.target.value;
    const digits = val.replace(/\D/g, '');

    // If multiple digits were input (mobile SMS/Email autofill)
    if (digits.length > 1) {
      const newOtp = [...otp];
      const slice = digits.slice(0, 6);
      for (let i = 0; i < slice.length; i++) {
        newOtp[i] = slice[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(slice.length, 5);
      const nextInput = document.getElementById(`otp-input-${focusIndex}`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
      return;
    }

    const singleDigit = digits.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = singleDigit;
    setOtp(newOtp);

    // Auto-advance to next input
    if (singleDigit && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) prevInput.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
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
    <div className="min-h-screen w-full bg-[#FAF9FE] sm:bg-[#060812] flex justify-center items-center p-0 sm:py-6 sm:px-4 select-none">
      {/* Centered Mobile Device Frame (Edge-to-edge on mobile, sleek frame on desktop) */}
      <div className="w-full sm:max-w-[430px] min-h-screen sm:min-h-0 sm:max-h-[92vh] bg-[#FAF9FE] flex flex-col justify-between relative sm:rounded-[36px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_12px_#1E1638] sm:border-2 sm:border-purple-500/20 overflow-y-auto no-scrollbar">
        
        {/* Top Hero Branded Header - Full Bleed Seamless Curved Luxury Design */}
        <div className="relative bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#2E0854] text-white pt-10 sm:pt-12 pb-7 px-6 rounded-b-[36px] sm:rounded-b-[40px] shadow-xl shadow-purple-950/30 overflow-hidden border-b border-purple-400/25 shrink-0">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-400/25 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* 3D Animated Floating Brand Emblem */}
            <div className="relative mb-2.5 flex items-center justify-center">
              <div className="absolute w-20 h-20 bg-amber-400/20 rounded-full blur-xl animate-pulse pointer-events-none" />
              
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-500 p-0.5 shadow-[0_10px_25px_rgba(245,158,11,0.4)] border border-amber-200/50 hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-purple-950 via-[#5B1EB7] to-[#2E0854] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/35 via-transparent to-transparent pointer-events-none" />
                  <ShieldCheck className="w-7 h-7 text-amber-300 drop-shadow-[0_2px_10px_rgba(251,191,36,0.9)] animate-pulse" />
                </div>

                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-purple-900 flex items-center justify-center shadow-md">
                  <Sparkles className="w-3 h-3 text-purple-950 animate-spin" />
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Verify Security Code
            </h1>
            
            <div className="mt-2 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1 rounded-full shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-[11px] font-bold text-purple-100 tracking-wide">
                256-Bit SSL Secured Verification
              </span>
            </div>
          </div>
        </div>

        {/* Form Body Area */}
        <div className="px-5 sm:px-6 py-4 flex-1 flex flex-col justify-center space-y-4">
          
          <div className="text-center">
            <p className="text-xs text-slate-500">
              Code sent to <strong className="text-slate-800 break-all">{email || 'your email'}</strong>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            {/* 6 Digit Inputs with 1-Click Paste & Auto-Advance */}
            <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={digit}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-black bg-white border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent transition-all shadow-xs"
                />
              ))}
            </div>

            {/* Spam Folder Advisory Note */}
            <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-3 text-left text-[11px] text-amber-900 flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <strong>Not in Primary inbox?</strong> Check your <strong>Spam</strong> or <strong>Promotions</strong> folder and mark as <em>"Not Spam"</em>.
              </div>
            </div>

            {/* Resend Timer */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <span className="text-slate-400 font-medium">
                {timer > 0 ? `Resend code in ${timer}s` : 'Did not receive code?'}
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className={`font-bold flex items-center gap-1.5 transition-colors ${
                  canResend ? 'text-[#6D28D9] hover:underline cursor-pointer' : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${!canResend ? '' : 'hover:rotate-180 transition-transform'}`} />
                <span>Resend Code</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-indigo-700 hover:opacity-95 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-purple-900/25 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-70 cursor-pointer"
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

          {/* Back link */}
          <div className="pt-2 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Registration</span>
            </Link>
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
