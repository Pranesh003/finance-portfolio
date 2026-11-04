import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import { authService } from '../auth/auth.service';
import {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  OnboardingRequest,
  SessionDetail,
  AuditLogEntry
} from '@finance/types';
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError
} from '../../core/errors/AppError';

export class UserService {
  public async getProfile(userId: string): Promise<User> {
    const user = authService.getUserById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return user;
  }

  public async updateProfile(userId: string, data: UpdateProfileRequest): Promise<User> {
    const stores = authService.getMemoryStores();
    let targetUser: any;

    for (const u of stores.users.values()) {
      if (u.id === userId) {
        targetUser = u;
        break;
      }
    }

    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    if (data.firstName) targetUser.profile.firstName = data.firstName;
    if (data.lastName) targetUser.profile.lastName = data.lastName;
    if (data.phoneNumber !== undefined) targetUser.profile.phoneNumber = data.phoneNumber;
    if (data.avatarUrl !== undefined) targetUser.profile.avatarUrl = data.avatarUrl;
    if (data.country) targetUser.profile.country = data.country;
    if (data.city) targetUser.profile.city = data.city;
    if (data.dateOfBirth) targetUser.profile.dateOfBirth = data.dateOfBirth;
    if (data.timeZone) targetUser.profile.timeZone = data.timeZone;
    if (data.financialYear) {
      targetUser.profile.financialYear = data.financialYear;
      targetUser.preferences.financialYear = data.financialYear;
    }
    if (data.dateFormat) targetUser.profile.dateFormat = data.dateFormat;
    if (data.defaultCurrency) targetUser.preferences.defaultCurrency = data.defaultCurrency;
    if (data.enableEmailAlerts !== undefined) targetUser.preferences.enableEmailAlerts = data.enableEmailAlerts;
    if (data.enablePushNotifications !== undefined) targetUser.preferences.enablePushNotifications = data.enablePushNotifications;
    if (data.enableTwoFactor !== undefined) targetUser.preferences.enableTwoFactor = data.enableTwoFactor;
    if (data.enableBiometrics !== undefined) targetUser.preferences.enableBiometrics = data.enableBiometrics;

    targetUser.updatedAt = new Date().toISOString();

    await authService.recordAuditLog('PROFILE_UPDATED', userId, 'SUCCESS', undefined, undefined, {
      updatedFields: Object.keys(data)
    });

    const { passwordHash: _, failedLoginAttempts: __, lockoutUntil: ___, ...sanitized } = targetUser;
    return sanitized;
  }

  public async updatePreferences(userId: string, data: any): Promise<User> {
    const stores = authService.getMemoryStores();
    let targetUser: any;

    for (const u of stores.users.values()) {
      if (u.id === userId) {
        targetUser = u;
        break;
      }
    }

    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    targetUser.preferences = {
      ...targetUser.preferences,
      ...data
    };
    targetUser.updatedAt = new Date().toISOString();

    await authService.recordAuditLog('PREFERENCES_UPDATED', userId, 'SUCCESS');

    const { passwordHash: _, failedLoginAttempts: __, lockoutUntil: ___, ...sanitized } = targetUser;
    return sanitized;
  }

  public async submitOnboarding(userId: string, data: OnboardingRequest): Promise<User> {
    const stores = authService.getMemoryStores();
    let targetUser: any;

    for (const u of stores.users.values()) {
      if (u.id === userId) {
        targetUser = u;
        break;
      }
    }

    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    const enabledModules = data.enabledModules || (data as any).activeModules || [];
    const defaultCurrency = data.defaultCurrency || (data as any).currency || targetUser.preferences.defaultCurrency || 'INR';

    targetUser.onboardingCompleted = true;
    targetUser.preferences.defaultCurrency = defaultCurrency;
    targetUser.preferences.financialYear = data.financialYear || targetUser.preferences.financialYear;
    targetUser.profile.financialYear = data.financialYear || targetUser.profile.financialYear;
    targetUser.preferences.workspaceType = data.workspaceType || targetUser.preferences.workspaceType;
    targetUser.preferences.enabledModules = enabledModules;

    if (data.initialGoal) {
      targetUser.preferences.initialFinancialGoalTitle = data.initialGoal.title;
      targetUser.preferences.initialFinancialGoalTarget = data.initialGoal.targetAmount;
    }

    targetUser.updatedAt = new Date().toISOString();

    await authService.recordAuditLog('ONBOARDING_COMPLETED', userId, 'SUCCESS', undefined, undefined, {
      currency: defaultCurrency,
      financialYear: data.financialYear,
      workspace: data.workspaceType,
      modulesCount: enabledModules.length
    });

    const { passwordHash: _, failedLoginAttempts: __, lockoutUntil: ___, ...sanitized } = targetUser;
    return sanitized;
  }

  public async changePassword(
    userId: string,
    data: ChangePasswordRequest,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    const stores = authService.getMemoryStores();
    let targetUser: any;

    for (const u of stores.users.values()) {
      if (u.id === userId) {
        targetUser = u;
        break;
      }
    }

    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(data.currentPassword, targetUser.passwordHash);
    if (!isCurrentValid) {
      await authService.recordAuditLog('CHANGE_PASSWORD_FAILED', userId, 'FAILURE', ip, userAgent);
      throw new UnauthorizedError('Current password provided is incorrect');
    }

    if (data.newPassword === data.currentPassword) {
      throw new BadRequestError('New password must be different from your current password');
    }

    const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
    targetUser.passwordHash = await bcrypt.hash(data.newPassword, salt);
    targetUser.updatedAt = new Date().toISOString();

    await authService.recordAuditLog('CHANGE_PASSWORD_SUCCESS', userId, 'SUCCESS', ip, userAgent);
  }

  public async getActiveSessions(userId: string, currentSessionId?: string): Promise<SessionDetail[]> {
    const stores = authService.getMemoryStores();
    const sessions: SessionDetail[] = [];

    for (const s of stores.sessions.values()) {
      if (s.userId === userId && s.isActive && s.expiresAt > new Date()) {
        sessions.push({
          id: s.id,
          userId: s.userId,
          ipAddress: s.ipAddress || '127.0.0.1',
          userAgent: s.userAgent,
          deviceType: s.deviceType || 'Desktop',
          deviceName: s.deviceName || 'Web Browser',
          browser: s.browser || 'Browser',
          os: s.os || 'OS',
          lastActiveAt: s.lastActiveAt.toISOString(),
          expiresAt: s.expiresAt.toISOString(),
          isActive: s.isActive,
          isCurrent: s.id === currentSessionId,
          createdAt: s.lastActiveAt.toISOString(),
          updatedAt: s.lastActiveAt.toISOString()
        });
      }
    }

    // If no explicit session tracked in memory, provide default active session
    if (sessions.length === 0) {
      sessions.push({
        id: currentSessionId || 'sess-current',
        userId,
        ipAddress: '127.0.0.1',
        deviceType: 'Desktop',
        deviceName: 'Chrome on Windows',
        browser: 'Chrome',
        os: 'Windows',
        lastActiveAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        isCurrent: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return sessions;
  }

  public async revokeSession(userId: string, sessionId: string): Promise<void> {
    const stores = authService.getMemoryStores();
    const session = stores.sessions.get(sessionId);

    if (session && session.userId === userId) {
      session.isActive = false;
      await authService.recordAuditLog('SESSION_REVOKED', userId, 'SUCCESS', undefined, undefined, { sessionId });
    }
  }

  public async revokeAllOtherSessions(userId: string, currentSessionId?: string): Promise<void> {
    const stores = authService.getMemoryStores();

    for (const s of stores.sessions.values()) {
      if (s.userId === userId && s.id !== currentSessionId) {
        s.isActive = false;
      }
    }
    await authService.recordAuditLog('ALL_OTHER_SESSIONS_REVOKED', userId, 'SUCCESS');
  }

  public async deactivateAccount(userId: string, ip?: string): Promise<void> {
    const stores = authService.getMemoryStores();
    let targetUser: any;

    for (const u of stores.users.values()) {
      if (u.id === userId) {
        targetUser = u;
        break;
      }
    }

    if (!targetUser) throw new NotFoundError('User not found');

    targetUser.isActive = false;
    targetUser.deactivatedAt = new Date().toISOString();

    // Revoke all sessions
    await authService.logoutAll(userId);
    await authService.recordAuditLog('ACCOUNT_DEACTIVATED', userId, 'SUCCESS', ip);
  }

  public async requestAccountDeletion(userId: string, ip?: string): Promise<void> {
    const stores = authService.getMemoryStores();
    let targetUser: any;

    for (const u of stores.users.values()) {
      if (u.id === userId) {
        targetUser = u;
        break;
      }
    }

    if (!targetUser) throw new NotFoundError('User not found');

    targetUser.deleteRequestedAt = new Date().toISOString();
    await authService.recordAuditLog('ACCOUNT_DELETE_REQUESTED', userId, 'SUCCESS', ip);
  }

  public async getAuditLogs(userId: string): Promise<AuditLogEntry[]> {
    const stores = authService.getMemoryStores();
    return stores.auditLogs
      .filter((log) => log.userId === userId)
      .slice(0, 50)
      .map((log) => ({
        id: log.id,
        userId: log.userId,
        action: log.action,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        status: log.status,
        details: log.details,
        createdAt: log.createdAt.toISOString(),
        updatedAt: log.createdAt.toISOString()
      }));
  }

  public async listAllUsersAdmin(): Promise<User[]> {
    const stores = authService.getMemoryStores();
    return Array.from(stores.users.values()).map((u) => {
      const { passwordHash: _, failedLoginAttempts: __, lockoutUntil: ___, ...sanitized } = u;
      return sanitized;
    });
  }
}

export const userService = new UserService();
