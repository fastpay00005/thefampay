import React from 'react';

/**
 * Ultra-Premium 3D Icon Artwork Suite for Fast Pay
 * Designed to look identical to Apple 3D / High-End Fintech apps on ALL platforms
 */

export const NavHome3D = ({ active }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 drop-shadow-sm">
    <defs>
      <linearGradient id="roofGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FB7185" />
        <stop offset="50%" stopColor="#E11D48" />
        <stop offset="100%" stopColor="#9F1239" />
      </linearGradient>
      <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#FDE68A" />
      </linearGradient>
      <linearGradient id="doorGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#B45309" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
    </defs>
    {/* Chimney */}
    <rect x="23" y="8" width="4" height="8" rx="1.5" fill="#BE123C" />
    {/* Roof Triangle */}
    <path d="M18 4L4 16H32L18 4Z" fill="url(#roofGrad)" />
    {/* Roof Edge Trim */}
    <path d="M2.5 16.5L18 3.5L33.5 16.5" stroke="#FFE4E6" strokeWidth="1.5" strokeLinecap="round" />
    {/* House Body */}
    <path d="M7 16H29V30C29 31.1 28.1 32 27 32H9C7.9 32 7 31.1 7 30V16Z" fill="url(#wallGrad)" />
    {/* Door */}
    <rect x="14" y="21" width="8" height="11" rx="2" fill="url(#doorGrad)" />
    {/* Door Knob */}
    <circle cx="20" cy="26.5" r="1" fill="#FDE047" />
    {/* Attic Circular Window */}
    <circle cx="18" cy="12" r="2.5" fill="#FFE4E6" stroke="#9F1239" strokeWidth="1" />
  </svg>
);

export const NavDeposit3D = ({ active }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 drop-shadow-sm">
    <defs>
      <linearGradient id="cartMetal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="50%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <linearGradient id="cartItems" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
      <radialGradient id="wheelGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#0F172A" />
      </radialGradient>
    </defs>
    {/* Items inside cart */}
    <rect x="12" y="8" width="8" height="7" rx="2" fill="#F59E0B" />
    <rect x="18" y="6" width="9" height="9" rx="2.5" fill="url(#cartItems)" />
    {/* Cart Basket Grid */}
    <path 
      d="M6 8H9L12.5 22H27L30 11H11" 
      stroke="url(#cartMetal)" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path d="M15 15H26M13.5 19H25" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
    {/* Wheels */}
    <circle cx="14" cy="27" r="3" fill="url(#wheelGrad)" />
    <circle cx="25" cy="27" r="3" fill="url(#wheelGrad)" />
    <circle cx="14" cy="27" r="1" fill="#E2E8F0" />
    <circle cx="25" cy="27" r="1" fill="#E2E8F0" />
  </svg>
);

export const NavTools3D = ({ active }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 drop-shadow-sm">
    <defs>
      <linearGradient id="wrenchMetal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="50%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="hammerHandle" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#C2410C" />
      </linearGradient>
    </defs>
    {/* Hammer Handle */}
    <rect x="22" y="10" width="4" height="22" rx="1.5" transform="rotate(45 22 10)" fill="url(#hammerHandle)" />
    {/* Hammer Head */}
    <path d="M26 6L32 12L28 16L22 10L26 6Z" fill="#334155" />
    {/* Wrench */}
    <path 
      d="M10 24L24 10" 
      stroke="url(#wrenchMetal)" 
      strokeWidth="4" 
      strokeLinecap="round" 
    />
    <path 
      d="M7 27C5 25 5 21 8 19L11 22L13 20L10 17C12 14 16 14 18 16L15 19L17 21L20 18C22 20 22 24 19 27L7 27Z" 
      fill="url(#wrenchMetal)" 
    />
  </svg>
);

export const NavHistory3D = ({ active }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 drop-shadow-sm">
    <defs>
      <linearGradient id="docGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F1F5F9" />
      </linearGradient>
    </defs>
    {/* Receipt Paper */}
    <path 
      d="M8 5C8 3.9 8.9 3 10 3H26C27.1 3 28 3.9 28 5V32L24.5 30L21 32L17.5 30L14 32L10.5 30L8 32V5Z" 
      fill="url(#docGrad)" 
      stroke="#CBD5E1" 
      strokeWidth="1.2"
    />
    {/* Cyan Top Ribbon */}
    <rect x="11" y="7" width="14" height="3" rx="1.5" fill="#38BDF8" />
    {/* Dotted lines */}
    <line x1="11" y1="14" x2="25" y2="14" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="11" y1="19" x2="22" y2="19" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="11" y1="24" x2="18" y2="24" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const NavProfile3D = ({ active }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 drop-shadow-sm">
    <defs>
      <linearGradient id="userGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="50%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
    </defs>
    {/* Head Circle */}
    <circle cx="18" cy="12" r="6" fill="url(#userGrad)" />
    {/* Torso */}
    <path d="M8 29C8 23 12 21 18 21C24 21 28 23 28 29V31H8V29Z" fill="url(#userGrad)" />
  </svg>
);

export const NavTeams3D = ({ active }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 drop-shadow-sm">
    <defs>
      <linearGradient id="teamLead" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A855F7" />
        <stop offset="100%" stopColor="#6B21A8" />
      </linearGradient>
      <linearGradient id="teamMember" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    {/* Center Leader */}
    <circle cx="18" cy="11" r="4.5" fill="url(#teamLead)" />
    <path d="M11 28C11 23 14 21 18 21C22 21 25 23 25 28V29H11V28Z" fill="url(#teamLead)" />
    {/* Left Member */}
    <circle cx="9" cy="14" r="3.5" fill="url(#teamMember)" opacity="0.9" />
    <path d="M4 28C4 24 6.5 22.5 9.5 22.5C11 22.5 12.2 23 13 24V28H4Z" fill="url(#teamMember)" opacity="0.8" />
    {/* Right Member */}
    <circle cx="27" cy="14" r="3.5" fill="url(#teamMember)" opacity="0.9" />
    <path d="M32 28C32 24 29.5 22.5 26.5 22.5C25 22.5 23.8 23 23 24V28H32Z" fill="url(#teamMember)" opacity="0.8" />
  </svg>
);

export const NavAssets3D = ({ active }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 drop-shadow-sm">
    <defs>
      <linearGradient id="walletOuter" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="50%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="cardGlow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* Card peaking out */}
    <rect x="10" y="6" width="16" height="10" rx="2" fill="url(#cardGlow)" />
    <line x1="12" y1="10" x2="24" y2="10" stroke="#A7F3D0" strokeWidth="1.5" />
    {/* Wallet Main Pocket */}
    <rect x="5" y="11" width="26" height="19" rx="3.5" fill="url(#walletOuter)" />
    {/* Flap */}
    <path d="M21 16H31V25H21C18.8 25 17 23.2 17 21C17 18.8 18.8 16 21 16Z" fill="#78350F" />
    {/* Golden Lock / Button */}
    <circle cx="24" cy="20.5" r="2.2" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
  </svg>
);

export const GoldenMoneyBagBig = () => (
  <div className="relative w-28 h-28 flex items-center justify-center">
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]">
      <defs>
        <radialGradient id="goldBulb" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="25%" stopColor="#FDE047" />
          <stop offset="55%" stopColor="#EAB308" />
          <stop offset="85%" stopColor="#CA8A04" />
          <stop offset="100%" stopColor="#854D0E" />
        </radialGradient>
        <linearGradient id="redRope" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
        <radialGradient id="coinGold" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#A16207" />
        </radialGradient>
      </defs>

      {/* Gold Coins behind the sack */}
      <circle cx="94" cy="42" r="13" fill="url(#coinGold)" />
      <circle cx="94" cy="42" r="10" stroke="#78350F" strokeWidth="1" strokeDasharray="3 2" />
      <text x="94" y="47" textAnchor="middle" fontSize="12" fontWeight="900" fill="#78350F">₹</text>

      <circle cx="86" cy="28" r="9" fill="url(#coinGold)" opacity="0.9" />

      {/* Ruffled Neck Top */}
      <path 
        d="M48 24C44 14 74 14 70 24L78 36C68 40 50 40 40 36L48 24Z" 
        fill="url(#goldBulb)" 
      />

      {/* Crimson Tie */}
      <ellipse cx="59" cy="36" rx="18" ry="5.5" fill="url(#redRope)" />
      <path d="M56 38L48 50M62 38L66 48" stroke="#991B1B" strokeWidth="3.5" strokeLinecap="round" />

      {/* Fat Plump Sack Body */}
      <path 
        d="M22 68C18 42 32 38 59 38C86 38 100 42 96 68C92 92 82 102 59 102C36 102 26 92 22 68Z" 
        fill="url(#goldBulb)" 
      />

      {/* 3D Specular Sheen (Curved Highlight) */}
      <ellipse cx="46" cy="56" rx="16" ry="9" fill="white" fillOpacity="0.45" transform="rotate(-30 46 56)" />

      {/* Big Dark Golden Currency Symbol */}
      <text 
        x="59" 
        y="78" 
        textAnchor="middle" 
        fontSize="34" 
        fontWeight="900" 
        fill="#713F12" 
        fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
      >
        ₹
      </text>
    </svg>
  </div>
);

export const MoneyBagOverviewIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 drop-shadow-sm">
    <defs>
      <radialGradient id="mbSm" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="40%" stopColor="#FACC15" />
        <stop offset="80%" stopColor="#CA8A04" />
        <stop offset="100%" stopColor="#854D0E" />
      </radialGradient>
    </defs>
    {/* Ruffled Neck */}
    <path d="M19 10C17 6 31 6 29 10L32 15C28 17 20 17 16 15L19 10Z" fill="url(#mbSm)" />
    {/* Tie */}
    <ellipse cx="24" cy="15" rx="7" ry="2.2" fill="#DC2626" />
    {/* Body */}
    <path d="M9 28C7 17 13 16 24 16C35 16 41 17 39 28C37 38 33 42 24 42C15 42 11 38 9 28Z" fill="url(#mbSm)" />
    {/* Highlight */}
    <ellipse cx="19" cy="24" rx="6" ry="3.5" fill="white" fillOpacity="0.4" transform="rotate(-25 19 24)" />
    <text x="24" y="32" textAnchor="middle" fontSize="14" fontWeight="900" fill="#713F12">₹</text>
  </svg>
);

export const ChartOverviewIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 drop-shadow-sm">
    <defs>
      <linearGradient id="chartStroke" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#F43F5E" />
        <stop offset="100%" stopColor="#BE123C" />
      </linearGradient>
    </defs>
    {/* Grid Background */}
    <path d="M10 16H38M10 24H38M10 32H38" stroke="#FCA5A5" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
    {/* Uptrend Line */}
    <path 
      d="M10 32L19 24L26 28L36 14" 
      stroke="url(#chartStroke)" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path d="M30 14H36V20" stroke="url(#chartStroke)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

