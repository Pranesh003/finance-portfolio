import { z } from 'zod';
import { currencyEnum } from './common';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  defaultCurrency: currencyEnum.default('USD')
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phoneNumber: z.string().max(20).optional(),
  country: z.string().max(50).optional(),
  city: z.string().max(50).optional(),
  dateOfBirth: z.string().date().optional()
});

export const updatePreferencesSchema = z.object({
  defaultCurrency: currencyEnum.optional(),
  locale: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  enableBiometrics: z.boolean().optional(),
  enablePushNotifications: z.boolean().optional(),
  enableEmailAlerts: z.boolean().optional(),
  enableTwoFactor: z.boolean().optional()
});

