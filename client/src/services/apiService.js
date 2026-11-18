// API Service connecting The FamPay React Frontend to Node/Express & Supabase
const BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api` 
  : '/api';

async function safeFetchJson(url, options = {}) {
  try {
    const adminToken = localStorage.getItem('fampay_admin_token') || '';
    const userToken = localStorage.getItem('fampay_token') || '';

    const headers = {
      ...(options.headers || {}),
      ...(adminToken ? { 'X-Admin-Token': adminToken } : {}),
      ...(userToken ? { 'Authorization': `Bearer ${userToken}` } : {})
    };

    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, message: text || `Server error (${res.status})` };
    }
  } catch (err) {
    console.error('[Network Error]:', err);
    return { success: false, message: 'Server communication error. Check connection.' };
  }
}

export const apiService = {
  // File Upload to Supabase Storage
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return await safeFetchJson(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
  },

  // User Profile & Settings
  async getUserProfile(userId) {
    return await safeFetchJson(`${BASE_URL}/user/profile/${userId}`);
  },

  async getUserReferrals(userId) {
    return await safeFetchJson(`${BASE_URL}/user/referrals/${userId}`);
  },

  async updateUserProfile(userId, data) {
    return await safeFetchJson(`${BASE_URL}/user/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data }),
    });
  },

  async changePassword(userId, currentPassword, newPassword) {
    return await safeFetchJson(`${BASE_URL}/user/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    });
  },

  async changePin(userId, currentPin, newPin) {
    return await safeFetchJson(`${BASE_URL}/user/change-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, currentPin, newPin }),
    });
  },

  async revokeSessions(userId) {
    return await safeFetchJson(`${BASE_URL}/user/revoke-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  },

  async getSettings() {
    return await safeFetchJson(`${BASE_URL}/settings`);
  },

  async getChannels() {
    return await safeFetchJson(`${BASE_URL}/user/channels`);
  },

  async getTasks() {
    return await safeFetchJson(`${BASE_URL}/user/tasks`);
  },

  async getUserTransactions(userId) {
    return await safeFetchJson(`${BASE_URL}/user/transactions/${userId}`);
  },

  async getUserNotifications(userId) {
    return await safeFetchJson(`${BASE_URL}/user/notifications/${userId}`);
  },

  async markNotificationAsRead(notifId, userId) {
    return await safeFetchJson(`${BASE_URL}/user/notifications/${notifId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  },

  async markAllNotificationsAsRead(userId) {
    return await safeFetchJson(`${BASE_URL}/user/notifications/mark-all-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  },

  // PIN Verification (Max 3 attempts, Sell only)
  async verifyPin(userId, pin) {
    return await safeFetchJson(`${BASE_URL}/user/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, pin }),
    });
  },

  // Trading (Buy / Sell)
  async executeTrade(tradeData) {
    return await safeFetchJson(`${BASE_URL}/user/trade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tradeData),
    });
  },

  // Deposit with UTR and Supabase Screenshot URL
  async submitDeposit(depositData) {
    return await safeFetchJson(`${BASE_URL}/user/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(depositData),
    });
  },

  // Withdrawal
  async submitWithdrawal(withdrawData) {
    return await safeFetchJson(`${BASE_URL}/withdrawals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withdrawData),
    });
  },

  // PDF §2.9: Bind/Edit Telegram Handle
  async bindTelegramHandle(userId, telegramHandle) {
    return await safeFetchJson(`${BASE_URL}/users/telegram`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, telegramHandle })
    });
  },

  // Lucky Spin
  async executeSpin(userId) {
    return await safeFetchJson(`${BASE_URL}/user/spin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  },

  // Task Submission
  async submitTaskProof(taskId, userId, proofUrl) {
    return await safeFetchJson(`${BASE_URL}/user/submit-task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, userId, proofUrl }),
    });
  },

  // ==========================================
  // ADMIN PANEL CONTROLS (COMPLETE CONTROL)
  // ==========================================
  async adminGetOverview() {
    return await safeFetchJson(`${BASE_URL}/admin/overview`);
  },

  async adminGetUsers() {
    return await safeFetchJson(`${BASE_URL}/admin/users`);
  },

  async adminToggleFundLock(userId, isLocked) {
    return await safeFetchJson(`${BASE_URL}/admin/users/${userId}/fund-lock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isLocked }),
    });
  },

  async adminResetPin(userId, newPin = '1234') {
    return await safeFetchJson(`${BASE_URL}/admin/users/${userId}/reset-pin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPin }),
    });
  },

  async adminToggleSell(userId, sellAllowed) {
    return await safeFetchJson(`${BASE_URL}/admin/users/${userId}/sell-toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellAllowed }),
    });
  },

  async adminToggleDeposit(userId, depositAllowed) {
    return await safeFetchJson(`${BASE_URL}/admin/users/${userId}/deposit-toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositAllowed }),
    });
  },

  async adminToggleAccountPause(userId, accountPaused) {
    return await safeFetchJson(`${BASE_URL}/admin/users/${userId}/account-pause`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountPaused }),
    });
  },

  async adminAdjustBalance(userId, balances) {
    return await safeFetchJson(`${BASE_URL}/admin/users/${userId}/balance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(balances),
    });
  },

  async adminUpdateUserStatus(userId, status) {
    return await safeFetchJson(`${BASE_URL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  async adminGetTransactions() {
    return await safeFetchJson(`${BASE_URL}/admin/transactions`);
  },

  async adminUpdateTransactionStatus(txId, status, adminNotes = '') {
    return await safeFetchJson(`${BASE_URL}/admin/transactions/${txId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes }),
    });
  },

  async adminGetChannels() {
    return await safeFetchJson(`${BASE_URL}/admin/channels`);
  },

  async adminAddChannel(channelData) {
    return await safeFetchJson(`${BASE_URL}/admin/channels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(channelData),
    });
  },

  async adminUpdateChannel(channelId, channelData) {
    return await safeFetchJson(`${BASE_URL}/admin/channels/${channelId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(channelData),
    });
  },

  async adminDeleteChannel(channelId) {
    return await safeFetchJson(`${BASE_URL}/admin/channels/${channelId}`, {
      method: 'DELETE',
    });
  },

  async adminGetTasks() {
    return await safeFetchJson(`${BASE_URL}/admin/tasks`);
  },

  async adminAddTask(taskData) {
    return await safeFetchJson(`${BASE_URL}/admin/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
  },

  async adminUpdateSubmissionStatus(subId, status) {
    return await safeFetchJson(`${BASE_URL}/admin/submissions/${subId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  async adminGetSettings() {
    return await safeFetchJson(`${BASE_URL}/admin/settings`);
  },

  async adminUpdateSettings(settingsData) {
    return await safeFetchJson(`${BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
  },

  async updateSettings(settingsData) {
    return this.adminUpdateSettings(settingsData);
  },

  async adminBroadcast(broadcastData) {
    return await safeFetchJson(`${BASE_URL}/admin/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(broadcastData),
    });
  },

  async adminGetBroadcastHistory() {
    return await safeFetchJson(`${BASE_URL}/admin/broadcast-history`);
  },

  async adminDeleteBroadcast(id) {
    return await safeFetchJson(`${BASE_URL}/admin/broadcast/${id}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // TOOL TAB: UPI & PROVIDER ACCOUNTS
  // ==========================================
  async getToolAccounts(userId) {
    return await safeFetchJson(`${BASE_URL}/tool/accounts?userId=${userId}`);
  },

  async addToolAccount(data) {
    return await safeFetchJson(`${BASE_URL}/tool/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async verifyToolCode(accountId, code, userId) {
    return await safeFetchJson(`${BASE_URL}/tool/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, code, userId }),
    });
  },

  async setPrimaryToolAccount(accountId, userId) {
    return await safeFetchJson(`${BASE_URL}/tool/set-primary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, userId }),
    });
  },

  // ==========================================
  // TOKEN / CASH OUT SELL REQUESTS
  // ==========================================
  async getMySellRequests(userId) {
    return await safeFetchJson(`${BASE_URL}/token/my-sell-requests?userId=${userId}`);
  },

  async submitSellRequest(data) {
    return await safeFetchJson(`${BASE_URL}/token/sell-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // ==========================================
  // DEPOSIT PACKAGES & RESERVATIONS
  // ==========================================
  async getDepositPackages() {
    return await safeFetchJson(`${BASE_URL}/deposit/packages`);
  },

  async getActiveDepositOrder(userId) {
    return await safeFetchJson(`${BASE_URL}/deposit/active-order?userId=${userId}`);
  },

  async reserveDepositOrder(data) {
    return await safeFetchJson(`${BASE_URL}/deposit/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async submitDepositOrderProof(formData) {
    return await safeFetchJson(`${BASE_URL}/deposit/submit-order`, {
      method: 'POST',
      body: formData,
    });
  },

  // ==========================================
  // BANNERS & ANNOUNCEMENTS
  // ==========================================
  async getActiveBanners() {
    return await safeFetchJson(`${BASE_URL}/banners/active`);
  },

  async getMaintenanceStatus() {
    return await safeFetchJson(`${BASE_URL}/maintenance/status`);
  },

  // ==========================================
  // ADMIN QUEUES & MANAGEMENT
  // ==========================================
  async adminGetUpiAccounts() {
    return await safeFetchJson(`${BASE_URL}/admin/upi-accounts`);
  },

  async adminActionUpiAccount(id, action, adminNotes = '', verificationCode = '') {
    return await safeFetchJson(`${BASE_URL}/admin/upi-accounts/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, adminNotes, verificationCode }),
    });
  },

  async adminGetSellRequests() {
    return await safeFetchJson(`${BASE_URL}/admin/sell-requests`);
  },

  async adminActionSellRequest(id, action, payoutUtr = '', adminNotes = '') {
    return await safeFetchJson(`${BASE_URL}/admin/sell-requests/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payoutUtr, adminNotes }),
    });
  },

  async adminGetBanners() {
    return await safeFetchJson(`${BASE_URL}/admin/banners`);
  },

  async adminAddBanner(formData) {
    return await safeFetchJson(`${BASE_URL}/admin/banners`, {
      method: 'POST',
      body: formData,
    });
  },

  async adminUpdateBanner(id, data) {
    return await safeFetchJson(`${BASE_URL}/admin/banners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async adminDeleteBanner(id) {
    return await safeFetchJson(`${BASE_URL}/admin/banners/${id}`, {
      method: 'DELETE',
    });
  },

  async adminGetMaintenance() {
    return await safeFetchJson(`${BASE_URL}/admin/maintenance`);
  },

  async adminUpdateMaintenance(data) {
    return await safeFetchJson(`${BASE_URL}/admin/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
};
