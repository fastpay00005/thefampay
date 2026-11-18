import React from 'react';

/**
 * Official Google Noto Emoji Suite for The FamPay
 * Using Google's authentic, ultra-sharp high-resolution Noto Emoji assets
 */

// 1. Google Noto Emoji: Buy Token (⚡ High Voltage Lightning)
export const ActionBuy3D = ({ className = "w-8 h-8" }) => (
  <img 
    src="/noto-emoji/lightning.svg" 
    alt="Buy Token" 
    className={`${className} object-contain select-none pointer-events-none drop-shadow-sm`} 
    loading="eager"
  />
);

// 2. Google Noto Emoji: Sell Token (🔄 Counterclockwise Exchange Arrows)
export const ActionSell3D = ({ className = "w-8 h-8" }) => (
  <img 
    src="/noto-emoji/exchange.svg" 
    alt="Sell Token" 
    className={`${className} object-contain select-none pointer-events-none drop-shadow-sm`} 
    loading="eager"
  />
);

// 3. Google Noto Emoji: Deposit (📥 Inflow Inbox Tray)
export const ActionDeposit3D = ({ className = "w-8 h-8" }) => (
  <img 
    src="/noto-emoji/deposit.svg" 
    alt="Deposit" 
    className={`${className} object-contain select-none pointer-events-none drop-shadow-sm`} 
    loading="eager"
  />
);

// 4. Google Noto Emoji: Withdraw (📤 Outflow Outbox Tray)
export const ActionWithdraw3D = ({ className = "w-8 h-8" }) => (
  <img 
    src="/noto-emoji/withdraw.svg" 
    alt="Withdraw" 
    className={`${className} object-contain select-none pointer-events-none drop-shadow-sm`} 
    loading="eager"
  />
);

// 5. Google Noto Emoji: Money Bag (💰 Total Deposits & Balances)
export const MoneyBag3D = ({ className = "w-10 h-10", size }) => (
  <img 
    src="/noto-emoji/money-bag.svg" 
    alt="Total Deposits" 
    className={`${className} object-contain select-none pointer-events-none drop-shadow-sm`} 
    style={size ? { width: size, height: size } : {}}
    loading="eager"
  />
);

// 6. Google Noto Emoji: Growth Chart (📈 Total Earnings)
export const ChartTrend3D = ({ className = "w-10 h-10" }) => (
  <img 
    src="/noto-emoji/chart-up.svg" 
    alt="Total Earnings" 
    className={`${className} object-contain select-none pointer-events-none drop-shadow-sm`} 
    loading="eager"
  />
);

// 7. Google Noto Emoji: Gift Box (🎁 Bonus & Rewards)
export const GiftBox3D = ({ className = "w-6 h-6" }) => (
  <img 
    src="/noto-emoji/gift.svg" 
    alt="Gift" 
    className={`${className} object-contain select-none pointer-events-none drop-shadow-xs`} 
    loading="eager"
  />
);

// 8. Google Noto Emoji: Security Shield (🛡️ Security & Account Alerts)
export const SecurityShield3D = ({ className = "w-6 h-6" }) => (
  <img 
    src="/noto-emoji/shield.svg" 
    alt="Security Shield" 
    className={`${className} object-contain select-none pointer-events-none drop-shadow-xs`} 
    loading="eager"
  />
);

// 9. Google Noto Emoji: Sparkles (✨ General / System)
export const Sparkles3D = ({ className = "w-6 h-6" }) => (
  <img 
    src="/noto-emoji/sparkles.svg" 
    alt="Sparkles" 
    className={`${className} object-contain select-none pointer-events-none drop-shadow-xs`} 
    loading="eager"
  />
);

// 10. 3D Sun Icon (Light Mode Toggle in Settings)
export const ThemeSun3D = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="sunCore" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="40%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </radialGradient>
    </defs>
    <circle cx="24" cy="24" r="11" fill="url(#sunCore)" />
    <ellipse cx="21" cy="19" rx="5" ry="3" fill="white" fillOpacity="0.5" transform="rotate(-20 21 19)" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <rect 
        key={angle}
        x="22" 
        y="4" 
        width="4" 
        height="6" 
        rx="2" 
        fill="#F59E0B" 
        transform={`rotate(${angle} 24 24)`}
      />
    ))}
  </svg>
);

// 11. 3D Moon Icon (Dark Mode Toggle in Settings)
export const ThemeMoon3D = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="moonGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#E0E7FF" />
        <stop offset="45%" stopColor="#818CF8" />
        <stop offset="85%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#312E81" />
      </radialGradient>
    </defs>
    <path 
      d="M34 26C33 34 26 40 18 40C12 40 7 36 5 31C8 32 11 32 14 31C23 28 29 19 26 10C25 8 23 6 21 5C28 6 35 14 34 26Z" 
      fill="url(#moonGrad)" 
    />
    <circle cx="36" cy="12" r="2.5" fill="#FDE047" />
    <circle cx="41" cy="22" r="1.5" fill="#FDE047" />
    <circle cx="14" cy="12" r="1.5" fill="#FDE047" />
  </svg>
);

// 12. 3D Lucky Spin Wheel
export const SpinWheel3D = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="wheelRim" cx="30%" cy="25%" r="75%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#854D0E" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#wheelRim)" />
    <circle cx="32" cy="32" r="23" fill="#BE123C" />
    <path d="M32 32L32 9A23 23 0 0 1 55 32Z" fill="#E11D48" />
    <path d="M32 32L55 32A23 23 0 0 1 32 55Z" fill="#F59E0B" />
    <path d="M32 32L32 55A23 23 0 0 1 9 32Z" fill="#10B981" />
    <path d="M32 32L9 32A23 23 0 0 1 32 9Z" fill="#3B82F6" />
    <circle cx="32" cy="32" r="7" fill="url(#wheelRim)" />
    <circle cx="32" cy="32" r="3" fill="#FFFFFF" />
  </svg>
);

// 13. 3D Security Padlock
export const Padlock3D = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="lockGold" cx="30%" cy="25%" r="75%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="45%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#92400E" />
      </radialGradient>
      <linearGradient id="shackle" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#CBD5E1" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    <path d="M16 20V14C16 9.58 19.58 6 24 6C28.42 6 32 9.58 32 14V20" stroke="url(#shackle)" strokeWidth="4" strokeLinecap="round" />
    <rect x="11" y="19" width="26" height="23" rx="6" fill="url(#lockGold)" />
    <ellipse cx="20" cy="24" rx="6" ry="3" fill="white" fillOpacity="0.4" transform="rotate(-20 20 24)" />
    <circle cx="24" cy="29" r="2.5" fill="#78350F" />
    <path d="M23 30L22 36H26L25 30H23Z" fill="#78350F" />
  </svg>
);
