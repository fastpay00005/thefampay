import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useApp } from '../context/AppContext';
import { Bell, ArrowDownLeft, Zap, CheckCheck, ShieldAlert, Sparkles, X, Check, Clock } from 'lucide-react';
import { GiftBox3D, SecurityShield3D, MoneyBag3D } from '../components/common/Icons3D';

export const NotificationsPage = () => {
  const { notifications, markAllNotificationsAsRead, markNotificationAsRead, isDark } = useApp();
  const [selectedNotification, setSelectedNotification] = useState(null);

  const getNotificationIcon = (item) => {
    const title = item?.title?.toLowerCase() || '';
    const type = item?.type || '';

    if (type === 'GIFT' || title.includes('gift') || title.includes('reward') || title.includes('bonus')) {
      return <GiftBox3D className="w-6 h-6 shrink-0" />;
    }
    if (type === 'SECURITY' || title.includes('blocked') || title.includes('paused') || title.includes('pin') || title.includes('lock')) {
      return <SecurityShield3D className="w-6 h-6 shrink-0" />;
    }
    if (type === 'DEPOSIT') {
      return <ArrowDownLeft className="w-5 h-5 text-emerald-500 shrink-0" />;
    }
    if (type === 'TRADE') {
      return <Zap className="w-5 h-5 text-blue-500 shrink-0" />;
    }
    return <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />;
  };

  const handleOpenNotification = (item) => {
    setSelectedNotification(item);
    if (!item.read) {
      markNotificationAsRead(item.id);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppShell title="Notifications">
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Notification Hub
            </h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:opacity-80 flex items-center gap-1 active:scale-95 transition-all cursor-pointer px-2 py-1 rounded-lg hover:bg-purple-500/10"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className={`rounded-3xl p-8 text-center border shadow-xs ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className={`text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                No Notifications Yet
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Your gifts, transactions, and security announcements will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const isGift = item.title?.includes('Gift') || item.title?.includes('Reward') || item.type === 'GIFT';
              const isWarning = item.title?.includes('Blocked') || item.title?.includes('Paused') || item.title?.includes('Lock');

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenNotification(item)}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 relative overflow-hidden cursor-pointer active:scale-[0.99] hover:shadow-md ${
                    isDark
                      ? isGift 
                        ? 'bg-amber-500/10 border-amber-500/30 text-white shadow-sm'
                        : isWarning
                        ? 'bg-rose-500/10 border-rose-500/30 text-white shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-200 shadow-xs'
                      : isGift
                      ? 'bg-gradient-to-r from-amber-50/90 to-yellow-50/50 border-amber-200 text-slate-900 shadow-sm'
                      : isWarning
                      ? 'bg-rose-50/80 border-rose-200 text-slate-900 shadow-sm'
                      : 'bg-white border-slate-200/90 text-slate-800 shadow-xs'
                  }`}
                >
                  {/* Icon Box */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    isDark ? 'bg-slate-800/80 border border-slate-700/60' : 'bg-white border border-slate-100'
                  }`}>
                    {getNotificationIcon(item)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-black truncate ${
                        isGift ? 'text-amber-500' : isWarning ? 'text-rose-500' : isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">{item.time}</span>
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed font-medium line-clamp-2 ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {item.message}
                    </p>
                  </div>

                  {!item.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-400/40 shrink-0 mt-2"></span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* POP-UP MODAL: FULL NOTIFICATION DETAILS                  */}
      {/* ======================================================== */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl relative ${
            isDark ? 'bg-[#0E1322] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  isDark ? 'bg-slate-800 border border-slate-700' : 'bg-purple-50 border border-purple-100'
                }`}>
                  {getNotificationIcon(selectedNotification)}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                    {selectedNotification.type || 'Announcement'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{selectedNotification.time || 'Recently'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Body */}
            <div className="py-5 space-y-3">
              <h3 className={`text-base font-black leading-snug ${
                selectedNotification.title?.includes('Gift') || selectedNotification.title?.includes('Reward') 
                  ? 'text-amber-500'
                  : selectedNotification.title?.includes('Blocked') || selectedNotification.title?.includes('Lock')
                  ? 'text-rose-500'
                  : isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {selectedNotification.title}
              </h3>

              <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line font-medium ${
                isDark ? 'bg-slate-900/80 border border-slate-800 text-slate-200' : 'bg-slate-50 border border-slate-200/80 text-slate-700'
              }`}>
                {selectedNotification.message}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                <Check className="w-4 h-4" />
                <span>Marked as Read</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-600/30 active:scale-95 transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};
