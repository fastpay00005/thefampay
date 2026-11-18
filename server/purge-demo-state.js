import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://gphlejllfvcsrgdfelma.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceKey);

async function purge() {
  console.log('Purging all demo data from Supabase Storage and resetting to clean state...');

  const cleanState = {
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
        extraBonusPercent: 2,
        globalSellEnabled: true
      },
      support: {
        telegramGroup: 'https://t.me/thefampayofficial',
        telegramChannel: 'https://t.me/thefampaychannel',
        whatsapp: '+919876543210',
        email: 'fastpay00005@gmail.com'
      },
      spin: {
        minTradingVolumeForSpin: 10000,
        usdtVolumeForSpin: 100
      }
    },
    notifications: []
  };

  const jsonBuffer = Buffer.from(JSON.stringify(cleanState, null, 2), 'utf-8');
  const { data, error } = await supabase.storage
    .from('data')
    .upload('fampay_db_state.json', jsonBuffer, {
      contentType: 'application/json',
      upsert: true
    });

  console.log('Reset Supabase data bucket state result:', { data, error });
}

purge().catch(console.error);

