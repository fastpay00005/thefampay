import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { apiService } from '../services/apiService';
import { 
  ArrowDownLeft, 
  ArrowUpRight,
  Clock, 
  Copy, 
  Check, 
  ShieldCheck, 
  Upload, 
  Coins, 
  Sparkles, 
  AlertTriangle,
  QrCode,
  Building2,
  Smartphone,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  History,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DepositPage = () => {
  const { user, isDark, showToast, refreshUserData } = useApp();
  const navigate = useNavigate();

  // Rail Switcher: 'INR' | 'USDT' (per PDF Spec 2.12)
  const [depositRail, setDepositRail] = useState('INR');
  const [selectedChain, setSelectedChain] = useState('TRC20'); // 'TRC20' | 'BEP20'
  const [usdtRate, setUsdtRate] = useState(88.50);

  const [packages, setPackages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [depositHistory, setDepositHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [activeOrder, setActiveOrder] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [copiedField, setCopiedField] = useState('');

  // Proof submission
  const [utrNumber, setUtrNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [loading, setLoading] = useState(true);

  // 15-Minute Countdown Timer
  const [timeLeft, setTimeLeft] = useState(0);

  // USDT Fixed Packages (per PDF Spec 2.12.2)
  const usdtPackages = [
    { amount: 50, bonusPercent: 2, label: 'Starter USDT' },
    { amount: 100, bonusPercent: 3, label: 'Popular USDT' },
    { amount: 250, bonusPercent: 4, label: 'Trader USDT' },
    { amount: 500, bonusPercent: 5, label: 'VIP USDT' },
    { amount: 1000, bonusPercent: 6, label: 'High Roller' },
  ];

  const loadDepositData = async () => {
    if (!user?.id) return;
    try {
      const [pkgRes, chanRes, orderRes, settingsRes, txRes] = await Promise.allSettled([
        apiService.getDepositPackages(),
        apiService.getChannels(),
        apiService.getActiveDepositOrder(user.id),
        apiService.getSettings(),
        apiService.getUserTransactions(user.id)
      ]);

      if (pkgRes.status === 'fulfilled' && pkgRes.value?.success) {
        setPackages(pkgRes.value.packages || []);
      }
      if (chanRes.status === 'fulfilled' && chanRes.value?.success) {
        const activeChans = (chanRes.value.channels || []).filter(c => c.isActive !== false);
        setChannels(activeChans);
      }
      if (orderRes.status === 'fulfilled' && orderRes.value?.success && orderRes.value.order) {
        setActiveOrder(orderRes.value.order);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value?.settings) {
        const s = settingsRes.value.settings;
        const r = Number(s.rates?.usdtInrRate || s.rates?.marketRate || s.usdtInrRate || s.usdtRate || 88.50);
        setUsdtRate(r);
      }
      if (txRes.status === 'fulfilled' && txRes.value?.success) {
        const deposits = (txRes.value.transactions || []).filter(t => t.type === 'DEPOSIT');
        setDepositHistory(deposits);
      }
    } catch (e) {
      console.error('Error loading deposit info:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepositData();
  }, [user?.id]);

  // Handle Order Timer
  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'RESERVED') {
      setTimeLeft(0);
      return;
    }
    const target = new Date(activeOrder.expiresAt).getTime();

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        clearInterval(interval);
        showToast('Reservation order expired. You can reserve a new package.', 'info');
        loadDepositData();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrder]);

  const copyText = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`${fieldName} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Handle Package Reservation (INR or USDT)
  const handleReservePackage = async (pkg, isUsdt = false) => {
    setSelectedPackage(pkg);
    setReserving(true);

    try {
      // Find matching payment channel
      let matchedChannel = null;
      if (isUsdt) {
        matchedChannel = channels.find(c => c.type === 'CRYPTO' && (c.cryptoChain === selectedChain || c.label?.includes(selectedChain)));
        if (!matchedChannel) {
          matchedChannel = channels.find(c => c.type === 'CRYPTO') || channels[0];
        }
      } else {
        matchedChannel = channels.find(c => c.id === selectedChannelId && c.type !== 'CRYPTO') || channels.find(c => c.type !== 'CRYPTO') || channels[0];
      }

      const res = await apiService.reserveDepositOrder({
        userId: user.id,
        packageAmount: pkg.amount,
        bonusPercent: pkg.bonusPercent,
        channelId: matchedChannel?.id || selectedChannelId
      });

      if (res.success) {
        showToast(`Order #${res.order.orderId} reserved for 15 minutes!`, 'success');
        setActiveOrder(res.order);
      } else {
        showToast(res.message || 'Could not reserve package', 'error');
      }
    } catch (err) {
      showToast('Reservation error. Check network.', 'error');
    } finally {
      setReserving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      showToast(depositRail === 'USDT' ? 'Please enter the on-chain Transaction Hash (TxHash)' : 'Please enter the 12-digit UTR or Reference number', 'error');
      return;
    }
    if (!activeOrder) return;

    setSubmittingProof(true);
    try {
      const formData = new FormData();
      formData.append('orderId', activeOrder.orderId || activeOrder.id);
      formData.append('userId', user.id);
      formData.append('utr', utrNumber.trim());
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const res = await apiService.submitDepositOrderProof(formData);
      if (res.success) {
        showToast('Payment proof submitted! Admin will verify and credit your Available Balance.', 'success');
        setUtrNumber('');
        setReceiptFile(null);
        setReceiptPreview('');
        await loadDepositData();
        if (refreshUserData) await refreshUserData();
      } else {
        showToast(res.message || 'Submission failed', 'error');
      }
    } catch (err) {
      showToast('Network error while submitting proof', 'error');
    } finally {
      setSubmittingProof(false);
    }
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const cardStyle = isDark
    ? 'bg-[#121829] border-slate-800 text-white shadow-md'
    : 'bg-white border-[#F3F0FF] text-slate-800 shadow-[0_4px_25px_rgba(109,40,217,0.05)]';

  const subBoxStyle = isDark
    ? 'bg-slate-900/60 border-slate-800'
    : 'bg-[#F9F7FE] border-purple-100/80';

  // Filter channels based on selected rail
  const inrChannels = channels.filter(c => c.type !== 'CRYPTO');
  const cryptoChannels = channels.filter(c => c.type === 'CRYPTO');
  const activeCryptoChannel = cryptoChannels.find(c => c.cryptoChain === selectedChain || c.label?.includes(selectedChain)) || cryptoChannels[0];

  return (
    <AppShell title="Deposit Center">
      <div className="px-4 py-4 space-y-4">

        {/* Dedicated Dual-Page Segmented Tab Switcher (Deposit vs Withdraw) */}
        <div className={`p-1 rounded-2xl border flex items-center gap-1 ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-purple-50/80 border-purple-100'
        }`}>
          <button
            onClick={() => navigate('/deposit')}
            className="flex-1 py-2.5 rounded-xl text-xs font-black bg-[#6D28D9] text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Deposit Funds</span>
          </button>

          <button
            onClick={() => navigate('/withdraw')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-purple-900 hover:text-purple-950'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Withdraw Funds</span>
          </button>
        </div>

        {/* 1. Header Banner */}
        <div className={`p-4 sm:p-5 rounded-3xl border relative overflow-hidden transition-all duration-200 ${
          isDark 
            ? 'bg-gradient-to-br from-[#121629] via-[#1E1738] to-[#0E101D] border-purple-900/40 shadow-xl' 
            : 'bg-gradient-to-br from-[#6820DA] via-[#7C3AED] to-[#5B1EB7] text-white border-purple-400/30 shadow-lg shadow-purple-600/20'
        }`}>
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Instant Bonus Included
            </span>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs font-black text-purple-200 hover:text-white flex items-center gap-1 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
          </div>

          <h1 className="text-xl font-black text-white tracking-tight mt-2.5">
            The FamPay Deposit Center
          </h1>
          <p className="text-xs text-purple-100/90 mt-1 leading-relaxed">
            Select a verified package to lock your reservation. Complete transfer within 15 minutes to guarantee extra rewards!
          </p>
        </div>

        {/* 2. DUAL-RAIL SWITCHER (Per PDF Spec 2.12: INR vs USDT) */}
        {!activeOrder && (
          <div className={`p-1 rounded-2xl border flex items-center gap-1 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-purple-50/80 border-purple-100'
          }`}>
            <button
              onClick={() => setDepositRail('INR')}
              className={`flex-1 py-2 px-2 rounded-xl transition-all flex flex-col items-center justify-center leading-tight ${
                depositRail === 'INR'
                  ? 'bg-[#6D28D9] text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-purple-900 hover:text-purple-950'
              }`}
            >
              <span className="text-xs font-black">🇮🇳 INR Deposit</span>
              <span className="text-[9.5px] opacity-80 mt-0.5">UPI • Bank • QR</span>
            </button>

            <button
              onClick={() => setDepositRail('USDT')}
              className={`flex-1 py-2 px-2 rounded-xl transition-all flex flex-col items-center justify-center leading-tight ${
                depositRail === 'USDT'
                  ? 'bg-[#6D28D9] text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-purple-900 hover:text-purple-950'
              }`}
            >
              <span className="text-xs font-black">💎 USDT Crypto</span>
              <span className="text-[9.5px] opacity-80 mt-0.5">TRC20 • BEP20</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* ACTIVE RESERVED ORDER SCREEN (If Order is in progress)   */}
        {/* ======================================================== */}
        {activeOrder && activeOrder.status === 'RESERVED' && (
          <div className={`p-5 rounded-3xl border space-y-4 relative ${
            isDark ? 'bg-slate-900 border-purple-500/50 shadow-2xl ring-2 ring-purple-500/30' : 'bg-white border-purple-300 shadow-xl'
          }`}>
            {/* Timer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                  ORDER #{activeOrder.orderId}
                </span>
                <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {activeOrder.channelDetails?.type === 'CRYPTO' 
                    ? `${activeOrder.packageAmount} USDT (≈ ₹${(activeOrder.packageAmount * usdtRate).toLocaleString('en-IN')})` 
                    : `₹${Number(activeOrder.packageAmount).toLocaleString('en-IN')}`} Locked
                </h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400">
                <Clock className="w-4 h-4 animate-spin" />
                <span className="font-mono font-black text-sm">{formatTimer(timeLeft)}</span>
              </div>
            </div>

            {/* Payment Channel Instructions */}
            {activeOrder.channelDetails && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Transfer exact amount to the verified payment handle below:
                </div>

                {/* UPI Details */}
                {activeOrder.channelDetails.type === 'UPI' && (
                  <div className={`p-4 rounded-2xl border space-y-3 ${subBoxStyle}`}>
                    {activeOrder.channelDetails.qrUrl && (
                      <div className="flex justify-center py-2">
                        <img 
                          src={activeOrder.channelDetails.qrUrl} 
                          alt="UPI QR" 
                          className="w-40 h-40 rounded-2xl bg-white p-2 shadow-md border"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-semibold">UPI ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-[#6D28D9] dark:text-purple-300">
                          {activeOrder.channelDetails.upiId}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(activeOrder.channelDetails.upiId, 'UPI ID')}
                          className="p-1.5 rounded-lg bg-purple-100 dark:bg-slate-800 text-purple-800 dark:text-slate-200"
                        >
                          {copiedField === 'UPI ID' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Details */}
                {activeOrder.channelDetails.type === 'BANK' && (
                  <div className={`p-4 rounded-2xl border space-y-2 text-xs ${subBoxStyle}`}>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Name:</span>
                      <span className="font-bold">{activeOrder.channelDetails.bankName || 'HDFC Bank'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">A/C Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black">{activeOrder.channelDetails.accountNumber}</span>
                        <button onClick={() => copyText(activeOrder.channelDetails.accountNumber, 'Account Number')} className="text-purple-600">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IFSC Code:</span>
                      <span className="font-mono font-bold">{activeOrder.channelDetails.ifscCode}</span>
                    </div>
                  </div>
                )}

                {/* USDT Crypto Details (Per PDF Spec 2.12.2) */}
                {activeOrder.channelDetails.type === 'CRYPTO' && (
                  <div className={`p-4 rounded-2xl border space-y-3 ${subBoxStyle}`}>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                      <span className="text-xs text-slate-500 font-semibold">Network:</span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        USDT {activeOrder.channelDetails.cryptoChain || selectedChain}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-500 font-semibold block">Official Deposit Address:</span>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-950 border gap-2">
                        <span className="font-mono font-bold text-xs truncate text-purple-700 dark:text-purple-300">
                          {activeOrder.channelDetails.walletAddress || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'}
                        </span>
                        <button 
                          type="button"
                          onClick={() => copyText(activeOrder.channelDetails.walletAddress || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 'Deposit Address')}
                          className="px-2.5 py-1 rounded-lg bg-[#6D28D9] text-white text-[11px] font-black shrink-0 active:scale-95 transition-all"
                        >
                          {copiedField === 'Deposit Address' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 leading-snug">
                      ⚡ <strong>Auto INR Conversion:</strong> On approval, your {activeOrder.packageAmount} USDT will convert to <strong>₹{(activeOrder.packageAmount * usdtRate).toLocaleString('en-IN')}</strong> and credit directly to your spendable INR Available Balance!
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Proof Submission Form */}
            <form onSubmit={handleSubmitProof} className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  {activeOrder.channelDetails?.type === 'CRYPTO' 
                    ? 'On-Chain Transaction Hash (TxHash) *' 
                    : '12-Digit UTR / Reference Number *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={activeOrder.channelDetails?.type === 'CRYPTO' ? 'e.g. 4f8a92b3c1d4... (Blockchain TxHash)' : 'e.g. 432198765432 (12-digit UTR)'}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-mono font-bold outline-none border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Payment Screenshot (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#6D28D9] file:text-white hover:file:bg-purple-700"
                />
                {receiptPreview && (
                  <div className="mt-2">
                    <img src={receiptPreview} alt="Receipt preview" className="w-24 h-24 object-cover rounded-xl border border-slate-300 dark:border-slate-700" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingProof}
                className="w-full py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-purple-700 text-white font-black text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all disabled:opacity-50"
              >
                {submittingProof ? 'Submitting Verification...' : (activeOrder.channelDetails?.type === 'CRYPTO' ? 'Confirm Payment & Submit TxHash' : 'Confirm Payment & Submit UTR')}
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUBMITTED ORDER STATUS (Pending Admin Review)            */}
        {/* ======================================================== */}
        {activeOrder && activeOrder.status === 'SUBMITTED' && (
          <div className={`p-5 rounded-3xl border text-center space-y-3 ${
            isDark ? 'bg-slate-900/90 border-blue-500/50' : 'bg-blue-50/70 border-blue-200'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Order #{activeOrder.orderId} Under Review
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Your deposit (Ref: {activeOrder.utr}) has been submitted. Our automated finance desk will verify and credit your INR Available Balance shortly.
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* RAIL 1: INR PACKAGES SELECTION                           */}
        {/* ======================================================== */}
        {!activeOrder && depositRail === 'INR' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Available INR Deposit Packages
              </h2>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">15-Min Guaranteed Lock</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {packages.map((pkg) => {
                const bonusAmt = ((pkg.amount * pkg.bonusPercent) / 100).toFixed(0);
                const totalGet = pkg.amount + Number(bonusAmt);

                return (
                  <div
                    key={pkg.amount}
                    className={`p-3 sm:p-3.5 rounded-3xl border relative transition-all active:scale-98 cursor-pointer overflow-hidden ${
                      isDark 
                        ? 'bg-slate-900/80 border-slate-800 hover:border-purple-500/50' 
                        : 'bg-white border-purple-100 hover:border-purple-300 shadow-sm'
                    }`}
                    onClick={() => handleReservePackage(pkg, false)}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-tight text-purple-600 dark:text-purple-400 truncate">
                        {pkg.label}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                        +{pkg.bonusPercent}%
                      </span>
                    </div>

                    <div className="mt-1.5">
                      <span className={`text-lg sm:text-xl font-black block tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        ₹{pkg.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 block truncate">
                        Credit: <strong className="text-emerald-600 dark:text-emerald-400">₹{totalGet.toLocaleString('en-IN')}</strong>
                      </span>
                    </div>

                    <button
                      disabled={reserving}
                      className="w-full mt-2.5 py-1.5 sm:py-2 rounded-xl bg-purple-500/15 hover:bg-[#6D28D9] text-[#6D28D9] hover:text-white font-black text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      Reserve <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* RAIL 2: USDT CRYPTO SELECTION (Per PDF Spec 2.12.2)      */}
        {/* ======================================================== */}
        {!activeOrder && depositRail === 'USDT' && (
          <div className="space-y-4">
            {/* Live Exchange Rate Preview Banner */}
            <div className={`p-4 rounded-3xl border space-y-2 ${
              isDark ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-500" />
                  Live USDT Exchange Rate
                </span>
                <span className="text-xs font-black font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300">
                  1 USDT = ₹{usdtRate.toFixed(2)} INR
                </span>
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">
                Send USDT from any crypto wallet (Binance, Trust Wallet, OKX). On approval, USDT converts directly to INR Available Balance at this guaranteed rate!
              </p>
            </div>

            {/* Network Chain Chips */}
            <div className="space-y-2">
              <label className="text-xs font-black block text-slate-700 dark:text-slate-300">
                Select USDT Network Chain:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChain('TRC20')}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    selectedChain === 'TRC20'
                      ? 'border-[#6D28D9] bg-purple-500/10 text-[#6D28D9] dark:text-purple-300 font-black shadow-sm'
                      : isDark ? 'border-slate-800 bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <div className="text-left">
                    <span className="text-xs block font-black">USDT (TRC-20)</span>
                    <span className="text-[10px] block opacity-70">Tron Network • Fast</span>
                  </div>
                  {selectedChain === 'TRC20' && <Check className="w-4 h-4 text-[#6D28D9]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChain('BEP20')}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    selectedChain === 'BEP20'
                      ? 'border-[#6D28D9] bg-purple-500/10 text-[#6D28D9] dark:text-purple-300 font-black shadow-sm'
                      : isDark ? 'border-slate-800 bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <div className="text-left">
                    <span className="text-xs block font-black">USDT (BEP-20)</span>
                    <span className="text-[10px] block opacity-70">BNB Smart Chain</span>
                  </div>
                  {selectedChain === 'BEP20' && <Check className="w-4 h-4 text-[#6D28D9]" />}
                </button>
              </div>
            </div>

            {/* USDT Packages Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Select USDT Package
                </h3>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">No Deposit Fee</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {usdtPackages.map((pkg) => {
                  const inrEquivalent = pkg.amount * usdtRate;
                  const bonusInr = (inrEquivalent * pkg.bonusPercent) / 100;
                  const totalCredit = inrEquivalent + bonusInr;

                  return (
                    <div
                      key={pkg.amount}
                      onClick={() => handleReservePackage(pkg, true)}
                      className={`p-3 sm:p-3.5 rounded-3xl border relative transition-all active:scale-98 cursor-pointer overflow-hidden ${
                        isDark 
                          ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50' 
                          : 'bg-white border-purple-100 hover:border-emerald-400 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-tight text-emerald-600 dark:text-emerald-400 truncate">
                          {pkg.label}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                          +{pkg.bonusPercent}%
                        </span>
                      </div>

                      <div className="mt-1.5">
                        <span className={`text-lg sm:text-xl font-black block tracking-tight font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {pkg.amount} USDT
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 block truncate">
                          Gets: <strong className="text-emerald-600 dark:text-emerald-400">₹{totalCredit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                        </span>
                      </div>

                      <button
                        disabled={reserving}
                        className="w-full mt-2.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white font-black text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        Reserve <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* DEPOSIT HISTORY MODAL / DRAWER (Per PDF Spec 2.12.5)     */}
        {/* ======================================================== */}
        {showHistory && (
          <div className={`p-4 sm:p-5 rounded-3xl border space-y-3 ${cardStyle}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider">Deposit History</h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            {depositHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                No deposit records found yet.
              </div>
            ) : (
              <div className="space-y-2">
                {depositHistory.slice(0, 6).map((dep) => (
                  <div key={dep.id} className={`p-3 rounded-2xl border flex items-center justify-between ${subBoxStyle}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black">{dep.channelLabel || 'Deposit'}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-300">
                          {dep.currency}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        Ref: {dep.refNumber || 'N/A'} • {dep.createdAt ? new Date(dep.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black block font-mono text-emerald-600 dark:text-emerald-400">
                        +{dep.currency === 'USDT' ? `${dep.amount} USDT` : `₹${Number(dep.amount).toLocaleString('en-IN')}`}
                      </span>
                      <span className={`text-[10px] font-bold block ${
                        dep.status === 'COMPLETED' ? 'text-emerald-500' : dep.status === 'REJECTED' ? 'text-rose-500' : 'text-amber-500'
                      }`}>
                        {dep.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </AppShell>
  );
};
