import React, { useState, useEffect } from 'react';

export const SplashScreen = ({ onFinished }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Snappy, cinematic 950ms transition — Seamlessly blooms from the OS splash
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 950);

    const finishTimer = setTimeout(() => {
      if (onFinished) onFinished();
    }, 1300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center select-none will-change-[opacity,transform] overflow-hidden ${
        fading ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundColor: '#0C081C',
        transition: 'opacity 350ms cubic-bezier(0.4, 0, 0.2, 1), transform 350ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Central Seamless Hero Container — Exactly matches Android WebAPK splash icon position & size */}
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Expanding Electric Radar Shockwave */}
        <div 
          className="absolute rounded-full border-2 border-purple-500/50 pointer-events-none"
          style={{
            width: 'min(58vw, 255px)',
            height: 'min(58vw, 255px)',
            animation: 'fampayShockwave 1.1s cubic-bezier(0.1, 0.8, 0.2, 1) infinite',
            willChange: 'transform, opacity'
          }}
        />

        {/* Ambient Electric Aura */}
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 'calc(min(58vw, 255px) * 1.15)',
            height: 'calc(min(58vw, 255px) * 1.15)',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(251, 191, 36, 0.25) 45%, transparent 70%)',
            animation: 'fampayAura 1.3s ease-in-out infinite alternate',
            willChange: 'transform, opacity'
          }}
        />

        {/* EXACT SAME CIRCULAR ICON AS ANDROID OS SPLASH */}
        <div 
          className="relative z-10 flex items-center justify-center"
          style={{
            width: 'min(58vw, 255px)',
            height: 'min(58vw, 255px)',
            animation: 'fampayHeroBreath 1.1s ease-in-out infinite alternate',
            willChange: 'transform'
          }}
        >
          <img 
            src="/icon-512.png" 
            alt="The FamPay" 
            className="w-full h-full object-contain filter drop-shadow-[0_10px_35px_rgba(124,58,237,0.7)]"
            style={{ willChange: 'transform, filter' }}
          />
        </div>

        {/* Brand Typography & Charging Indicator (Smoothly Glides In) */}
        <div 
          className="mt-6 flex flex-col items-center text-center px-4"
          style={{
            animation: 'fampayTextEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
            willChange: 'transform, opacity'
          }}
        >
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_14px_rgba(168,85,247,0.5)]">
            <span className="bg-gradient-to-r from-white via-purple-100 to-amber-200 bg-clip-text text-transparent">
              The FamPay
            </span>
          </h1>

          <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[11px] font-bold text-purple-100 tracking-wide">
              Instant Digital Wallet & VIP Exchange
            </span>
          </div>

          {/* Sleek Laser Charging Indicator Line */}
          <div className="mt-5 w-44 h-1 bg-white/10 rounded-full overflow-hidden relative">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]"
              style={{
                animation: 'fampayLaserCharge 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                willChange: 'width'
              }}
            />
          </div>
        </div>

      </div>

      {/* High-Performance 60fps GPU Compositor Keyframes */}
      <style>{`
        @keyframes fampayShockwave {
          0% {
            transform: scale(0.95);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.45);
            opacity: 0;
          }
        }
        @keyframes fampayAura {
          0% {
            transform: scale(0.95);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.15);
            opacity: 0.85;
          }
        }
        @keyframes fampayHeroBreath {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.05);
          }
        }
        @keyframes fampayTextEnter {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fampayLaserCharge {
          0% {
            width: 0%;
          }
          60% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
