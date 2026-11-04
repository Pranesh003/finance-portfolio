-- Migration: 20261104120000_auth_user_management
-- Description: Implement full authentication, session management, token rotation, and security audit log models.

-- CreateEnum AuthProviderType
CREATE TYPE "AuthProviderType" AS ENUM ('EMAIL_PASSWORD', 'GOOGLE', 'APPLE', 'PHONE_OTP', 'SAML_SSO');

-- CreateEnum TokenType
CREATE TYPE "TokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PHONE_OTP', 'SESSION_REFRESH');

-- AlterEnum Role (add MEMBER and VIEWER for household / team management)
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MEMBER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'VIEWER';

-- AlterTable User (add lockout, verification, and deactivation flags)
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lockoutUntil" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "deactivatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "deleteRequestedAt" TIMESTAMP(3);

-- AlterTable UserProfile (add city, timeZone, financialYear, dateFormat)
ALTER TABLE "UserProfile"
ADD COLUMN IF NOT EXISTS "city" TEXT,
ADD COLUMN IF NOT EXISTS "timeZone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
ADD COLUMN IF NOT EXISTS "financialYear" TEXT NOT NULL DEFAULT 'APRIL_MARCH',
ADD COLUMN IF NOT EXISTS "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY';

-- AlterTable UserPreferences (add defaultCurrency, financialYear, workspaceType, enabledModules)
ALTER TABLE "UserPreferences"
ADD COLUMN IF NOT EXISTS "defaultCurrency" "CurrencyCode" NOT NULL DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS "financialYear" TEXT NOT NULL DEFAULT 'APRIL_MARCH',
ADD COLUMN IF NOT EXISTS "workspaceType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN IF NOT EXISTS "enabledModules" TEXT[] DEFAULT ARRAY['banking', 'investments', 'budgets', 'goals']::TEXT[],
ADD COLUMN IF NOT EXISTS "initialFinancialGoalTitle" TEXT,
ADD COLUMN IF NOT EXISTS "initialFinancialGoalTarget" DECIMAL(18,4);

-- AlterTable Session (add browser, os, deviceName, tokenHash, lastActiveAt)
ALTER TABLE "Session"
ADD COLUMN IF NOT EXISTS "tokenHash" TEXT,
ADD COLUMN IF NOT EXISTS "deviceName" TEXT,
ADD COLUMN IF NOT EXISTS "browser" TEXT,
ADD COLUMN IF NOT EXISTS "os" TEXT,
ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable AuthProvider
CREATE TABLE IF NOT EXISTS "AuthProvider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AuthProviderType" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthProvider_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AuthProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable RefreshToken
CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "replacedByTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RefreshToken_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable VerificationToken
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenType" "TokenType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable PasswordResetRequest
CREATE TABLE IF NOT EXISTS "PasswordResetRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetRequest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PasswordResetRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable AuditLog
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndexes
CREATE UNIQUE INDEX IF NOT EXISTS "AuthProvider_provider_providerAccountId_key" ON "AuthProvider"("provider", "providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_tokenHash_key" ON "VerificationToken"("tokenHash");
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetRequest_tokenHash_key" ON "PasswordResetRequest"("tokenHash");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");

