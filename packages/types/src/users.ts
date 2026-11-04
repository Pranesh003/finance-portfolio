import { BaseEntity, CurrencyCode } from './common';

export type UserRole = 'USER' | 'PREMIUM' | 'ADVISOR' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export type KYCStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type WorkspaceType = 'INDIVIDUAL' | 'HOUSEHOLD';

export interface UserPreferences {
  defaultCurrency: CurrencyCode;
  locale: string;
  theme: 'light' | 'dark' | 'system';
  financialYear: string;
  workspaceType: WorkspaceType;
  enabledModules: string[];
  enableBiometrics: boolean;
  enablePushNotifications: boolean;
  enableEmailAlerts: boolean;
  enableTwoFactor: boolean;
  initialFinancialGoalTitle?: string;
  initialFinancialGoalTarget?: number;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  timeZone?: string;
  financialYear?: string;
  dateFormat?: string;
}

export interface User extends BaseEntity {
  email: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  kycStatus: KYCStatus;
  onboardingCompleted: boolean;
  profile: UserProfile;
  preferences: UserPreferences;
  deactivatedAt?: string | null;
  deleteRequestedAt?: string | null;
}

export interface SessionDetail extends BaseEntity {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  deviceName?: string;
  browser?: string;
  os?: string;
  lastActiveAt: string;
  expiresAt: string;
  isActive: boolean;
  isCurrent?: boolean;
}

export interface AuditLogEntry extends BaseEntity {
  userId?: string | null;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: Record<string, unknown> | null;
}
