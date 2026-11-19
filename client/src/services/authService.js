/**
 * The FamPay Authentication Service
 * Communicates with backend endpoints (/api/auth) for Brevo OTP & Account Management
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/auth` 
  : (import.meta.env.PROD ? 'https://thefampay.onrender.com/api/auth' : '/api/auth');

async function safeFetchJson(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return data;
    } catch {
      return {
        success: false,
        message: text || `Server error (${res.status})`
      };
    }
  } catch (err) {
    console.error('[Network Error]:', err);
    return {
      success: false,
      message: 'Cannot connect to backend server. Make sure server is running.'
    };
  }
}

export const authService = {
  // Send 6-digit Email OTP via Brevo
  async sendOtp(email, fullName = '', type = 'REGISTRATION') {
    return await safeFetchJson(`${API_BASE}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName, type }),
    });
  },

  // Verify OTP
  async verifyOtp(email, otp) {
    return await safeFetchJson(`${API_BASE}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
  },

  // Complete Registration
  async register(payload) {
    const data = await safeFetchJson(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (data.success && data.token) {
      localStorage.setItem('fampay_token', data.token);
      localStorage.setItem('fampay_user', JSON.stringify(data.user));
    }
    return data;
  },

  // Real Login
  async login(identifier, password) {
    const data = await safeFetchJson(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    if (data.success && data.token) {
      localStorage.setItem('fampay_token', data.token);
      localStorage.setItem('fampay_user', JSON.stringify(data.user));
    }
    return data;
  },

  // Reset Password with Verified OTP
  async resetPassword(email, otp, newPassword) {
    return await safeFetchJson(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    });
  },

  // Sync Google OAuth User with FamPay Backend
  async googleSync(payload) {
    const data = await safeFetchJson(`${API_BASE}/google-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (data.success && data.token) {
      localStorage.setItem('fampay_token', data.token);
      localStorage.setItem('fampay_user', JSON.stringify(data.user));
    }
    return data;
  },

  // Sign Out
  logout() {
    localStorage.removeItem('fampay_token');
    localStorage.removeItem('fampay_user');
  },

  getStoredUser() {
    try {
      const raw = localStorage.getItem('fampay_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getStoredToken() {
    return localStorage.getItem('fampay_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('fampay_token');
  }
};
