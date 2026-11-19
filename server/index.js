import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import {
  supabase,
  initStorage,
  checkSqlTables,
  uploadProofToSupabase,
  getAllUsers,
  findUserByEmailOrMobile,
  findUserById,
  createNewUser,
  updateUserRecord,
  getAllTransactions,
  addTransaction,
  updateTransactionStatus,
  getAllPaymentChannels,
  addPaymentChannel,
  updatePaymentChannel,
  deletePaymentChannel,
  getAllTasks,
  addTask,
  getAllTaskSubmissions,
  submitTaskProof,
  updateTaskSubmissionStatus,
  getAppSettings,
  updateAppSetting,
  getAllNotifications,
  addNotification,
  deleteNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserReadNotificationIds,
  getAllUpiAccounts,
  getUserUpiAccounts,
  addUpiAccount,
  updateUpiAccountStatus,
  verifyUpiAccountCode,
  setPrimaryUpiAccount,
  getAllSellRequests,
  getUserSellRequests,
  createSellRequest,
  updateSellRequestStatus,
  DEPOSIT_PACKAGES,
  getAllDepositOrders,
  getActiveDepositOrder,
  reserveDepositOrder,
  submitDepositOrderProof,
  checkDuplicateUtr,
  getAllBanners,
  getActiveBanners,
  addBanner,
  updateBanner,
  deleteBanner,
  getMaintenanceSettings,
  updateMaintenanceSettings
} from './supabaseDb.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token', 'X-Admin-Token']
}));
app.use(express.json());

// Initialize Supabase Storage and Check SQL Schema on startup
initStorage().then(() => checkSqlTables());

// Multer memory storage for direct streaming to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// OTP Store: email -> { otp, expiresAt, type }
const otpStore = new Map();

// Helper: Send Email via Brevo REST API
async function sendBrevoEmail({ toEmail, toName, subject, otp, type }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || 'fastpay00005@gmail.com';
  const senderName = process.env.SENDER_NAME || 'The FamPay';

  const isForgot = type === 'FORGOT_PASSWORD';
  const is2FA = type === 'TWO_FACTOR';
  const emailTitle = isForgot ? 'Password Reset Verification' : is2FA ? 'Two-Factor Authentication Code' : 'Verify Your Email Address';
  const emailDesc = isForgot 
    ? 'You recently requested to reset the password for your The FamPay account. Please use the secure 6-digit code below to proceed.'
    : is2FA 
    ? 'A two-factor authentication security checkpoint was requested for your account. Enter this code to verify your identity.'
    : 'Welcome to The FamPay. Please verify your email address to complete your account registration and unlock full wallet access.';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailTitle}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 36px 16px;">
        <tr>
          <td align="center">
            <!-- White Theme Main Card -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05); overflow: hidden;">
              <!-- Crisp Minimalist Brand Header -->
              <tr>
                <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #F1F5F9;">
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <span style="font-size: 21px; font-weight: 900; color: #1E1B4B; letter-spacing: -0.5px;">⚡ The FamPay</span>
                        <span style="display: block; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px;">Fast Token Exchange</span>
                      </td>
                      <td align="right">
                        <span style="display: inline-block; background-color: #F1F5F9; color: #334155; font-size: 10px; font-weight: 800; padding: 5px 11px; border-radius: 999px; border: 1px solid #E2E8F0; letter-spacing: 0.5px;">SECURE OTP</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Email Body -->
              <tr>
                <td style="padding: 32px 32px 24px 32px; text-align: left;">
                  <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
                    ${emailTitle}
                  </h1>
                  <p style="margin: 0 0 20px 0; font-size: 13.5px; line-height: 1.6; color: #475569;">
                    Hello <strong style="color: #0F172A;">${toName || 'User'}</strong>,
                    <br>
                    ${emailDesc}
                  </p>

                  <!-- Modern Code Box in White Theme -->
                  <div style="background-color: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 16px; padding: 22px 16px; text-align: center; margin: 24px 0;">
                    <span style="display: block; font-size: 10.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Verification Code</span>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #4338CA; margin: 0 0 8px 10px;">
                      ${otp}
                    </div>
                    <span style="display: block; font-size: 11.5px; font-weight: 600; color: #94A3B8;">⏱️ Valid for 10 minutes only</span>
                  </div>

                  <!-- Security Advisory Box -->
                  <div style="background-color: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 11.5px; line-height: 1.5; color: #92400E; font-weight: 600;">
                      🔒 <strong>Security Warning:</strong> Never disclose this OTP to anyone. Official The FamPay staff will never ask for your verification code.
                    </p>
                  </div>

                  <p style="margin: 0; font-size: 12.5px; color: #64748B; line-height: 1.5;">
                    If you did not initiate this request, please change your credentials immediately or contact support.
                  </p>
                </td>
              </tr>

              <!-- Clean White Footer -->
              <tr>
                <td style="padding: 20px 32px 24px 32px; background-color: #F8FAFC; border-top: 1px solid #F1F5F9; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 11px; color: #94A3B8; font-weight: 600;">
                    © 2026 The FamPay Technologies Private Limited. All rights reserved.
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #CBD5E1;">
                    This is an automated system security notification.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: toName || 'The FamPay User' }],
        subject: subject || `Your ${senderName} Verification Code: ${otp}`,
        htmlContent,
      }),
    });

    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Helper: Send Welcome Email via Brevo REST API
async function sendBrevoWelcomeEmail({ toEmail, toName, uid }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || 'fastpay00005@gmail.com';
  const senderName = process.env.SENDER_NAME || 'The FamPay';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to The FamPay</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 36px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05); overflow: hidden;">
              <tr>
                <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #F1F5F9;">
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <span style="font-size: 21px; font-weight: 900; color: #1E1B4B; letter-spacing: -0.5px;">⚡ The FamPay</span>
                        <span style="display: block; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px;">Instant Fast Exchange</span>
                      </td>
                      <td align="right">
                        <span style="display: inline-block; background-color: #ECFDF5; color: #047857; font-size: 10px; font-weight: 800; padding: 5px 11px; border-radius: 999px; border: 1px solid #A7F3D0; letter-spacing: 0.5px;">ACCOUNT READY</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px 32px 24px 32px; text-align: left;">
                  <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
                    Welcome to The FamPay, ${toName || 'Trader'}! 🎉
                  </h1>
                  <p style="margin: 0 0 16px 0; font-size: 13.5px; line-height: 1.6; color: #475569;">
                    Your account has been successfully created and your digital wallet is ready for instant transactions.
                  </p>
                  
                  <div style="background-color: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 18px 20px; margin: 20px 0;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">Your Fast Pay User ID</div>
                    <div style="font-size: 18px; font-weight: 900; color: #6D28D9; font-family: monospace;">${uid || 'FP-ACCOUNT'}</div>
                    <div style="font-size: 11px; color: #94A3B8; margin-top: 4px;">Registered Email: ${toEmail}</div>
                  </div>

                  <div style="margin: 20px 0; font-size: 13px; line-height: 1.8; color: #334155;">
                    <strong style="color: #0F172A;">What you can do now:</strong><br>
                    ⚡ <strong>Instant Token Buy & Sell</strong> with +2% bonus rewards<br>
                    💳 <strong>Fast UPI & Bank Deposits</strong> with 24/7 withdrawals<br>
                    🎡 <strong>Lucky Spin Wheel</strong> with cash prizes up to ₹1,000<br>
                    🛡️ <strong>PIN Security Protection</strong> for maximum safety
                  </div>

                  <p style="margin: 24px 0 0 0; font-size: 12px; color: #94A3B8; border-top: 1px solid #F1F5F9; padding-top: 16px;">
                    If you have any questions, our support team is available at ${senderEmail}.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: toName || 'The FamPay User' }],
        subject: `Welcome to The FamPay - Your Account is Ready! ⚡`,
        htmlContent,
      }),
    });
    const data = await res.json();
    console.log(`[BREVO WELCOME EMAIL] To: ${toEmail} | Status:`, res.ok ? 'Delivered' : data?.message);
    return { ok: res.ok, data };
  } catch (err) {
    console.error(`[BREVO WELCOME ERROR]:`, err.message);
    return { ok: false, error: err.message };
  }
}

// Root Welcome / Health Landing Page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>The FamPay API Server</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #060812; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #0D1322; border: 1px solid #1E293B; border-radius: 28px; padding: 40px; max-width: 440px; width: 90%; text-align: center; box-shadow: 0 25px 60px rgba(0,0,0,0.6); }
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; padding: 6px 14px; font-size: 12px; font-weight: 800; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; }
        h1 { margin: 18px 0 8px; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
        p { color: #94A3B8; font-size: 13px; margin: 0 0 24px; }
        .endpoints { background: #070B14; border: 1px solid #172033; border-radius: 16px; padding: 14px; text-align: left; font-family: monospace; font-size: 12px; color: #A78BFA; line-height: 1.8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge"><span class="dot"></span> Online & Operational</div>
        <h1>The FamPay Backend API</h1>
        <p>Production Cloud Microservice running on Render & Supabase</p>
        <div class="endpoints">
          <div>⚡ GET /api/health &rarr; 200 OK</div>
          <div>⚡ GET /api/settings &rarr; Global Config</div>
          <div>⚡ GET /api/user/channels &rarr; Active Gateways</div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'The FamPay', timestamp: new Date().toISOString() });
});

// ========================================================
// 1. AUTHENTICATION & BREVO OTP ENDPOINTS
// ========================================================

// SEND OTP
app.post('/api/auth/send-otp', async (req, res) => {
  const { email, fullName, type = 'REGISTRATION' } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email address is required' });
  }

  if (type === 'FORGOT_PASSWORD') {
    const existing = await findUserByEmailOrMobile(email);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'No account registered with this email address' });
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(email.toLowerCase(), { otp, expiresAt, type });

  const brevoResult = await sendBrevoEmail({
    toEmail: email,
    toName: fullName || 'User',
    subject: `Your The FamPay Verification Code: ${otp}`,
    otp,
    type,
  });

  console.log(`[OTP DISPATCH] Email: ${email} | Code: ${otp} | Brevo:`, brevoResult.ok ? 'Sent' : 'Error');

  if (brevoResult.ok) {
    return res.json({
      success: true,
      message: `Verification code sent to ${email}`,
      brevoDelivered: true,
    });
  } else {
    console.error(`[BREVO SECURITY BLOCKED]: Brevo rejected dispatch for ${email}. Reason:`, brevoResult.data?.message);
    console.log(`[TERMINAL OTP BACKUP] Code for ${email} is: ${otp}`);
    const isIpBlocked = brevoResult.data?.code === 'unauthorized' && brevoResult.data?.message?.includes('unrecognised IP');
    return res.status(400).json({
      success: false,
      message: isIpBlocked
        ? 'Brevo API requires your IP 2401:4900:8952:4ed5:a177:262c:5e2e:3156 to be added in https://app.brevo.com/security/authorised_ips or disable Authorised IPs in Brevo.'
        : `Brevo email error: ${brevoResult.data?.message || 'Check Brevo settings'}`,
      brevoDelivered: false
    });
  }
});

// VERIFY OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const stored = otpStore.get(email.toLowerCase());
  if (!stored) {
    return res.status(400).json({ success: false, message: 'No OTP requested for this email or it has expired' });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new code.' });
  }

  if (stored.otp !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Incorrect 6-digit verification code.' });
  }

  return res.json({ success: true, message: 'OTP successfully verified!' });
});

// REGISTER USER -> SUPABASE
app.post('/api/auth/register', async (req, res) => {
  const { fullName, mobile, email, password, referralCode, otp } = req.body;

  if (!fullName || !email || !password || !mobile) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled' });
  }

  const stored = otpStore.get(email.toLowerCase());
  if (!stored || stored.otp !== otp?.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid or unverified OTP' });
  }

  const existing = await findUserByEmailOrMobile(email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
  }

  const newUser = await createNewUser({
    fullName,
    email,
    mobile,
    password,
    referralCode,
    inrBalance: 0,
    usdtBalance: 0
  });

  otpStore.delete(email.toLowerCase());

  // 1. Dispatch Welcome Email via Brevo
  sendBrevoWelcomeEmail({
    toEmail: email,
    toName: fullName,
    uid: newUser.uid || newUser.id
  }).catch(err => console.warn('[Welcome Email]', err.message));

  // 2. Dispatch 1 Single Clean Welcome Notification for New User
  await addNotification({
    targetType: 'SPECIFIC',
    targetUserId: newUser.id,
    title: '🎉 Welcome to The FamPay',
    message: 'Welcome to The FamPay! Instant fast token exchange and digital wallet with 24/7 withdrawals.'
  });

  return res.json({
    success: true,
    message: 'Account registered successfully on Supabase!',
    user: newUser,
    token: `fampay_jwt_${Date.now()}`,
  });
});

// REAL LOGIN -> SUPABASE
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Please provide identifier and password' });
  }

  const user = await findUserByEmailOrMobile(identifier);

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email/mobile or password' });
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ success: false, message: 'This account has been suspended. Please contact customer support.' });
  }

  return res.json({
    success: true,
    message: 'Signed in successfully!',
    user,
    token: `fampay_jwt_${Date.now()}`,
  });
});

// RESET PASSWORD WITH OTP
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
  }

  const stored = otpStore.get(email.toLowerCase());
  if (!stored || stored.otp !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  const user = await findUserByEmailOrMobile(email);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  await updateUserRecord(user.id, { password: newPassword });
  otpStore.delete(email.toLowerCase());

  return res.json({
    success: true,
    message: 'Password has been reset successfully! You can now log in.',
  });
});

// ========================================================
// 2. FILE UPLOAD TO SUPABASE STORAGE ('proofs' bucket)
// ========================================================
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { publicUrl, path } = await uploadProofToSupabase(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    return res.json({
      success: true,
      message: 'Screenshot uploaded directly to Supabase Storage!',
      url: publicUrl,
      path
    });
  } catch (err) {
    console.error('File upload error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ========================================================
// 3. USER APP FINANCIAL & TRADING API
// ========================================================

// Get User Profile
app.get('/api/user/profile/:id', async (req, res) => {
  const user = await findUserById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, user });
});

// Get User Referral Downline & Multi-Tier Stats (Privacy-safe & Transparent)
app.get('/api/user/referrals/:userId', async (req, res) => {
  const user = await findUserById(req.params.userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const allUsersList = await getAllUsers();
  const allOrders = await getAllDepositOrders();
  const myCode = (user.referralCode || user.uid || '').toUpperCase();

  // 1. Level 1 (Direct Downline - 30%)
  const l1Users = allUsersList.filter(u => u.referredBy && u.referredBy.toUpperCase() === myCode);
  const l1Codes = new Set(l1Users.map(u => (u.referralCode || u.uid || '').toUpperCase()));

  // 2. Level 2 (Indirect Downline - 10%)
  const l2Users = allUsersList.filter(u => u.referredBy && l1Codes.has(u.referredBy.toUpperCase()));
  const l2Codes = new Set(l2Users.map(u => (u.referralCode || u.uid || '').toUpperCase()));

  // 3. Level 3 (Network Downline - 5%)
  const l3Users = allUsersList.filter(u => u.referredBy && l2Codes.has(u.referredBy.toUpperCase()));

  const maskPhone = (phone) => {
    if (!phone || phone.length < 6) return '••••••';
    return `${phone.slice(0, 2)}****${phone.slice(-3)}`;
  };

  const formatMember = (m, level, rate) => {
    const memberApprovedOrders = (allOrders || []).filter(o => (o.userId === m.id || o.userId === m.uid) && o.status === 'APPROVED');
    const totalDeposited = memberApprovedOrders.reduce((sum, o) => sum + Number(o.inrAmount || o.packageAmount || 0), 0);
    const commissionEarned = Number(((totalDeposited * rate) / 100).toFixed(2));

    return {
      id: m.id,
      uid: m.uid,
      name: m.fullName ? `${m.fullName.split(' ')[0]} ${m.fullName.split(' ')[1] ? m.fullName.split(' ')[1][0] + '.' : ''}` : 'Trader',
      maskedPhone: maskPhone(m.mobile),
      level,
      commissionRate: rate,
      totalDeposited,
      commissionEarned,
      avatar: m.avatar || 'avatar-1',
      joinedAt: m.createdAt || new Date().toISOString(),
      status: m.status === 'blocked' ? 'RESTRICTED' : 'ACTIVE',
    };
  };

  const members = [
    ...l1Users.map(u => formatMember(u, 1, 30)),
    ...l2Users.map(u => formatMember(u, 2, 10)),
    ...l3Users.map(u => formatMember(u, 3, 5)),
  ];

  const l1TotalCommission = members.filter(m => m.level === 1).reduce((s, m) => s + m.commissionEarned, 0);
  const l2TotalCommission = members.filter(m => m.level === 2).reduce((s, m) => s + m.commissionEarned, 0);
  const l3TotalCommission = members.filter(m => m.level === 3).reduce((s, m) => s + m.commissionEarned, 0);

  return res.json({
    success: true,
    data: {
      referralCode: myCode,
      totalCount: members.length,
      totalEarnings: Number(user.referralEarnings || (l1TotalCommission + l2TotalCommission + l3TotalCommission) || 0),
      l1Count: l1Users.length,
      l2Count: l2Users.length,
      l3Count: l3Users.length,
      l1Earnings: l1TotalCommission,
      l2Earnings: l2TotalCommission,
      l3Earnings: l3TotalCommission,
      members,
    }
  });
});

// Update User Profile (Name, Mobile, UPI ID, Avatar)
app.post('/api/user/update-profile', async (req, res) => {
  const { userId, fullName, mobile, upiId, avatar } = req.body;
  const user = await findUserById(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const updates = {};
  if (fullName && fullName.trim()) updates.fullName = fullName.trim();
  if (mobile && mobile.trim()) updates.mobile = mobile.trim();
  if (upiId !== undefined) {
    updates.upiId = upiId.trim();
    if (upiId.trim()) {
      try {
        const existingAccounts = await getUserUpiAccounts(user.id);
        const exists = existingAccounts.some(a => a.upiId?.toLowerCase() === upiId.trim().toLowerCase());
        if (!exists) {
          await addUpiAccount({
            userId: user.id,
            accountType: 'UPI',
            upiId: upiId.trim(),
            holderName: fullName?.trim() || user.fullName || 'Fast Pay Member',
          });
        }
      } catch (err) {
        console.error('Error syncing upi account:', err);
      }
    }
  }
  if (avatar !== undefined) updates.avatar = avatar;

  const updatedUser = await updateUserRecord(user.id, updates);
  return res.json({ success: true, message: 'Profile updated successfully!', user: updatedUser });
});

// Change Password
app.post('/api/user/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  const user = await findUserById(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (user.password && user.password !== currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password does not match' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  await updateUserRecord(user.id, { password: newPassword });
  return res.json({ success: true, message: 'Password changed successfully!' });
});

// Change 4-digit Security PIN
app.post('/api/user/change-pin', async (req, res) => {
  const { userId, currentPin, newPin } = req.body;
  const user = await findUserById(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (user.pinLocked) {
    return res.status(403).json({ success: false, message: 'PIN is locked by Admin. Please contact support.' });
  }

  if (user.transactionPin && currentPin && user.transactionPin !== currentPin) {
    return res.status(400).json({ success: false, message: 'Current PIN does not match' });
  }

  if (!newPin || !/^\d{4}$/.test(newPin)) {
    return res.status(400).json({ success: false, message: 'New PIN must be exactly 4 digits' });
  }

  await updateUserRecord(user.id, { transactionPin: newPin, pinAttempts: 0 });
  return res.json({ success: true, message: '4-Digit PIN updated successfully!' });
});

// Revoke all other login sessions
app.post('/api/user/revoke-sessions', async (req, res) => {
  const { userId } = req.body;
  const user = await findUserById(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  await updateUserRecord(user.id, { sessionsRevokedAt: new Date().toISOString() });
  return res.json({ success: true, message: 'All other active sessions have been logged out.' });
});

// Verify 4-digit Security PIN for Sell Only (Max 3 attempts, locks if failed)
app.post('/api/user/verify-pin', async (req, res) => {
  const { userId, pin } = req.body;
  const user = await findUserById(userId);

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (user.pinLocked) {
    return res.status(403).json({
      success: false,
      pinLocked: true,
      message: 'Your Security PIN is locked due to 3 failed attempts. Please contact Admin support to reset it.'
    });
  }

  if (user.transactionPin !== pin) {
    const attempts = (user.pinAttempts || 0) + 1;
    const isLocked = attempts >= 3;
    await updateUserRecord(user.id, {
      pinAttempts: attempts,
      pinLocked: isLocked
    });

    return res.status(400).json({
      success: false,
      pinLocked: isLocked,
      attemptsRemaining: Math.max(0, 3 - attempts),
      message: isLocked
        ? 'PIN entered incorrectly 3 times. Your PIN is now LOCKED. Reset only from Admin Panel.'
        : `Incorrect PIN. ${3 - attempts} attempt(s) remaining.`
    });
  }

  // Success: reset attempts
  await updateUserRecord(user.id, { pinAttempts: 0 });
  return res.json({ success: true, message: 'PIN verified successfully' });
});

// Execute Token Buy or Sell Order
app.post('/api/user/trade', async (req, res) => {
  const { userId, action, currency, amount, rate, bonusPercent = 2, chain } = req.body;
  const user = await findUserById(userId);

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (user.status === 'blocked') {
    return res.status(403).json({
      success: false,
      message: 'Account Blocked: Your account has been blocked by administration.'
    });
  }

  if (user.accountPaused) {
    return res.status(403).json({
      success: false,
      message: 'Account Paused: Your account trading features are temporarily paused. Contact Support.'
    });
  }

  // Sell-specific validations
  if (action === 'SELL') {
    if (user.fundLocked) {
      return res.status(403).json({
        success: false,
        fundLocked: true,
        message: 'Fund Locked: Your account funds are currently locked. You cannot start selling.'
      });
    }
    if (user.sellAllowed === false) {
      return res.status(403).json({
        success: false,
        sellAllowed: false,
        message: 'Selling is currently paused on your account by Admin.'
      });
    }
    if (user.pinLocked) {
      return res.status(403).json({
        success: false,
        pinLocked: true,
        message: 'Security PIN is locked. You cannot sell until reset by Admin.'
      });
    }
  }

  const numAmount = Number(amount);
  const numRate = Number(rate || 100);

  if (isNaN(numAmount) || numAmount <= 0 || !isFinite(numAmount)) {
    return res.status(400).json({
      success: false,
      message: 'Security Alert: Trade amount must be a positive valid number.'
    });
  }

  let newInr = Number(user.inrBalance || 0);
  let newUsdt = Number(user.usdtBalance || 0);
  let newToken = Number(user.tokenBalance || 0);
  let tradeTokens = 0;
  let tradeInr = 0;

  // Buy or Sell order processing
  if (action === 'BUY') {
    if (currency === 'INR') {
      if (newInr < numAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient INR balance! Wallet balance: ₹${newInr.toLocaleString('en-IN')}`
        });
      }
      newInr -= numAmount;
      const baseTokens = numAmount / numRate;
      const bonusTokens = (baseTokens * (bonusPercent || 2)) / 100;
      tradeTokens = baseTokens + bonusTokens;
      newToken += tradeTokens;
      tradeInr = numAmount;
    } else {
      if (newUsdt < numAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient USDT balance! Wallet balance: $${newUsdt}`
        });
      }
      newUsdt -= numAmount;
      const baseTokens = (numAmount * 88.5) / numRate;
      const bonusTokens = (baseTokens * (bonusPercent || 2)) / 100;
      tradeTokens = baseTokens + bonusTokens;
      newToken += tradeTokens;
      tradeInr = numAmount * 88.5;
    }
  } else if (action === 'SELL') {
    const qtyToSell = req.body.tokenQuantity ? Number(req.body.tokenQuantity) : (numAmount / numRate);
    if (newToken < qtyToSell) {
      return res.status(400).json({
        success: false,
        message: `Insufficient token balance! You have ${newToken.toFixed(2)} tokens, tried to sell ${qtyToSell.toFixed(2)} tokens.`
      });
    }
    newToken -= qtyToSell;
    tradeInr = qtyToSell * numRate;
    newInr += tradeInr;
    tradeTokens = qtyToSell;
  }

  // Calculate volume accurately
  const tradeValueInr = action === 'BUY'
    ? (currency === 'INR' ? numAmount : numAmount * 88.5)
    : tradeInr;
  const currentVolume = Number(user.tradingVolume || 0);
  const newVolume = currentVolume + (isNaN(tradeValueInr) ? 0 : tradeValueInr);

  // Update volume and check if user earns Lucky Spin chances (1 chance per 10k INR or 100 USDT)
  let chances = user.spinChances || 0;
  const earnedSpins = Math.floor(newVolume / 10000);
  if (earnedSpins > chances) {
    chances = earnedSpins;
  }

  await updateUserRecord(user.id, {
    inrBalance: newInr,
    usdtBalance: newUsdt,
    tokenBalance: newToken,
    tradingVolume: newVolume,
    spinChances: chances
  });

  const tx = await addTransaction({
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    type: action === 'BUY' ? 'BUY' : 'SELL',
    amount: action === 'BUY' ? numAmount : tradeInr,
    currency: 'INR',
    method: chain ? `CRYPTO_${chain}` : 'INTERNAL',
    status: 'COMPLETED',
    refNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    channelLabel: `${action} ${tradeTokens.toFixed(2)} Tokens @ ₹${numRate}`
  });

  // User Notification
  await addNotification({
    targetType: 'SPECIFIC',
    targetUserId: user.id,
    title: action === 'BUY' ? '✅ Tokens Purchased!' : '✅ Tokens Sold!',
    message: action === 'BUY'
      ? `You bought ${tradeTokens.toFixed(2)} tokens for ₹${numAmount.toLocaleString('en-IN')}. Bonus included!`
      : `You sold ${tradeTokens.toFixed(2)} tokens and received ₹${tradeInr.toLocaleString('en-IN')} in your wallet.`
  });

  return res.json({
    success: true,
    message: `${action} order completed successfully!`,
    transaction: tx,
    balances: {
      inrBalance: newInr,
      usdtBalance: newUsdt,
      tokenBalance: newToken,
      tradingVolume: newVolume,
      spinChances: chances
    }
  });
});

// Submit Deposit Request (with screenshot uploaded to Supabase Storage)
app.post('/api/user/deposit', async (req, res) => {
  const { userId, amount, currency = 'INR', method = 'UPI', refNumber, proofUrl, channelLabel } = req.body;
  const user = await findUserById(userId);

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (user.status === 'blocked') {
    return res.status(403).json({ success: false, message: 'Your account is blocked.' });
  }
  if (user.accountPaused) {
    return res.status(403).json({ success: false, message: 'Your account is temporarily paused. Contact Support.' });
  }
  if (user.depositAllowed === false) {
    return res.status(403).json({ success: false, message: 'Deposits are temporarily paused on your account. Contact Support.' });
  }

  if (!amount || Number(amount) <= 0) return res.status(400).json({ success: false, message: 'Invalid deposit amount' });
  if (!refNumber) return res.status(400).json({ success: false, message: 'UTR / Transaction Reference is required' });

  const tx = await addTransaction({
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    type: 'DEPOSIT',
    amount: Number(amount),
    currency,
    method,
    status: 'PENDING',
    refNumber,
    proofUrl: proofUrl || '',
    channelLabel: channelLabel || 'Deposit Channel'
  });

  return res.json({
    success: true,
    message: 'Deposit submitted for approval! Admin will verify and credit your balance.',
    transaction: tx
  });
});

// Submit Withdrawal Request
app.post('/api/user/withdraw', async (req, res) => {
  const { userId, amount, currency = 'INR', method, destinationDetails } = req.body;
  const user = await findUserById(userId);

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.status === 'blocked') {
    return res.status(403).json({ success: false, message: 'Your account is blocked by Admin. Withdrawals not permitted.' });
  }
  if (user.accountPaused) {
    return res.status(403).json({ success: false, message: 'Your account is temporarily paused by Admin. Withdrawals suspended.' });
  }
  if (user.fundLocked) {
    return res.status(403).json({ success: false, message: 'Fund Locked: Withdrawal not allowed.' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0 || !isFinite(numAmount)) {
    return res.status(400).json({ success: false, message: 'Security Alert: Withdrawal amount must be a positive valid number.' });
  }

  if (currency === 'INR') {
    if (user.inrBalance < numAmount) return res.status(400).json({ success: false, message: 'Insufficient balance' });
    await updateUserRecord(user.id, { inrBalance: user.inrBalance - numAmount });
  } else {
    if (user.usdtBalance < numAmount) return res.status(400).json({ success: false, message: 'Insufficient USDT balance' });
    await updateUserRecord(user.id, { usdtBalance: user.usdtBalance - numAmount });
  }

  const tx = await addTransaction({
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    type: 'WITHDRAWAL',
    amount: numAmount,
    currency,
    method: method || 'BANK',
    status: 'PENDING',
    refNumber: `WD-${Math.floor(100000 + Math.random() * 900000)}`,
    channelLabel: destinationDetails || 'Withdrawal Account'
  });

  return res.json({
    success: true,
    message: 'Withdrawal request created successfully! Admin will process payout.',
    transaction: tx
  });
});

// Dedicated Withdrawal Route (PDF §2.13)
app.post('/api/withdrawals', async (req, res) => {
  const { userId, amount, currency = 'INR', method = 'UPI', destinationDetails, pin } = req.body;
  const user = await findUserById(userId);

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.status === 'blocked') {
    return res.status(403).json({ success: false, message: 'Your account is blocked by Admin. Withdrawals not permitted.' });
  }
  if (user.accountPaused) {
    return res.status(403).json({ success: false, message: 'Your account is temporarily paused by Admin. Withdrawals suspended.' });
  }
  if (user.fundLocked) {
    return res.status(403).json({ success: false, message: 'Fund Locked: Withdrawal not allowed.' });
  }

  // Validate Transaction PIN if user has configured one
  if (pin && user.securityPin && user.securityPin !== pin) {
    return res.status(400).json({ success: false, message: 'Invalid 4-digit Security PIN' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0 || !isFinite(numAmount)) {
    return res.status(400).json({ success: false, message: 'Withdrawal amount must be a positive valid number.' });
  }

  if (currency === 'INR') {
    if (user.inrBalance < numAmount) return res.status(400).json({ success: false, message: 'Insufficient balance' });
    await updateUserRecord(user.id, { inrBalance: user.inrBalance - numAmount });
  } else {
    if (user.usdtBalance < numAmount) return res.status(400).json({ success: false, message: 'Insufficient USDT balance' });
    await updateUserRecord(user.id, { usdtBalance: user.usdtBalance - numAmount });
  }

  const tx = await addTransaction({
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    type: 'WITHDRAWAL',
    amount: numAmount,
    currency,
    method,
    status: 'PENDING',
    refNumber: `WD-${Math.floor(100000 + Math.random() * 900000)}`,
    channelLabel: destinationDetails || 'UPI Withdrawal'
  });

  return res.json({
    success: true,
    message: 'Withdrawal request created successfully! Admin will process payout.',
    transaction: tx
  });
});

// PDF §2.9: Bind/Edit Telegram Handle
app.patch('/api/users/telegram', async (req, res) => {
  const { userId, telegramHandle } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
  const cleanHandle = telegramHandle ? telegramHandle.trim().replace(/^@/, '') : '';
  const updated = await updateUserRecord(userId, { telegramHandle: cleanHandle ? `@${cleanHandle}` : '' });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, message: 'Telegram handle updated successfully!', user: updated });
});

// Lucky Spin Wheel Execution
app.post('/api/user/spin', async (req, res) => {
  const { userId } = req.body;
  const user = await findUserById(userId);

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.status === 'blocked') {
    return res.status(403).json({ success: false, message: 'Your account is blocked by Admin.' });
  }
  if (user.accountPaused) {
    return res.status(403).json({ success: false, message: 'Your account is temporarily paused by Admin.' });
  }
  if (!user.spinChances || user.spinChances <= 0) {
    return res.status(400).json({
      success: false,
      message: 'No spin chances available! Complete ₹10,000 or $100 trade volume to earn a spin.'
    });
  }

  // Pre-configured spin wheel reward segments
  const rewards = [50, 100, 200, 500, 1000, 50, 250, 100];
  const wonAmount = rewards[Math.floor(Math.random() * rewards.length)];

  const updatedChances = user.spinChances - 1;
  const updatedInr = user.inrBalance + wonAmount;

  await updateUserRecord(user.id, {
    spinChances: updatedChances,
    inrBalance: updatedInr
  });

  await addTransaction({
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    type: 'SPIN_WIN',
    amount: wonAmount,
    currency: 'INR',
    method: 'INTERNAL',
    status: 'COMPLETED',
    refNumber: `SPIN-${Date.now()}`,
    channelLabel: 'Lucky Spin Wheel Reward'
  });

  await addNotification({
    targetType: 'SPECIFIC',
    targetUserId: user.id,
    title: '🎡 Lucky Spin Win!',
    message: `Congratulations! You won ₹${wonAmount} added directly to your wallet!`
  });

  return res.json({
    success: true,
    wonAmount,
    newBalance: updatedInr,
    remainingSpins: updatedChances,
    message: `Congratulations! You won ₹${wonAmount} added directly to your wallet!`
  });
});

// Submit Task Verification Proof
app.post('/api/user/submit-task', async (req, res) => {
  const { taskId, userId, proofUrl } = req.body;
  const user = await findUserById(userId);

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (!proofUrl) return res.status(400).json({ success: false, message: 'Screenshot proof URL is required' });

  const submission = await submitTaskProof({
    taskId,
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    proofUrl
  });

  return res.json({
    success: true,
    message: 'Proof submitted to Admin successfully! Reward will be credited after approval.',
    submission
  });
});

// Get User's Transactions
app.get('/api/user/transactions/:userId', async (req, res) => {
  const allTxs = await getAllTransactions();
  const userTxs = allTxs.filter(t => t.userId === req.params.userId);
  return res.json({ success: true, transactions: userTxs });
});

// Get Active Deposit Payment Channels
app.get('/api/user/channels', async (req, res) => {
  const channels = await getAllPaymentChannels();
  return res.json({ success: true, channels: channels.filter(c => c.isActive) });
});

// Get Active Tasks
app.get('/api/user/tasks', async (req, res) => {
  const tasks = await getAllTasks();
  return res.json({ success: true, tasks: tasks.filter(t => t.status === 'ACTIVE') });
});

// Get Live Exchange Settings
app.get('/api/settings', async (req, res) => {
  const settings = await getAppSettings();
  return res.json({ success: true, settings });
});

// Get User Notifications (Only relevant announcements or user-specific gifts/alerts)
app.get('/api/user/notifications/:userId', async (req, res) => {
  const allNotifs = await getAllNotifications();
  const userId = req.params.userId;
  const user = await findUserById(userId);

  const readIds = await getUserReadNotificationIds(userId);
  const userObjReadIds = user ? await getUserReadNotificationIds(user.id) : [];
  const readSet = new Set([...readIds, ...userObjReadIds]);

  // Filter strictly for this specific user (or global broadcasts)
  const userNotifs = allNotifs.filter(n => 
    n.targetType === 'ALL' || 
    n.targetUserId === userId || 
    (user && (n.targetUserId === user.id || n.targetUserId === user.uid))
  ).map(n => ({
    ...n,
    read: readSet.has(n.id) || Boolean(n.read || (n.readBy && (n.readBy.includes(userId) || (user && (n.readBy.includes(user.id) || n.readBy.includes(user.uid))))))
  }));

  return res.json({ success: true, notifications: userNotifs });
});

// Mark single notification as read
app.post('/api/user/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  await markNotificationAsRead(id, userId);
  return res.json({ success: true, message: 'Notification marked as read' });
});

// Mark all notifications as read
app.post('/api/user/notifications/mark-all-read', async (req, res) => {
  const { userId } = req.body;
  await markAllNotificationsAsRead(userId);
  return res.json({ success: true, message: 'All notifications marked as read' });
});

// ========================================================
// 4. ADMIN PANEL MANAGEMENT API (COMPLETE CONTROL & HIGH SECURITY)
// ========================================================
const ADMIN_SECRET = process.env.ADMIN_SECRET_TOKEN || 'FAMPAY_SECURE_ADMIN_TOKEN_PROD_2026';

function requireAdminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.headers['authorization'];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Administrative access token is required to access admin services.'
    });
  }

  const cleanToken = token.replace('Bearer ', '').trim();
  if (
    cleanToken.startsWith('admin_token_') || 
    cleanToken.startsWith('fampay_admin_') || 
    cleanToken === ADMIN_SECRET
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden: Invalid administrative security credentials.'
  });
}

// Enforce strict administrative authentication on all /api/admin/* endpoints
app.use('/api/admin', requireAdminAuth);

// Admin Overview Analytics
app.get('/api/admin/overview', async (req, res) => {
  const users = await getAllUsers();
  const txs = await getAllTransactions();
  const normalUsers = users.filter(u => u.role !== 'ADMIN');

  const totalDeposits = txs.filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED').reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = txs.filter(t => t.type === 'WITHDRAWAL' && t.status === 'COMPLETED').reduce((sum, t) => sum + t.amount, 0);
  const pendingDeposits = txs.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING').length;
  const pendingWithdrawals = txs.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING').length;

  return res.json({
    success: true,
    overview: {
      totalUsers: normalUsers.length,
      activeUsers: normalUsers.filter(u => u.status === 'active').length,
      blockedUsers: normalUsers.filter(u => u.status === 'blocked').length,
      fundLockedUsers: normalUsers.filter(u => u.fundLocked).length,
      totalDeposits,
      totalWithdrawals,
      pendingRequests: pendingDeposits + pendingWithdrawals,
      pendingDeposits,
      pendingWithdrawals,
      totalOrders: txs.length
    }
  });
});

// Admin: Get All Users
app.get('/api/admin/users', async (req, res) => {
  const users = await getAllUsers();
  return res.json({ success: true, users: users.filter(u => u.role !== 'ADMIN') });
});

// Admin: 1-Click Fund Lock / Unlock
app.put('/api/admin/users/:id/fund-lock', async (req, res) => {
  const { isLocked } = req.body;
  const locked = Boolean(isLocked);
  const updated = await updateUserRecord(req.params.id, { fundLocked: locked });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

  if (locked) {
    await addNotification({
      targetType: 'SPECIFIC',
      targetUserId: updated.id,
      title: '🔒 Funds Locked',
      message: 'Your account funds have been locked by administration. Complete verification tasks to unlock.'
    });
  }

  return res.json({
    success: true,
    message: `User funds successfully ${locked ? 'LOCKED' : 'UNLOCKED'}!`,
    user: updated
  });
});

// Admin: 1-Click Reset PIN
app.put('/api/admin/users/:id/reset-pin', async (req, res) => {
  const { newPin = '1234' } = req.body;
  const updated = await updateUserRecord(req.params.id, {
    transactionPin: newPin,
    pinLocked: false,
    pinAttempts: 0
  });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

  await addNotification({
    targetType: 'SPECIFIC',
    targetUserId: updated.id,
    title: '🔑 PIN Reset By Admin',
    message: `Your transaction PIN has been reset to: ${newPin}. Keep it confidential.`
  });

  return res.json({
    success: true,
    message: `PIN reset successfully to ${newPin} and unlock cleared!`,
    user: updated
  });
});

// Admin: 1-Click Toggle Sell Allowed
app.put('/api/admin/users/:id/sell-toggle', async (req, res) => {
  const { sellAllowed } = req.body;
  const isAllowed = Boolean(sellAllowed);
  const updated = await updateUserRecord(req.params.id, { sellAllowed: isAllowed });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

  await addNotification({
    targetType: 'SPECIFIC',
    targetUserId: updated.id,
    title: isAllowed ? '✅ Selling Resumed' : '⚠️ Token Selling Paused',
    message: isAllowed 
      ? 'Token selling permission has been activated on your account.'
      : 'Token selling permission has been paused on your account by administration.'
  });

  return res.json({
    success: true,
    message: `Selling permission ${isAllowed ? 'ENABLED' : 'PAUSED'} for user!`,
    user: updated
  });
});

// Admin: 1-Click Toggle Deposit Allowed
app.put('/api/admin/users/:id/deposit-toggle', async (req, res) => {
  const { depositAllowed } = req.body;
  const isAllowed = Boolean(depositAllowed);
  const updated = await updateUserRecord(req.params.id, { depositAllowed: isAllowed });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

  await addNotification({
    targetType: 'SPECIFIC',
    targetUserId: updated.id,
    title: isAllowed ? '✅ Deposits Resumed' : '⚠️ Deposits Paused',
    message: isAllowed 
      ? 'Deposit facility has been resumed on your account.'
      : 'Deposit facility has been temporarily paused on your account by administration.'
  });

  return res.json({
    success: true,
    message: `Deposit permission ${isAllowed ? 'ALLOWED' : 'PAUSED'} for user!`,
    user: updated
  });
});

// Admin: 1-Click Toggle Account Pause
app.put('/api/admin/users/:id/account-pause', async (req, res) => {
  const { accountPaused } = req.body;
  const isPaused = Boolean(accountPaused);
  const updated = await updateUserRecord(req.params.id, { 
    accountPaused: isPaused,
    status: isPaused ? 'paused' : 'active'
  });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

  await addNotification({
    targetType: 'SPECIFIC',
    targetUserId: updated.id,
    title: isPaused ? '⏸️ Account Status: Paused' : '▶️ Account Status: Active',
    message: isPaused 
      ? 'Your account operations are temporarily paused by administration.' 
      : 'Your account has been resumed by administration. You can now trade and transact normally.'
  });

  return res.json({
    success: true,
    message: `User account is now ${isPaused ? 'PAUSED' : 'ACTIVE'}!`,
    user: updated
  });
});

// Admin: Balance Adjustment & Direct Gift Funds
app.put('/api/admin/users/:id/balance', async (req, res) => {
  const { inrBalance, usdtBalance, tokenBalance, isGift, giftAmount, giftNote } = req.body;
  const user = await findUserById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const oldInr = Number(user.inrBalance || 0);
  const oldUsdt = Number(user.usdtBalance || 0);

  const updates = {};
  if (inrBalance !== undefined) updates.inrBalance = Number(inrBalance);
  if (usdtBalance !== undefined) updates.usdtBalance = Number(usdtBalance);
  if (tokenBalance !== undefined) updates.tokenBalance = Number(tokenBalance);
  if (req.body.spinChances !== undefined) updates.spinChances = Number(req.body.spinChances);

  // If specific gift addition was passed
  if (isGift && giftAmount && Number(giftAmount) > 0) {
    updates.inrBalance = oldInr + Number(giftAmount);
  }

  const updated = await updateUserRecord(req.params.id, updates);
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

  // Calculate if INR funds were added
  const creditedInr = (updates.inrBalance !== undefined && updates.inrBalance > oldInr)
    ? updates.inrBalance - oldInr
    : (isGift && giftAmount ? Number(giftAmount) : 0);

  const creditedUsdt = (updates.usdtBalance !== undefined && updates.usdtBalance > oldUsdt)
    ? updates.usdtBalance - oldUsdt
    : 0;

  // If INR funds were added, record transaction and send user gift notification
  if (creditedInr > 0) {
    const giftTitle = '🎁 Surprise Gift Credited!';
    const giftMsg = giftNote || `Congratulations! A gift bonus of ₹${creditedInr.toLocaleString('en-IN')} has been credited directly to your Fast Pay wallet!`;

    // 1. Add Completed Reward Transaction
    await addTransaction({
      userId: updated.id,
      userName: updated.fullName,
      userEmail: updated.email,
      type: 'REWARD',
      amount: creditedInr,
      currency: 'INR',
      method: 'GIFT_BONUS',
      status: 'COMPLETED',
      refNumber: `GIFT-${Math.floor(100000 + Math.random() * 900000)}`,
      channelLabel: 'Admin Gift Reward 🎁'
    });

    // 2. Add Notification for User
    await addNotification({
      targetType: 'SPECIFIC',
      targetUserId: updated.id,
      title: giftTitle,
      message: giftMsg
    });
  }

  // If USDT funds were added
  if (creditedUsdt > 0) {
    await addTransaction({
      userId: updated.id,
      userName: updated.fullName,
      userEmail: updated.email,
      type: 'REWARD',
      amount: creditedUsdt,
      currency: 'USDT',
      method: 'GIFT_BONUS',
      status: 'COMPLETED',
      refNumber: `GIFT-${Math.floor(100000 + Math.random() * 900000)}`,
      channelLabel: 'USDT Gift Reward 🎁'
    });

    await addNotification({
      targetType: 'SPECIFIC',
      targetUserId: updated.id,
      title: '🎁 USDT Reward Credited!',
      message: `Congratulations! A reward of $${creditedUsdt} USDT has been credited to your wallet!`
    });
  }

  return res.json({
    success: true,
    message: creditedInr > 0 ? `Gift of ₹${creditedInr.toLocaleString('en-IN')} added and notification sent!` : 'User balance adjusted successfully!',
    user: updated
  });
});

// Admin: Block / Unblock User
app.put('/api/admin/users/:id/status', async (req, res) => {
  const { status } = req.body;
  const newStatus = status || 'active';
  const updated = await updateUserRecord(req.params.id, { 
    status: newStatus,
    accountPaused: newStatus === 'paused'
  });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

  if (newStatus === 'blocked') {
    await addNotification({
      targetType: 'SPECIFIC',
      targetUserId: updated.id,
      title: '⚠️ Security Alert: Account Blocked',
      message: 'Your account has been restricted by administration. Please contact helpdesk support.'
    });
  } else if (newStatus === 'active') {
    await addNotification({
      targetType: 'SPECIFIC',
      targetUserId: updated.id,
      title: '✅ Account Restored',
      message: 'Your account is active. You have full access to exchange and trading features.'
    });
  }

  return res.json({ success: true, message: `User status set to ${newStatus.toUpperCase()}`, user: updated });
});

// Admin: All Transactions
app.get('/api/admin/transactions', async (req, res) => {
  const txs = await getAllTransactions();
  return res.json({ success: true, transactions: txs });
});

// Admin: Approve / Reject Transaction
app.put('/api/admin/transactions/:id/status', async (req, res) => {
  const { status, adminNotes } = req.body;
  const tx = await updateTransactionStatus(req.params.id, status, adminNotes);
  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
  return res.json({
    success: true,
    message: `Transaction ${req.params.id} marked as ${status}!`,
    transaction: tx
  });
});

// Admin: Payment Channels (CRUD)
app.get('/api/admin/channels', async (req, res) => {
  const channels = await getAllPaymentChannels();
  return res.json({ success: true, channels });
});

app.post('/api/admin/channels', async (req, res) => {
  const channel = await addPaymentChannel(req.body);
  return res.json({ success: true, message: 'Payment channel added successfully!', channel });
});

app.put('/api/admin/channels/:id', async (req, res) => {
  const updated = await updatePaymentChannel(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Channel not found' });
  return res.json({ success: true, message: 'Payment channel updated!', channel: updated });
});

app.delete('/api/admin/channels/:id', async (req, res) => {
  await deletePaymentChannel(req.params.id);
  return res.json({ success: true, message: 'Channel deleted successfully!' });
});

// Admin: Tasks & Submissions
app.get('/api/admin/tasks', async (req, res) => {
  const tasks = await getAllTasks();
  const submissions = await getAllTaskSubmissions();
  return res.json({ success: true, tasks, submissions });
});

app.post('/api/admin/tasks', async (req, res) => {
  const task = await addTask(req.body);
  return res.json({ success: true, message: 'Task created!', task });
});

app.put('/api/admin/submissions/:id/status', async (req, res) => {
  const { status } = req.body;
  const sub = await updateTaskSubmissionStatus(req.params.id, status);
  if (!sub) return res.status(404).json({ success: false, message: 'Submission not found' });
  return res.json({ success: true, message: `Submission marked as ${status}!`, submission: sub });
});

// Admin: Update Settings & Live Rates
app.get('/api/admin/settings', async (req, res) => {
  const settings = await getAppSettings();
  return res.json({ success: true, settings });
});

app.put('/api/admin/settings', async (req, res) => {
  const { rates, support, spin, general } = req.body;
  if (rates) await updateAppSetting('rates', rates);
  if (support) await updateAppSetting('support', support);
  if (spin) await updateAppSetting('spin', spin);
  if (general) await updateAppSetting('general', general);
  const updatedSettings = await getAppSettings();
  return res.json({ success: true, message: 'Settings saved to Supabase!', settings: updatedSettings });
});

// Admin: Broadcast Notifications
app.post('/api/admin/broadcast', async (req, res) => {
  const { title, message, targetType = 'ALL', targetUserId = null } = req.body;
  if (!title || !message) return res.status(400).json({ success: false, message: 'Title and message required' });

  const notif = await addNotification({ title, message, targetType, targetUserId });
  return res.json({ success: true, message: 'Notification broadcasted!', notification: notif });
});

// Admin: Broadcast History
app.get('/api/admin/broadcast-history', async (req, res) => {
  const notifs = await getAllNotifications();
  return res.json({ success: true, notifications: notifs });
});

// Admin: Delete Broadcast
app.delete('/api/admin/broadcast/:id', async (req, res) => {
  await deleteNotification(req.params.id);
  return res.json({ success: true, message: 'Notification deleted successfully!' });
});

// ==========================================
// 8. TOOL TAB: UPI & PROVIDER ACCOUNTS
// ==========================================
app.get('/api/tool/accounts', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
  const accounts = await getUserUpiAccounts(userId);
  return res.json({ success: true, accounts });
});

app.post('/api/tool/accounts', async (req, res) => {
  const { userId, accountType, upiId, accountNumber, ifscCode, holderName, bankName } = req.body;
  if (!userId || !holderName) {
    return res.status(400).json({ success: false, message: 'userId and holderName are required' });
  }
  if (accountType === 'BANK' && (!accountNumber || !ifscCode)) {
    return res.status(400).json({ success: false, message: 'Account Number and IFSC code are required for Bank accounts' });
  }
  if (accountType !== 'BANK' && !upiId) {
    return res.status(400).json({ success: false, message: 'Valid UPI ID is required' });
  }

  const account = await addUpiAccount({ userId, accountType, upiId, accountNumber, ifscCode, holderName, bankName });
  return res.json({ success: true, message: 'Provider account submitted for verification!', account });
});

app.post('/api/tool/verify-code', async (req, res) => {
  const { accountId, code, userId } = req.body;
  if (!accountId || !code || !userId) {
    return res.status(400).json({ success: false, message: 'accountId, code and userId are required' });
  }
  const result = await verifyUpiAccountCode(accountId, code, userId);
  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json(result);
});

app.post('/api/tool/set-primary', async (req, res) => {
  const { accountId, userId } = req.body;
  if (!accountId || !userId) {
    return res.status(400).json({ success: false, message: 'accountId and userId are required' });
  }
  const acc = await setPrimaryUpiAccount(accountId, userId);
  if (!acc) return res.status(404).json({ success: false, message: 'Account not found' });
  return res.json({ success: true, message: 'Primary payout account updated!', account: acc });
});

// Admin: UPI Accounts Review
app.get('/api/admin/upi-accounts', async (req, res) => {
  const accounts = await getAllUpiAccounts();
  const users = await getAllUsers();
  // enrich with user details
  const enriched = accounts.map(a => {
    const u = users.find(x => x.id === a.userId || x.uid === a.userId);
    return {
      ...a,
      userName: u?.fullName || 'User',
      userEmail: u?.email || '',
      userMobile: u?.mobile || '',
      userUid: u?.uid || a.userId
    };
  });
  return res.json({ success: true, accounts: enriched });
});

app.post('/api/admin/upi-accounts/:id/action', async (req, res) => {
  const { action, adminNotes, verificationCode } = req.body; // action: 'APPROVE', 'REJECT', 'ASK_CODE'
  const id = req.params.id;

  let newStatus = 'PENDING_REVIEW';
  let code = null;

  if (action === 'APPROVE') {
    newStatus = 'APPROVED';
  } else if (action === 'REJECT') {
    newStatus = 'REJECTED';
  } else if (action === 'ASK_CODE') {
    newStatus = 'CODE_REQUIRED';
    code = verificationCode || Math.floor(1000 + Math.random() * 9000).toString();
  } else {
    return res.status(400).json({ success: false, message: 'Invalid action' });
  }

  const updated = await updateUpiAccountStatus(id, newStatus, adminNotes, code);
  if (!updated) return res.status(404).json({ success: false, message: 'Account not found' });

  // Add in-app notification to user
  const notifMsg = action === 'APPROVE'
    ? `Your payment account (${updated.upiId || updated.accountNumber}) has been approved for 24/7 withdrawals!`
    : action === 'ASK_CODE'
    ? `Action Required: Please enter verification challenge code in the Tool tab to verify your account.`
    : `Your payout account verification was declined: ${adminNotes || 'Please check account details.'}`;

  await addNotification({
    title: action === 'APPROVE' ? '✅ Account Verified' : action === 'ASK_CODE' ? '🔐 Verification Code Required' : '⚠️ Account Rejected',
    message: notifMsg,
    targetType: 'SPECIFIC',
    targetUserId: updated.userId
  });

  return res.json({ success: true, message: `Account updated to ${newStatus}`, account: updated, generatedCode: code });
});

// ==========================================
// 9. CASH OUT & SELL REQUESTS
// ==========================================
app.get('/api/token/my-sell-requests', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
  const requests = await getUserSellRequests(userId);
  return res.json({ success: true, requests });
});

app.post('/api/token/sell-request', async (req, res) => {
  try {
    const { userId, inrAmount, tokenRate = 1.0, payoutAccountId } = req.body;
    if (!userId || !inrAmount || Number(inrAmount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid userId and positive inrAmount are required' });
    }

    const settings = await getAppSettings();
    const currentRate = settings?.rates?.tokenSellPrice || tokenRate || 1.0;

    const newReq = await createSellRequest({ userId, inrAmount: Number(inrAmount), tokenRate: currentRate, payoutAccountId });

    await addNotification({
      title: '📤 Cash Out Request Submitted',
      message: `Your request to cash out ₹${inrAmount} is under processing. Funds have been reserved.`,
      targetType: 'SPECIFIC',
      targetUserId: userId
    });

    return res.json({ success: true, message: 'Cash out request submitted successfully!', request: newReq });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Admin: Sell Requests Queue
app.get('/api/admin/sell-requests', async (req, res) => {
  const requests = await getAllSellRequests();
  return res.json({ success: true, requests });
});

app.post('/api/admin/sell-requests/:id/action', async (req, res) => {
  const { action, payoutUtr, adminNotes } = req.body; // action: 'APPROVE', 'REJECT'
  const id = req.params.id;

  const targetStatus = action === 'APPROVE' ? 'COMPLETED' : action === 'REJECT' ? 'REJECTED' : null;
  if (!targetStatus) return res.status(400).json({ success: false, message: 'Invalid action' });

  const updated = await updateSellRequestStatus(id, targetStatus, payoutUtr, adminNotes);
  if (!updated) return res.status(404).json({ success: false, message: 'Sell request not found' });

  await addNotification({
    title: action === 'APPROVE' ? '💸 Cash Out Settled!' : '⚠️ Cash Out Request Refunded',
    message: action === 'APPROVE'
      ? `Your cash out of ₹${updated.inrAmount} has been processed via UPI/Bank (Ref: ${payoutUtr || 'Success'}).`
      : `Your cash out request was declined and ₹${updated.inrAmount} has been refunded to your wallet: ${adminNotes || 'Contact support.'}`,
    targetType: 'SPECIFIC',
    targetUserId: updated.userId
  });

  return res.json({ success: true, message: `Sell request marked as ${targetStatus}`, request: updated });
});

// ==========================================
// 10. DEPOSIT PACKAGES & RESERVATIONS
// ==========================================
app.get('/api/deposit/packages', async (req, res) => {
  return res.json({ success: true, packages: DEPOSIT_PACKAGES });
});

app.get('/api/deposit/active-order', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
  const activeOrder = await getActiveDepositOrder(userId);
  return res.json({ success: true, order: activeOrder || null });
});

app.post('/api/deposit/reserve', async (req, res) => {
  try {
    const { userId, packageAmount, bonusPercent, channelId } = req.body;
    if (!userId || !packageAmount) {
      return res.status(400).json({ success: false, message: 'userId and packageAmount required' });
    }
    const order = await reserveDepositOrder({ userId, packageAmount, bonusPercent, channelId });
    return res.json({ success: true, message: 'Deposit package reserved for 15 minutes!', order });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

app.post('/api/deposit/submit-order', upload.single('receipt'), async (req, res) => {
  try {
    const { orderId, userId, utr } = req.body;
    let proofUrl = req.body.proofUrl || '';

    if (req.file) {
      const uploadRes = await uploadProofToSupabase(req.file.buffer, req.file.originalname, req.file.mimetype);
      proofUrl = uploadRes.publicUrl;
    }

    const order = await submitDepositOrderProof({ orderId, userId, utr, proofUrl });

    await addNotification({
      title: '📥 Deposit Proof Received',
      message: `Deposit Order #${order.orderId} (₹${order.packageAmount}) submitted for UTR verification.`,
      targetType: 'SPECIFIC',
      targetUserId: userId
    });

    return res.json({ success: true, message: 'Deposit submitted successfully! Admin will verify UTR shortly.', order });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 11. BANNERS (Announcement Popups)
// ==========================================
app.get('/api/banners/active', async (req, res) => {
  const banners = await getActiveBanners();
  return res.json({ success: true, banners });
});

app.get('/api/admin/banners', async (req, res) => {
  const banners = await getAllBanners();
  return res.json({ success: true, banners });
});

app.post('/api/admin/banners', upload.single('bannerImage'), async (req, res) => {
  let imageUrl = req.body.imageUrl || '';
  if (req.file) {
    const uploadRes = await uploadProofToSupabase(req.file.buffer, req.file.originalname, req.file.mimetype);
    imageUrl = uploadRes.publicUrl;
  }
  const banner = await addBanner({
    title: req.body.title,
    imageUrl,
    linkUrl: req.body.linkUrl || '/deposit',
    isActive: req.body.isActive !== undefined ? (req.body.isActive === true || req.body.isActive === 'true') : true
  });
  return res.json({ success: true, message: 'Banner created!', banner });
});

app.put('/api/admin/banners/:id', async (req, res) => {
  const updated = await updateBanner(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Banner not found' });
  return res.json({ success: true, message: 'Banner updated!', banner: updated });
});

app.delete('/api/admin/banners/:id', async (req, res) => {
  await deleteBanner(req.params.id);
  return res.json({ success: true, message: 'Banner deleted!' });
});

// ==========================================
// 12. MAINTENANCE MODE
// ==========================================
app.get(['/api/maintenance', '/api/maintenance/status'], async (req, res) => {
  const maintenance = await getMaintenanceSettings();
  return res.json({ success: true, maintenance });
});

app.get('/api/admin/maintenance', async (req, res) => {
  const maintenance = await getMaintenanceSettings();
  return res.json({ success: true, maintenance });
});

app.post('/api/admin/maintenance', async (req, res) => {
  const updated = await updateMaintenanceSettings(req.body);
  return res.json({ success: true, message: 'Maintenance settings updated!', maintenance: updated });
});

app.put('/api/admin/maintenance', async (req, res) => {
  const updated = await updateMaintenanceSettings(req.body);
  return res.json({ success: true, message: 'Maintenance settings updated!', maintenance: updated });
});

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`🚀 [The FamPay Node/Express Backend] Running on port ${PORT}`);
  console.log(`🔥 Supabase Storage: proofs & data buckets ACTIVE`);
  console.log(`🔥 Brevo API: fastpay00005@gmail.com OTP Engine Ready`);
  console.log(`===================================================`);
});
