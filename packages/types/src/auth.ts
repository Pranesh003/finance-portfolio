import { BaseEntity, CurrencyCode } from './common';
import { User, UserRole, KYCStatus, UserProfile, UserPreferences, SessionDetail, AuditLogEntry, WorkspaceType } from './users';

export { User, UserRole, KYCStatus, UserProfile, UserPreferences, SessionDetail, AuditLogEntry, WorkspaceType };

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthUserResponse {
  user: User;
  tokens: AuthTokens;
  sessionId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  country?: string;
  defaultCurrency?: CurrencyCode;
  financialYear?: string;
  timeZone?: string;
  theme?: 'light' | 'dark' | 'system';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface SocialAuthRequest {
  provider: 'GOOGLE' | 'APPLE';
  idToken: string;
  email?: string;
  name?: string;
  providerUserId?: string;
}

export interface SendPhoneOtpRequest {
  phoneNumber: string;
}

export interface VerifyPhoneOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword?: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword?: string;
}

export interface OnboardingRequest {
  enabledModules: string[];
  defaultCurrency: CurrencyCode;
  financialYear: string;
  workspaceType: WorkspaceType;
  initialGoal?: {
    title: string;
    targetAmount: number;
  };
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  country?: string;
  city?: string;
  dateOfBirth?: string;
  timeZone?: string;
  financialYear?: string;
  dateFormat?: string;
  defaultCurrency?: CurrencyCode;
  enableEmailAlerts?: boolean;
  enablePushNotifications?: boolean;
  enableTwoFactor?: boolean;
  enableBiometrics?: boolean;
}

export interface SessionInfo extends BaseEntity {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  isActive: boolean;
}
