import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Sparkles } from 'lucide-react';

export const BannerPopupModal = () => {
  const navigate = useNavigate();
  const [activeBanner, setActiveBanner] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    apiService.getActiveBanners().then((res) => {
      if (res.success && res.banners && res.banners.length > 0) {
        const topBanner = res.banners[0];
        const today = new Date().toISOString().slice(0, 10);
        const dismissedKey = `fampay_banner_dismissed_${topBanner.id}`;
        const sessionDismissedKey = `fampay_banner_session_dismissed_${topBanner.id}`;

        const dismissedDate = localStorage.getItem(dismissedKey);
        const sessionDismissed = sessionStorage.getItem(sessionDismissedKey);

        // Do NOT show if already dismissed today OR already dismissed/seen in this browser session
        if (dismissedDate !== today && !sessionDismissed) {
          setActiveBanner(topBanner);
          setIsOpen(true);
        }
      }
    }).catch((err) => console.error('Active banner fetch error:', err));
  }, []);

  const handleClose = () => {
    if (activeBanner?.id) {
      const today = new Date().toISOString().slice(0, 10);
      // Mark as dismissed for the entire current browser session so page transitions NEVER trigger it again
      sessionStorage.setItem(`fampay_banner_session_dismissed_${activeBanner.id}`, 'true');

      if (dontShowToday) {
        localStorage.setItem(`fampay_banner_dismissed_${activeBanner.id}`, today);
      }
    }
    setIsOpen(false);
  };

  const handleBannerClick = () => {
    if (activeBanner?.linkUrl) {
      handleClose();
      if (activeBanner.linkUrl.startsWith('http')) {
        window.open(activeBanner.linkUrl, '_blank');
      } else {
        navigate(activeBanner.linkUrl);
      }
    }
  };

  if (!isOpen || !activeBanner) return null;

  return (
    <div 
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-[#0D1222] border border-purple-500/40 shadow-2xl overflow-hidden relative text-white"
      >
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Banner Media */}
        {activeBanner.imageUrl && (
          <div className="relative h-48 w-full overflow-hidden cursor-pointer" onClick={handleBannerClick}>
            <img
              src={activeBanner.imageUrl}
              alt={activeBanner.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1222] via-transparent to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> Platform Event
            </span>
            <h3 className="text-base font-black text-white mt-1 leading-snug">
              {activeBanner.title}
            </h3>
          </div>

          <button
            onClick={handleBannerClick}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-xl shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            Check Offer Now <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Dismiss Today Checkbox */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0"
              />
              <span className="text-[11px]">Don't show again today</span>
            </label>
            <button onClick={handleClose} className="text-[11px] text-slate-500 hover:text-white">
              Dismiss
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

