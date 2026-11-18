-- ==============================================================================
-- The FamPay Database Schema for Supabase (Production Ready - Zero Demo Data)
-- Copy and paste this into Supabase Dashboard -> SQL Editor and click "RUN"
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'USER',
  inr_balance NUMERIC DEFAULT 0,
  usdt_balance NUMERIC DEFAULT 0,
  token_balance NUMERIC DEFAULT 0,
  trading_volume NUMERIC DEFAULT 0,
  spin_chances INTEGER DEFAULT 0,
  fund_locked BOOLEAN DEFAULT FALSE,
  sell_allowed BOOLEAN DEFAULT TRUE,
  deposit_allowed BOOLEAN DEFAULT TRUE,
  account_paused BOOLEAN DEFAULT FALSE,
  pin_locked BOOLEAN DEFAULT FALSE,
  transaction_pin TEXT DEFAULT '1234',
  pin_attempts INTEGER DEFAULT 0,
  referral_code TEXT,
  referred_by TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration support for existing databases
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_paused BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deposit_allowed BOOLEAN DEFAULT TRUE;

-- 2. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  type TEXT NOT NULL, -- 'DEPOSIT', 'WITHDRAWAL', 'BUY', 'SELL', 'REWARD', 'SPIN_WIN'
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR', -- 'INR', 'USDT', 'TOKEN'
  method TEXT DEFAULT 'UPI', -- 'UPI', 'BANK', 'CRYPTO_TRC20', 'CRYPTO_BEP20'
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'REJECTED'
  ref_number TEXT, -- UTR / Transaction Hash
  proof_url TEXT, -- Supabase Storage URL
  channel_label TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Payment Channels Table
CREATE TABLE IF NOT EXISTS public.payment_channels (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'BANK', 'UPI', 'CRYPTO'
  label TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  holder_name TEXT,
  upi_id TEXT,
  qr_url TEXT,
  crypto_chain TEXT, -- 'TRC20', 'BEP20'
  wallet_address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  min_deposit NUMERIC DEFAULT 500,
  extra_reward_percent NUMERIC DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tasks Table (Human Verification & Banners)
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_inr NUMERIC DEFAULT 200,
  type TEXT DEFAULT 'HUMAN_VERIFICATION',
  status TEXT DEFAULT 'ACTIVE',
  proof_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Task Submissions Table
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  proof_url TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Broadcast Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  target_type TEXT DEFAULT 'ALL', -- 'ALL', 'SPECIFIC'
  target_user_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. UPI & Bank Provider Accounts Table (Tool Tab)
CREATE TABLE IF NOT EXISTS public.upi_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL DEFAULT 'UPI', -- 'UPI', 'BANK'
  upi_id TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  holder_name TEXT NOT NULL,
  bank_name TEXT,
  status TEXT DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'CODE_REQUIRED'
  verification_code TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Sell Requests Table (Cash Out Flow)
CREATE TABLE IF NOT EXISTS public.sell_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  inr_amount NUMERIC NOT NULL,
  token_rate NUMERIC NOT NULL,
  token_amount NUMERIC NOT NULL,
  payout_account_id TEXT,
  payout_details JSONB,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'REJECTED'
  admin_notes TEXT,
  payout_utr TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settled_at TIMESTAMPTZ
);

-- 10. Deposit Orders Table (Package Reservation System)
CREATE TABLE IF NOT EXISTS public.deposit_orders (
  id TEXT PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL, -- 11-digit numeric ID
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  package_amount NUMERIC NOT NULL,
  bonus_percent NUMERIC DEFAULT 2,
  channel_id TEXT,
  channel_details JSONB,
  status TEXT DEFAULT 'RESERVED', -- 'RESERVED', 'SUBMITTED', 'APPROVED', 'EXPIRED', 'REJECTED'
  expires_at TIMESTAMPTZ NOT NULL,
  utr TEXT,
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

-- 11. Banners Table (Modal Announcements)
CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Maintenance Mode Table
CREATE TABLE IF NOT EXISTS public.maintenance_settings (
  id TEXT PRIMARY KEY DEFAULT 'global_maintenance',
  is_enabled BOOLEAN DEFAULT FALSE,
  message TEXT,
  scheduled_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upi_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sell_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_settings ENABLE ROW LEVEL SECURITY;

-- Allow full access for backend service role key
DROP POLICY IF EXISTS "Full access for service role on upi_accounts" ON public.upi_accounts;
CREATE POLICY "Full access for service role on upi_accounts" ON public.upi_accounts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on sell_requests" ON public.sell_requests;
CREATE POLICY "Full access for service role on sell_requests" ON public.sell_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on deposit_orders" ON public.deposit_orders;
CREATE POLICY "Full access for service role on deposit_orders" ON public.deposit_orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on banners" ON public.banners;
CREATE POLICY "Full access for service role on banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on maintenance_settings" ON public.maintenance_settings;
CREATE POLICY "Full access for service role on maintenance_settings" ON public.maintenance_settings FOR ALL USING (true) WITH CHECK (true);

-- Allow full access for backend service role key
DROP POLICY IF EXISTS "Full access for service role on users" ON public.users;
CREATE POLICY "Full access for service role on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on transactions" ON public.transactions;
CREATE POLICY "Full access for service role on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on payment_channels" ON public.payment_channels;
CREATE POLICY "Full access for service role on payment_channels" ON public.payment_channels FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on tasks" ON public.tasks;
CREATE POLICY "Full access for service role on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on task_submissions" ON public.task_submissions;
CREATE POLICY "Full access for service role on task_submissions" ON public.task_submissions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on settings" ON public.settings;
CREATE POLICY "Full access for service role on settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on notifications" ON public.notifications;
CREATE POLICY "Full access for service role on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- ONLY ESSENTIAL INITIAL DATA (ZERO DEMO USERS, ZERO DEMO BALANCES)
-- ==============================================================================

-- Admin Root Account Only (Balance: 0)
INSERT INTO public.users (
  id, uid, full_name, email, mobile, password, role, 
  inr_balance, usdt_balance, fund_locked, sell_allowed, 
  pin_locked, transaction_pin, referral_code
)
VALUES (
  'USR-ADMIN', 'FP-ADMIN', 'The FamPay SuperAdmin', 'admin@thefampay.com', 
  '+91 99999 88888', 'Admin@FamPay2026', 'ADMIN', 
  0, 0, FALSE, TRUE, 
  FALSE, '0000', 'ADMIN-ROOT'
)
ON CONFLICT (id) DO UPDATE SET
  inr_balance = 0,
  usdt_balance = 0,
  role = 'ADMIN';

-- Initial Payment Receiving Channels
INSERT INTO public.payment_channels (id, type, label, bank_name, account_number, ifsc_code, holder_name, upi_id, qr_url, crypto_chain, wallet_address, is_active, min_deposit, extra_reward_percent)
VALUES
  ('CH-01', 'UPI', 'VIP Instant UPI (Primary)', NULL, NULL, NULL, 'The FamPay Merchant', 'thefampay@yesbank', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=thefampay@yesbank&pn=The%20FamPay&cu=INR', NULL, NULL, TRUE, 500, 2),
  ('CH-02', 'BANK', 'HDFC Corporate Current A/C', 'HDFC Bank Ltd', '50200088991122', 'HDFC0001234', 'The FamPay Technologies Pvt Ltd', NULL, NULL, NULL, NULL, TRUE, 1000, 3),
  ('CH-03', 'CRYPTO', 'USDT TRC20 Fast Deposit', NULL, NULL, NULL, NULL, NULL, NULL, 'TRC20', 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', TRUE, 50, 2),
  ('CH-04', 'CRYPTO', 'USDT BEP20 Low Fee Deposit', NULL, NULL, NULL, NULL, NULL, NULL, 'BEP20', '0x55d398326f99059fF775485246999027B3197955', TRUE, 50, 2)
ON CONFLICT (id) DO NOTHING;

-- Initial Exchange Rates & Platform Settings
INSERT INTO public.settings (key, value)
VALUES
  ('rates', '{"marketRate": 98.50, "appRate": 100.00, "tokenBuyPrice": 100.00, "tokenSellPrice": 98.00, "usdtInrRate": 88.50, "extraBonusPercent": 2, "globalSellEnabled": true}'::jsonb),
  ('support', '{"telegramGroup": "https://t.me/thefampayofficial", "telegramChannel": "https://t.me/thefampaychannel", "whatsapp": "+919876543210", "email": "fastpay00005@gmail.com"}'::jsonb),
  ('spin', '{"minTradingVolumeForSpin": 10000, "usdtVolumeForSpin": 100}'::jsonb)
ON CONFLICT (key) DO NOTHING;
