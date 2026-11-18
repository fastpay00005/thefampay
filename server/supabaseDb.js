import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gphlejllfvcsrgdfelma.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Storage Buckets
const PROOFS_BUCKET = 'proofs';
const DATA_BUCKET = 'data';
const STATE_FILE = 'fampay_db_state.json';

// In-Memory cache to drastically cut Supabase database & storage egress
const CACHE_TTL = {
  USERS: 15 * 1000,         // 15s cache
  TRANSACTIONS: 15 * 1000,  // 15s cache
  CHANNELS: 60 * 1000,      // 60s cache
  SETTINGS: 60 * 1000,      // 60s cache
  TASKS: 30 * 1000,         // 30s cache
  NOTIFICATIONS: 15 * 1000, // 15s cache
  UPI_ACCOUNTS: 15 * 1000,  // 15s cache
  SELL_REQUESTS: 15 * 1000, // 15s cache
  DEPOSIT_ORDERS: 15 * 1000,// 15s cache
  BANNERS: 60 * 1000,       // 60s cache
  MAINTENANCE: 30 * 1000    // 30s cache
};

const cache = {
  users: { data: null, lastFetched: 0 },
  transactions: { data: null, lastFetched: 0 },
  channels: { data: null, lastFetched: 0 },
  settings: { data: null, lastFetched: 0 },
  tasks: { data: null, lastFetched: 0 },
  submissions: { data: null, lastFetched: 0 },
  notifications: { data: null, lastFetched: 0 },
  upiAccounts: { data: null, lastFetched: 0 },
  sellRequests: { data: null, lastFetched: 0 },
  depositOrders: { data: null, lastFetched: 0 },
  banners: { data: null, lastFetched: 0 },
  maintenance: { data: null, lastFetched: 0 }
};

export function invalidateCache(key) {
  if (cache[key]) {
    cache[key].data = null;
    cache[key].lastFetched = 0;
  }
}

// In-Memory fallback & caching layer (Real Users Only - Demo Data Removed)
let dbState = {
  users: [
    {
      id: 'USR-ADMIN',
      uid: 'FP-ADMIN',
      fullName: 'The FamPay SuperAdmin',
      email: 'admin@thefampay.com',
      mobile: '+91 99999 88888',
      password: 'Admin@FamPay2026',
      role: 'ADMIN',
      inrBalance: 0,
      usdtBalance: 0,
      tokenBalance: 0,
      tradingVolume: 0,
      spinChances: 0,
      fundLocked: false,
      sellAllowed: true,
      pinLocked: false,
      transactionPin: '0000',
      pinAttempts: 0,
      referralCode: 'ADMIN-ROOT',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ],
  transactions: [],
  paymentChannels: [
    {
      id: 'CH-01',
      type: 'UPI',
      label: 'VIP Instant UPI (Primary)',
      upiId: 'thefampay@yesbank',
      qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=thefampay@yesbank&pn=The%20FamPay&cu=INR',
      isActive: true,
      minDeposit: 500,
      extraRewardPercent: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 'CH-02',
      type: 'BANK',
      label: 'HDFC Corporate Current A/C',
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50200088991122',
      ifscCode: 'HDFC0001234',
      holderName: 'The FamPay Technologies Pvt Ltd',
      isActive: true,
      minDeposit: 1000,
      extraRewardPercent: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: 'CH-03',
      type: 'CRYPTO',
      label: 'USDT TRC20 Fast Deposit',
      cryptoChain: 'TRC20',
      walletAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      isActive: true,
      minDeposit: 50,
      extraRewardPercent: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 'CH-04',
      type: 'CRYPTO',
      label: 'USDT BEP20 Low Fee Deposit',
      cryptoChain: 'BEP20',
      walletAddress: '0x55d398326f99059fF775485246999027B3197955',
      isActive: true,
      minDeposit: 50,
      extraRewardPercent: 2,
      createdAt: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: 'TASK-01',
      title: 'Human Verification: Social Community Share',
      description: 'Share The FamPay on Telegram / WhatsApp and upload screenshot proof to verify account & unlock full limits.',
      rewardInr: 200,
      type: 'HUMAN_VERIFICATION',
      status: 'ACTIVE',
      proofRequired: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'TASK-02',
      title: 'Join Official VIP Telegram Channel',
      description: 'Subscribe to our verified Telegram broadcast channel and submit screenshot proof.',
      rewardInr: 100,
      type: 'HUMAN_VERIFICATION',
      status: 'ACTIVE',
      proofRequired: true,
      createdAt: new Date().toISOString()
    }
  ],
  taskSubmissions: [],
  settings: {
    rates: {
      marketRate: 98.50,
      appRate: 100.00,
      tokenBuyPrice: 100.00,
      tokenSellPrice: 98.00,
      usdtInrRate: 88.50,
      extraBonusPercent: 2
    },
    support: {
      telegramGroup: 'https://t.me/thefampayofficial',
      telegramChannel: 'https://t.me/thefampaychannel',
      whatsapp: '+91 98765 43210',
      email: 'fastpay00005@gmail.com'
    },
    spin: {
      minTradingVolumeForSpin: 10000,
      usdtVolumeForSpin: 100
    }
  },
  notifications: [],
  upiAccounts: [],
  sellRequests: [],
  depositOrders: [],
  banners: [
    {
      id: 'BANNER-01',
      title: 'Welcome to The FamPay VIP Exchange',
      imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=800&q=80',
      linkUrl: '/deposit',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  maintenance: {
    isEnabled: false,
    message: 'System upgrade in progress. Normal operations will resume shortly.',
    scheduledEnd: null
  },
  userReadNotifications: {}
};

// Check if SQL tables exist
let sqlTablesAvailable = false;

export async function syncUsersFromSql() {
  if (!sqlTablesAvailable) return;
  try {
    const users = await getAllUsers();
    if (users && users.length > 0) {
      users.forEach(u => {
        const idx = dbState.users.findIndex(x => x.id === u.id || x.uid === u.uid);
        if (idx >= 0) {
          dbState.users[idx] = { ...dbState.users[idx], ...u };
        } else {
          dbState.users.push(u);
        }
      });
      console.log(`✅ Synchronized ${users.length} users into live memory state.`);
    }
  } catch (err) {
    console.warn('Sync users from SQL error:', err.message);
  }
}

export async function seedInitialSqlData() {
  if (!sqlTablesAvailable) return;
  try {
    const { data: existingTasks } = await supabase.from('tasks').select('id');
    if (!existingTasks || existingTasks.length === 0) {
      for (const t of dbState.tasks) {
        await supabase.from('tasks').insert({
          id: t.id,
          title: t.title,
          description: t.description,
          reward_inr: t.rewardInr,
          type: t.type,
          status: t.status,
          proof_required: t.proofRequired
        });
      }
      console.log('✅ Seeded default tasks into Supabase tasks table.');
    }
  } catch (err) {
    console.warn('Seeding tasks error:', err.message);
  }
}

export async function checkSqlTables() {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (!error) {
      sqlTablesAvailable = true;
      console.log('✅ Supabase PostgreSQL Tables detected and ACTIVE!');
      await syncUsersFromSql();
      await syncSettingsFromSql();
      await seedInitialSqlData();
      return true;
    }
    sqlTablesAvailable = false;
    return false;
  } catch {
    sqlTablesAvailable = false;
    return false;
  }
}

export async function syncSettingsFromSql() {
  if (!sqlTablesAvailable) return;
  try {
    const { data, error } = await supabase.from('settings').select('*');
    if (!error && data) {
      data.forEach(item => {
        if (item.key === 'user_read_notifications') {
          dbState.userReadNotifications = item.value || {};
        } else if (item.key === 'maintenance') {
          dbState.maintenance = item.value || { isEnabled: false };
        } else if (item.key === 'banners') {
          dbState.banners = item.value || [];
        } else {
          dbState.settings[item.key] = item.value;
        }
      });
      console.log('✅ Synchronized settings and read notifications from Supabase SQL.');
    }
  } catch (err) {
    console.warn('Sync settings from SQL error:', err.message);
  }
}

// Ensure Storage Buckets exist
export async function initStorage() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketNames = (buckets || []).map(b => b.name);

    if (!bucketNames.includes(PROOFS_BUCKET)) {
      await supabase.storage.createBucket(PROOFS_BUCKET, { public: true });
      console.log(`[Storage] Created bucket: ${PROOFS_BUCKET}`);
    }
    if (!bucketNames.includes(DATA_BUCKET)) {
      await supabase.storage.createBucket(DATA_BUCKET, { public: true });
      console.log(`[Storage] Created bucket: ${DATA_BUCKET}`);
    }

    // Only load JSON state from Storage if SQL tables are NOT available
    if (!sqlTablesAvailable) {
      const { data: fileData, error } = await supabase.storage
        .from(DATA_BUCKET)
        .download(STATE_FILE);

      if (!error && fileData) {
        const text = await fileData.text();
        const parsed = JSON.parse(text);
        if (parsed && parsed.users) {
          dbState = parsed;
          console.log(`✅ Loaded fallback database state from Supabase Storage (${dbState.users.length} users, ${dbState.transactions.length} txs)`);
        }
      }
    } else {
      // With SQL active, ensure in-memory fallback has 0 fake transactions
      dbState.transactions = [];
    }
  } catch (err) {
    console.warn('[Storage Init Error]:', err.message);
  }
}

// Persist entire dbState to Supabase Storage bucket 'data' (Only used as fallback when SQL is unavailable)
export async function persistStateToSupabase() {
  if (sqlTablesAvailable) {
    // PostgreSQL tables are the active source of truth. Do not burn Storage egress.
    return;
  }
  try {
    const jsonStr = JSON.stringify(dbState, null, 2);
    const buffer = Buffer.from(jsonStr, 'utf-8');
    await supabase.storage
      .from(DATA_BUCKET)
      .upload(STATE_FILE, buffer, {
        contentType: 'application/json',
        upsert: true
      });
  } catch (err) {
    console.error('[Persist Error]:', err.message);
  }
}

// Upload file to Supabase Storage proofs bucket
export async function uploadProofToSupabase(fileBuffer, originalName, mimeType) {
  const ext = originalName.split('.').pop() || 'png';
  const fileName = `proof_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(PROOFS_BUCKET)
    .upload(fileName, fileBuffer, {
      contentType: mimeType || 'image/jpeg',
      upsert: true
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(PROOFS_BUCKET)
    .getPublicUrl(fileName);

  return {
    path: fileName,
    publicUrl: publicUrlData.publicUrl
  };
}

// ==========================================
// DB SERVICE METHODS (USERS)
// ==========================================
export async function getAllUsers() {
  if (cache.users.data && (Date.now() - cache.users.lastFetched < CACHE_TTL.USERS)) {
    return cache.users.data;
  }

  if (sqlTablesAvailable) {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      const mapped = data.map(u => {
        const isPaused = u.account_paused !== undefined ? Boolean(u.account_paused) : (u.status === 'paused');
        const fallbackUser = dbState.users.find(du => du.id === u.id || du.uid === u.uid) || {};
        const code = u.referral_code || fallbackUser.referralCode || `FP${Math.floor(100000 + Math.random() * 900000)}`;
        const directDownlineCount = data.filter(other => other.referred_by && other.referred_by.toUpperCase() === code.toUpperCase()).length;

        return {
          id: u.id,
          uid: u.uid,
          fullName: u.full_name,
          email: u.email,
          mobile: u.mobile,
          password: u.password,
          role: u.role,
          inrBalance: Number(u.inr_balance || 0),
          usdtBalance: Number(u.usdt_balance || 0),
          tokenBalance: Number(u.token_balance || fallbackUser.tokenBalance || 0),
          tradingVolume: Number(u.trading_volume || 0),
          spinChances: u.spin_chances || 0,
          fundLocked: Boolean(u.fund_locked),
          sellAllowed: u.sell_allowed !== false,
          accountPaused: isPaused,
          depositAllowed: u.deposit_allowed !== undefined ? (u.deposit_allowed !== false) : true,
          pinLocked: Boolean(u.pin_locked),
          transactionPin: u.transaction_pin,
          pinAttempts: u.pin_attempts || 0,
          referralCode: code,
          referredBy: u.referred_by || fallbackUser.referredBy || null,
          referralCount: directDownlineCount || fallbackUser.referralCount || 0,
          referralEarnings: Number(fallbackUser.referralEarnings || 0),
          upiId: u.upi_id || fallbackUser.upiId || '',
          avatar: fallbackUser.avatar || 'avatar-1',
          status: isPaused && u.status === 'active' ? 'paused' : (u.status || 'active'),
          createdAt: u.created_at
        };
      });
      cache.users.data = mapped;
      cache.users.lastFetched = Date.now();
      return mapped;
    }
  }
  return dbState.users;
}

export async function findUserByEmailOrMobile(identifier) {
  const users = await getAllUsers();
  const ident = identifier.toLowerCase().trim();
  return users.find(u => u.email.toLowerCase() === ident || u.mobile.trim() === identifier.trim());
}

export async function findUserById(id) {
  if (!id) return null;
  // If memory cache exists, look up instantly with 0 Supabase egress
  if (cache.users.data) {
    const found = cache.users.data.find(u => u.id === id || u.uid === id);
    if (found) return found;
  }
  const users = await getAllUsers();
  return users.find(u => u.id === id || u.uid === id);
}

export async function createNewUser(userData) {
  const allUsersList = await getAllUsers();
  const existingCodes = new Set(allUsersList.map(u => (u.referralCode || '').toUpperCase()));

  // Generate unique permanent referral code (Format: FP + 6 Digits, e.g. FP892401)
  let ownReferralCode = '';
  do {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    ownReferralCode = `FP${randomSuffix}`;
  } while (existingCodes.has(ownReferralCode));

  const randomUid = `FP${Math.floor(10000 + Math.random() * 90000)}`;

  // Validate referredBy code (if user provided one during signup)
  let validReferredBy = null;
  const rawRef = userData.referredBy || userData.referralCodeEntered || (typeof userData.referralCode === 'string' && userData.referralCode.trim() !== '' ? userData.referralCode.trim().toUpperCase() : null);
  
  if (rawRef) {
    const cleanRef = rawRef.trim().toUpperCase();
    const referrer = allUsersList.find(u => 
      (u.referralCode && u.referralCode.toUpperCase() === cleanRef) ||
      (u.uid && u.uid.toUpperCase() === cleanRef)
    );
    if (referrer) {
      validReferredBy = referrer.referralCode || referrer.uid;
      referrer.referralCount = (referrer.referralCount || 0) + 1;
      await updateUserRecord(referrer.id, { referralCount: referrer.referralCount });
      console.log(`[Referral System] New user linked to referrer: ${referrer.fullName} (${validReferredBy})`);
    } else {
      console.log(`[Referral System] Provided referral code "${cleanRef}" not found. Proceeding as direct signup.`);
    }
  }

  const newUser = {
    id: `USR-${Math.floor(100 + Math.random() * 900)}`,
    uid: randomUid,
    fullName: userData.fullName,
    email: userData.email.toLowerCase().trim(),
    mobile: userData.mobile.trim(),
    password: userData.password,
    role: userData.role || 'USER',
    inrBalance: userData.inrBalance ?? 0,
    usdtBalance: userData.usdtBalance ?? 0,
    tokenBalance: 0,
    tradingVolume: 0,
    spinChances: 0,
    fundLocked: false,
    sellAllowed: true,
    depositAllowed: true,
    accountPaused: false,
    pinLocked: false,
    transactionPin: userData.transactionPin || '1234',
    pinAttempts: 0,
    referralCode: ownReferralCode,
    referredBy: validReferredBy,
    referralCount: 0,
    referralEarnings: 0,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  if (sqlTablesAvailable) {
    try {
      const sqlUserData = {
        id: newUser.id,
        uid: newUser.uid,
        full_name: newUser.fullName,
        email: newUser.email,
        mobile: newUser.mobile,
        password: newUser.password,
        role: newUser.role,
        inr_balance: newUser.inrBalance || 0,
        usdt_balance: newUser.usdtBalance || 0,
        token_balance: newUser.tokenBalance || 0,
        trading_volume: newUser.tradingVolume || 0,
        spin_chances: newUser.spinChances || 0,
        fund_locked: Boolean(newUser.fundLocked),
        sell_allowed: newUser.sellAllowed !== false,
        pin_locked: Boolean(newUser.pinLocked),
        transaction_pin: newUser.transactionPin || '1234',
        pin_attempts: newUser.pinAttempts || 0,
        referral_code: newUser.referralCode,
        referred_by: newUser.referredBy,
        status: newUser.status || 'active'
      };
      const { error: insertErr } = await supabase.from('users').insert(sqlUserData);
      if (insertErr) {
        console.warn('SQL insert user error:', insertErr.message);
      } else {
        console.log(`✅ Saved new user ${newUser.id} (${newUser.fullName}) to Supabase PostgreSQL table!`);
      }
    } catch (err) {
      console.warn('SQL insert user error:', err.message);
    }
  }

  // Also sync to Supabase Auth
  try {
    await supabase.auth.admin.createUser({
      email: newUser.email,
      password: newUser.password,
      email_confirm: true,
      user_metadata: {
        fullName: newUser.fullName,
        mobile: newUser.mobile,
        uid: newUser.uid,
        role: newUser.role
      }
    });
  } catch (err) {
    console.log('[Supabase Auth Sync Notice]:', err.message);
  }

  dbState.users.push(newUser);
  invalidateCache('users');
  await persistStateToSupabase();
  return newUser;
}

export async function updateUserRecord(id, updates) {
  let user = dbState.users.find(u => u.id === id || u.uid === id);
  if (!user) {
    const fetched = await findUserById(id);
    if (fetched) {
      user = fetched;
      dbState.users.push(user);
    }
  }
  if (!user) return null;

  // Handle status and accountPaused coordination
  if (updates.accountPaused !== undefined) {
    if (updates.accountPaused && user.status !== 'blocked') {
      user.status = 'paused';
    } else if (!updates.accountPaused && user.status === 'paused') {
      user.status = 'active';
    }
  }

  if (updates.status === 'paused') {
    updates.accountPaused = true;
  } else if (updates.status === 'active' && user.accountPaused) {
    updates.accountPaused = false;
  }

  Object.assign(user, updates);

  if (sqlTablesAvailable) {
    try {
      const sqlUpdates = {};
      if (updates.inrBalance !== undefined) sqlUpdates.inr_balance = Number(updates.inrBalance);
      if (updates.usdtBalance !== undefined) sqlUpdates.usdt_balance = Number(updates.usdtBalance);
      if (updates.tokenBalance !== undefined) sqlUpdates.token_balance = Number(updates.tokenBalance);
      if (updates.tradingVolume !== undefined) sqlUpdates.trading_volume = Number(updates.tradingVolume);
      if (updates.spinChances !== undefined) sqlUpdates.spin_chances = updates.spinChances;
      if (updates.fundLocked !== undefined) sqlUpdates.fund_locked = Boolean(updates.fundLocked);
      if (updates.sellAllowed !== undefined) sqlUpdates.sell_allowed = Boolean(updates.sellAllowed);
      if (updates.pinLocked !== undefined) sqlUpdates.pin_locked = Boolean(updates.pinLocked);
      if (updates.transactionPin !== undefined) sqlUpdates.transaction_pin = updates.transactionPin;
      if (updates.pinAttempts !== undefined) sqlUpdates.pin_attempts = updates.pinAttempts;
      if (user.status !== undefined) sqlUpdates.status = user.status;
      if (updates.password !== undefined) sqlUpdates.password = updates.password;

      // Update basic fields in Supabase
      const { error: primaryErr } = await supabase.from('users').update(sqlUpdates).eq('id', user.id);
      if (primaryErr) {
        console.warn('SQL update user primary error:', primaryErr.message);
      }

      // Try extra schema fields if present in table
      if (updates.accountPaused !== undefined || updates.depositAllowed !== undefined) {
        const extraSql = {};
        if (updates.accountPaused !== undefined) extraSql.account_paused = Boolean(updates.accountPaused);
        if (updates.depositAllowed !== undefined) extraSql.deposit_allowed = Boolean(updates.depositAllowed);
        try {
          await supabase.from('users').update(extraSql).eq('id', user.id);
        } catch {
          // Fallback handled by status: 'paused'
        }
      }
    } catch (err) {
      console.warn('SQL update user error:', err.message);
    }
  }

  invalidateCache('users');
  await persistStateToSupabase();
  return user;
}

// ==========================================
// TRANSACTIONS
// ==========================================
export async function getAllTransactions() {
  if (cache.transactions.data && (Date.now() - cache.transactions.lastFetched < CACHE_TTL.TRANSACTIONS)) {
    return cache.transactions.data;
  }

  if (sqlTablesAvailable) {
    const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      const mapped = data.map(t => ({
        id: t.id,
        userId: t.user_id,
        userName: t.user_name,
        userEmail: t.user_email,
        type: t.type,
        amount: Number(t.amount),
        currency: t.currency,
        method: t.method,
        status: t.status,
        refNumber: t.ref_number,
        proofUrl: t.proof_url,
        channelLabel: t.channel_label,
        adminNotes: t.admin_notes,
        createdAt: t.created_at
      }));
      cache.transactions.data = mapped;
      cache.transactions.lastFetched = Date.now();
      return mapped;
    }
  }
  return dbState.transactions;
}

export async function addTransaction(tx) {
  const newTx = {
    id: tx.id || `TX-${Math.floor(10000 + Math.random() * 90000)}`,
    userId: tx.userId,
    userName: tx.userName || 'The FamPay User',
    userEmail: tx.userEmail || '',
    type: tx.type,
    amount: Number(tx.amount),
    currency: tx.currency || 'INR',
    method: tx.method || 'UPI',
    status: tx.status || 'PENDING',
    refNumber: tx.refNumber || '',
    proofUrl: tx.proofUrl || '',
    channelLabel: tx.channelLabel || '',
    adminNotes: tx.adminNotes || '',
    createdAt: new Date().toISOString()
  };

  if (sqlTablesAvailable) {
    try {
      await supabase.from('transactions').insert({
        id: newTx.id,
        user_id: newTx.userId,
        user_name: newTx.userName,
        user_email: newTx.userEmail,
        type: newTx.type,
        amount: newTx.amount,
        currency: newTx.currency,
        method: newTx.method,
        status: newTx.status,
        ref_number: newTx.refNumber,
        proof_url: newTx.proofUrl,
        channel_label: newTx.channelLabel,
        admin_notes: newTx.adminNotes
      });
    } catch (err) {
      console.warn('SQL add transaction error:', err.message);
    }
  }

  dbState.transactions.unshift(newTx);
  invalidateCache('transactions');
  await persistStateToSupabase();
  return newTx;
}

export async function updateTransactionStatus(txId, status, adminNotes = '') {
  let tx = dbState.transactions.find(t => t.id === txId);
  if (!tx) {
    if (sqlTablesAvailable) {
      const { data } = await supabase.from('transactions').select('*').eq('id', txId).single();
      if (data) {
        tx = {
          id: data.id,
          userId: data.user_id,
          userName: data.user_name,
          userEmail: data.user_email,
          type: data.type,
          amount: Number(data.amount),
          currency: data.currency,
          method: data.method,
          status: data.status,
          refNumber: data.ref_number,
          proofUrl: data.proof_url,
          channelLabel: data.channel_label,
          adminNotes: data.admin_notes,
          createdAt: data.created_at
        };
        dbState.transactions.push(tx);
      }
    }
  }
  if (!tx) return null;

  tx.status = status;
  if (adminNotes) tx.adminNotes = adminNotes;

  // Auto-credit/refund user balance in Supabase on approval / rejection
  if (status === 'COMPLETED') {
    let user = dbState.users.find(u => u.id === tx.userId);
    if (!user) user = await findUserById(tx.userId);
    if (user) {
      if (tx.type === 'DEPOSIT') {
        const settings = await getAppSettings();
        const usdtRate = Number(settings?.usdtInrRate || 88.5);

        if (tx.currency === 'INR') {
          const depositInr = Number(tx.amount || 0);
          const newBal = Number(user.inrBalance || 0) + depositInr;

          // PDF §3.7.1 & §4.6: Convert deposit to JTokens (amount / tokenRate) on INR deposit approval
          const tokenRate = Number(settings?.rates?.tokenBuyPrice || settings?.tokenBuyPrice || 10.0);
          const tokensToAdd = tokenRate > 0 ? Number((depositInr / tokenRate).toFixed(4)) : 0;
          const newTokenBal = Number(user.tokenBalance || 0) + tokensToAdd;

          await updateUserRecord(user.id, { inrBalance: newBal, tokenBalance: newTokenBal });

          // ----------------------------------------------------
          // 3-Generation Referral Commission Distribution (PDF §2.14 & §4.8)
          // L1: 30%, L2: 10%, L3: 5% (Strictly on INR deposits, USDT = 0%)
          // ----------------------------------------------------
          try {
            const allUsersList = await getAllUsers();
            
            // Level 1 Referrer (Direct: 30%)
            if (user.referredBy) {
              const l1User = allUsersList.find(u => u.referralCode && u.referralCode.toUpperCase() === user.referredBy.toUpperCase());
              if (l1User) {
                const l1Commission = Number(((depositInr * 30) / 100).toFixed(2));
                const l1Bal = Number(l1User.inrBalance || 0) + l1Commission;
                const l1Earnings = Number(l1User.referralEarnings || 0) + l1Commission;
                await updateUserRecord(l1User.id, { inrBalance: l1Bal, referralEarnings: l1Earnings });

                await addNotification({
                  targetType: 'SPECIFIC',
                  targetUserId: l1User.id,
                  title: '🎉 Level 1 Commission Earned!',
                  message: `You earned ₹${l1Commission.toLocaleString('en-IN')} (30% Commission) from ${user.fullName || 'a member'}'s deposit of ₹${depositInr.toLocaleString('en-IN')}!`
                });

                // Level 2 Referrer (10%)
                if (l1User.referredBy) {
                  const l2User = allUsersList.find(u => u.referralCode && u.referralCode.toUpperCase() === l1User.referredBy.toUpperCase());
                  if (l2User) {
                    const l2Commission = Number(((depositInr * 10) / 100).toFixed(2));
                    const l2Bal = Number(l2User.inrBalance || 0) + l2Commission;
                    const l2Earnings = Number(l2User.referralEarnings || 0) + l2Commission;
                    await updateUserRecord(l2User.id, { inrBalance: l2Bal, referralEarnings: l2Earnings });

                    await addNotification({
                      targetType: 'SPECIFIC',
                      targetUserId: l2User.id,
                      title: '🎉 Level 2 Commission Earned!',
                      message: `You earned ₹${l2Commission.toLocaleString('en-IN')} (10% Commission) from downline deposit of ₹${depositInr.toLocaleString('en-IN')}!`
                    });

                    // Level 3 Referrer (5%)
                    if (l2User.referredBy) {
                      const l3User = allUsersList.find(u => u.referralCode && u.referralCode.toUpperCase() === l2User.referredBy.toUpperCase());
                      if (l3User) {
                        const l3Commission = Number(((depositInr * 5) / 100).toFixed(2));
                        const l3Bal = Number(l3User.inrBalance || 0) + l3Commission;
                        const l3Earnings = Number(l3User.referralEarnings || 0) + l3Commission;
                        await updateUserRecord(l3User.id, { inrBalance: l3Bal, referralEarnings: l3Earnings });

                        await addNotification({
                          targetType: 'SPECIFIC',
                          targetUserId: l3User.id,
                          title: '🎉 Level 3 Commission Earned!',
                          message: `You earned ₹${l3Commission.toLocaleString('en-IN')} (5% Commission) from Level 3 downline deposit!`
                        });
                      }
                    }
                  }
                }
              }
            }
          } catch (commErr) {
            console.warn('Referral commission calculation error:', commErr.message);
          }
        } else if (tx.currency === 'USDT') {
          // Per PDF Spec 2.12.2 & 3.7.2: USDT is converted to INR at usdtRate and credited to Available Balance
          // Per PDF Spec 4.8: USDT deposits pay 0% referral commission (Commission is strictly 0 for USDT)
          const inrCredit = Number((Number(tx.amount || 0) * usdtRate).toFixed(2));
          const newBal = Number(user.inrBalance || 0) + inrCredit;
          await updateUserRecord(user.id, { inrBalance: newBal });
        }
      }
    }

    if (tx.type === 'DEPOSIT') {
      const isUsdt = tx.currency === 'USDT';
      const settings = await getAppSettings();
      const usdtRate = Number(settings?.usdtInrRate || 88.5);
      const creditedDisplay = isUsdt 
        ? `${tx.amount} USDT (₹${(Number(tx.amount) * usdtRate).toLocaleString('en-IN')})` 
        : `₹${Number(tx.amount).toLocaleString('en-IN')}`;

      await addNotification({
        targetType: 'SPECIFIC',
        targetUserId: tx.userId,
        title: '✅ Deposit Approved & Credited',
        message: `Your deposit of ${creditedDisplay} has been verified and added to your balance!`
      });
    } else if (tx.type === 'WITHDRAWAL') {
      await addNotification({
        targetType: 'SPECIFIC',
        targetUserId: tx.userId,
        title: '✅ Withdrawal Settled',
        message: `Your payout of ₹${Number(tx.amount).toLocaleString('en-IN')} has been processed and settled by Admin!`
      });
    }
  } else if (status === 'REJECTED') {
    // If a withdrawal was rejected, refund the deducted amount back to user's wallet
    if (tx.type === 'WITHDRAWAL') {
      let user = dbState.users.find(u => u.id === tx.userId);
      if (!user) user = await findUserById(tx.userId);
      if (user) {
        if (tx.currency === 'INR') {
          const refundedBal = Number(user.inrBalance || 0) + Number(tx.amount || 0);
          await updateUserRecord(user.id, { inrBalance: refundedBal });
        } else if (tx.currency === 'USDT') {
          const refundedBal = Number(user.usdtBalance || 0) + Number(tx.amount || 0);
          await updateUserRecord(user.id, { usdtBalance: refundedBal });
        }
      }
    }

    await addNotification({
      targetType: 'SPECIFIC',
      targetUserId: tx.userId,
      title: '⚠️ Transaction Rejected',
      message: `Your ${tx.type.toLowerCase()} request (${tx.id}) was rejected.${adminNotes ? ' Reason: ' + adminNotes : ''}${tx.type === 'WITHDRAWAL' ? ' The amount has been refunded back to your wallet.' : ''}`
    });
  }

  if (sqlTablesAvailable) {
    try {
      await supabase.from('transactions').update({
        status,
        admin_notes: tx.adminNotes
      }).eq('id', txId);
    } catch (err) {
      console.warn('SQL update transaction error:', err.message);
    }
  }

  invalidateCache('transactions');
  await persistStateToSupabase();
  return tx;
}

// ==========================================
// PAYMENT CHANNELS
// ==========================================
export async function getAllPaymentChannels() {
  if (cache.channels.data && (Date.now() - cache.channels.lastFetched < CACHE_TTL.CHANNELS)) {
    return cache.channels.data;
  }

  if (sqlTablesAvailable) {
    const { data, error } = await supabase.from('payment_channels').select('*').order('created_at', { ascending: true });
    if (!error && data) {
      const mapped = data.map(c => ({
        id: c.id,
        type: c.type,
        label: c.label,
        bankName: c.bank_name,
        accountNumber: c.account_number,
        ifscCode: c.ifsc_code,
        holderName: c.holder_name,
        upiId: c.upi_id,
        qrUrl: c.qr_url,
        cryptoChain: c.crypto_chain,
        walletAddress: c.wallet_address,
        isActive: c.is_active,
        minDeposit: Number(c.min_deposit),
        extraRewardPercent: Number(c.extra_reward_percent),
        createdAt: c.created_at
      }));
      cache.channels.data = mapped;
      cache.channels.lastFetched = Date.now();
      return mapped;
    }
  }
  return dbState.paymentChannels;
}

export async function addPaymentChannel(channel) {
  const newChannel = {
    id: `CH-${Math.floor(10 + Math.random() * 90)}`,
    type: channel.type,
    label: channel.label,
    bankName: channel.bankName || null,
    accountNumber: channel.accountNumber || null,
    ifscCode: channel.ifscCode || null,
    holderName: channel.holderName || null,
    upiId: channel.upiId || null,
    qrUrl: channel.qrUrl || (channel.upiId ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${channel.upiId}&pn=The%20FamPay&cu=INR` : null),
    cryptoChain: channel.cryptoChain || null,
    walletAddress: channel.walletAddress || null,
    isActive: channel.isActive ?? true,
    minDeposit: Number(channel.minDeposit || 500),
    extraRewardPercent: Number(channel.extraRewardPercent || 2),
    createdAt: new Date().toISOString()
  };

  if (sqlTablesAvailable) {
    try {
      await supabase.from('payment_channels').insert({
        id: newChannel.id,
        type: newChannel.type,
        label: newChannel.label,
        bank_name: newChannel.bankName,
        account_number: newChannel.accountNumber,
        ifsc_code: newChannel.ifscCode,
        holder_name: newChannel.holderName,
        upi_id: newChannel.upiId,
        qr_url: newChannel.qrUrl,
        crypto_chain: newChannel.cryptoChain,
        wallet_address: newChannel.walletAddress,
        is_active: newChannel.isActive,
        min_deposit: newChannel.minDeposit,
        extra_reward_percent: newChannel.extraRewardPercent
      });
    } catch (err) {
      console.warn('SQL insert payment channel error:', err.message);
    }
  }

  dbState.paymentChannels.push(newChannel);
  invalidateCache('channels');
  await persistStateToSupabase();
  return newChannel;
}

export async function updatePaymentChannel(channelId, updates) {
  let ch = dbState.paymentChannels.find(c => c.id === channelId);
  if (!ch && sqlTablesAvailable) {
    try {
      const { data } = await supabase.from('payment_channels').select('*').eq('id', channelId).single();
      if (data) {
        ch = {
          id: data.id,
          type: data.type,
          label: data.label,
          bankName: data.bank_name,
          accountNumber: data.account_number,
          ifscCode: data.ifsc_code,
          holderName: data.holder_name,
          upiId: data.upi_id,
          qrUrl: data.qr_url,
          cryptoChain: data.crypto_chain,
          walletAddress: data.wallet_address,
          isActive: data.is_active,
          minDeposit: Number(data.min_deposit || 500),
          extraRewardPercent: Number(data.extra_reward_percent || 2),
          createdAt: data.created_at
        };
        dbState.paymentChannels.push(ch);
      }
    } catch (e) {
      console.warn('SQL fetch single payment channel warning:', e.message);
    }
  }
  if (!ch) return null;

  Object.assign(ch, updates);

  if (sqlTablesAvailable) {
    try {
      const sqlUpdates = {};
      if (updates.label !== undefined) sqlUpdates.label = updates.label;
      if (updates.isActive !== undefined) sqlUpdates.is_active = updates.isActive;
      if (updates.upiId !== undefined) {
        sqlUpdates.upi_id = updates.upiId;
        sqlUpdates.qr_url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${updates.upiId}&pn=The%20FamPay&cu=INR`;
      }
      if (updates.bankName !== undefined) sqlUpdates.bank_name = updates.bankName;
      if (updates.accountNumber !== undefined) sqlUpdates.account_number = updates.accountNumber;
      if (updates.ifscCode !== undefined) sqlUpdates.ifsc_code = updates.ifscCode;
      if (updates.holderName !== undefined) sqlUpdates.holder_name = updates.holderName;
      if (updates.walletAddress !== undefined) sqlUpdates.wallet_address = updates.walletAddress;
      if (updates.extraRewardPercent !== undefined) sqlUpdates.extra_reward_percent = updates.extraRewardPercent;

      await supabase.from('payment_channels').update(sqlUpdates).eq('id', channelId);
    } catch (err) {
      console.warn('SQL update payment channel error:', err.message);
    }
  }

  invalidateCache('channels');
  await persistStateToSupabase();
  return ch;
}

export async function deletePaymentChannel(channelId) {
  const idx = dbState.paymentChannels.findIndex(c => c.id === channelId);
  if (idx !== -1) {
    dbState.paymentChannels.splice(idx, 1);
  }
  if (sqlTablesAvailable) {
    try {
      await supabase.from('payment_channels').delete().eq('id', channelId);
    } catch (err) {
      console.warn('SQL delete payment channel error:', err.message);
    }
  }
  invalidateCache('channels');
  await persistStateToSupabase();
  return true;
}

// ==========================================
// TASKS & SUBMISSIONS
// ==========================================
export async function getAllTasks() {
  if (cache.tasks.data && (Date.now() - cache.tasks.lastFetched < CACHE_TTL.TASKS)) {
    return cache.tasks.data;
  }

  if (sqlTablesAvailable) {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      const mapped = data.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        rewardInr: Number(t.reward_inr),
        type: t.type,
        status: t.status,
        proofRequired: t.proof_required,
        createdAt: t.created_at
      }));
      cache.tasks.data = mapped;
      cache.tasks.lastFetched = Date.now();
      return mapped;
    }
  }
  return dbState.tasks;
}

export async function addTask(task) {
  const newTask = {
    id: `TASK-${Math.floor(10 + Math.random() * 90)}`,
    title: task.title,
    description: task.description,
    rewardInr: Number(task.rewardInr || 200),
    type: task.type || 'HUMAN_VERIFICATION',
    status: 'ACTIVE',
    proofRequired: true,
    createdAt: new Date().toISOString()
  };

  if (sqlTablesAvailable) {
    try {
      await supabase.from('tasks').insert({
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        reward_inr: newTask.rewardInr,
        type: newTask.type,
        status: newTask.status,
        proof_required: newTask.proofRequired
      });
    } catch (err) {
      console.warn('SQL insert task error:', err.message);
    }
  }

  dbState.tasks.push(newTask);
  invalidateCache('tasks');
  await persistStateToSupabase();
  return newTask;
}

export async function getAllTaskSubmissions() {
  if (cache.submissions.data && (Date.now() - cache.submissions.lastFetched < CACHE_TTL.TASKS)) {
    return cache.submissions.data;
  }

  if (sqlTablesAvailable) {
    const { data, error } = await supabase.from('task_submissions').select('*').order('submitted_at', { ascending: false });
    if (!error && data) {
      const mapped = data.map(s => ({
        id: s.id,
        taskId: s.task_id,
        userId: s.user_id,
        userName: s.user_name,
        userEmail: s.user_email,
        proofUrl: s.proof_url,
        status: s.status,
        submittedAt: s.submitted_at
      }));
      cache.submissions.data = mapped;
      cache.submissions.lastFetched = Date.now();
      return mapped;
    }
  }
  return dbState.taskSubmissions;
}

export async function submitTaskProof(sub) {
  const newSub = {
    id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
    taskId: sub.taskId,
    userId: sub.userId,
    userName: sub.userName || 'FamPay User',
    userEmail: sub.userEmail || '',
    proofUrl: sub.proofUrl,
    status: 'PENDING',
    submittedAt: new Date().toISOString()
  };

  if (sqlTablesAvailable) {
    try {
      await supabase.from('task_submissions').insert({
        id: newSub.id,
        task_id: newSub.taskId,
        user_id: newSub.userId,
        user_name: newSub.userName,
        user_email: newSub.userEmail,
        proof_url: newSub.proofUrl,
        status: newSub.status
      });
    } catch (err) {
      console.warn('SQL insert submission error:', err.message);
    }
  }

  dbState.taskSubmissions.unshift(newSub);
  invalidateCache('submissions');
  await persistStateToSupabase();
  return newSub;
}

export async function updateTaskSubmissionStatus(subId, status) {
  let sub = dbState.taskSubmissions.find(s => s.id === subId);
  if (!sub) {
    if (sqlTablesAvailable) {
      const { data } = await supabase.from('task_submissions').select('*').eq('id', subId).single();
      if (data) {
        sub = {
          id: data.id,
          taskId: data.task_id,
          userId: data.user_id,
          userName: data.user_name,
          userEmail: data.user_email,
          proofUrl: data.proof_url,
          status: data.status,
          submittedAt: data.submitted_at
        };
        dbState.taskSubmissions.push(sub);
      }
    }
  }
  if (!sub) return null;

  sub.status = status;

  if (status === 'APPROVED') {
    const tasks = await getAllTasks();
    const task = tasks.find(t => t.id === sub.taskId);
    const reward = task ? Number(task.rewardInr || 200) : 200;
    let user = await findUserById(sub.userId);
    if (user) {
      const newBal = Number(user.inrBalance || 0) + reward;
      await updateUserRecord(user.id, { inrBalance: newBal });

      // Add Reward transaction
      await addTransaction({
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        type: 'REWARD',
        amount: reward,
        currency: 'INR',
        method: 'TASK_REWARD',
        status: 'COMPLETED',
        refNumber: `TASK-${Date.now()}`,
        channelLabel: `Task Reward: ${task ? task.title : 'Verification'}`
      });

      // Send Notification
      await addNotification({
        targetType: 'SPECIFIC',
        targetUserId: user.id,
        title: '🎉 Task Reward Credited!',
        message: `Your task proof was approved! ₹${reward} has been credited to your wallet.`
      });
    }
  }

  if (sqlTablesAvailable) {
    try {
      await supabase.from('task_submissions').update({ status }).eq('id', subId);
    } catch (err) {
      console.warn('SQL update submission error:', err.message);
    }
  }

  invalidateCache('submissions');
  await persistStateToSupabase();
  return sub;
}

// ==========================================
// SETTINGS & BROADCASTS
// ==========================================
export async function getAppSettings() {
  if (cache.settings.data && (Date.now() - cache.settings.lastFetched < CACHE_TTL.SETTINGS)) {
    return cache.settings.data;
  }

  if (sqlTablesAvailable) {
    const { data, error } = await supabase.from('settings').select('*');
    if (!error && data && data.length > 0) {
      const settingsObj = {};
      data.forEach(item => {
        settingsObj[item.key] = item.value;
      });
      const resolved = { ...dbState.settings, ...settingsObj };
      cache.settings.data = resolved;
      cache.settings.lastFetched = Date.now();
      return resolved;
    }
  }
  return dbState.settings;
}

export async function updateAppSetting(key, value) {
  dbState.settings[key] = { ...(dbState.settings[key] || {}), ...value };

  if (sqlTablesAvailable) {
    try {
      await supabase.from('settings').upsert({
        key,
        value: dbState.settings[key],
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('SQL upsert settings error:', err.message);
    }
  }

  invalidateCache('settings');
  await persistStateToSupabase();
  return dbState.settings[key];
}

export async function getAllNotifications() {
  if (cache.notifications.data && (Date.now() - cache.notifications.lastFetched < CACHE_TTL.NOTIFICATIONS)) {
    return cache.notifications.data;
  }

  if (sqlTablesAvailable) {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      const mapped = data.map(n => ({
        id: n.id,
        targetType: n.target_type,
        targetUserId: n.target_user_id,
        title: n.title,
        message: n.message,
        createdAt: n.created_at,
        read: Boolean(n.read),
        readBy: n.read_by || []
      }));
      cache.notifications.data = mapped;
      cache.notifications.lastFetched = Date.now();
      return mapped;
    }
  }
  return dbState.notifications;
}

export async function addNotification(notif) {
  const newNotif = {
    id: `NOTIF-${Math.floor(100 + Math.random() * 900)}`,
    targetType: notif.targetType || 'ALL',
    targetUserId: notif.targetUserId || null,
    title: notif.title,
    message: notif.message,
    createdAt: new Date().toISOString(),
    read: false,
    readBy: []
  };

  if (sqlTablesAvailable) {
    try {
      await supabase.from('notifications').insert({
        id: newNotif.id,
        target_type: newNotif.targetType,
        target_user_id: newNotif.targetUserId,
        title: newNotif.title,
        message: newNotif.message
      });
    } catch (err) {
      console.warn('SQL insert notification error:', err.message);
    }
  }

  dbState.notifications.unshift(newNotif);
  invalidateCache('notifications');
  await persistStateToSupabase();
  return newNotif;
}

export async function getUserReadNotificationIds(userId) {
  if (!userId) return [];
  if (!dbState.userReadNotifications || Object.keys(dbState.userReadNotifications).length === 0) {
    if (sqlTablesAvailable) {
      try {
        const { data } = await supabase.from('settings').select('value').eq('key', 'user_read_notifications').single();
        if (data && data.value) {
          dbState.userReadNotifications = data.value;
        }
      } catch (e) {
        // silent
      }
    }
  }
  if (!dbState.userReadNotifications) dbState.userReadNotifications = {};
  return dbState.userReadNotifications[userId] || [];
}

export async function markNotificationAsRead(notifId, userId) {
  if (!userId || !notifId) return false;
  if (!dbState.userReadNotifications) dbState.userReadNotifications = {};
  if (!dbState.userReadNotifications[userId]) dbState.userReadNotifications[userId] = [];
  
  if (!dbState.userReadNotifications[userId].includes(notifId)) {
    dbState.userReadNotifications[userId].push(notifId);
  }

  const notif = dbState.notifications.find(n => n.id === notifId);
  if (notif) notif.read = true;

  if (sqlTablesAvailable) {
    try {
      await supabase.from('settings').upsert({
        key: 'user_read_notifications',
        value: dbState.userReadNotifications,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('SQL upsert user_read_notifications error:', e.message);
    }
  }

  invalidateCache('notifications');
  await persistStateToSupabase();
  return true;
}

export async function markAllNotificationsAsRead(userId) {
  if (!userId) return false;
  if (!dbState.userReadNotifications) dbState.userReadNotifications = {};
  if (!dbState.userReadNotifications[userId]) dbState.userReadNotifications[userId] = [];

  const all = await getAllNotifications();
  all.forEach(n => {
    if (!dbState.userReadNotifications[userId].includes(n.id)) {
      dbState.userReadNotifications[userId].push(n.id);
    }
  });

  if (sqlTablesAvailable) {
    try {
      await supabase.from('settings').upsert({
        key: 'user_read_notifications',
        value: dbState.userReadNotifications,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('SQL upsert user_read_notifications error:', e.message);
    }
  }

  invalidateCache('notifications');
  await persistStateToSupabase();
  return true;
}

export async function deleteNotification(id) {
  if (sqlTablesAvailable) {
    try {
      await supabase.from('notifications').delete().eq('id', id);
    } catch (e) {
      console.warn('SQL delete notification error:', e.message);
    }
  }
  if (dbState.notifications) {
    dbState.notifications = dbState.notifications.filter(n => n.id !== id);
  }
  invalidateCache('notifications');
  return true;
}

// ==========================================
// 8. UPI & PROVIDER ACCOUNTS (Tool Tab)
// ==========================================
export async function getAllUpiAccounts() {
  if (cache.upiAccounts.data && (Date.now() - cache.upiAccounts.lastFetched < CACHE_TTL.UPI_ACCOUNTS)) {
    return cache.upiAccounts.data;
  }
  if (sqlTablesAvailable) {
    try {
      const { data, error } = await supabase.from('upi_accounts').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const mapped = data.map(a => ({
          id: a.id,
          userId: a.user_id,
          accountType: a.account_type || 'UPI',
          upiId: a.upi_id,
          accountNumber: a.account_number,
          ifscCode: a.ifsc_code,
          holderName: a.holder_name,
          bankName: a.bank_name,
          status: a.status || 'PENDING_REVIEW',
          verificationCode: a.verification_code,
          isPrimary: Boolean(a.is_primary),
          adminNotes: a.admin_notes,
          createdAt: a.created_at,
          updatedAt: a.updated_at
        }));
        cache.upiAccounts.data = mapped;
        cache.upiAccounts.lastFetched = Date.now();
        return mapped;
      }
    } catch (e) {
      console.warn('SQL get upi_accounts notice:', e.message);
    }
  }
  return dbState.upiAccounts || [];
}

export async function getUserUpiAccounts(userId) {
  const all = await getAllUpiAccounts();
  return all.filter(a => a.userId === userId);
}

export async function addUpiAccount({ userId, accountType = 'UPI', upiId, accountNumber, ifscCode, holderName, bankName }) {
  const existingUserAccounts = await getUserUpiAccounts(userId);
  const isFirst = existingUserAccounts.length === 0;

  const newAccount = {
    id: `ACC-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`,
    userId,
    accountType: accountType.toUpperCase(),
    upiId: upiId || null,
    accountNumber: accountNumber || null,
    ifscCode: ifscCode || null,
    holderName: holderName.trim(),
    bankName: bankName || null,
    status: 'PENDING_REVIEW', // PENDING_REVIEW, APPROVED, REJECTED, CODE_REQUIRED
    verificationCode: null,
    isPrimary: isFirst,
    adminNotes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (sqlTablesAvailable) {
    try {
      await supabase.from('upi_accounts').insert({
        id: newAccount.id,
        user_id: newAccount.userId,
        account_type: newAccount.accountType,
        upi_id: newAccount.upiId,
        account_number: newAccount.accountNumber,
        ifsc_code: newAccount.ifscCode,
        holder_name: newAccount.holderName,
        bank_name: newAccount.bankName,
        status: newAccount.status,
        is_primary: newAccount.isPrimary
      });
    } catch (err) {
      console.warn('SQL insert upi_account warning:', err.message);
    }
  }

  if (!dbState.upiAccounts) dbState.upiAccounts = [];
  dbState.upiAccounts.unshift(newAccount);
  invalidateCache('upiAccounts');
  await persistStateToSupabase();
  return newAccount;
}

export async function updateUpiAccountStatus(id, status, adminNotes = '', verificationCode = null) {
  let all = await getAllUpiAccounts();
  let acc = all.find(a => a.id === id);
  if (!acc) return null;

  acc.status = status;
  if (adminNotes) acc.adminNotes = adminNotes;
  if (verificationCode !== null) acc.verificationCode = verificationCode;
  acc.updatedAt = new Date().toISOString();

  if (sqlTablesAvailable) {
    try {
      await supabase.from('upi_accounts').update({
        status: acc.status,
        admin_notes: acc.adminNotes,
        verification_code: acc.verificationCode,
        updated_at: acc.updatedAt
      }).eq('id', id);
    } catch (err) {
      console.warn('SQL update upi_account warning:', err.message);
    }
  }

  const memIdx = (dbState.upiAccounts || []).findIndex(a => a.id === id);
  if (memIdx >= 0) {
    dbState.upiAccounts[memIdx] = { ...dbState.upiAccounts[memIdx], ...acc };
  }
  invalidateCache('upiAccounts');
  await persistStateToSupabase();
  return acc;
}

export async function verifyUpiAccountCode(id, code, userId) {
  let all = await getAllUpiAccounts();
  let acc = all.find(a => a.id === id && a.userId === userId);
  if (!acc) return { success: false, message: 'Account not found' };

  if (acc.status !== 'CODE_REQUIRED') {
    return { success: false, message: 'Verification code not requested for this account' };
  }

  if (!acc.verificationCode || acc.verificationCode.toString().trim() !== code.toString().trim()) {
    return { success: false, message: 'Invalid verification code. Please check and try again.' };
  }

  // Code verified! Set to APPROVED
  acc.status = 'APPROVED';
  acc.verificationCode = null;
  acc.adminNotes = 'Verified via challenge code submission';
  acc.updatedAt = new Date().toISOString();

  if (sqlTablesAvailable) {
    try {
      await supabase.from('upi_accounts').update({
        status: 'APPROVED',
        verification_code: null,
        admin_notes: acc.adminNotes,
        updated_at: acc.updatedAt
      }).eq('id', id);
    } catch (e) {
      console.warn('SQL code verify warning:', e.message);
    }
  }

  const memIdx = (dbState.upiAccounts || []).findIndex(a => a.id === id);
  if (memIdx >= 0) {
    dbState.upiAccounts[memIdx] = { ...dbState.upiAccounts[memIdx], ...acc };
  }
  invalidateCache('upiAccounts');
  await persistStateToSupabase();
  return { success: true, message: 'Account successfully verified!', account: acc };
}

export async function setPrimaryUpiAccount(id, userId) {
  let all = await getAllUpiAccounts();
  const userAccs = all.filter(a => a.userId === userId);
  const target = userAccs.find(a => a.id === id);
  if (!target) return null;

  userAccs.forEach(a => {
    a.isPrimary = (a.id === id);
    a.updatedAt = new Date().toISOString();
  });

  if (sqlTablesAvailable) {
    try {
      await supabase.from('upi_accounts').update({ is_primary: false }).eq('user_id', userId);
      await supabase.from('upi_accounts').update({ is_primary: true }).eq('id', id);
    } catch (e) {
      console.warn('SQL set primary warning:', e.message);
    }
  }

  invalidateCache('upiAccounts');
  await persistStateToSupabase();
  return target;
}

// ==========================================
// 9. SELL REQUESTS (Cash Out Flow)
// ==========================================
export async function getAllSellRequests() {
  if (cache.sellRequests.data && (Date.now() - cache.sellRequests.lastFetched < CACHE_TTL.SELL_REQUESTS)) {
    return cache.sellRequests.data;
  }
  if (sqlTablesAvailable) {
    try {
      const { data, error } = await supabase.from('sell_requests').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const mapped = data.map(s => ({
          id: s.id,
          userId: s.user_id,
          inrAmount: Number(s.inr_amount),
          tokenRate: Number(s.token_rate),
          tokenAmount: Number(s.token_amount),
          payoutAccountId: s.payout_account_id,
          payoutDetails: s.payout_details,
          status: s.status || 'PENDING',
          adminNotes: s.admin_notes,
          payoutUtr: s.payout_utr,
          createdAt: s.created_at,
          settledAt: s.settled_at
        }));
        cache.sellRequests.data = mapped;
        cache.sellRequests.lastFetched = Date.now();
        return mapped;
      }
    } catch (e) {
      console.warn('SQL get sell_requests notice:', e.message);
    }
  }
  return dbState.sellRequests || [];
}

export async function getUserSellRequests(userId) {
  const all = await getAllSellRequests();
  return all.filter(s => s.userId === userId);
}

export async function createSellRequest({ userId, inrAmount, tokenRate = 1.0, payoutAccountId }) {
  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  if (user.sellAllowed === false) throw new Error('Cash out is currently disabled for this account.');
  if (user.fundLocked) throw new Error('Wallet funds are locked. Please contact support.');
  if (Number(user.inrBalance) < Number(inrAmount)) throw new Error('Insufficient wallet balance for cash out.');

  // Find payout account snapshot
  const userAccs = await getUserUpiAccounts(userId);
  const payoutAcc = userAccs.find(a => a.id === payoutAccountId) || userAccs.find(a => a.isPrimary) || userAccs[0];
  if (!payoutAcc || payoutAcc.status !== 'APPROVED') {
    throw new Error('Please add and verify a UPI or Bank account in the Tool tab before cashing out.');
  }

  // Reserve/Debit user balance atomically
  const newBalance = Number(user.inrBalance) - Number(inrAmount);
  await updateUserRecord(user.id, { inrBalance: newBalance });

  const tokenAmount = Number((inrAmount * tokenRate).toFixed(4));
  const newReq = {
    id: `SELL-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`,
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    inrAmount: Number(inrAmount),
    tokenRate: Number(tokenRate),
    tokenAmount,
    payoutAccountId: payoutAcc.id,
    payoutDetails: {
      accountType: payoutAcc.accountType,
      upiId: payoutAcc.upiId,
      accountNumber: payoutAcc.accountNumber,
      ifscCode: payoutAcc.ifscCode,
      holderName: payoutAcc.holderName,
      bankName: payoutAcc.bankName
    },
    status: 'PENDING',
    adminNotes: '',
    payoutUtr: '',
    createdAt: new Date().toISOString(),
    settledAt: null
  };

  // Add ledger transaction record
  await addTransaction({
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    type: 'SELL',
    amount: Number(inrAmount),
    currency: 'INR',
    method: payoutAcc.accountType === 'BANK' ? 'BANK' : 'UPI',
    status: 'PENDING',
    refNumber: newReq.id,
    channelLabel: payoutAcc.upiId || payoutAcc.accountNumber || 'Cash Out Payout',
    adminNotes: `Cash out reservation of ₹${inrAmount}`
  });

  if (sqlTablesAvailable) {
    try {
      await supabase.from('sell_requests').insert({
        id: newReq.id,
        user_id: newReq.userId,
        inr_amount: newReq.inrAmount,
        token_rate: newReq.tokenRate,
        token_amount: newReq.tokenAmount,
        payout_account_id: newReq.payoutAccountId,
        payout_details: newReq.payoutDetails,
        status: newReq.status
      });
    } catch (err) {
      console.warn('SQL insert sell_request warning:', err.message);
    }
  }

  if (!dbState.sellRequests) dbState.sellRequests = [];
  dbState.sellRequests.unshift(newReq);
  invalidateCache('sellRequests');
  await persistStateToSupabase();
  return newReq;
}

export async function updateSellRequestStatus(id, status, payoutUtr = '', adminNotes = '') {
  let all = await getAllSellRequests();
  let req = all.find(s => s.id === id);
  if (!req) return null;

  const previousStatus = req.status;
  req.status = status;
  if (payoutUtr) req.payoutUtr = payoutUtr;
  if (adminNotes) req.adminNotes = adminNotes;
  if (status === 'COMPLETED' || status === 'REJECTED') {
    req.settledAt = new Date().toISOString();
  }

  // If rejected, REFUND balance back to user
  if (status === 'REJECTED' && previousStatus === 'PENDING') {
    const user = await findUserById(req.userId);
    if (user) {
      const refundBal = Number(user.inrBalance || 0) + Number(req.inrAmount);
      await updateUserRecord(user.id, { inrBalance: refundBal });

      // Add ledger refund transaction
      await addTransaction({
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        type: 'REFUND',
        amount: Number(req.inrAmount),
        currency: 'INR',
        method: 'WALLET',
        status: 'COMPLETED',
        refNumber: `REFUND-${req.id}`,
        channelLabel: 'Cash Out Refund',
        adminNotes: adminNotes || 'Cash out request rejected and refunded to wallet'
      });
    }
  }

  // Update corresponding transaction in ledger
  const txs = await getAllTransactions();
  const relatedTx = txs.find(t => t.refNumber === req.id || (t.type === 'SELL' && t.userId === req.userId && Math.abs(t.amount - req.inrAmount) < 0.01));
  if (relatedTx) {
    await updateTransactionStatus(relatedTx.id, status === 'COMPLETED' ? 'COMPLETED' : status === 'REJECTED' ? 'REJECTED' : 'PENDING', adminNotes);
  }

  if (sqlTablesAvailable) {
    try {
      await supabase.from('sell_requests').update({
        status: req.status,
        payout_utr: req.payoutUtr,
        admin_notes: req.adminNotes,
        settled_at: req.settledAt
      }).eq('id', id);
    } catch (err) {
      console.warn('SQL update sell_request warning:', err.message);
    }
  }

  const memIdx = (dbState.sellRequests || []).findIndex(s => s.id === id);
  if (memIdx >= 0) {
    dbState.sellRequests[memIdx] = { ...dbState.sellRequests[memIdx], ...req };
  }
  invalidateCache('sellRequests');
  await persistStateToSupabase();
  return req;
}

// ==========================================
// 10. DEPOSIT ORDERS & RESERVATION ENGINE
// ==========================================
export const DEPOSIT_PACKAGES = [
  { amount: 500, bonusPercent: 2, label: 'Starter VIP' },
  { amount: 1000, bonusPercent: 2, label: 'Silver Pro' },
  { amount: 2500, bonusPercent: 2.5, label: 'Gold Prime' },
  { amount: 5000, bonusPercent: 3, label: 'Platinum Super' },
  { amount: 10000, bonusPercent: 3.5, label: 'Diamond Elite' },
  { amount: 25000, bonusPercent: 4, label: 'Crown Master' },
  { amount: 50000, bonusPercent: 5, label: 'Ambassador Ultra' }
];

export async function getAllDepositOrders() {
  if (cache.depositOrders.data && (Date.now() - cache.depositOrders.lastFetched < CACHE_TTL.DEPOSIT_ORDERS)) {
    return cache.depositOrders.data;
  }
  if (sqlTablesAvailable) {
    try {
      const { data, error } = await supabase.from('deposit_orders').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const mapped = data.map(o => ({
          id: o.id,
          orderId: o.order_id,
          userId: o.user_id,
          packageAmount: Number(o.package_amount),
          bonusPercent: Number(o.bonus_percent || 2),
          channelId: o.channel_id,
          channelDetails: o.channel_details,
          status: o.status || 'RESERVED',
          expiresAt: o.expires_at,
          utr: o.utr,
          proofUrl: o.proof_url,
          createdAt: o.created_at,
          submittedAt: o.submitted_at
        }));
        cache.depositOrders.data = mapped;
        cache.depositOrders.lastFetched = Date.now();
        return mapped;
      }
    } catch (e) {
      console.warn('SQL get deposit_orders notice:', e.message);
    }
  }
  return dbState.depositOrders || [];
}

export async function getActiveDepositOrder(userId) {
  const all = await getAllDepositOrders();
  const now = new Date().toISOString();
  // An active order is RESERVED or SUBMITTED and not expired (or submitted pending admin review)
  return all.find(o => o.userId === userId && (o.status === 'SUBMITTED' || (o.status === 'RESERVED' && o.expiresAt > now)));
}

export async function checkDuplicateUtr(utr) {
  if (!utr || !utr.trim()) return false;
  const cleanUtr = utr.trim().toUpperCase();

  // Check deposit orders
  const orders = await getAllDepositOrders();
  const orderMatch = orders.some(o => o.utr && o.utr.toUpperCase() === cleanUtr && o.status !== 'REJECTED');
  if (orderMatch) return true;

  // Check transactions table
  const txs = await getAllTransactions();
  const txMatch = txs.some(t => t.refNumber && t.refNumber.toUpperCase() === cleanUtr && t.status !== 'REJECTED');
  return txMatch;
}

export async function reserveDepositOrder({ userId, packageAmount, bonusPercent = 2, channelId }) {
  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  if (user.depositAllowed === false) throw new Error('Deposits are currently disabled for this account.');

  // Find channel details
  const channels = await getAllPaymentChannels();
  const channel = channels.find(c => c.id === channelId) || channels[0];

  // Generate unique 11-digit numeric Order ID (e.g. 20261116001)
  const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // 8 digits (20261116)
  const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 digits
  const orderId = `${datePrefix}${randomSuffix}`; // exactly 11 digits

  // 15-minute lock
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const newOrder = {
    id: `ORD-${Date.now()}`,
    orderId,
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    packageAmount: Number(packageAmount),
    bonusPercent: Number(bonusPercent),
    channelId: channel?.id || 'CH-01',
    channelDetails: channel ? {
      type: channel.type,
      label: channel.label,
      upiId: channel.upiId,
      accountNumber: channel.accountNumber,
      ifscCode: channel.ifscCode,
      holderName: channel.holderName,
      bankName: channel.bankName,
      qrUrl: channel.qrUrl,
      walletAddress: channel.walletAddress,
      cryptoChain: channel.cryptoChain
    } : null,
    status: 'RESERVED',
    expiresAt,
    utr: '',
    proofUrl: '',
    createdAt: new Date().toISOString(),
    submittedAt: null
  };

  if (sqlTablesAvailable) {
    try {
      await supabase.from('deposit_orders').insert({
        id: newOrder.id,
        order_id: newOrder.orderId,
        user_id: newOrder.userId,
        package_amount: newOrder.packageAmount,
        bonus_percent: newOrder.bonusPercent,
        channel_id: newOrder.channelId,
        channel_details: newOrder.channelDetails,
        status: newOrder.status,
        expires_at: newOrder.expiresAt
      });
    } catch (err) {
      console.warn('SQL insert deposit_order warning:', err.message);
    }
  }

  if (!dbState.depositOrders) dbState.depositOrders = [];
  dbState.depositOrders.unshift(newOrder);
  invalidateCache('depositOrders');
  await persistStateToSupabase();
  return newOrder;
}

export async function submitDepositOrderProof({ orderId, userId, utr, proofUrl }) {
  if (!utr || !utr.trim()) throw new Error('UTR / Reference number is required');

  const isDuplicate = await checkDuplicateUtr(utr);
  if (isDuplicate) {
    throw new Error('This UTR has already been submitted or processed in the system. Duplicate submissions are rejected.');
  }

  const all = await getAllDepositOrders();
  let order = all.find(o => (o.orderId === orderId || o.id === orderId) && o.userId === userId);
  if (!order) throw new Error('Deposit reservation order not found');

  order.status = 'SUBMITTED';
  order.utr = utr.trim().toUpperCase();
  order.proofUrl = proofUrl || '';
  order.submittedAt = new Date().toISOString();

  // Create pending deposit transaction in ledger
  const bonusAmount = Number(((order.packageAmount * order.bonusPercent) / 100).toFixed(2));
  const totalCredit = order.packageAmount + bonusAmount;

  await addTransaction({
    userId: order.userId,
    userName: order.userName || 'FamPay User',
    userEmail: order.userEmail || '',
    type: 'DEPOSIT',
    amount: totalCredit,
    currency: order.channelDetails?.type === 'CRYPTO' ? 'USDT' : 'INR',
    method: order.channelDetails?.type || 'UPI',
    status: 'PENDING',
    refNumber: order.utr,
    proofUrl: order.proofUrl,
    channelLabel: `${order.channelDetails?.label || 'Direct Deposit'} (Order #${order.orderId})`,
    adminNotes: `Package: ₹${order.packageAmount} + ₹${bonusAmount} Bonus (${order.bonusPercent}%)`
  });

  if (sqlTablesAvailable) {
    try {
      await supabase.from('deposit_orders').update({
        status: order.status,
        utr: order.utr,
        proof_url: order.proofUrl,
        submitted_at: order.submittedAt
      }).eq('id', order.id);
    } catch (err) {
      console.warn('SQL submit deposit_order warning:', err.message);
    }
  }

  const memIdx = (dbState.depositOrders || []).findIndex(o => o.id === order.id);
  if (memIdx >= 0) {
    dbState.depositOrders[memIdx] = { ...dbState.depositOrders[memIdx], ...order };
  }
  invalidateCache('depositOrders');
  await persistStateToSupabase();
  return order;
}

// ==========================================
// 11. BANNERS (Announcement Popups)
// ==========================================
export async function getAllBanners() {
  if (cache.banners.data && (Date.now() - cache.banners.lastFetched < CACHE_TTL.BANNERS)) {
    return cache.banners.data;
  }
  if (sqlTablesAvailable) {
    try {
      const { data, error } = await supabase.from('settings').select('value').eq('key', 'banners').single();
      if (!error && data && Array.isArray(data.value)) {
        cache.banners.data = data.value;
        cache.banners.lastFetched = Date.now();
        dbState.banners = data.value;
        return data.value;
      }
    } catch (e) {
      console.warn('SQL get banners notice:', e.message);
    }
  }
  return dbState.banners || [];
}

export async function getActiveBanners() {
  const all = await getAllBanners();
  return all.filter(b => b.isActive);
}

export async function addBanner({ title, imageUrl, linkUrl = '/deposit', isActive = true }) {
  const newBanner = {
    id: `BNR-${Date.now().toString().slice(-6)}`,
    title: title || 'Special Announcement',
    imageUrl,
    linkUrl,
    isActive: Boolean(isActive),
    createdAt: new Date().toISOString()
  };

  const all = await getAllBanners();
  all.unshift(newBanner);
  dbState.banners = all;

  if (sqlTablesAvailable) {
    try {
      await supabase.from('settings').upsert({
        key: 'banners',
        value: all,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('SQL upsert banners error:', e.message);
    }
  }

  invalidateCache('banners');
  return newBanner;
}

export async function updateBanner(id, updates) {
  let all = await getAllBanners();
  let bnr = all.find(b => b.id === id);
  if (!bnr) return null;

  if (updates.title !== undefined) bnr.title = updates.title;
  if (updates.imageUrl !== undefined) bnr.imageUrl = updates.imageUrl;
  if (updates.linkUrl !== undefined) bnr.linkUrl = updates.linkUrl;
  if (updates.isActive !== undefined) bnr.isActive = Boolean(updates.isActive);

  dbState.banners = all;

  if (sqlTablesAvailable) {
    try {
      await supabase.from('settings').upsert({
        key: 'banners',
        value: all,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('SQL upsert banners error:', e.message);
    }
  }

  invalidateCache('banners');
  return bnr;
}

export async function deleteBanner(id) {
  let all = await getAllBanners();
  all = all.filter(b => b.id !== id);
  dbState.banners = all;

  if (sqlTablesAvailable) {
    try {
      await supabase.from('settings').upsert({
        key: 'banners',
        value: all,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('SQL delete banner error:', e.message);
    }
  }

  invalidateCache('banners');
  return true;
}

// ==========================================
// 12. MAINTENANCE SETTINGS
// ==========================================
export async function getMaintenanceSettings() {
  if (cache.maintenance.data && (Date.now() - cache.maintenance.lastFetched < CACHE_TTL.MAINTENANCE)) {
    return cache.maintenance.data;
  }
  if (sqlTablesAvailable) {
    try {
      const { data, error } = await supabase.from('settings').select('value').eq('key', 'maintenance').single();
      if (!error && data && data.value) {
        cache.maintenance.data = data.value;
        cache.maintenance.lastFetched = Date.now();
        dbState.maintenance = data.value;
        return data.value;
      }
    } catch (e) {
      console.warn('SQL get maintenance notice:', e.message);
    }
  }
  return dbState.maintenance || { isEnabled: false, message: 'System maintenance in progress. Normal operations will resume shortly.', scheduledEnd: null };
}

export async function updateMaintenanceSettings({ isEnabled, message, scheduledEnd }) {
  const current = await getMaintenanceSettings();
  const updated = {
    isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : current.isEnabled,
    message: message !== undefined ? message : current.message,
    scheduledEnd: scheduledEnd !== undefined ? scheduledEnd : current.scheduledEnd,
    updatedAt: new Date().toISOString()
  };

  if (sqlTablesAvailable) {
    try {
      await supabase.from('settings').upsert({
        key: 'maintenance',
        value: updated,
        updated_at: updated.updatedAt
      });
    } catch (e) {
      console.warn('SQL update maintenance error:', e.message);
    }
  }

  dbState.maintenance = updated;
  invalidateCache('maintenance');
  return updated;
}


