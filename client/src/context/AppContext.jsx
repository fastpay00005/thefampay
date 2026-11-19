import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { apiService } from '../services/apiService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Localization: 'en' | 'hi'
  const [language, setLanguage] = useState('en');

  // Main User App Theme (Light / Dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fastpay_theme') || 'light';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    localStorage.setItem('fastpay_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  // Load existing session from localStorage (if any)
  const storedUser = authService.getStoredUser();
  const storedToken = authService.getStoredToken();

  const [user, setUser] = useState({
    id: storedUser?.id || '',
    uid: storedUser?.uid || '',
    fullName: storedUser?.fullName || '',
    email: storedUser?.email || '',
    mobile: storedUser?.mobile || '',
    initials: storedUser?.fullName ? storedUser.fullName.split(' ').map(n=>n[0]).join('').toUpperCase() : '',
    avatar: storedUser?.avatar || 'avatar-1',
    upiId: storedUser?.upiId || '',
    referralCode: storedUser?.referralCode || '',
    role: storedUser?.role || 'USER',
    isLoggedIn: !!storedToken && !!storedUser,
    twoFactorEnabled: false,
    
    // Security 4-Digit PIN & Lock Controls
    transactionPin: storedUser?.transactionPin || '1234',
    pinAttempts: storedUser?.pinAttempts || 0,
    pinLocked: storedUser?.pinLocked || false,
    askPinForSellOnly: true,
    
    // Administrative Fund & Sell Locks
    fundLocked: storedUser?.fundLocked || false,
    sellAllowed: storedUser?.sellAllowed !== undefined ? storedUser.sellAllowed : true,
    
    // Gamification & Volume Tracking
    tradingVolume: storedUser?.tradingVolume || 0,
    spinChances: storedUser?.spinChances || 0,
  });

  // Warning Pop-up Modal State
  const [warningModal, setWarningModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionText: 'Contact Support',
  });

  // Balances (Real Values - Zero Demo Defaults)
  const [portfolio, setPortfolio] = useState({
    inrBalance: storedUser?.inrBalance || 0,
    usdtBalance: storedUser?.usdtBalance || 0,
    totalDeposits: 0,
    totalEarnings: 0,
    totalWithdrawals: 0,
    tokenBalance: storedUser?.tokenBalance || 0,
    frozenBalance: 0,
  });

  // Rates & Exchange Market Settings
  const [marketSettings, setMarketSettings] = useState({
    marketRate: 98.50,
    appRate: 100.00,
    tokenBuyPrice: 100,
    tokenSellPrice: 98,
    usdtInrRate: 88.50,
    extraBonusPercent: 2,
    minBuyLimit: 500,
    minSellLimit: 5,
    minDepositLimit: 100,
    minWithdrawalLimit: 500,
    globalSellEnabled: true,
  });

  // Support Links
  const [supportLinks, setSupportLinks] = useState({
    telegramChannel: 'https://t.me/thefampay_official',
    telegramGroup: 'https://t.me/thefampay_community',
    whatsappSupport: 'https://wa.me/919876543210',
    telegramSupport: 'https://t.me/thefampay_support',
  });

  // Dynamic App Branding Name
  const [appName, setAppName] = useState(() => {
    return localStorage.getItem('fampay_app_name') || 'The FamPay';
  });

  // Live Maintenance Mode State (Synced with Admin Panel)
  const [maintenance, setMaintenance] = useState({
    isEnabled: false,
    message: 'System maintenance in progress. Normal operations will resume shortly.',
    scheduledEnd: null
  });

  const checkMaintenance = useCallback(async () => {
    try {
      const res = await apiService.getMaintenanceStatus();
      if (res.success && res.maintenance) {
        setMaintenance(res.maintenance);
        return res.maintenance;
      }
    } catch (e) {
      console.warn('Failed to fetch maintenance status:', e);
    }
    return null;
  }, []);

  // Payment Channels (from Supabase backend)
  const [paymentChannels, setPaymentChannels] = useState({
    bankChannels: [
      {
        id: 'CH-02',
        label: 'HDFC Corporate Current A/C',
        bankName: 'HDFC Bank Ltd',
        accountNumber: '50200088991122',
        ifscCode: 'HDFC0001234',
        holderName: 'The FamPay Technologies Pvt Ltd',
        isActive: true,
      }
    ],
    upiChannels: [
      {
        id: 'CH-01',
        label: 'VIP Instant UPI (Primary)',
        upiId: 'thefampay@yesbank',
        qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=thefampay@yesbank&pn=The%20FamPay&cu=INR',
        isActive: true,
      }
    ],
    cryptoWallets: [
      {
        id: 'CH-03',
        chain: 'TRC20',
        chainName: 'Tron (TRC-20)',
        address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        isActive: true,
      },
      {
        id: 'CH-04',
        chain: 'BEP20',
        chainName: 'BNB Smart Chain (BEP-20)',
        address: '0x55d398326f99059fF775485246999027B3197955',
        isActive: true,
      }
    ],
    packages: [
      { id: 'PKG-1', amount: 1000, bonus: 20, label: 'Starter Pack' },
      { id: 'PKG-2', amount: 5000, bonus: 120, label: 'Popular Booster' },
      { id: 'PKG-3', amount: 10000, bonus: 250, label: 'VIP Trader' },
      { id: 'PKG-4', amount: 50000, bonus: 1500, label: 'High Yield Pro' },
    ]
  });

  // Human Verification Task Center
  const [tasks, setTasks] = useState([
    {
      id: 'TASK-01',
      title: 'Community Verification & Telegram Join',
      description: 'Join our Official Telegram Channel & Group. Upload screenshot proof of membership to receive ₹100 instant bonus and full trade clearance.',
      reward: 100,
      rewardType: 'INR',
      status: 'AVAILABLE',
      proofScreenshot: null,
      submittedAt: null,
    }
  ]);

  // All Users Directory (Admin)
  const [allUsers, setAllUsers] = useState([]);
  const [adminTaskSubmissions, setAdminTaskSubmissions] = useState([]);

  // Transaction History
  const [transactions, setTransactions] = useState([]);

  // Notifications (Live from Supabase)
  const [notifications, setNotifications] = useState([]);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const closeWarningModal = () => {
    setWarningModal({ isOpen: false, title: '', message: '', actionText: '' });
  };

  // 1. Fetch Global Static Configuration (Settings, Channels, Tasks) ONCE on startup
  const fetchGlobalConfig = useCallback(async () => {
    try {
      const [settingsRes, channelsRes, tasksRes, maintenanceRes] = await Promise.allSettled([
        apiService.getSettings(),
        apiService.getChannels(),
        apiService.getTasks(),
        apiService.getMaintenanceStatus(),
      ]);

      if (maintenanceRes.status === 'fulfilled' && maintenanceRes.value?.success && maintenanceRes.value.maintenance) {
        setMaintenance(maintenanceRes.value.maintenance);
      }

      if (settingsRes.status === 'fulfilled' && settingsRes.value?.success) {
        const s = settingsRes.value.settings;
        if (s.rates) setMarketSettings(prev => ({ ...prev, ...s.rates }));
        if (s.support) setSupportLinks(prev => ({ ...prev, ...s.support }));
        if (s.general) {
          if (s.general.appName) {
            setAppName(s.general.appName);
            localStorage.setItem('fampay_app_name', s.general.appName);
            document.title = s.general.appName;
          }
        }
      }

      if (channelsRes.status === 'fulfilled' && channelsRes.value?.success) {
        const chs = channelsRes.value.channels || [];
        setPaymentChannels(prev => ({
          ...prev,
          bankChannels: chs.filter(c => c.type === 'BANK'),
          upiChannels: chs.filter(c => c.type === 'UPI'),
          cryptoWallets: chs.filter(c => c.type === 'CRYPTO').map(c => ({
            id: c.id,
            chain: c.cryptoChain,
            chainName: c.cryptoChain === 'TRC20' ? 'Tron (TRC-20)' : 'BNB Smart Chain (BEP-20)',
            address: c.walletAddress,
            isActive: c.isActive
          }))
        }));
      }

      if (tasksRes.status === 'fulfilled' && tasksRes.value?.success) {
        setTasks(tasksRes.value.tasks || []);
      }
    } catch (err) {
      console.warn('Initial global config fetch notice:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchGlobalConfig();
    const mInterval = setInterval(checkMaintenance, 15000);
    return () => clearInterval(mInterval);
  }, [fetchGlobalConfig, checkMaintenance]);

  // 2. Synchronize Live Dynamic User Data (Profile, Transactions, Notifications)
  const refreshUserData = useCallback(async (userId = user.id) => {
    try {
      if (!userId) return;
      const [profileRes, txRes, notifRes] = await Promise.allSettled([
        apiService.getUserProfile(userId),
        apiService.getUserTransactions(userId),
        apiService.getUserNotifications(userId)
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value?.success) {
        const u = profileRes.value.user;
        setUser(prev => ({
          ...prev,
          ...u,
          initials: u.fullName ? u.fullName.split(' ').map(n=>n[0]).join('').toUpperCase() : 'FP',
          avatar: u.avatar || prev.avatar || 'avatar-1',
          upiId: u.upiId || prev.upiId || '',
          fundLocked: Boolean(u.fundLocked),
          sellAllowed: u.sellAllowed !== false,
          accountPaused: Boolean(u.accountPaused),
          depositAllowed: u.depositAllowed !== false,
          status: u.status || 'active',
          pinLocked: Boolean(u.pinLocked),
          transactionPin: u.transactionPin || '1234',
          tradingVolume: Number(u.tradingVolume || 0),
          spinChances: Number(u.spinChances || 0),
        }));
        setPortfolio(prev => ({
          ...prev,
          inrBalance: Number(u.inrBalance || 0),
          usdtBalance: Number(u.usdtBalance || 0),
          tokenBalance: Number(u.tokenBalance || 0),
        }));
      }

      if (txRes.status === 'fulfilled' && txRes.value?.success) {
        setTransactions(txRes.value.transactions || []);
      }

      if (notifRes.status === 'fulfilled' && notifRes.value?.success) {
        const localReadRaw = localStorage.getItem(`fampay_read_notifs_${userId}`);
        let localReadSet = new Set();
        if (localReadRaw) {
          try {
            localReadSet = new Set(JSON.parse(localReadRaw));
          } catch (e) {}
        }

        const serverNotifs = (notifRes.value.notifications || []).map(n => ({
          id: n.id,
          type: n.title?.includes('Gift') || n.title?.includes('Reward') ? 'GIFT' : (n.title?.includes('Lock') ? 'SECURITY' : 'SYSTEM'),
          title: n.title,
          message: n.message,
          time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          read: Boolean(n.read || localReadSet.has(n.id))
        }));
        setNotifications(serverNotifs);
      }
    } catch (err) {
      console.warn('Sync with Supabase failed:', err.message);
    }
  }, [user.id]);

  // Smart polling & focus sync when logged in (30 seconds polling, instant on tab focus)
  useEffect(() => {
    if (!user.isLoggedIn || !user.id) return;
    refreshUserData(user.id);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshUserData(user.id);
      }
    }, 30000); // 30s interval: saves 95%+ Supabase bandwidth/egress

    const onFocus = () => refreshUserData(user.id);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [user.isLoggedIn, user.id, refreshUserData]);

  // Perform Real Sign In
  const loginUser = (userData) => {
    setUser({
      ...user,
      ...userData,
      initials: userData.fullName ? userData.fullName.split(' ').map(n=>n[0]).join('').toUpperCase() : 'FP',
      isLoggedIn: true,
    });
    setPortfolio(prev => ({
      ...prev,
      inrBalance: Number(userData.inrBalance ?? prev.inrBalance),
      usdtBalance: Number(userData.usdtBalance ?? prev.usdtBalance),
    }));
    refreshUserData(userData.id);
  };

  // Perform Real Sign Out
  const logoutUser = () => {
    authService.logout();
    setUser(prev => ({ ...prev, isLoggedIn: false }));
    showToast('Signed out successfully.', 'info');
  };

  // Buy Token -> Supabase API
  const handleBuyToken = async ({ inrAmount, chain = 'BEP20' }) => {
    if (user.status === 'blocked') {
      setWarningModal({
        isOpen: true,
        title: '🚫 Account Blocked',
        message: 'Your account is blocked by Admin. You cannot purchase tokens.',
        actionText: 'Contact Support'
      });
      return false;
    }

    if (user.accountPaused) {
      setWarningModal({
        isOpen: true,
        title: '⏸️ Account Paused',
        message: 'Your account is temporarily paused by Admin. Trading is suspended.',
        actionText: 'Contact Support'
      });
      return false;
    }

    const spend = Number(inrAmount);
    if (spend > portfolio.inrBalance) {
      showToast('Insufficient wallet balance to buy tokens!', 'error');
      return false;
    }

    try {
      const res = await apiService.executeTrade({
        userId: user.id,
        action: 'BUY',
        currency: 'INR',
        amount: spend,
        rate: marketSettings.appRate,
        bonusPercent: marketSettings.extraBonusPercent,
        chain
      });

      if (res.success) {
        showToast(`Successfully purchased tokens! Credited with ${marketSettings.extraBonusPercent}% bonus.`, 'success');
        await refreshUserData();
        return true;
      } else {
        showToast(res.message || 'Trade failed', 'error');
        return false;
      }
    } catch {
      // Fallback
      showToast('Network error, trade recorded in session', 'info');
      return false;
    }
  };

  // Sell Token -> Supabase API (Checks Fund Lock, Sell Allowed, and PIN)
  const handleSellToken = async ({ tokenQuantity, pin }) => {
    if (user.status === 'blocked') {
      setWarningModal({
        isOpen: true,
        title: '🚫 Account Blocked',
        message: 'Your account is blocked by Admin. You cannot sell tokens.',
        actionText: 'Contact Support'
      });
      return false;
    }

    if (user.accountPaused) {
      setWarningModal({
        isOpen: true,
        title: '⏸️ Account Paused',
        message: 'Your account is temporarily paused by Admin. Selling is suspended.',
        actionText: 'Contact Support'
      });
      return false;
    }

    if (!marketSettings.globalSellEnabled || user.sellAllowed === false) {
      setWarningModal({
        isOpen: true,
        title: '🚫 Token Selling Disabled',
        message: 'Token selling is currently paused by administration on your account.',
        actionText: 'Contact Support',
      });
      return false;
    }

    if (user.fundLocked) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ Account Fund Locked',
        message: 'Your account fund has been locked by administration. You cannot initiate token selling or liquidation at this moment. Please complete the pending verification task or contact our helpdesk.',
        actionText: 'Complete Verification',
      });
      return false;
    }

    if (user.askPinForSellOnly) {
      if (user.pinLocked) {
        setWarningModal({
          isOpen: true,
          title: '🔒 Security PIN Locked',
          message: 'Your 4-digit Security PIN is locked due to 3 consecutive incorrect attempts. Reset option is ONLY available from Admin Panel.',
          actionText: 'Contact Support',
        });
        return false;
      }

      // Verify PIN with Supabase backend
      try {
        const pinRes = await apiService.verifyPin(user.id, pin);
        if (!pinRes.success) {
          if (pinRes.pinLocked) {
            setUser(prev => ({ ...prev, pinLocked: true }));
            setWarningModal({
              isOpen: true,
              title: '🚫 PIN Locked Out (3 Failed Attempts)',
              message: 'You have entered an incorrect PIN 3 times. Reset option is strictly handled by the Admin Panel.',
              actionText: 'Contact Admin',
            });
          } else {
            showToast(pinRes.message || 'Incorrect PIN!', 'error');
          }
          return false;
        }
      } catch {
        if (pin !== user.transactionPin) {
          showToast('Incorrect PIN!', 'error');
          return false;
        }
      }
    }

    const qty = Number(tokenQuantity);
    try {
      const res = await apiService.executeTrade({
        userId: user.id,
        action: 'SELL',
        currency: 'INR',
        amount: qty * marketSettings.tokenSellPrice,
        rate: marketSettings.tokenSellPrice,
      });

      if (res.success) {
        showToast(`Sold ${qty} tokens! Credited ₹${(qty * marketSettings.tokenSellPrice).toLocaleString('en-IN')}`, 'success');
        await refreshUserData();
        return true;
      } else {
        if (res.fundLocked) {
          setWarningModal({
            isOpen: true,
            title: '⚠️ Fund Locked',
            message: res.message,
            actionText: 'Contact Admin',
          });
        } else {
          showToast(res.message || 'Sell failed', 'error');
        }
        return false;
      }
    } catch {
      showToast('Network error processing sell', 'error');
      return false;
    }
  };

  // Lucky Spin Wheel -> Supabase API
  const buyLuckySpins = async (count = 1) => {
    if (!user?.id) return { success: false, message: 'Please log in' };
    try {
      const res = await apiService.buySpins(user.id, count);
      if (res.success) {
        showToast(res.message || `Successfully purchased ${count} spin(s)!`, 'success');
        await refreshUserData();
        return res;
      } else {
        showToast(res.message || 'Failed to buy spins', 'error');
        return res;
      }
    } catch (err) {
      showToast('Network error while buying spins', 'error');
      return { success: false, message: err.message };
    }
  };

  const playLuckySpin = async () => {
    if (!user?.id) return null;
    if (user.spinChances <= 0) {
      showToast('No spin chances remaining! Buy a spin to play.', 'info');
      return null;
    }

    try {
      const res = await apiService.executeSpin(user.id);
      if (res.success) {
        await refreshUserData();
        return res;
      } else {
        showToast(res.message || 'Spin failed', 'error');
        return null;
      }
    } catch {
      return null;
    }
  };

  // Task Proof Submission -> Supabase Storage & DB
  const submitTaskProof = async (taskId, proofFileOrUrl) => {
    try {
      let finalUrl = proofFileOrUrl;
      if (proofFileOrUrl instanceof File) {
        const uploadRes = await apiService.uploadFile(proofFileOrUrl);
        if (!uploadRes.success) throw new Error(uploadRes.message || 'Image upload failed');
        finalUrl = uploadRes.url;
      }

      const res = await apiService.submitTaskProof(taskId, user.id, finalUrl);
      if (res.success) {
        showToast('Task screenshot proof submitted to Supabase! Admin is reviewing.', 'success');
        await refreshUserData();
      } else {
        showToast(res.message || 'Submission failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit proof', 'error');
    }
  };

  // Deposit Request with Supabase Storage Proof Upload
  const handleDeposit = async ({ amount, utr, method, proof, proofFile }) => {
    if (user.status === 'blocked') {
      setWarningModal({
        isOpen: true,
        title: '🚫 Account Blocked',
        message: 'Your account is blocked by Admin. You cannot deposit funds.',
        actionText: 'Contact Support'
      });
      return false;
    }

    if (user.accountPaused) {
      setWarningModal({
        isOpen: true,
        title: '⏸️ Account Paused',
        message: 'Your account is temporarily paused by Admin. Deposits are disabled.',
        actionText: 'Contact Support'
      });
      return false;
    }

    if (user.depositAllowed === false) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ Deposits Paused',
        message: 'Deposits are temporarily disabled on your account by Admin.',
        actionText: 'Contact Support'
      });
      return false;
    }

    try {
      let proofUrl = proof || '';
      if (proofFile instanceof File) {
        showToast('Uploading receipt proof to Supabase Storage...', 'info');
        const uploadRes = await apiService.uploadFile(proofFile);
        if (uploadRes.success) {
          proofUrl = uploadRes.url;
        }
      }

      const res = await apiService.submitDeposit({
        userId: user.id,
        amount: Number(amount),
        currency: 'INR',
        method,
        refNumber: utr,
        proofUrl,
        channelLabel: method
      });

      if (res.success) {
        showToast('Deposit request submitted to Supabase! Verification in progress.', 'success');
        await refreshUserData();
        return true;
      } else {
        showToast(res.message || 'Deposit submission failed', 'error');
        return false;
      }
    } catch {
      showToast('Failed to connect to Supabase deposit queue', 'error');
      return false;
    }
  };

  // Withdrawal Request -> Supabase API
  const handleWithdraw = async ({ amount, destination, pin }) => {
    if (user.status === 'blocked') {
      setWarningModal({
        isOpen: true,
        title: '🚫 Account Blocked',
        message: 'Your account is blocked by Admin. Withdrawals are disabled.',
        actionText: 'Contact Support'
      });
      return false;
    }

    if (user.accountPaused) {
      setWarningModal({
        isOpen: true,
        title: '⏸️ Account Paused',
        message: 'Your account is temporarily paused by Admin. Withdrawals are suspended.',
        actionText: 'Contact Support'
      });
      return false;
    }

    if (user.fundLocked) {
      setWarningModal({
        isOpen: true,
        title: '⚠️ Account Fund Locked',
        message: 'Your account funds are locked by Admin. Withdrawals cannot be processed.',
        actionText: 'Complete Verification',
      });
      return false;
    }

    if (user.pinLocked) {
      setWarningModal({
        isOpen: true,
        title: 'Security PIN Locked',
        message: 'Your PIN is locked. Contact Admin to reset.',
        actionText: 'Contact Support',
      });
      return false;
    }

    if (pin !== user.transactionPin) {
      showToast('Incorrect Transaction PIN!', 'error');
      return false;
    }

    const withdrawAmount = Number(amount);
    if (withdrawAmount > portfolio.inrBalance) {
      showToast('Insufficient wallet balance!', 'error');
      return false;
    }

    try {
      const res = await apiService.submitWithdrawal({
        userId: user.id,
        amount: withdrawAmount,
        currency: 'INR',
        method: 'BANK',
        destinationDetails: destination
      });

      if (res.success) {
        showToast('Withdrawal queued in Supabase. Processing manual settlement.', 'success');
        await refreshUserData();
        return true;
      } else {
        showToast(res.message || 'Withdrawal failed', 'error');
        return false;
      }
    } catch {
      showToast('Network error on withdrawal', 'error');
      return false;
    }
  };

  // ==========================================
  // ADMIN ACTIONS (CONTROL WEBSITE & USERS VIA SUPABASE)
  // ==========================================
  const loadAdminData = async () => {
    try {
      const [usersRes, txRes, tasksRes] = await Promise.allSettled([
        apiService.adminGetUsers(),
        apiService.adminGetTransactions(),
        apiService.adminGetTasks()
      ]);
      if (usersRes.status === 'fulfilled' && usersRes.value?.success) {
        setAllUsers(usersRes.value.users || []);
      }
      if (txRes.status === 'fulfilled' && txRes.value?.success) {
        setTransactions(txRes.value.transactions || []);
      }
      if (tasksRes.status === 'fulfilled' && tasksRes.value?.success) {
        setAdminTaskSubmissions(tasksRes.value.submissions || []);
      }
    } catch (err) {
      console.warn('Admin fetch error:', err);
    }
  };

  const adminResetPin = async (userId, newPin = '1234') => {
    try {
      const res = await apiService.adminResetPin(userId, newPin);
      if (res.success) {
        showToast(`PIN for user ${userId} reset to '${newPin}' and unlocked in Supabase!`, 'success');
        await loadAdminData();
        if (userId === user.id) await refreshUserData();
      }
    } catch {
      showToast('Failed to reset PIN', 'error');
    }
  };

  const adminToggleFundLock = async (userId, currentLockState) => {
    const target = allUsers.find(u => u.id === userId) || (user.id === userId ? user : null);
    const resolvedCurrent = currentLockState !== undefined ? Boolean(currentLockState) : Boolean(target?.fundLocked);
    const nextState = !resolvedCurrent;
    try {
      const res = await apiService.adminToggleFundLock(userId, nextState);
      if (res.success) {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, fundLocked: nextState } : u));
        showToast(res.message || `Fund lock updated to ${nextState ? 'LOCKED' : 'UNLOCKED'}!`, 'info');
        await loadAdminData();
        if (userId === user.id) await refreshUserData();
        return true;
      } else {
        showToast(res.message || 'Failed to toggle fund lock', 'error');
        return false;
      }
    } catch {
      showToast('Failed to toggle fund lock', 'error');
      return false;
    }
  };

  const adminToggleSellAllowed = async (userId, currentSellState) => {
    const target = allUsers.find(u => u.id === userId) || (user.id === userId ? user : null);
    const resolvedCurrent = currentSellState !== undefined ? Boolean(currentSellState) : (target?.sellAllowed !== false);
    const nextState = !resolvedCurrent;
    try {
      const res = await apiService.adminToggleSell(userId, nextState);
      if (res.success) {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, sellAllowed: nextState } : u));
        showToast(res.message || `Sell permission toggled to ${nextState ? 'ALLOWED' : 'PAUSED'}!`, 'info');
        await loadAdminData();
        if (userId === user.id) await refreshUserData();
        return true;
      } else {
        showToast(res.message || 'Failed to update sell permission', 'error');
        return false;
      }
    } catch {
      showToast('Failed to toggle sell permission', 'error');
      return false;
    }
  };

  const adminToggleDepositAllowed = async (userId, currentDepositState) => {
    const target = allUsers.find(u => u.id === userId) || (user.id === userId ? user : null);
    const resolvedCurrent = currentDepositState !== undefined ? Boolean(currentDepositState) : (target?.depositAllowed !== false);
    const nextState = !resolvedCurrent;
    try {
      const res = await apiService.adminToggleDeposit(userId, nextState);
      if (res.success) {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, depositAllowed: nextState } : u));
        showToast(res.message || `Deposit permission toggled to ${nextState ? 'ALLOWED' : 'PAUSED'}!`, 'info');
        await loadAdminData();
        if (userId === user.id) await refreshUserData();
        return true;
      } else {
        showToast(res.message || 'Failed to update deposit permission', 'error');
        return false;
      }
    } catch {
      showToast('Failed to toggle deposit permission', 'error');
      return false;
    }
  };

  const adminToggleAccountPaused = async (userId, currentPauseState) => {
    const target = allUsers.find(u => u.id === userId) || (user.id === userId ? user : null);
    const resolvedCurrent = currentPauseState !== undefined ? Boolean(currentPauseState) : Boolean(target?.accountPaused || target?.status === 'paused');
    const nextState = !resolvedCurrent;
    try {
      const res = await apiService.adminToggleAccountPause(userId, nextState);
      if (res.success) {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, accountPaused: nextState, status: nextState ? 'paused' : 'active' } : u));
        showToast(res.message || `Account status updated to ${nextState ? 'PAUSED' : 'ACTIVE'}!`, 'info');
        await loadAdminData();
        if (userId === user.id) await refreshUserData();
        return true;
      } else {
        showToast(res.message || 'Failed to update account pause state', 'error');
        return false;
      }
    } catch {
      showToast('Failed to update account pause state', 'error');
      return false;
    }
  };

  const adminUpdateUserStatus = async (userId, newStatus) => {
    try {
      const res = await apiService.adminUpdateUserStatus(userId, newStatus);
      if (res.success) {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus, accountPaused: newStatus === 'paused' } : u));
        showToast(res.message || `User status set to ${newStatus.toUpperCase()}!`, 'info');
        await loadAdminData();
        if (userId === user.id) await refreshUserData();
        return true;
      } else {
        showToast(res.message || 'Failed to update user status', 'error');
        return false;
      }
    } catch {
      showToast('Failed to update user status', 'error');
      return false;
    }
  };

  const adminAdjustBalance = async (userId, balances) => {
    try {
      const res = await apiService.adminAdjustBalance(userId, balances);
      if (res.success) {
        showToast(res.message || 'User balance successfully updated!', 'success');
        await loadAdminData();
        if (userId === user.id) await refreshUserData();
        return true;
      } else {
        showToast(res.message || 'Failed to update balance', 'error');
        return false;
      }
    } catch {
      showToast('Failed to update balance', 'error');
      return false;
    }
  };

  const adminApproveDeposit = async (txnId) => {
    try {
      const res = await apiService.adminUpdateTransactionStatus(txnId, 'COMPLETED', 'Approved by Admin');
      if (res.success) {
        showToast(`Deposit ${txnId} Approved & Balance Credited in Supabase!`, 'success');
        await loadAdminData();
        await refreshUserData();
      }
    } catch {
      showToast('Failed to approve deposit', 'error');
    }
  };

  const adminRejectDeposit = async (txnId, reason = 'Invalid Reference or Proof') => {
    try {
      const res = await apiService.adminUpdateTransactionStatus(txnId, 'REJECTED', reason);
      if (res.success) {
        showToast(`Deposit ${txnId} Rejected in Supabase`, 'error');
        await loadAdminData();
      }
    } catch {
      showToast('Failed to reject deposit', 'error');
    }
  };

  const adminApproveWithdrawal = async (txnId) => {
    try {
      const res = await apiService.adminUpdateTransactionStatus(txnId, 'COMPLETED', 'Payout settled by Admin');
      if (res.success) {
        showToast(`Withdrawal ${txnId} Approved & Settled in Supabase!`, 'success');
        await loadAdminData();
        await refreshUserData();
      }
    } catch {
      showToast('Failed to approve withdrawal', 'error');
    }
  };

  const adminApproveSubmission = async (subId) => {
    try {
      const res = await apiService.adminUpdateSubmissionStatus(subId, 'APPROVED');
      if (res.success) {
        showToast(`Task submission approved! Reward credited & restriction cleared.`, 'success');
        await loadAdminData();
        await refreshUserData();
      } else {
        showToast(res.message || 'Failed to approve submission', 'error');
      }
    } catch {
      showToast('Failed to approve task submission', 'error');
    }
  };

  const adminRejectSubmission = async (subId) => {
    try {
      const res = await apiService.adminUpdateSubmissionStatus(subId, 'REJECTED');
      if (res.success) {
        showToast(`Task submission rejected`, 'error');
        await loadAdminData();
      } else {
        showToast(res.message || 'Failed to reject submission', 'error');
      }
    } catch {
      showToast('Failed to reject task submission', 'error');
    }
  };

  const adminSendNotification = async ({ targetType, targetUserId, title, message }) => {
    try {
      const res = await apiService.adminBroadcast({ targetType, targetUserId, title, message });
      if (res.success) {
        showToast(`Broadcast notification saved to Supabase!`, 'success');
      }
    } catch {
      showToast('Failed to send broadcast', 'error');
    }
  };

  const markNotificationAsRead = useCallback(async (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    if (user?.id) {
      try {
        const key = `fampay_read_notifs_${user.id}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        if (!existing.includes(notifId)) {
          existing.push(notifId);
          localStorage.setItem(key, JSON.stringify(existing));
        }
      } catch (e) {}
    }
    try {
      if (user?.id) {
        await apiService.markNotificationAsRead(notifId, user.id);
      }
    } catch (e) {
      console.warn('Failed to mark notification read on server:', e);
    }
  }, [user?.id]);

  const markAllNotificationsAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
    if (user?.id) {
      try {
        const key = `fampay_read_notifs_${user.id}`;
        const allIds = notifications.map(n => n.id);
        localStorage.setItem(key, JSON.stringify(allIds));
      } catch (e) {}
    }
    try {
      if (user?.id) {
        await apiService.markAllNotificationsAsRead(user.id);
      }
    } catch (e) {
      console.warn('Failed to mark all notifications read on server:', e);
    }
  }, [user?.id, notifications, showToast]);

  return (
    <AppContext.Provider
      value={{
        appName,
        setAppName,
        language,
        setLanguage,
        theme,
        setTheme,
        isDark,
        toggleTheme,
        user,
        setUser,
        loginUser,
        logoutUser,
        portfolio,
        setPortfolio,
        marketSettings,
        setMarketSettings,
        supportLinks,
        paymentChannels,
        setPaymentChannels,
        tasks,
        submitTaskProof,
        maintenance,
        setMaintenance,
        checkMaintenance,
        allUsers,
        transactions,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toast,
        setToast,
        showToast,
        warningModal,
        closeWarningModal,
        refreshUserData,
        loadAdminData,
        handleBuyToken,
        handleSellToken,
        playLuckySpin,
        buyLuckySpins,
        handleDeposit,
        handleWithdraw,
        adminResetPin,
        adminToggleFundLock,
        adminToggleSellAllowed,
        adminToggleDepositAllowed,
        adminToggleAccountPaused,
        adminUpdateUserStatus,
        adminAdjustBalance,
        adminApproveDeposit,
        adminRejectDeposit,
        adminApproveWithdrawal,
        adminSendNotification,
        adminTaskSubmissions,
        adminApproveSubmission,
        adminRejectSubmission,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
