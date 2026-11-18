import React from 'react';
import { Crown, Zap, Rocket, Gem, Shield, Award, Sparkles, Star, Flame } from 'lucide-react';

export const AVATAR_PALETTES = [
  {
    id: 'palette-1',
    name: 'Royal Violet',
    gradient: 'from-[#6D28D9] via-[#8B5CF6] to-[#4F46E5]',
    ring: 'ring-purple-300/40',
    shadow: 'shadow-purple-600/30',
    accent: '#A78BFA',
    BadgeIcon: Crown
  },
  {
    id: 'palette-2',
    name: 'Sunset Amber',
    gradient: 'from-[#F59E0B] via-[#EA580C] to-[#DC2626]',
    ring: 'ring-amber-300/40',
    shadow: 'shadow-amber-600/30',
    accent: '#FDE68A',
    BadgeIcon: Flame
  },
  {
    id: 'palette-3',
    name: 'Emerald Mint',
    gradient: 'from-[#059669] via-[#10B981] to-[#0D9488]',
    ring: 'ring-emerald-300/40',
    shadow: 'shadow-emerald-600/30',
    accent: '#6EE7B7',
    BadgeIcon: Shield
  },
  {
    id: 'palette-4',
    name: 'Electric Cyan',
    gradient: 'from-[#0284C7] via-[#06B6D4] to-[#2563EB]',
    ring: 'ring-cyan-300/40',
    shadow: 'shadow-cyan-600/30',
    accent: '#67E8F9',
    BadgeIcon: Zap
  },
  {
    id: 'palette-5',
    name: 'Neon Magenta',
    gradient: 'from-[#D946EF] via-[#EC4899] to-[#F43F5E]',
    ring: 'ring-pink-300/40',
    shadow: 'shadow-pink-600/30',
    accent: '#FBCFE8',
    BadgeIcon: Sparkles
  },
  {
    id: 'palette-6',
    name: 'Imperial Gold',
    gradient: 'from-[#F59E0B] via-[#EAB308] to-[#D97706]',
    ring: 'ring-yellow-300/50',
    shadow: 'shadow-yellow-600/30',
    accent: '#FEF08A',
    BadgeIcon: Crown
  },
  {
    id: 'palette-7',
    name: 'Cosmic Blue',
    gradient: 'from-[#3B82F6] via-[#6366F1] to-[#7C3AED]',
    ring: 'ring-blue-300/40',
    shadow: 'shadow-blue-600/30',
    accent: '#93C5FD',
    BadgeIcon: Rocket
  },
  {
    id: 'palette-8',
    name: 'Ruby Rose',
    gradient: 'from-[#E11D48] via-[#BE123C] to-[#881337]',
    ring: 'ring-rose-300/40',
    shadow: 'shadow-rose-600/30',
    accent: '#FDA4AF',
    BadgeIcon: Gem
  },
];

export const AVATAR_OPTIONS = AVATAR_PALETTES;

export function getAvatarPalette(seed = '', role = '') {
  if (role === 'ADMIN' || String(seed).toLowerCase().includes('admin')) {
    return AVATAR_PALETTES[5]; // Imperial Gold for admin
  }
  const str = String(seed || 'User').trim();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

export const UserAvatar = ({ 
  user = null, 
  seed = '', 
  avatarId = '', 
  initials = '', 
  size = 'md', 
  className = '', 
  showOnlineDot = false 
}) => {
  // Deterministic seed resolution
  const userSeed = seed || user?.fullName || user?.username || user?.email || user?.id || initials || 'User';
  const userRole = user?.role || (String(userSeed).toLowerCase().includes('admin') ? 'ADMIN' : 'USER');
  const palette = getAvatarPalette(userSeed, userRole);

  const isAdmin = userRole === 'ADMIN';

  // Determine displayed initial
  const displayInitial = (initials || user?.fullName || user?.username || userSeed || 'U')
    .trim()
    .charAt(0)
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-9 h-9 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-16 h-16 rounded-3xl',
    xl: 'w-20 h-20 rounded-3xl',
  }[size] || 'w-11 h-11 rounded-2xl';

  const fontSizes = {
    sm: 'text-sm font-black',
    md: 'text-base font-black',
    lg: 'text-2xl font-black',
    xl: 'text-3xl font-black',
  }[size] || 'text-base font-black';

  const badgeSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  }[size] || 'w-3.5 h-3.5';

  const BadgeIcon = palette.BadgeIcon;

  return (
    <div className="relative inline-block shrink-0 select-none">
      <div 
        className={`${sizeClasses} bg-gradient-to-tr ${palette.gradient} border border-white/30 shadow-lg ${palette.shadow} ring-1 ${palette.ring} flex items-center justify-center font-black text-white relative shrink-0 transition-all duration-200 overflow-hidden ${className}`}
      >
        {/* Specular 3D Gloss Highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/5 to-transparent pointer-events-none" />

        {/* Diagonal Soft Ambient Reflection */}
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-white/20 rounded-full blur-xs pointer-events-none" />

        {/* Center Content: Crown for Admin, Bold Stylish Initial for Users */}
        {isAdmin ? (
          <Crown className={`${badgeSizes} text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]`} />
        ) : (
          <span className={`${fontSizes} leading-none tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] font-black`}>
            {displayInitial}
          </span>
        )}
      </div>

      {/* Online Status Dot */}
      {showOnlineDot && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-[#4C1D95] shadow-xs"></span>
        </span>
      )}
    </div>
  );
};
