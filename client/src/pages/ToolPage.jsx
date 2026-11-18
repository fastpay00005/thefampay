import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { apiService } from '../services/apiService';
import { 
  ShieldCheck, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Building2, 
  Smartphone, 
  KeyRound, 
  Star, 
  Info,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ToolPage = () => {
  const { user, isDark, showToast } = useApp();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Account Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [accountType, setAccountType] = useState('UPI'); // 'UPI' or 'BANK'
  const [holderName, setHolderName] = useState(user?.fullName || '');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Verification Code Modal State
  const [selectedAccountForCode, setSelectedAccountForCode] = useState(null);
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);

  const fetchAccounts = async () => {
    if (!user?.id) return;
    try {
      const res = await apiService.getToolAccounts(user.id);
      if (res.success) {
        setAccounts(res.accounts || []);
      }
    } catch (e) {
      console.error('Fetch accounts error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user?.id]);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!holderName.trim()) {
      showToast('Please enter account holder name', 'error');
      return;
    }
    if (accountType === 'UPI' && !upiId.trim()) {
      showToast('Please enter a valid UPI ID (e.g. name@okhdfcbank)', 'error');
      return;
    }
    if (accountType === 'BANK' && (!accountNumber.trim() || !ifscCode.trim())) {
      showToast('Please enter Bank Account Number and IFSC Code', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiService.addToolAccount({
        userId: user.id,
        accountType,
        upiId: accountType === 'UPI' ? upiId.trim() : null,
        accountNumber: accountType === 'BANK' ? accountNumber.trim() : null,
        ifscCode: accountType === 'BANK' ? ifscCode.trim().toUpperCase() : null,
        holderName: holderName.trim(),
        bankName: accountType === 'BANK' ? bankName.trim() : null
      });

      if (res.success) {
        showToast('Payout account submitted for verification!', 'success');
        setShowAddModal(false);
        setUpiId('');
        setAccountNumber('');
        setIfscCode('');
        setBankName('');
        await fetchAccounts();
      } else {
        showToast(res.message || 'Failed to add account', 'error');
      }
    } catch (err) {
      showToast('Failed to add account. Check network.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCodeInput.trim() || !selectedAccountForCode) return;

    setVerifyingCode(true);
    try {
      const res = await apiService.verifyToolCode(selectedAccountForCode.id, verificationCodeInput.trim(), user.id);
      if (res.success) {
        showToast('Verification code confirmed! Account is now APPROVED.', 'success');
        setSelectedAccountForCode(null);
        setVerificationCodeInput('');
        await fetchAccounts();
      } else {
        showToast(res.message || 'Incorrect verification code', 'error');
      }
    } catch (err) {
      showToast('Verification error. Please retry.', 'error');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSetPrimary = async (accountId) => {
    try {
      const res = await apiService.setPrimaryToolAccount(accountId, user.id);
      if (res.success) {
        showToast('Primary payout account updated!', 'success');
        await fetchAccounts();
      }
    } catch {
      showToast('Failed to set primary account', 'error');
    }
  };

  return (
    <AppShell title="Tool & Payout Accounts">
      <div className="px-4 py-5 space-y-5">
        
        {/* Header Hero Banner */}
        <div className={`p-5 rounded-3xl relative overflow-hidden border ${
          isDark 
            ? 'bg-gradient-to-br from-indigo-950/70 via-purple-950/50 to-slate-900 border-purple-800/40 shadow-xl shadow-purple-950/30' 
            : 'bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white border-purple-400/30 shadow-lg shadow-purple-500/20'
        }`}>
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-tight bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1.5 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero-KYC Verified
              </span>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 rounded-2xl bg-white text-purple-900 font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-purple-700" />
                Add Account
              </button>
            </div>

            <h1 className="text-xl font-black text-white tracking-tight mt-3">
              Payout & Provider Tool
            </h1>
            <p className="text-xs text-purple-100/90 mt-1 leading-relaxed">
              Link your UPI ID or Bank account for fast 24/7 withdrawals and token cash-outs. Verified securely without requiring identity documents.
            </p>
          </div>
        </div>

        {/* Security / Notice Card */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
          isDark ? 'bg-purple-950/20 border-purple-800/30 text-purple-200' : 'bg-purple-50 border-purple-200/80 text-purple-900'
        }`}>
          <Info className="w-5 h-5 shrink-0 text-purple-500 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Fast Approval Security Protocol:</p>
            <p className="opacity-90 leading-relaxed">
              When you submit a payout account, our system verifies it within minutes. If challenged, an admin will issue a 4-digit verification code directly to you.
            </p>
          </div>
        </div>

        {/* Account List Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Registered Accounts ({accounts.length})
            </h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="text-xs font-bold text-purple-500 hover:text-purple-400 flex items-center gap-1"
            >
              + New Account
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
              Loading verified provider accounts...
            </div>
          ) : accounts.length === 0 ? (
            <div className={`p-8 rounded-3xl border border-dashed text-center ${
              isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <Smartphone className="w-10 h-10 mx-auto text-purple-500/70 mb-3" />
              <h3 className="font-black text-sm text-slate-300">No Payout Accounts Linked</h3>
              <p className="text-xs mt-1 max-w-[260px] mx-auto text-slate-400">
                Add your UPI ID or Bank account to enable instant cash-outs and withdrawals.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
              >
                + Add Payout Account
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((acc) => {
                const isApproved = acc.status === 'APPROVED';
                const isCodeReq = acc.status === 'CODE_REQUIRED';
                const isPending = acc.status === 'PENDING_REVIEW';
                const isRejected = acc.status === 'REJECTED';

                return (
                  <div
                    key={acc.id}
                    className={`p-4 rounded-3xl border transition-all ${
                      isDark 
                        ? 'bg-slate-900/80 border-slate-800/80 shadow-md' 
                        : 'bg-white border-slate-200/90 shadow-sm'
                    } ${acc.isPrimary ? 'ring-2 ring-purple-500/50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                          acc.accountType === 'BANK' 
                            ? 'bg-blue-500/15 text-blue-500' 
                            : 'bg-purple-500/15 text-purple-500'
                        }`}>
                          {acc.accountType === 'BANK' ? <Building2 className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {acc.holderName}
                            </h3>
                            {acc.isPrimary && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                PRIMARY
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">
                            {acc.accountType === 'UPI' ? acc.upiId : `${acc.bankName || 'Bank'} A/C ••${acc.accountNumber?.slice(-4)} (${acc.ifscCode})`}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isApproved && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        )}
                        {isCodeReq && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                            <KeyRound className="w-3.5 h-3.5" /> Code Required
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Reviewing
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Declined
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Row for Code Verification Challenge */}
                    {isCodeReq && (
                      <div className="mt-3 pt-3 border-t border-dashed border-amber-500/30 flex items-center justify-between">
                        <span className="text-[11px] text-amber-300 font-semibold">
                          Admin requested verification code confirmation
                        </span>
                        <button
                          onClick={() => {
                            setSelectedAccountForCode(acc);
                            setVerificationCodeInput('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Enter Code
                        </button>
                      </div>
                    )}

                    {/* Footer Actions */}
                    {isApproved && !acc.isPrimary && (
                      <div className="mt-3 pt-3 border-t border-slate-800/60 flex justify-end">
                        <button
                          onClick={() => handleSetPrimary(acc.id)}
                          className="text-xs font-bold text-slate-400 hover:text-purple-400 flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5" /> Set as Primary Payout
                        </button>
                      </div>
                    )}

                    {isRejected && acc.adminNotes && (
                      <div className="mt-2 text-[11px] text-rose-400 bg-rose-950/20 p-2 rounded-xl border border-rose-900/40">
                        Reason: {acc.adminNotes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Link to Cash Out / Withdraw */}
        <div className={`p-4 rounded-3xl border flex items-center justify-between cursor-pointer active:scale-98 transition-all ${
          isDark ? 'bg-slate-900/60 border-slate-800 hover:border-purple-600/40' : 'bg-white border-slate-200'
        }`} onClick={() => navigate('/token')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black">
              ₹
            </div>
            <div>
              <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Ready to Cash Out?</h4>
              <p className="text-[11px] text-slate-400">Withdraw or cash out tokens to your approved account.</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-400" />
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD PROVIDER ACCOUNT (Zero-KYC)                */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-t-[32px] sm:rounded-3xl p-6 border shadow-2xl ${
            isDark ? 'bg-[#0E1322] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between pb-4 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Add Payout Account
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4 mt-4">
              {/* Account Type Toggle */}
              <div className={`grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setAccountType('UPI')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    accountType === 'UPI' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30' 
                      : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-900' : 'text-slate-700 hover:text-slate-950 hover:bg-white/80'
                  }`}
                >
                  <span>⚡</span> UPI (Instant)
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('BANK')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    accountType === 'BANK' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30' 
                      : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-900' : 'text-slate-700 hover:text-slate-950 hover:bg-white/80'
                  }`}
                >
                  <span>🏦</span> Bank Account
                </button>
              </div>

              {/* Account Holder Name */}
              <div>
                <label className={`text-[11px] font-bold block mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Account Holder Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="As per bank / UPI record"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-semibold outline-none border transition-all ${
                    isDark 
                      ? 'bg-slate-950/60 border-slate-800 focus:border-purple-500 text-white' 
                      : 'bg-slate-50 border-slate-200 focus:border-purple-500 text-slate-900'
                  }`}
                />
              </div>

              {accountType === 'UPI' ? (
                <div>
                  <label className={`text-[11px] font-bold block mb-1.5 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    UPI ID (Virtual Payment Address)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. mobile@paytm or name@okaxis"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl text-xs font-semibold outline-none border transition-all ${
                      isDark 
                        ? 'bg-slate-950/60 border-slate-800 focus:border-purple-500 text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-purple-500 text-slate-900'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Supported: GPay, PhonePe, Paytm, BHIM, Bank UPI.
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className={`text-[11px] font-bold block mb-1.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Bank Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. State Bank of India / HDFC"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-2xl text-xs font-semibold outline-none border transition-all ${
                        isDark ? 'bg-slate-950/60 border-slate-800 focus:border-purple-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-purple-500 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-[11px] font-bold block mb-1.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Account Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-2xl text-xs font-semibold outline-none border transition-all ${
                        isDark ? 'bg-slate-950/60 border-slate-800 focus:border-purple-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-purple-500 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-[11px] font-bold block mb-1.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SBIN0001234"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className={`w-full px-4 py-2.5 rounded-2xl text-xs font-semibold outline-none border uppercase transition-all ${
                        isDark ? 'bg-slate-950/60 border-slate-800 focus:border-purple-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-purple-500 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm shadow-xl shadow-purple-600/30 active:scale-95 transition-all mt-4 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ENTER VERIFICATION CHALLENGE CODE              */}
      {/* ======================================================== */}
      {selectedAccountForCode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${
            isDark ? 'bg-[#0E1322] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className={`text-center font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Enter Verification Code
            </h3>
            <p className={`text-center text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Please enter the challenge code issued for {selectedAccountForCode.upiId || selectedAccountForCode.accountNumber}.
            </p>

            <form onSubmit={handleVerifyCode} className="space-y-4 mt-5">
              <input
                type="text"
                required
                maxLength={8}
                placeholder="Enter 4 or 6-digit code"
                value={verificationCodeInput}
                onChange={(e) => setVerificationCodeInput(e.target.value)}
                className={`w-full text-center tracking-widest text-lg font-black py-3 rounded-2xl border outline-none transition-all ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                }`}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAccountForCode(null)}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all ${
                    isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingCode}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 active:scale-95 transition-all disabled:opacity-50"
                >
                  {verifyingCode ? 'Verifying...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppShell>
  );
};

