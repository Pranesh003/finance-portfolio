import { BaseEntity, CurrencyCode } from './common';
import { User, UserRole, KYCStatus, UserProfile, UserPreferences } from './users';

export { User, UserRole, KYCStatus, UserProfile, UserPreferences };

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthUserResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  defaultCurrency?: CurrencyCode;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface SessionInfo extends BaseEntity {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  isActive: boolean;
}
