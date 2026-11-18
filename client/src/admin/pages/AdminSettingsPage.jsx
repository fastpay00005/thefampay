import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminTheme } from '../context/AdminThemeContext';
import { apiService } from '../../services/apiService';
import { Settings, Save, Sun, Moon, MessageCircle, Check, Loader2, Palette } from 'lucide-react';

export const AdminSettingsPage = () => {
  const { isDark, setTheme } = useAdminTheme();

  const { 
    marketSettings, 
    setMarketSettings, 
    supportLinks, 
    setSupportLinks,
    appName,
    setAppName,
    showToast 
  } = useApp();

  const [appNameInput, setAppNameInput] = useState(appName || 'The FamPay');
  const [appTagline, setAppTagline] = useState('Instant Token Exchange & Secure Digital Wallet');
  const [minDeposit, setMinDeposit] = useState(500);
  const [minWithdraw, setMinWithdraw] = useState(100);

  const [marketRate, setMarketRate] = useState(marketSettings.marketRate || 98.5);
  const [appRate, setAppRate] = useState(marketSettings.appRate || 100);
  const [bonusPercent, setBonusPercent] = useState(marketSettings.extraBonusPercent || 2);
  const [globalSell, setGlobalSell] = useState(marketSettings.globalSellEnabled ?? true);

  const [tgChannel, setTgChannel] = useState(supportLinks.telegramChannel || 'https://t.me/thefampayofficial');
  const [tgGroup, setTgGroup] = useState(supportLinks.telegramGroup || 'https://t.me/thefampaygroup');
  const [waSupport, setWaSupport] = useState(supportLinks.whatsappSupport || 'https://wa.me/919999988888');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiService.adminGetSettings().then(res => {
      if (res.success && res.settings) {
        if (res.settings.general) {
          if (res.settings.general.appName) setAppNameInput(res.settings.general.appName);
          if (res.settings.general.appTagline) setAppTagline(res.settings.general.appTagline);
          if (res.settings.general.minDeposit !== undefined) setMinDeposit(res.settings.general.minDeposit);
          if (res.settings.general.minWithdraw !== undefined) setMinWithdraw(res.settings.general.minWithdraw);
        }
        if (res.settings.rates) {
          setMarketRate(res.settings.rates.marketRate ?? 98.5);
          setAppRate(res.settings.rates.appRate ?? 100);
          setBonusPercent(res.settings.rates.extraBonusPercent ?? 2);
          if (res.settings.rates.globalSellEnabled !== undefined) {
            setGlobalSell(res.settings.rates.globalSellEnabled);
          }
        }
        if (res.settings.support) {
          setTgChannel(res.settings.support.telegramChannel || 'https://t.me/thefampayofficial');
          setTgGroup(res.settings.support.telegramGroup || 'https://t.me/thefampaygroup');
          setWaSupport(res.settings.support.whatsapp || 'https://wa.me/919999988888');
        }
      }
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedGeneral = {
        appName: appNameInput.trim() || 'The FamPay',
        appTagline: appTagline.trim(),
        minDeposit: Number(minDeposit),
        minWithdraw: Number(minWithdraw),
      };
      const updatedRates = {
        marketRate: Number(marketRate),
        appRate: Number(appRate),
        tokenBuyPrice: Number(appRate),
        tokenSellPrice: Number(marketRate),
        extraBonusPercent: Number(bonusPercent),
        globalSellEnabled: globalSell,
      };
      const updatedSupport = {
        telegramChannel: tgChannel,
        telegramGroup: tgGroup,
        whatsapp: waSupport,
      };

      setMarketSettings(prev => ({
        ...prev,
        ...updatedRates
      }));
      setSupportLinks(prev => ({
        ...prev,
        ...updatedSupport
      }));

      const res = await apiService.adminUpdateSettings({
        general: updatedGeneral,
        rates: updatedRates,
        support: updatedSupport
      });

      setIsSaving(false);
      if (res.success) {
        setAppName(updatedGeneral.appName);
        localStorage.setItem('fampay_app_name', updatedGeneral.appName);
        document.title = updatedGeneral.appName;
        showToast('Platform settings saved successfully to Supabase!', 'success');
      } else {
        showToast(res.message || 'Saved settings', 'info');
      }
    } catch (err) {
      setIsSaving(false);
      showToast('Settings saved to session', 'info');
    }
  };

  const cardStyle = isDark
    ? 'bg-[#111C44] border-slate-800 shadow-md text-white'
    : 'bg-white border-slate-200/90 shadow-xs text-slate-800';

  const inputStyle = isDark
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500" />
          <span>Platform Settings & Appearance</span>
        </h2>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Configure theme display mode, live exchange rates, purchase bonus rules, and official support channels
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        
        {/* ======================================================== */}
        {/* 1. BRAND & PLATFORM IDENTITY (DYNAMIC APP NAME & LIMITS) */}
        {/* ======================================================== */}
        <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-500" />
              <span>Platform Brand & Global Limits</span>
            </h3>
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Live Control</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold block mb-1">Application Name (Headers & Titles)</label>
              <input
                type="text"
                required
                value={appNameInput}
                onChange={(e) => setAppNameInput(e.target.value)}
                placeholder="The FamPay"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold ${inputStyle}`}
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Platform Tagline</label>
              <input
                type="text"
                value={appTagline}
                onChange={(e) => setAppTagline(e.target.value)}
                placeholder="Instant Token Exchange & Secure Wallet"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs ${inputStyle}`}
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Minimum Deposit Amount (₹)</label>
              <input
                type="number"
                value={minDeposit}
                onChange={(e) => setMinDeposit(e.target.value)}
                placeholder="500"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono font-bold ${inputStyle}`}
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Minimum Cash Out Limit (₹)</label>
              <input
                type="number"
                value={minWithdraw}
                onChange={(e) => setMinWithdraw(e.target.value)}
                placeholder="100"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono font-bold ${inputStyle}`}
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. APPEARANCE & THEME PREFERENCE (DARK / LIGHT MODE)     */}
        {/* ======================================================== */}
        <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-500" />
              <span>Admin Appearance & Color Theme</span>
            </h3>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Interface</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Dark Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3.5 sm:p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
                isDark 
                  ? 'border-blue-500 bg-blue-600/15 text-white ring-2 ring-blue-500/30 font-black shadow-sm' 
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-slate-600'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 shadow-sm">
                <Moon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <span className="text-xs font-black block">Dark Mode</span>
                <span className="text-[10px] text-slate-400">Night & High Contrast</span>
              </div>
              {isDark && (
                <span className="text-[10px] font-bold text-blue-500 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Active
                </span>
              )}
            </button>

            {/* Light Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3.5 sm:p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
                !isDark 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/30 font-black shadow-sm' 
                  : 'border-slate-800 hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-sm">
                <Sun className="w-5 h-5" />
              </div>
              <div className="text-center">
                <span className="text-xs font-black block">Light Mode</span>
                <span className="text-[10px] text-slate-400">Clean White & Day</span>
              </div>
              {!isDark && (
                <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Active
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. MARKET RATES BOX                                      */}
        {/* ======================================================== */}
        <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${cardStyle}`}>
          <h3 className="text-sm font-black flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-500" />
            <span>Exchange Rates & Reward Formula</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold block mb-1">External Market Rate (₹)</label>
              <input
                type="number"
                step="0.01"
                value={marketRate}
                onChange={(e) => setMarketRate(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono font-bold ${inputStyle}`}
              />
            </div>

            <div>
              <label className="font-bold block mb-1 text-blue-500">The FamPay App Rate (₹)</label>
              <input
                type="number"
                step="0.01"
                value={appRate}
                onChange={(e) => setAppRate(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono font-black ${
                  isDark ? 'bg-slate-800 border-blue-500/40 text-blue-400' : 'bg-blue-50/50 border-blue-200 text-blue-600'
                }`}
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-bold block mb-1">Extra Reward Bonus % (On Purchases)</label>
            <input
              type="number"
              step="0.1"
              value={bonusPercent}
              onChange={(e) => setBonusPercent(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-black ${
                isDark ? 'bg-slate-800 border-emerald-500/40 text-emerald-400' : 'bg-emerald-50/50 border-emerald-200 text-emerald-600'
              }`}
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Example: 2% bonus on ₹10,000 order gives ₹200 extra bonus tokens.
            </span>
          </div>

          {/* Master Global Sell Switch */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold block">Global Token Selling Switch</span>
              <span className="text-slate-400 text-[11px]">Enables or pauses token liquidation for all platform users</span>
            </div>
            <button
              type="button"
              onClick={() => setGlobalSell(!globalSell)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 active:scale-95 ${
                globalSell ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                globalSell ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. COMMUNITY & SUPPORT HANDLES                           */}
        {/* ======================================================== */}
        <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${cardStyle}`}>
          <h3 className="text-sm font-black flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span>Community & Official Support Links</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold block mb-1">Official Telegram Channel</label>
              <input
                type="url"
                value={tgChannel}
                onChange={(e) => setTgChannel(e.target.value)}
                placeholder="https://t.me/thefampayofficial"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono ${inputStyle}`}
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Official Telegram Group</label>
              <input
                type="url"
                value={tgGroup}
                onChange={(e) => setTgGroup(e.target.value)}
                placeholder="https://t.me/thefampaygroup"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono ${inputStyle}`}
              />
            </div>

            <div>
              <label className="font-bold block mb-1">WhatsApp Customer Support</label>
              <input
                type="text"
                value={waSupport}
                onChange={(e) => setWaSupport(e.target.value)}
                placeholder="https://wa.me/919999988888"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono ${inputStyle}`}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Configuration Changes</span>
        </button>

      </form>
    </div>
  );
};
