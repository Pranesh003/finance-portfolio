import { BaseEntity, CurrencyCode } from './common';

export type UserRole = 'USER' | 'PREMIUM' | 'ADVISOR' | 'ADMIN';

export type KYCStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface UserPreferences {
  defaultCurrency: CurrencyCode;
  locale: string;
  theme: 'light' | 'dark' | 'system';
  enableBiometrics: boolean;
  enablePushNotifications: boolean;
  enableEmailAlerts: boolean;
  enableTwoFactor: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
}

export interface User extends BaseEntity {
  email: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  kycStatus: KYCStatus;
  profile: UserProfile;
  preferences: UserPreferences;
}

