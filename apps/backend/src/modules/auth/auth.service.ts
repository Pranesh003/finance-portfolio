import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env';
import { prisma } from '../../core/database/prisma';
import { logger } from '../../core/logger/logger';
import { parseUserAgent } from '../../core/utils/deviceParser';
import {
  LoginRequest,
  RegisterRequest,
  AuthUserResponse,
  AuthTokens,
  User,
  SocialAuthRequest,
  SendPhoneOtpRequest,
  VerifyPhoneOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '@finance/types';
import {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  ForbiddenError
} from '../../core/errors/AppError';

// In-Memory Repository for local dev resilience when database is offline
interface StoredUser extends User {
  passwordHash: string;
  failedLoginAttempts: number;
  lockoutUntil?: Date | null;
}

interface StoredSession {
  id: string;
  userId: string;
  tokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  deviceName?: string;
  browser?: string;
  os?: string;
  lastActiveAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

interface StoredRefreshToken {
  id: string;
  userId: string;
  sessionId?: string;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  replacedByTokenHash?: string;
}

interface StoredVerificationToken {
  id: string;
  userId?: string;
  identifier: string;
  tokenHash: string;
  type: 'EMAIL_VERIFICATION' | 'PHONE_OTP';
  expiresAt: Date;
  isUsed: boolean;
  attempts: number;
}

interface StoredPasswordReset {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  isUsed: boolean;
  ipAddress?: string;
  userAgent?: string;
}

interface StoredAuditLog {
  id: string;
  userId?: string | null;
  action: string;
  status: 'SUCCESS' | 'FAILURE';
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown> | null;
  createdAt: Date;
}

// Initial default seed user
const INITIAL_DEMO_HASH = bcrypt.hashSync('Password123!', 10);

const memoryUsers: Map<string, StoredUser> = new Map([
  [
    'demo.user@antigravity-finance.local',
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo.user@antigravity-finance.local',
      passwordHash: INITIAL_DEMO_HASH,
      role: 'USER',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      kycStatus: 'VERIFIED',
      onboardingCompleted: true,
      failedLoginAttempts: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-11-04T05:00:00.000Z',
      profile: {
        firstName: 'Alex',
        lastName: 'Morgan',
        phoneNumber: '+91 98765 43210',
        country: 'India',
        city: 'Mumbai',
        timeZone: 'Asia/Kolkata',
        financialYear: 'APRIL_MARCH',
        dateFormat: 'DD/MM/YYYY'
      },
      preferences: {
        defaultCurrency: 'INR',
        locale: 'en-IN',
        theme: 'dark',
        financialYear: 'APRIL_MARCH',
        workspaceType: 'INDIVIDUAL',
        enabledModules: ['accounts', 'transactions', 'expenses', 'income', 'investments', 'budgets', 'goals'],
        enableBiometrics: true,
        enablePushNotifications: true,
        enableEmailAlerts: true,
        enableTwoFactor: false
      }
    }
  ]
]);

const memorySessions: Map<string, StoredSession> = new Map();
const memoryRefreshTokens: Map<string, StoredRefreshToken> = new Map();
const memoryVerificationTokens: Map<string, StoredVerificationToken> = new Map();
const memoryPasswordResets: Map<string, StoredPasswordReset> = new Map();
const memoryAuditLogs: StoredAuditLog[] = [];

export class AuthService {
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public generateTokens(user: Pick<User, 'id' | 'email' | 'role'>, sessionId?: string): AuthTokens {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, sessionId },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, sessionId, nonce: crypto.randomBytes(16).toString('hex') },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 mins in seconds
      tokenType: 'Bearer'
    };
  }

  public async recordAuditLog(
    action: string,
    userId?: string | null,
    status: 'SUCCESS' | 'FAILURE' = 'SUCCESS',
    ipAddress?: string,
    userAgent?: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      const entry: StoredAuditLog = {
        id: crypto.randomUUID(),
        userId: userId || null,
        action,
        status,
        ipAddress,
        userAgent,
        details: details || null,
        createdAt: new Date()
      };
      memoryAuditLogs.unshift(entry);

      // Attempt PostgreSQL log
      try {
        await prisma.auditLog.create({
          data: {
            userId: userId || undefined,
            action,
            status,
            ipAddress,
            userAgent,
            details: (details as any) || undefined
          }
        });
      } catch {
        // Fallback to in-memory audit log
      }
    } catch (err) {
      logger.warn('Failed to record security audit log:', err);
    }
  }

  public async register(
    req: RegisterRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthUserResponse> {
    const emailNormalized = req.email.toLowerCase().trim();

    // Check if user already exists
    if (memoryUsers.has(emailNormalized)) {
      await this.recordAuditLog('REGISTER_FAILED_DUPLICATE', null, 'FAILURE', ipAddress, userAgent, { email: emailNormalized });
      throw new ConflictError('An account with this email already exists');
    }

    // Check password strength
    if (req.password.length < 8) {
      throw new BadRequestError('Password must be at least 8 characters long');
    }

    const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(req.password, salt);

    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      id: userId,
      email: emailNormalized,
      passwordHash,
      role: 'USER',
      isActive: true,
      isEmailVerified: false,
      isPhoneVerified: false,
      kycStatus: 'UNVERIFIED',
      onboardingCompleted: false,
      failedLoginAttempts: 0,
      createdAt: now,
      updatedAt: now,
      profile: {
        firstName: req.firstName.trim(),
        lastName: req.lastName.trim(),
        phoneNumber: req.phoneNumber?.trim(),
        country: req.country || 'India',
        timeZone: req.timeZone || 'Asia/Kolkata',
        financialYear: req.financialYear || 'APRIL_MARCH',
        dateFormat: 'DD/MM/YYYY'
      },
      preferences: {
        defaultCurrency: req.defaultCurrency || 'INR',
        locale: 'en-IN',
        theme: req.theme || 'dark',
        financialYear: req.financialYear || 'APRIL_MARCH',
        workspaceType: 'INDIVIDUAL',
        enabledModules: ['accounts', 'transactions', 'expenses', 'income', 'investments', 'budgets', 'goals'],
        enableBiometrics: false,
        enablePushNotifications: true,
        enableEmailAlerts: true,
        enableTwoFactor: false
      }
    };

    memoryUsers.set(emailNormalized, newUser);

    // Create session
    const sessionId = crypto.randomUUID();
    const deviceInfo = parseUserAgent(userAgent);
    const tokens = this.generateTokens(newUser, sessionId);
    const tokenHash = this.hashToken(tokens.refreshToken);

    const session: StoredSession = {
      id: sessionId,
      userId,
      tokenHash,
      ipAddress,
      userAgent,
      deviceType: deviceInfo.deviceType,
      deviceName: deviceInfo.deviceName,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true
    };
    memorySessions.set(sessionId, session);

    memoryRefreshTokens.set(tokenHash, {
      id: crypto.randomUUID(),
      userId,
      sessionId,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false
    });

    // Create initial verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    memoryVerificationTokens.set(verifyToken, {
      id: crypto.randomUUID(),
      userId,
      identifier: emailNormalized,
      tokenHash: this.hashToken(verifyToken),
      type: 'EMAIL_VERIFICATION',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isUsed: false,
      attempts: 0
    });

    logger.info(`[AUTH] Registered new user: ${emailNormalized} (Default Currency: ${newUser.preferences.defaultCurrency}, FY: ${newUser.preferences.financialYear})`);
    logger.info(`[DEV EMAIL VERIFICATION] Token for ${emailNormalized}: ${verifyToken}`);

    await this.recordAuditLog('REGISTER', userId, 'SUCCESS', ipAddress, userAgent, {
      email: emailNormalized,
      country: newUser.profile.country,
      currency: newUser.preferences.defaultCurrency
    });

    const { passwordHash: _, failedLoginAttempts: __, lockoutUntil: ___, ...sanitizedUser } = newUser;
    return { user: sanitizedUser, tokens, sessionId };
  }

  public async login(
    req: LoginRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthUserResponse> {
    const emailNormalized = req.email.toLowerCase().trim();
    const user = memoryUsers.get(emailNormalized);

    if (!user) {
      await this.recordAuditLog('LOGIN_FAILED', null, 'FAILURE', ipAddress, userAgent, { email: emailNormalized, reason: 'USER_NOT_FOUND' });
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      await this.recordAuditLog('LOGIN_FAILED_DEACTIVATED', user.id, 'FAILURE', ipAddress, userAgent);
      throw new ForbiddenError('This account has been deactivated. Please contact support to reactivate.');
    }

    // Check account lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / (60 * 1000));
      await this.recordAuditLog('LOGIN_FAILED_LOCKED', user.id, 'FAILURE', ipAddress, userAgent, { remainingMinutes });
      throw new ForbiddenError(`Account temporarily locked due to multiple failed attempts. Try again in ${remainingMinutes} minute(s).`);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(req.password, user.passwordHash);

    if (!isPasswordValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      let lockoutMessage = 'Invalid email or password';

      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        lockoutMessage = 'Too many failed login attempts. Your account is temporarily locked for 15 minutes.';
      }

      await this.recordAuditLog('LOGIN_FAILED_PASSWORD', user.id, 'FAILURE', ipAddress, userAgent, {
        failedAttempts: user.failedLoginAttempts
      });

      throw new UnauthorizedError(lockoutMessage);
    }

    // Reset failed login attempts on successful credentials
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;

    // Create session
    const sessionId = crypto.randomUUID();
    const deviceInfo = parseUserAgent(userAgent);
    const tokens = this.generateTokens(user, sessionId);
    const tokenHash = this.hashToken(tokens.refreshToken);

    const session: StoredSession = {
      id: sessionId,
      userId: user.id,
      tokenHash,
      ipAddress,
      userAgent,
      deviceType: deviceInfo.deviceType,
      deviceName: deviceInfo.deviceName,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + (req.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000),
      isActive: true
    };
    memorySessions.set(sessionId, session);

    memoryRefreshTokens.set(tokenHash, {
      id: crypto.randomUUID(),
      userId: user.id,
      sessionId,
      tokenHash,
      expiresAt: session.expiresAt,
      isRevoked: false
    });

    await this.recordAuditLog('LOGIN_SUCCESS', user.id, 'SUCCESS', ipAddress, userAgent, {
      device: deviceInfo.deviceName,
      rememberMe: req.rememberMe
    });

    const { passwordHash: _, failedLoginAttempts: __, lockoutUntil: ___, ...sanitizedUser } = user;
    return { user: sanitizedUser, tokens, sessionId };
  }

  public async socialAuth(
    req: SocialAuthRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthUserResponse> {
    const emailNormalized = (req.email || `${req.provider.toLowerCase()}_${req.idToken.slice(0, 10)}@social.wealthflow.local`).toLowerCase().trim();

    let user = memoryUsers.get(emailNormalized);

    if (!user) {
      // Auto-register social user
      const userId = crypto.randomUUID();
      const rawName = req.name || 'Social User';
      const parts = rawName.split(' ');
      const firstName = parts[0] || 'Social';
      const lastName = parts.slice(1).join(' ') || 'Member';

      user = {
        id: userId,
        email: emailNormalized,
        passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
        role: 'USER',
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: false,
        kycStatus: 'VERIFIED',
        onboardingCompleted: false,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: {
          firstName,
          lastName,
          country: 'India',
          timeZone: 'Asia/Kolkata',
          financialYear: 'APRIL_MARCH',
          dateFormat: 'DD/MM/YYYY'
        },
        preferences: {
          defaultCurrency: 'INR',
          locale: 'en-IN',
          theme: 'dark',
          financialYear: 'APRIL_MARCH',
          workspaceType: 'INDIVIDUAL',
          enabledModules: ['accounts', 'transactions', 'expenses', 'income', 'investments', 'budgets', 'goals'],
          enableBiometrics: false,
          enablePushNotifications: true,
          enableEmailAlerts: true,
          enableTwoFactor: false
        }
      };
      memoryUsers.set(emailNormalized, user);
      await this.recordAuditLog(`SOCIAL_REGISTER_${req.provider}`, user.id, 'SUCCESS', ipAddress, userAgent);
    }

    const nonNullUser = user;
    const sessionId = crypto.randomUUID();
    const deviceInfo = parseUserAgent(userAgent);
    const tokens = this.generateTokens(nonNullUser, sessionId);
    const tokenHash = this.hashToken(tokens.refreshToken);

    const session: StoredSession = {
      id: sessionId,
      userId: nonNullUser.id,
      tokenHash,
      ipAddress,
      userAgent,
      deviceType: deviceInfo.deviceType,
      deviceName: deviceInfo.deviceName,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true
    };
    memorySessions.set(sessionId, session);

    await this.recordAuditLog(`SOCIAL_LOGIN_${req.provider}`, nonNullUser.id, 'SUCCESS', ipAddress, userAgent);

    const { passwordHash: _, failedLoginAttempts: __, lockoutUntil: ___, ...sanitizedUser } = nonNullUser;
    return { user: sanitizedUser, tokens, sessionId };
  }

  public async sendPhoneOtp(
    req: SendPhoneOtpRequest,
    ipAddress?: string
  ): Promise<{ success: boolean; message: string; devOtp?: string }> {
    const phone = req.phoneNumber.trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

    const tokenEntry: StoredVerificationToken = {
      id: crypto.randomUUID(),
      identifier: phone,
      tokenHash: this.hashToken(otp),
      type: 'PHONE_OTP',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      isUsed: false,
      attempts: 0
    };

    memoryVerificationTokens.set(`otp_${phone}`, tokenEntry);

    logger.info(`[SMS AUTH PROVIDER] 📲 Verification OTP for ${phone}: ${otp}`);
    await this.recordAuditLog('SEND_PHONE_OTP', null, 'SUCCESS', ipAddress, undefined, { phone });

    return {
      success: true,
      message: `OTP sent successfully to ${phone}`,
      devOtp: env.NODE_ENV !== 'production' ? otp : undefined
    };
  }

  public async verifyPhoneOtp(
    req: VerifyPhoneOtpRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthUserResponse> {
    const phone = req.phoneNumber.trim();
    const tokenEntry = memoryVerificationTokens.get(`otp_${phone}`);

    if (!tokenEntry || tokenEntry.isUsed || tokenEntry.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired OTP code');
    }

    if (tokenEntry.tokenHash !== this.hashToken(req.otp.trim())) {
      tokenEntry.attempts += 1;
      if (tokenEntry.attempts >= 4) {
        memoryVerificationTokens.delete(`otp_${phone}`);
        throw new ForbiddenError('Too many invalid attempts. Please request a new OTP.');
      }
      throw new BadRequestError('Incorrect verification code');
    }

    tokenEntry.isUsed = true;

    // Find user with this phone or create one
    let targetUser: StoredUser | undefined;
    for (const u of memoryUsers.values()) {
      if (u.profile.phoneNumber === phone) {
        targetUser = u;
        break;
      }
    }

    if (!targetUser) {
      const userId = crypto.randomUUID();
      const syntheticEmail = `phone_${phone.replace(/\D/g, '')}@mobile.wealthflow.local`;
      targetUser = {
        id: userId,
        email: syntheticEmail,
        passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
        role: 'USER',
        isActive: true,
        isEmailVerified: false,
        isPhoneVerified: true,
        kycStatus: 'VERIFIED',
        onboardingCompleted: false,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: {
          firstName: 'Mobile',
          lastName: 'User',
          phoneNumber: phone,
          country: 'India',
          timeZone: 'Asia/Kolkata',
          financialYear: 'APRIL_MARCH',
          dateFormat: 'DD/MM/YYYY'
        },
        preferences: {
          defaultCurrency: 'INR',
          locale: 'en-IN',
          theme: 'dark',
          financialYear: 'APRIL_MARCH',
          workspaceType: 'INDIVIDUAL',
          enabledModules: ['accounts', 'transactions', 'expenses', 'income', 'investments', 'budgets', 'goals'],
          enableBiometrics: false,
          enablePushNotifications: true,
          enableEmailAlerts: true,
          enableTwoFactor: false
        }
      };
      memoryUsers.set(syntheticEmail, targetUser);
    } else {
      targetUser.isPhoneVerified = true;
    }

    const sessionId = crypto.randomUUID();
    const deviceInfo = parseUserAgent(userAgent);
    const tokens = this.generateTokens(targetUser, sessionId);
    const tokenHash = this.hashToken(tokens.refreshToken);

    const session: StoredSession = {
      id: sessionId,
      userId: targetUser.id,
      tokenHash,
      ipAddress,
      userAgent,
      deviceType: deviceInfo.deviceType,
      deviceName: deviceInfo.deviceName,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true
    };
    memorySessions.set(sessionId, session);

    await this.recordAuditLog('PHONE_OTP_LOGIN', targetUser.id, 'SUCCESS', ipAddress, userAgent, { phone });

    const { passwordHash: _, failedLoginAttempts: __, lockoutUntil: ___, ...sanitizedUser } = targetUser;
    return { user: sanitizedUser, tokens, sessionId };
  }

  public async requestPasswordReset(
    req: ForgotPasswordRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; message: string; devResetToken?: string }> {
    const emailNormalized = req.email.toLowerCase().trim();
    const user = memoryUsers.get(emailNormalized);

    // Always respond with success to avoid email enumeration attacks
    if (!user) {
      logger.info(`[AUTH] Password reset requested for non-existent email: ${emailNormalized}`);
      return {
        success: true,
        message: 'If an account exists with this email address, password reset instructions have been dispatched.'
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(resetToken);

    memoryPasswordResets.set(resetToken, {
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      isUsed: false,
      ipAddress,
      userAgent
    });

    logger.info(`[AUTH EMAIL PROVIDER] 🔑 Password reset link for ${emailNormalized}: http://localhost:5173/reset-password?token=${resetToken}`);
    await this.recordAuditLog('PASSWORD_RESET_REQUESTED', user.id, 'SUCCESS', ipAddress, userAgent);

    return {
      success: true,
      message: 'If an account exists with this email address, password reset instructions have been dispatched.',
      devResetToken: env.NODE_ENV !== 'production' ? resetToken : undefined
    };
  }

  public async resetPassword(
    req: ResetPasswordRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; message: string }> {
    const resetEntry = memoryPasswordResets.get(req.token);

    if (!resetEntry || resetEntry.isUsed || resetEntry.expiresAt < new Date()) {
      throw new BadRequestError('Password reset link is invalid or has expired');
    }

    // Find user
    let user: StoredUser | undefined;
    for (const u of memoryUsers.values()) {
      if (u.id === resetEntry.userId) {
        user = u;
        break;
      }
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
    user.passwordHash = await bcrypt.hash(req.password, salt);
    user.updatedAt = new Date().toISOString();
    resetEntry.isUsed = true;

    // Invalidate existing sessions on password reset for security
    for (const s of memorySessions.values()) {
      if (s.userId === user.id) {
        s.isActive = false;
      }
    }

    await this.recordAuditLog('PASSWORD_RESET_COMPLETED', user.id, 'SUCCESS', ipAddress, userAgent);
    logger.info(`[AUTH] Password reset successfully for user: ${user.email}`);

    return {
      success: true,
      message: 'Your password has been reset successfully. You may now sign in with your new password.'
    };
  }

  public async verifyEmail(
    token: string,
    ipAddress?: string
  ): Promise<{ success: boolean; message: string }> {
    const tokenEntry = memoryVerificationTokens.get(token);

    if (!tokenEntry || tokenEntry.isUsed || tokenEntry.expiresAt < new Date()) {
      throw new BadRequestError('Verification link is invalid or has expired');
    }

    tokenEntry.isUsed = true;

    let user: StoredUser | undefined;
    if (tokenEntry.userId) {
      for (const u of memoryUsers.values()) {
        if (u.id === tokenEntry.userId) {
          user = u;
          break;
        }
      }
    } else {
      user = memoryUsers.get(tokenEntry.identifier.toLowerCase());
    }

    if (user) {
      user.isEmailVerified = true;
      user.updatedAt = new Date().toISOString();
      await this.recordAuditLog('EMAIL_VERIFIED', user.id, 'SUCCESS', ipAddress);
    }

    return {
      success: true,
      message: 'Email address verified successfully!'
    };
  }

  public async resendEmailVerification(
    userId: string
  ): Promise<{ success: boolean; message: string; devVerifyToken?: string }> {
    let user: StoredUser | undefined;
    for (const u of memoryUsers.values()) {
      if (u.id === userId) {
        user = u;
        break;
      }
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isEmailVerified) {
      return {
        success: true,
        message: 'Email is already verified.'
      };
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    memoryVerificationTokens.set(verifyToken, {
      id: crypto.randomUUID(),
      userId,
      identifier: user.email,
      tokenHash: this.hashToken(verifyToken),
      type: 'EMAIL_VERIFICATION',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isUsed: false,
      attempts: 0
    });

    logger.info(`[AUTH] Resent verification token for ${user.email}: http://localhost:5173/verify-email?token=${verifyToken}`);

    return {
      success: true,
      message: 'Verification link resent successfully to your registered email.',
      devVerifyToken: env.NODE_ENV !== 'production' ? verifyToken : undefined
    };
  }

  public async refreshToken(
    oldRefreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as { id: string; sessionId?: string };
      const oldHash = this.hashToken(oldRefreshToken);

      const storedToken = memoryRefreshTokens.get(oldHash);
      if (storedToken && storedToken.isRevoked) {
        // Token reuse detection! Invalidate all sessions for this user for security
        await this.logoutAll(payload.id);
        await this.recordAuditLog('TOKEN_REUSE_DETECTED', payload.id, 'FAILURE', ipAddress, userAgent);
        throw new UnauthorizedError('Revoked token reuse detected. All sessions terminated for security.');
      }

      // Find user
      let user: StoredUser | undefined;
      for (const u of memoryUsers.values()) {
        if (u.id === payload.id) {
          user = u;
          break;
        }
      }

      if (!user || !user.isActive) {
        throw new UnauthorizedError('User session expired or user deactivated');
      }

      // Revoke old token and rotate
      const newTokens = this.generateTokens(user, payload.sessionId);
      const newHash = this.hashToken(newTokens.refreshToken);

      if (storedToken) {
        storedToken.isRevoked = true;
        storedToken.replacedByTokenHash = newHash;
      }

      memoryRefreshTokens.set(newHash, {
        id: crypto.randomUUID(),
        userId: user.id,
        sessionId: payload.sessionId,
        tokenHash: newHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: false
      });

      // Update session lastActiveAt
      if (payload.sessionId) {
        const session = memorySessions.get(payload.sessionId);
        if (session) {
          session.lastActiveAt = new Date();
        }
      }

      return newTokens;
    } catch (err: unknown) {
      if (err instanceof UnauthorizedError) throw err;
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  public async logout(sessionId?: string, refreshToken?: string, userId?: string): Promise<void> {
    if (refreshToken) {
      const hash = this.hashToken(refreshToken);
      const stored = memoryRefreshTokens.get(hash);
      if (stored) stored.isRevoked = true;
    }

    if (sessionId) {
      const s = memorySessions.get(sessionId);
      if (s) s.isActive = false;
    }

    await this.recordAuditLog('LOGOUT', userId, 'SUCCESS');
  }

  public async logoutAll(userId: string): Promise<void> {
    for (const s of memorySessions.values()) {
      if (s.userId === userId) {
        s.isActive = false;
      }
    }
    for (const rt of memoryRefreshTokens.values()) {
      if (rt.userId === userId) {
        rt.isRevoked = true;
      }
    }
    await this.recordAuditLog('LOGOUT_ALL_SESSIONS', userId, 'SUCCESS');
  }

  public getUserById(id: string): User | null {
    for (const u of memoryUsers.values()) {
      if (u.id === id) {
        const { passwordHash: _, failedLoginAttempts: __, lockoutUntil: ___, ...sanitized } = u;
        return sanitized;
      }
    }
    return null;
  }

  public getDemoUser(): User {
    const demo = memoryUsers.get('demo.user@antigravity-finance.local')!;
    const { passwordHash: _, failedLoginAttempts: __, lockoutUntil: ___, ...sanitized } = demo;
    return sanitized;
  }

  public getMemoryStores() {
    return {
      users: memoryUsers,
      sessions: memorySessions,
      refreshTokens: memoryRefreshTokens,
      auditLogs: memoryAuditLogs
    };
  }
}

export const authService = new AuthService();
