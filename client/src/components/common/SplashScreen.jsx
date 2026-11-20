import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, ShieldCheck, Lock } from 'lucide-react';

export const SplashScreen = ({ minDisplayTime = 1600, onFinished }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Secure Core...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    // Hide initial preloader from index.html if still present
    const preloader = document.getElementById('app-splash-preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      setTimeout(() => {
        try { preloader.remove(); } catch (e) {}
      }, 300);
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(100, Math.floor((elapsed / minDisplayTime) * 100));

      setProgress(rawProgress);

      if (rawProgress < 30) {
        setStatusText('Initializing Secure Core...');
      } else if (rawProgress < 65) {
        setStatusText('Connecting to Encrypted Network...');
      } else if (rawProgress < 90) {
        setStatusText('Synchronizing Wallet Assets...');
      } else {
        setStatusText('Welcome to The FamPay');
      }

      if (elapsed >= minDisplayTime) {
        clearInterval(interval);
        setProgress(100);
        setStatusText('Welcome to The FamPay');

        // Smooth exit fade
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsMounted(false);
            if (onFinished) onFinished();
          }, 450);
        }, 150);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDisplayTime, onFinished]);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-between overflow-hidden bg-[#090715] select-none transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 40%, #1c0e3a 0%, #0c081e 50%, #060410 100%)'
      }}
    >
      {/* Dynamic Ambient Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/25 rounded-full blur-[90px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-amber-500/15 rounded-full blur-[70px] pointer-events-none" />

      {/* Top Spacer */}
      <div className="w-full pt-12 flex justify-center">
        {/* Subtle Brand Tag */}
        <div className="opacity-0 translate-y-2 animate-[fadeIn_0.6s_ease-out_0.2s_forwards] flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-purple-200 uppercase">
            Official Web App
          </span>
        </div>
      </div>

      {/* Center Cinematic Emblem & Identity */}
      <div className="flex flex-col items-center justify-center text-center px-6 relative">
        
        {/* Animated Shockwave Radar Rings */}
        <div className="relative flex items-center justify-center mb-7">
          {/* Ring 1 */}
          <div className="absolute w-36 h-36 rounded-full border border-purple-500/30 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none" />
          {/* Ring 2 */}
          <div className="absolute w-48 h-48 rounded-full border border-purple-400/20 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_0.8s_infinite] pointer-events-none" />
          {/* Ring 3 */}
          <div className="absolute w-60 h-60 rounded-full border border-indigo-400/15 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_1.6s_infinite] pointer-events-none" />

          {/* Glowing Radial Halo */}
          <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600/40 via-amber-400/25 to-indigo-600/40 blur-xl pointer-events-none animate-pulse" />

          {/* Central 3D High-End FamPay Emblem */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-tr from-amber-400 via-purple-500 to-indigo-500 shadow-[0_12px_40px_rgba(109,40,217,0.55)] border border-amber-300/40 animate-[bounceFloat_3s_ease-in-out_infinite]">
            <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-[#7C3AED] via-[#5B1EB7] to-[#2E0854] flex items-center justify-center relative overflow-hidden shadow-inner">
              
              {/* Glass Specular Sheen (Sweeping light reflex) */}
              <div 
                className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full animate-[shimmerSlide_2.2s_infinite]"
              />

              {/* 3D High-Voltage Lightning Bolt */}
              <div className="relative z-10 filter drop-shadow-[0_4px_16px_rgba(251,191,36,0.9)] transform transition-transform hover:scale-110">
                <svg className="w-13 h-13 sm:w-15 sm:h-15 text-amber-300" viewBox="0 0 512 512" fill="none">
                  <path 
                    fill="#FEB804" 
                    d="M69.68,54.04c0,0,28.97-46.41,29.63-47.57c0.66-1.16,0.8-3.29-1.02-3.29c-1.82,0-46.95,46.07-46.95,46.07l-32.05,19c0,0-2.15,1.32-1.82,2.97s1.77,1.72,2.43,1.72s34.85-0.18,36.84-0.24c2.47-0.07,1.86,3.44,1.86,3.44l-21.64,34.02c0,0-9.45,13.08-9.45,13.97c0,1.31,1.58,1.96,3.05,1.08c1.14-0.68,74.84-63.13,78.09-67.42c0.88-1.17,1.33-4.25-2.3-4.25s-32.54,8.42-32.54,8.42L69.68,54.04z"
                    transform="translate(140, 110) scale(2.2)"
                  />
                  <path 
                    fill="#FFC927" 
                    d="M64.61,50.35c-0.89,1.22-1.13,3.26,0.79,3.38c1.91,0.11,40.95-0.18,40.95-0.18S78.46,79.18,70.02,86.83s-36.39,32.43-38.27,34.18c-1.84,1.72-3.51,3.3-4.19,3.08c-0.11-0.03-0.25-0.62,2.38-4.95c2.4-3.95,25.44-42.56,26.34-44.02c0.9-1.46,1.69-2.7,2.14-3.38c0.45-0.68,1.91-4.39-1.13-4.39s-38,0.9-38,0.9s24.15-20.49,31.13-26S96.96,3.18,98.29,3.18S65.51,49.12,64.61,50.35z"
                    transform="translate(140, 110) scale(2.2)"
                  />
                  <path 
                    fill="#FFE567" 
                    d="M63.45,70.75c1.8-2.59,3.57-2.78,4.64-2.14c1.38,0.83,1.52,2.74-0.22,5.05c-2.74,3.66-22.88,30.61-23.65,31.56c-1.46,1.8-3.61,1.01-2.21-1.6C43.18,101.46,61.59,73.43,63.45,70.75z"
                    transform="translate(140, 110) scale(2.2)"
                  />
                </svg>
              </div>

              {/* Glowing Corner VIP Badge */}
              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-purple-950 flex items-center justify-center shadow-md">
                <Sparkles className="w-3 h-3 text-purple-950 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Name with Ambient Glow */}
        <div className="opacity-0 translate-y-3 animate-[fadeIn_0.6s_ease-out_0.25s_forwards]">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_4px_20px_rgba(168,85,247,0.4)]">
            <span className="bg-gradient-to-r from-white via-purple-100 to-amber-200 bg-clip-text text-transparent">
              The FamPay
            </span>
          </h1>

          {/* Subtitle Pill */}
          <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/8 border border-white/15 backdrop-blur-md shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[11px] font-bold text-purple-100 tracking-wide">
              Instant Digital Wallet & VIP Exchange
            </span>
          </div>
        </div>

        {/* Modern Animated Loading Progress Bar */}
        <div className="mt-8 w-60 sm:w-72 flex flex-col items-center">
          {/* Progress Track */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-sm border border-white/10 relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-purple-500 to-indigo-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] transition-all duration-150 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Glowing leading head */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
            </div>
          </div>

          {/* Micro Status Label & Numerical Percentage */}
          <div className="w-full mt-2.5 flex items-center justify-between text-[11px] font-medium text-purple-300/80 px-1">
            <span className="animate-pulse flex items-center gap-1.5 truncate max-w-[190px]">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping inline-block" />
              {statusText}
            </span>
            <span className="font-mono font-bold text-amber-300">
              {progress}%
            </span>
          </div>
        </div>

      </div>

      {/* Footer / Trust Badge */}
      <div className="w-full pb-8 flex flex-col items-center justify-center text-center opacity-0 translate-y-2 animate-[fadeIn_0.6s_ease-out_0.4s_forwards]">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-300/70">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>256-Bit SSL Encrypted</span>
          <span className="text-purple-400/40">•</span>
          <span>Zero-KYC Protected</span>
        </div>
        <p className="mt-1 text-[9px] text-purple-400/40 font-medium tracking-wider uppercase">
          Powered by FamPay Decentralized Network
        </p>
      </div>

      {/* Embedded High-Performance Keyframe Animations */}
      <style>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounceFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.03);
          }
        }
        @keyframes shimmerSlide {
          0% {
            transform: translateX(-150%) skewX(-20deg);
          }
          100% {
            transform: translateX(250%) skewX(-20deg);
          }
        }
      `}</style>
    </div>
  );
};