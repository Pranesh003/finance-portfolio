import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { LoginRequest, RegisterRequest, AuthUserResponse, AuthTokens, User } from '@finance/types';
import { UnauthorizedError } from '../../core/errors/AppError';

// Realistic development placeholder user for initial development & testing
const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'demo.user@antigravity-finance.local',
  role: 'USER',
  isActive: true,
  isEmailVerified: true,
  kycStatus: 'VERIFIED',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-11-04T05:00:00.000Z',
  profile: {
    firstName: 'Alex',
    lastName: 'Morgan',
    phoneNumber: '+1-555-0199',
    country: 'United States',
    city: 'San Francisco'
  },
  preferences: {
    defaultCurrency: 'USD',
    locale: 'en-US',
    theme: 'system',
    enableBiometrics: true,
    enablePushNotifications: true,
    enableEmailAlerts: true,
    enableTwoFactor: false
  }
};

export class AuthService {
  public generateTokens(user: Pick<User, 'id' | 'email' | 'role'>): AuthTokens {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      tokenType: 'Bearer'
    };
  }

  public async login(req: LoginRequest): Promise<AuthUserResponse> {
    // In initial foundation mode, provide demo authentication or validate credentials
    if (req.email === DEMO_USER.email && req.password === 'Password123!') {
      const tokens = this.generateTokens(DEMO_USER);
      return { user: DEMO_USER, tokens };
    }

    // Default mock response for valid formatted credentials in development sandbox
    if (req.email && req.password) {
      const user: User = {
        ...DEMO_USER,
        id: '00000000-0000-0000-0000-000000000002',
        email: req.email
      };
      const tokens = this.generateTokens(user);
      return { user, tokens };
    }

    throw new UnauthorizedError('Invalid email or password');
  }

  public async register(req: RegisterRequest): Promise<AuthUserResponse> {
    const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
    await bcrypt.hash(req.password, salt);

    const newUser: User = {
      id: '00000000-0000-0000-0000-000000000003',
      email: req.email,
      role: 'USER',
      isActive: true,
      isEmailVerified: false,
      kycStatus: 'UNVERIFIED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        firstName: req.firstName,
        lastName: req.lastName
      },
      preferences: {
        defaultCurrency: req.defaultCurrency || 'USD',
        locale: 'en-US',
        theme: 'system',
        enableBiometrics: false,
        enablePushNotifications: true,
        enableEmailAlerts: true,
        enableTwoFactor: false
      }
    };

    const tokens = this.generateTokens(newUser);
    return { user: newUser, tokens };
  }

  public async refreshToken(token: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
      return this.generateTokens({
        id: payload.id,
        email: DEMO_USER.email,
        role: 'USER'
      });
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  public getDemoUser(): User {
    return DEMO_USER;
  }
}

export const authService = new AuthService();

