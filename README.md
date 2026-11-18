# The FamPay (FP) ⚡

> **Instant Digital P2P Wallet & Multi-tier Token Exchange Platform**  
> *Zero-KYC, Bank-Grade Financial Architecture with Real-Time Administrative Governance.*

---

## 🌟 Key Features

- **⚡ Instant Token Exchange**: Real-time Buy & Sell order matching with automated INR/Token reserves.
- **🛡️ Zero-KYC Financial Flow**: UID-based account identification with 4-digit security PIN authorization.
- **👥 3-Tier Multi-Level Referral Engine**: 30% Level 1, 3% Level 2, 2% Level 3 automated commission distribution.
- **👑 Standalone Administrative Command Portal**: Dedicated `/admin` dashboard for deposit reviews, withdrawal payouts, live maintenance mode toggles, and user balance management.
- **🎨 Ultra-Premium Mobile UI**: Google Noto Emoji vector suite, 3D glossy squircle avatars with deterministic luxury palettes, and dark/light adaptive theming.
- **📱 PWA & Mobile Native App Ready**: Standalone display mode with safe-area padding for modern mobile status bars.

---

## 📂 Project Structure

```
├── client/                     # Vite + React 18 Frontend
│   ├── public/                 # Favicons, Web Manifest, Google Noto Emoji SVGs
│   ├── src/
│   │   ├── admin/              # Dedicated Standalone Admin Portal & Pages
│   │   ├── components/         # Reusable UI, Layout, Dashboard & Modals
│   │   ├── context/            # Global AppContext & Theme State
│   │   ├── pages/              # User-facing routes (Dashboard, Deposit, Tool, Teams, Assets, Token, Profile)
│   │   └── services/           # Backend API Service & Brevo OTP Authentication
│   └── vercel.json             # Vercel Single-Page Application (SPA) routing configuration
├── server/                     # Node.js + Express + Supabase Backend
│   ├── index.js                # Core API routes & Real-time Express Server
│   ├── supabaseDb.js           # Supabase Storage & Database Persistence Layer
│   └── supabase_schema.sql     # Database tables, policies & relations schema
└── package.json                # Monorepo task runner
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### 2. Environment Setup

Create `.env` in `server/` using `server/.env.example`:
```bash
cp server/.env.example server/.env
```
Fill in your Supabase project credentials and Brevo email API key.

Create `.env` in `client/` using `client/.env.example`:
```bash
cp client/.env.example client/.env
```

### 3. Installation & Local Development

Run from the root directory:
```bash
# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..

# Run backend server (Runs on http://localhost:5000)
npm run server

# Run frontend development server (Runs on http://localhost:3000)
npm run client
```

---

## ☁️ Deployment Guide (Vercel)

### Deploying the Frontend to Vercel:
1. In your **Vercel Dashboard**, click **Add New Project** and import `fastpay00005/thefampay`.
2. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variables in Vercel:
   - `VITE_APP_NAME`: `The FamPay`
   - `VITE_API_BASE_URL`: URL of your deployed backend (e.g. `https://api.yourdomain.com`)
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anonymous Key
4. Click **Deploy**. Vercel will build the frontend using `client/vercel.json` for seamless SPA page refreshes.

---

## 🔒 Security & Privacy

- **Never Commit Secrets**: All `.env` files and private API tokens are strictly excluded in `.gitignore`.
- **Zero-KYC Architecture**: Does not store government IDs, Aadhaar or PAN details on server infrastructure.
- **Transaction PIN Protection**: High-value financial operations (Token Sell, Payout Account addition, Withdrawals) require user PIN confirmation.

---

## 📄 License
UNLICENSED — All rights reserved by The FamPay Team.
