import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useApp } from '../context/AppContext';
import { ArrowDownLeft, ArrowUpRight, Copy, Check, QrCode, Building2, ShieldCheck, Upload, Image, Sparkles } from 'lucide-react';

export const WalletPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('action') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview', 'deposit', 'withdraw'

  const { portfolio, marketSettings, paymentChannels, transactions, handleDeposit, handleWithdraw, showToast, isDark } = useApp();

  const cardStyle = isDark
    ? 'bg-[#121829] border-slate-800 text-white shadow-md'
    : 'bg-white border-purple-100 text-slate-800 shadow-[0_4px_20px_rgba(109,40,217,0.05)]';

  const subBoxStyle = isDark
    ? 'bg-slate-900/60 border-slate-800 text-slate-100'
    : 'bg-slate-50 border-slate-200 text-slate-900';

  const inputStyle = isDark
    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#6D28D9]';

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState('');
  const [depositUtr, setDepositUtr] = useState('');
  const [depositMethod, setDepositMethod] = useState('UPI'); // 'UPI', 'BANK', 'CRYPTO'
  const [selectedBankId, setSelectedBankId] = useState(paymentChannels.bankChannels[0]?.id || '');
  const [selectedCryptoChain, setSelectedCryptoChain] = useState('TRC20');
  const [depositScreenshot, setDepositScreenshot] = useState('');
  const [depositScreenshotFile, setDepositScreenshotFile] = useState(null);
  const [depositScreenshotPreview, setDepositScreenshotPreview] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('UPI');
  const [payoutAddress, setPayoutAddress] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('');

  // History Filter
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    if (searchParams.get('action')) {
      setActiveTab(searchParams.get('action'));
    }
  }, [searchParams]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const selectedBank = paymentChannels.bankChannels.find(b => b.id === selectedBankId) || paymentChannels.bankChannels[0];
  const selectedCrypto = paymentChannels.cryptoWallets.find(c => c.chain === selectedCryptoChain) || paymentChannels.cryptoWallets[0];
  const activeUpi = paymentChannels.upiChannels[0];

  // Dynamic UPI URL for QR
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${activeUpi.upiId}&pn=${encodeURIComponent(activeUpi.holderName)}&am=${depositAmount || '100'}&cu=INR`)}`;

  const submitDeposit = (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) < marketSettings.minDepositLimit) {
      showToast(`Minimum deposit is ₹${marketSettings.minDepositLimit}`, 'error');
      return;
    }
    if (!depositUtr || depositUtr.length < 8) {
      showToast('Please enter a valid UTR or Transaction Hash (min 8 digits)', 'error');
      return;
    }

    handleDeposit({
      amount: depositAmount,
      utr: depositUtr,
      method: depositMethod === 'BANK' ? `${selectedBank.label} (${selectedBank.bankName})` : depositMethod === 'CRYPTO' ? `Crypto (${selectedCryptoChain})` : 'UPI Auto QR',
      proof: depositScreenshot || '',
      proofFile: depositScreenshotFile,
    });

    setDepositAmount('');
    setDepositUtr('');
    setDepositScreenshot('');
    setDepositScreenshotFile(null);
    setDepositScreenshotPreview(null);
    setActiveTab('overview');
  };

  const submitWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) < marketSettings.minWithdrawalLimit) {
      showToast(`Minimum withdrawal is ₹${marketSettings.minWithdrawalLimit}`, 'error');
      return;
    }
    if (!payoutAddress) {
      showToast('Please enter payout destination details', 'error');
      return;
    }
    if (!withdrawPin || withdrawPin.length < 4) {
      showToast('Please enter your 4-digit Security PIN', 'error');
      return;
    }

    const success = await handleWithdraw({
      amount: withdrawAmount,
      destination: `${payoutMethod}: ${payoutAddress}`,
      pin: withdrawPin,
    });

    if (success) {
      setWithdrawAmount('');
      setPayoutAddress('');
      setWithdrawPin('');
      setActiveTab('overview');
    }
  };

  const filteredTxns = transactions.filter(t => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  return (
    <AppShell title="Wallet & Cashier">
      <div className="p-4 space-y-4">

        {/* Dual Balance Hero Card */}
        <div className="bg-gradient-to-br from-[#5B1EB7] via-[#6F23E1] to-[#431093] text-white rounded-3xl p-5 shadow-hero relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs text-purple-200 font-bold uppercase tracking-wider">Available Cash Balance</span>
            <h2 className="text-3xl font-black tracking-tight mt-0.5 mb-4">
              ₹{portfolio.inrBalance.toLocaleString('en-IN')}
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3">
                <span className="text-[10px] text-purple-200 block font-bold">The FamPay Tokens</span>
                <span className="text-sm font-black text-white">{portfolio.tokenBalance} FAST</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3">
                <span className="text-[10px] text-purple-200 block font-bold">USDT Portfolio</span>
                <span className="text-sm font-black text-white">${portfolio.usdtBalance} USDT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Toggle Pills */}
        <div className={`grid grid-cols-3 gap-2 p-1 rounded-2xl text-xs font-black ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-200/80'
        }`}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'overview' 
                ? isDark ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-[#6D28D9] shadow-xs' 
                : isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Ledger History
          </button>
          <button
            onClick={() => setActiveTab('deposit')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'deposit' 
                ? isDark ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-emerald-600 shadow-xs' 
                : isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Deposit
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'withdraw' 
                ? isDark ? 'bg-amber-600 text-white shadow-xs' : 'bg-white text-amber-600 shadow-xs' 
                : isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
          </button>
        </div>

        {/* ========================================================= */}
        {/* DEPOSIT MODULE (Manual Channels: Bank with Labels, Auto QR, Crypto) */}
        {/* ========================================================= */}
        {activeTab === 'deposit' && (
          <form onSubmit={submitDeposit} className={`rounded-3xl p-5 border space-y-4 ${cardStyle}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-800">Deposit Funds</h3>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Manual Approval
              </span>
            </div>

            {/* Deposit Packages (Client Feature: Extra Bonus per package) */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">Quick Deposit Packages (+Bonus)</span>
              <div className="grid grid-cols-2 gap-2">
                {paymentChannels.packages.map((pkg) => (
                  <button
                    type="button"
                    key={pkg.id}
                    onClick={() => setDepositAmount(String(pkg.amount))}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      depositAmount === String(pkg.amount)
                        ? 'border-[#6D28D9] bg-purple-50 text-[#6D28D9] shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase text-slate-400 block">{pkg.label}</span>
                    <span className="text-sm font-black block">₹{pkg.amount.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> +₹{pkg.bonus} Extra Bonus
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Channel Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'UPI', label: 'UPI Auto-QR', icon: QrCode },
                { id: 'BANK', label: 'Bank Channels', icon: Building2 },
                { id: 'CRYPTO', label: 'USDT (TRC/BEP)', icon: ShieldCheck },
              ].map(method => (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setDepositMethod(method.id)}
                  className={`py-2.5 px-2 rounded-2xl text-[11px] font-black border transition-all flex flex-col items-center gap-1 ${
                    depositMethod === method.id
                      ? 'border-[#6D28D9] bg-purple-50 text-[#6D28D9] shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <method.icon className="w-4 h-4" />
                  <span>{method.label}</span>
                </button>
              ))}
            </div>

            {/* Active Channel Details Box */}
            <div className="bg-[#FAF9FE] border border-purple-100 rounded-2xl p-4 text-xs space-y-3">
              
              {/* UPI AUTO QR GENERATOR */}
              {depositMethod === 'UPI' && (
                <>
                  <div className="text-center pb-2 border-b border-purple-100">
                    <span className="text-[11px] text-slate-600 font-extrabold block mb-2">
                      Scan Automatic QR Code via PhonePe / GPay / Paytm
                    </span>
                    <div className="w-44 h-44 mx-auto bg-white p-2 rounded-2xl border border-purple-200 shadow-md flex items-center justify-center">
                      <img 
                        src={upiQrUrl} 
                        alt="Dynamic UPI QR" 
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Official UPI ID</span>
                      <span className="font-mono font-black text-slate-800 text-xs">{activeUpi.upiId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activeUpi.upiId, 'upi')}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-[#6D28D9] shadow-xs"
                    >
                      {copiedKey === 'upi' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </>
              )}

              {/* BANK CHANNELS WITH LABELS */}
              {depositMethod === 'BANK' && (
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Select Bank Channel</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {paymentChannels.bankChannels.map((b) => (
                        <button
                          type="button"
                          key={b.id}
                          onClick={() => setSelectedBankId(b.id)}
                          className={`p-2 rounded-xl text-left border text-[11px] font-bold ${
                            selectedBank.id === b.id ? 'border-[#6D28D9] bg-white text-[#6D28D9]' : 'border-slate-200 bg-white/60 text-slate-600'
                          }`}
                        >
                          <span className="font-black block leading-tight">{b.label}</span>
                          <span className="text-[9px] text-slate-400">{b.bankName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-purple-100 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Holder:</span>
                      <span className="font-black text-slate-800">{selectedBank.holderName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-slate-400 block text-[9px]">Account Number:</span>
                        <span className="font-mono font-black text-slate-900">{selectedBank.accountNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedBank.accountNumber, 'acc')}
                        className="p-1 bg-purple-50 text-[#6D28D9] rounded border border-purple-100"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IFSC Code:</span>
                      <span className="font-mono font-black text-slate-800">{selectedBank.ifscCode}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CRYPTO WALLETS (TRC20 & BEP20) */}
              {depositMethod === 'CRYPTO' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    {paymentChannels.cryptoWallets.map((cw) => (
                      <button
                        type="button"
                        key={cw.id}
                        onClick={() => setSelectedCryptoChain(cw.chain)}
                        className={`p-2 rounded-xl text-xs font-black border ${
                          selectedCryptoChain === cw.chain ? 'border-[#6D28D9] bg-white text-[#6D28D9]' : 'border-slate-200 bg-white/60 text-slate-600'
                        }`}
                      >
                        {cw.chainName}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-purple-100 space-y-1 text-[11px]">
                    <span className="text-slate-400 block text-[10px]">Deposit Address:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[10px] break-all text-slate-900 flex-1">{selectedCrypto.address}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedCrypto.address, 'crypto')}
                        className="p-1.5 rounded bg-purple-50 text-[#6D28D9]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Deposit Amount Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Enter Deposit Amount (₹)</label>
              <input
                type="number"
                placeholder="Enter amount (min ₹100)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
              />
            </div>

            {/* UTR / Transaction Hash */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">12-Digit UTR / Transaction Hash</label>
              <input
                type="text"
                placeholder="e.g. 492019284729"
                value={depositUtr}
                onChange={(e) => setDepositUtr(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
              />
            </div>

            {/* Screenshot Proof Attachment */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Payment Screenshot Proof (Saved to Supabase)</label>
              <div className="border border-dashed border-purple-200 bg-purple-50/50 rounded-2xl p-3 text-center cursor-pointer">
                <input
                  type="file"
                  id="dep-proof"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setDepositScreenshot(file.name);
                      setDepositScreenshotFile(file);
                      setDepositScreenshotPreview(URL.createObjectURL(file));
                      showToast('Screenshot attached! Ready to upload to Supabase.', 'info');
                    }
                  }}
                />
                <label htmlFor="dep-proof" className="cursor-pointer flex flex-col items-center justify-center gap-2 text-xs font-bold text-[#6D28D9]">
                  {depositScreenshotPreview ? (
                    <div className="flex items-center gap-3">
                      <img src={depositScreenshotPreview} alt="Preview" className="w-12 h-12 object-cover rounded-xl border border-purple-300" />
                      <div className="text-left">
                        <span className="block text-slate-900 font-extrabold text-xs">{depositScreenshot}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">✓ Attached (Click to change)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>Upload Payment Screenshot</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-900/20 active:scale-98 transition-all text-xs"
            >
              Submit Deposit Request
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* WITHDRAW MODULE (PIN Protected)                           */}
        {/* ========================================================= */}
        {activeTab === 'withdraw' && (
          <form onSubmit={submitWithdraw} className={`rounded-3xl p-5 border space-y-4 ${cardStyle}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-800">Withdraw Funds</h3>
              <span className="text-[11px] text-[#6D28D9] font-bold">Available: ₹{portfolio.inrBalance.toLocaleString('en-IN')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {['UPI', 'BANK ACCOUNT'].map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPayoutMethod(m)}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    payoutMethod === m
                      ? 'border-[#6D28D9] bg-purple-50 text-[#6D28D9] shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Withdrawal Amount (₹)</label>
              <input
                type="number"
                placeholder="Enter amount (min ₹500)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {payoutMethod === 'UPI' ? 'Recipient UPI ID' : 'Bank Account No. & IFSC'}
              </label>
              <input
                type="text"
                placeholder={payoutMethod === 'UPI' ? 'user@upi' : 'Account Number, IFSC, Name'}
                value={payoutAddress}
                onChange={(e) => setPayoutAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">4-Digit Security PIN</label>
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={withdrawPin}
                onChange={(e) => setWithdrawPin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-center tracking-[0.5em] text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-amber-900/20 active:scale-98 transition-all text-xs"
            >
              Confirm Withdrawal
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* TRANSACTION LEDGER HISTORY                                */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className={`rounded-3xl p-4 border space-y-3 ${cardStyle}`}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black">Transaction Ledger</h4>
              
              <div className="flex gap-1 overflow-x-auto no-scrollbar text-[10px] font-black">
                {['ALL', 'DEPOSIT', 'WITHDRAWAL', 'TOKEN_BUY'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-2.5 py-1 rounded-xl transition-colors ${
                      filterType === f 
                        ? 'bg-purple-600 text-white' 
                        : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {f === 'ALL' ? 'All' : f === 'TOKEN_BUY' ? 'Buy' : f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filteredTxns.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 font-semibold">No records found</p>
              ) : (
                filteredTxns.map(txn => {
                  const isCredit = txn.type === 'DEPOSIT' || txn.type === 'REFERRAL_BONUS';
                  return (
                    <div key={txn.id} className={`p-3 rounded-2xl border flex justify-between items-center text-xs ${subBoxStyle}`}>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black">{txn.title || txn.type}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                            txn.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                            txn.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-rose-500/10 text-rose-500'
                          }`}>
                            {txn.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                          {txn.timestamp || new Date(txn.createdAt || Date.now()).toLocaleTimeString()} • {txn.refNumber || txn.id}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-black ${isCredit ? 'text-emerald-500' : isDark ? 'text-white' : 'text-slate-900'}`}>
                          {isCredit ? '+' : '-'}₹{Number(txn.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
};
