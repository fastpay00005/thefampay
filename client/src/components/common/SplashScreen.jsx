import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Lock } from 'lucide-react';

export const SplashScreen = ({ onFinished }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Single timer for fade out — 0% CPU overhead, 0 re-render churn
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1300);

    const finishTimer = setTimeout(() => {
      if (onFinished) onFinished();
    }, 1650);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-between overflow-hidden select-none will-change-[opacity,transform] ${
        fading ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 35%, #1d1038 0%, #0d081f 55%, #070512 100%)',
        transition: 'opacity 350ms ease-out, transform 350ms ease-out'
      }}
    >
      {/* Lightweight Soft Ambient Glow (Pure CSS gradient, ZERO heavy blur filter for 60fps) */}
      <div 
        className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(217, 119, 6, 0.12) 40%, transparent 70%)'
        }}
      />

      {/* Top Spacer / Security Tag */}
      <div className="w-full pt-10 flex justify-center">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-purple-200 uppercase">
            Official Web App
          </span>
        </div>
      </div>

      {/* Center Hero Emblem & Identity */}
      <div className="flex flex-col items-center justify-center text-center px-6 relative">
        
        {/* Radar Ring & Emblem Container */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Subtle GPU-Accelerated Radar Shockwave */}
          <div 
            className="absolute w-28 h-28 rounded-full border border-purple-400/40 pointer-events-none"
            style={{
              animation: 'splashPulse 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
              willChange: 'transform, opacity'
            }}
          />

          {/* FamPay 3D Emblem */}
          <div 
            className="relative w-24 h-24 rounded-3xl p-1 bg-gradient-to-tr from-amber-400 via-purple-500 to-indigo-500 shadow-[0_8px_30px_rgba(109,40,217,0.5)] border border-amber-300/40"
            style={{
              animation: 'splashFloat 2.8s ease-in-out infinite',
              willChange: 'transform'
            }}
          >
            <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-[#7C3AED] via-[#5B1EB7] to-[#2E0854] flex items-center justify-center relative overflow-hidden shadow-inner">
              
              {/* Specular Diagonal Light Sweep */}
              <div 
                className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{
                  animation: 'splashSheen 2.4s ease-in-out infinite',
                  willChange: 'transform'
                }}
              />

              {/* 3D High-Voltage Lightning Bolt */}
              <div className="relative z-10 filter drop-shadow-[0_2px_10px_rgba(251,191,36,0.85)]">
                <svg className="w-13 h-13 text-amber-300" viewBox="0 0 512 512" fill="none">
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

              {/* VIP Star Pin */}
              <div className="absolute top-1.5 right-1.5 w-4.5 h-4.5 rounded-full bg-amber-400 border border-purple-950 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-purple-950" />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(168,85,247,0.4)]">
            <span className="bg-gradient-to-r from-white via-purple-100 to-amber-200 bg-clip-text text-transparent">
              The FamPay
            </span>
          </h1>

          {/* Subtitle Pill */}
          <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-0.5 rounded-full bg-white/8 border border-white/15">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[11px] font-bold text-purple-100 tracking-wide">
              Instant Digital Wallet & VIP Exchange
            </span>
          </div>
        </div>

        {/* GPU-Driven Continuous Progress Bar (ZERO JS CPU usage) */}
        <div className="mt-7 w-60 sm:w-64 flex flex-col items-center">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-purple-500 to-indigo-400 shadow-[0_0_10px_rgba(245,158,11,0.7)]"
              style={{
                animation: 'splashProgress 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                willChange: 'width'
              }}
            />
          </div>

          <div className="mt-2 text-[10px] font-semibold text-purple-300/70 tracking-wider uppercase">
            Securing Connection...
          </div>
        </div>

      </div>

      {/* Footer / Trust Badge */}
      <div className="w-full pb-8 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-300/70">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>256-Bit SSL Encrypted</span>
          <span className="text-purple-400/40">•</span>
          <span>Zero-KYC Protected</span>
        </div>
      </div>

      {/* Embedded High-Performance Lightweight Hardware-Accelerated Keyframes */}
      <style>{`
        @keyframes splashPulse {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @keyframes splashFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes splashSheen {
          0% {
            transform: translateX(-150%) skewX(-20deg);
          }
          100% {
            transform: translateX(250%) skewX(-20deg);
          }
        }
        @keyframes splashProgress {
          0% {
            width: 0%;
          }
          40% {
            width: 55%;
          }
          80% {
            width: 88%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
