# WealthFlow — All-in-One Personal Finance & Wealth Management Platform

[![GitHub Repository](https://img.shields.io/badge/GitHub-Pranesh003%2Ffinance--portfolio-blue?logo=github)](https://github.com/Pranesh003/finance-portfolio)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-blueviolet.svg)](https://reactnative.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-teal.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)

WealthFlow is a scalable, modular, production-oriented All-in-One Personal Finance Tracker and Wealth Management platform. It is engineered with a clean monorepo architecture powering a **React + Vite Web Frontend**, an **Expo React Native Mobile Application**, and a **Node.js Express + TypeScript Backend API**, backed by **PostgreSQL (Prisma ORM)** and **Redis**.

🔗 **Repository**: [https://github.com/Pranesh003/finance-portfolio.git](https://github.com/Pranesh003/finance-portfolio.git)

---

## 🏗 System Architecture & Monorepo Structure

```
wealth-management-monorepo/
├── apps/
│   ├── backend/                 # Node.js + Express + TypeScript Core API
│   │   ├── prisma/              # Prisma schema & seed scripts
│   │   │   ├── schema.prisma    # Complete PostgreSQL relational schema (21 models)
│   │   │   └── seed.ts          # Realistic development seed generator
│   │   ├── src/
│   │   │   ├── config/          # Zod-validated environment configurations
│   │   │   ├── core/            # Resilient database, cache, error, and middleware core
│   │   │   │   ├── database/    # Prisma client singleton with health check
│   │   │   │   ├── redis/       # Redis client with in-memory fallback
│   │   │   │   ├── logger/      # Winston structured logger (dev/prod)
│   │   │   │   ├── errors/      # Centralized AppError hierarchy
│   │   │   │   └── middleware/  # JWT auth, validation, logging, CORS, rate limiter
│   │   │   ├── modules/         # Modular domain subsystems (Controllers, Services, Routes)
│   │   │   │   ├── auth/        # Register, login, refresh, session management
│   │   │   │   ├── users/       # Profiles, KYC, user preferences
│   │   │   │   ├── banking/     # Depository institutions & open banking
│   │   │   │   ├── accounts/    # Multi-currency accounts & balance snapshots
│   │   │   │   ├── transactions/# Double-entry transactions & recurring schedules
│   │   │   │   ├── expenses/    # Expense categorizations & cash outflows
│   │   │   │   ├── income/      # Income streams & payroll tracking
│   │   │   │   ├── investments/ # Holdings, portfolios & sub-asset classes:
│   │   │   │   │   ├── stocks/          # Equities, quotes, dividends
│   │   │   │   │   ├── mutual-funds/    # NAV tracking, fund families
│   │   │   │   │   ├── etfs/            # Benchmark tracking & expense ratios
│   │   │   │   │   ├── bonds/           # Fixed income, yields, coupon rates
│   │   │   │   │   ├── crypto/          # Wallets, staking, multi-chain
│   │   │   │   │   └── precious-metals/ # Gold, silver, platinum allocated vaults
│   │   │   │   ├── assets/      # Real estate, vehicles, physical assets
│   │   │   │   ├── liabilities/ # Mortgages, student & auto loans, amortizations
│   │   │   │   ├── budgets/     # Category limits & threshold alerts
│   │   │   │   ├── goals/       # Target milestones & completion projections
│   │   │   │   ├── analytics/   # Net worth historical tracking & asset allocation
│   │   │   │   ├── reports/     # Monthly cash flow & tax summary metadata
│   │   │   │   ├── notifications/# Multi-channel notification center (push, email, in-app)
│   │   │   │   ├── integrations/# Plaid, Yodlee, and crypto exchange connectors
│   │   │   │   ├── documents/   # Secure vault for statements & tax forms
│   │   │   │   └── ai/          # AI wealth advisory & anomaly detection
│   │   │   ├── routes/          # Versioned API router (/api/v1)
│   │   │   ├── app.ts           # Express application composition
│   │   │   └── server.ts        # Server bootstrap & graceful shutdown
│   │   └── .env.example         # Environment template
│   │
│   ├── web/                     # React 18 + Vite + TypeScript Web Frontend
│   │   ├── src/
│   │   │   ├── api.ts           # Shared typed API client integration
│   │   │   ├── App.tsx          # Real-time architecture dashboard & calculation engine
│   │   │   └── main.tsx         # React root
│   │   ├── index.html           # HTML template
│   │   └── vite.config.ts       # Vite proxy & bundler config
│   │
│   └── mobile/                  # React Native + Expo Mobile Application
│       ├── App.tsx              # Mobile status & shared engine demonstration
│       ├── app.json             # Expo project configuration
│       └── tsconfig.json        # Expo TypeScript configuration
│
├── packages/                    # Shared Workspace Packages
│   ├── types/                   # @finance/types - Shared TypeScript interfaces & DTOs
│   ├── validation/              # @finance/validation - Zod request validation schemas
│   ├── utils/                   # @finance/utils - Pure financial math calculation engine
│   ├── api-client/              # @finance/api-client - Universal typed API client
│   └── ui/                      # @finance/ui - Design tokens & theme palettes
│
├── docker-compose.yml           # Local PostgreSQL 16 & Redis 7 containers
├── tsconfig.base.json           # Base TypeScript strict configuration
├── .gitignore                   # Monorepo git ignores
├── .prettierrc                  # Prettier formatting standard
└── package.json                 # Monorepo workspaces & root orchestration scripts
```

---

## ⚙️ Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or `v11.x`
- **Docker & Docker Compose** (Optional for local PostgreSQL and Redis)

---

## 🚀 Quick Start Guide

### 1. Clone the Repository

```bash
git clone https://github.com/Pranesh003/finance-portfolio.git
cd finance-portfolio
```

### 2. Installation

From the monorepo root:

```bash
npm install
```

### 3. Environment Configuration

Copy the template environment variables:

```bash
# In apps/backend:
cp apps/backend/.env.example apps/backend/.env
```

Or configure environment-specific settings:
- Development: `apps/backend/.env.development`
- Staging: `apps/backend/.env.staging`
- Production: `apps/backend/.env.production`

### 3. Spin Up Infrastructure (PostgreSQL & Redis)

If you have Docker installed, start the local database and cache services:

```bash
docker compose up -d
```

> **Note**: If you are not running PostgreSQL right away, the backend initializes in development mode, Prisma Client compiles with complete TypeScript types, and Redis gracefully falls back to an in-memory caching engine without crashing.

### 4. Generate Prisma Client & Database Migrations

```bash
# Generate the Prisma Client
npm run db:generate

# Push schema to PostgreSQL database (when connected)
npm run db:push

# Seed initial development data
npm run db:seed
```

---

## 🖥 Application Execution Commands

### Run Everything Together
```bash
npm run dev:all
```

### Run Backend API (`http://localhost:5000`)
```bash
npm run dev:backend
```

- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **API v1 Base**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

### Run Web Application (`http://localhost:5173`)
```bash
npm run dev:web
```

### Run Mobile Application (Expo React Native)
```bash
npm run dev:mobile
```

Run on specific targets:
```bash
npm run dev:mobile -- --android
npm run dev:mobile -- --ios
npm run dev:mobile -- --web
```

---

## 🧪 Monorepo Quality & Verification Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Build Packages** | `npm run build:packages` | Compiles shared types, utils, validation, ui, and api-client |
| **Build Apps** | `npm run build:apps` | Compiles backend server and Vite web frontend |
| **Typecheck** | `npm run typecheck` | Strict TypeScript validation across all apps and packages |
| **Format** | `npm run format` | Code formatting with Prettier |
| **Format Check** | `npm run format:check` | Verifies adherence to formatting rules |

---

## 🧮 Shared Financial Calculation Engine (`@finance/utils`)

Pure mathematical financial calculations are decoupled into `@finance/utils`, compiled once, and shared across backend, web, and mobile:

- **Compound Interest**: `calculateCompoundInterest(principal, rate, years, compoundingFrequency, annualContribution)`
- **Loan / Mortgage EMI**: `calculateLoanEMI(principal, annualRate, tenureMonths)`
- **Amortization Schedules**: `generateAmortizationSchedule(principal, annualRate, tenureMonths)`
- **Net Worth**: `calculateNetWorth(assetsSum, liabilitiesSum)`
- **CAGR**: `calculateCAGR(initialValue, finalValue, numberOfYears)`
- **Debt-to-Income (DTI)**: `calculateDTI(monthlyDebt, grossMonthlyIncome)`
- **Savings Rate**: `calculateSavingsRate(savings, grossIncome)`
- **Emergency Fund Runway**: `calculateEmergencyFundRunway(liquidCash, monthlyExpenses)`

---

## 🔐 Security & Production Architecture

1. **Strict Request Validation**: Every endpoint is validated using Zod schemas via middleware before reaching controllers.
2. **Authentication Middleware Foundation**: JWT verification with token expiration, refresh token lifecycle, and role-based access control guards (`USER`, `PREMIUM`, `ADVISOR`, `ADMIN`, `MEMBER`, `VIEWER`).
3. **Resilient Redis Cache**: Built-in in-memory fallback layer ensures background routines and caching functions continue to operate even during Redis network partitions.
4. **Centralized Error Handling**: Standardized `ApiResponse<T>` and `ApiErrorResponse` interfaces prevent stack trace leaks in production.
5. **Decoupled Placeholder Data**: Realistic mock datasets are strictly categorized and marked with development identifiers (`... (Development Mock)`) to eliminate confusion with production financial data.

---

## 🛡️ Step 03: Authentication & User Management Module

### 1. Workflows & Architecture
- **Multi-Platform Authentication**: Web (React + Vite) and Mobile (React Native + Expo) support Email/Password, Google OAuth, Apple Sign-In, and 6-digit Mobile OTP.
- **Regional Experience Defaults**: India preconfigured as the default regional experience (`country: 'India'`, `currency: 'INR'`, fiscal year: `APRIL_MARCH`, time zone: `Asia/Kolkata`).
- **Security & Token Rotation**:
  - Bcrypt password hashing (`BCRYPT_SALT_ROUNDS=12`).
  - Short-lived Access Tokens (15 min) + Rotated Refresh Tokens (7 days).
  - Cryptographic token reuse detection: replaying a revoked token immediately invalidates all active sessions for the user.
  - Account Lockout: 5 consecutive failed logins trigger a 15-minute lockout.
  - IP-based rate limiting on sensitive auth endpoints.
  - Device/Browser detection via User-Agent parsing.
  - Platform-secure token persistence: HttpOnly SameSite cookies on Web, SecureStore foundation on Mobile.
- **Guided Onboarding**: 4-step wizard for workspace selection (`Individual` vs `Household`), module multi-selection, and milestone targets without forcing bank account linkage.
- **Account Settings & Security**: Active session monitoring with remote device revocation, logout from all devices, danger zone deactivation, and permanent deletion workflows.
- **Account Recovery**: Dedicated self-service unlock and 24-character master cryptographic recovery screen.

### 2. Integration Credentials Setup (Production)

To connect real third-party authentication and notification providers in production, populate the following in `.env`:

```env
# Email Provider (Resend or SMTP)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_production_api_key
EMAIL_FROM=security@wealthflow.com

# SMTP Alternative (AWS SES, SendGrid, Mailgun)
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@wealthflow.com
SMTP_PASS=your_production_smtp_password

# SMS OTP Provider (Twilio)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=AC_your_production_sid
TWILIO_AUTH_TOKEN=your_production_auth_token
TWILIO_PHONE_NUMBER=+18005550199

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Apple Sign-In
APPLE_CLIENT_ID=com.wealthflow.app
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY_PATH=/path/to/AuthKey.p8
```

### 3. Automated Verification Tests

Run the complete 14-test suite covering registration, duplicate email rejection, token rotation, session revocation, account lockout, rate limiting, and RBAC authorization boundaries:

```bash
npm run test:auth --workspace=@finance/backend
```

