import { z } from 'zod';
import { currencyEnum } from './common';

export const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: passwordValidation,
    confirmPassword: z.string().optional(),
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    phoneNumber: z.string().max(25).optional(),
    country: z.string().max(60).default('India'),
    defaultCurrency: currencyEnum.default('INR'),
    financialYear: z.string().default('APRIL_MARCH'),
    timeZone: z.string().default('Asia/Kolkata'),
    theme: z.enum(['light', 'dark', 'system']).default('dark')
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordValidation,
    confirmPassword: z.string().optional()
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});

export const sendOtpSchema = z.object({
  phoneNumber: z.string().min(8, 'Valid phone number required').max(20)
});

export const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(8, 'Valid phone number required').max(20),
  otp: z.string().length(6, 'OTP must be 6 digits')
});

export const socialAuthSchema = z.object({
  provider: z.enum(['GOOGLE', 'APPLE']),
  idToken: z.string().min(1, 'ID Token is required'),
  email: z.string().email().optional(),
  name: z.string().optional(),
  providerUserId: z.string().optional()
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordValidation,
    confirmNewPassword: z.string().optional()
  })
  .refine((data) => !data.confirmNewPassword || data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword']
  });

export const onboardingSchema = z.object({
  enabledModules: z.array(z.string()).min(1, 'Select at least one module'),
  defaultCurrency: currencyEnum.default('INR'),
  financialYear: z.string().default('APRIL_MARCH'),
  workspaceType: z.enum(['INDIVIDUAL', 'HOUSEHOLD']).default('INDIVIDUAL'),
  initialGoal: z
    .object({
      title: z.string().min(1, 'Goal title is required'),
      targetAmount: z.number().positive('Target amount must be positive')
    })
    .optional()
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phoneNumber: z.string().max(25).optional(),
  country: z.string().max(60).optional(),
  city: z.string().max(60).optional(),
  dateOfBirth: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  timeZone: z.string().optional(),
  financialYear: z.string().optional(),
  dateFormat: z.string().optional(),
  defaultCurrency: currencyEnum.optional(),
  enableEmailAlerts: z.boolean().optional(),
  enablePushNotifications: z.boolean().optional(),
  enableTwoFactor: z.boolean().optional(),
  enableBiometrics: z.boolean().optional()
});

export const updatePreferencesSchema = z.object({
  defaultCurrency: currencyEnum.optional(),
  locale: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  financialYear: z.string().optional(),
  workspaceType: z.enum(['INDIVIDUAL', 'HOUSEHOLD']).optional(),
  enabledModules: z.array(z.string()).optional(),
  enableBiometrics: z.boolean().optional(),
  enablePushNotifications: z.boolean().optional(),
  enableEmailAlerts: z.boolean().optional(),
  enableTwoFactor: z.boolean().optional()
});
