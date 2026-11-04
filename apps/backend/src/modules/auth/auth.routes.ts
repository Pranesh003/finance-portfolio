import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../core/middleware/validate';
import { authRateLimiter, strictAuthRateLimiter } from '../../core/middleware/rateLimiter';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  sendOtpSchema,
  verifyOtpSchema,
  socialAuthSchema
} from '@finance/validation';
import { authenticate } from '../../core/middleware/authenticate';

const router = Router();

router.post('/login', strictAuthRateLimiter, validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/register', authRateLimiter, validate(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post('/social', authRateLimiter, validate(socialAuthSchema), (req, res, next) => authController.socialAuth(req, res, next));

router.post('/phone/send-otp', strictAuthRateLimiter, validate(sendOtpSchema), (req, res, next) => authController.sendPhoneOtp(req, res, next));
router.post('/phone/verify-otp', strictAuthRateLimiter, validate(verifyOtpSchema), (req, res, next) => authController.verifyPhoneOtp(req, res, next));

router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', strictAuthRateLimiter, validate(resetPasswordSchema), (req, res, next) => authController.resetPassword(req, res, next));
router.post('/verify-email', validate(verifyEmailSchema), (req, res, next) => authController.verifyEmail(req, res, next));
router.post('/resend-verification', authenticate, (req, res, next) => authController.resendEmailVerification(req, res, next));

router.post('/refresh-token', (req, res, next) => authController.refreshToken(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/logout-all', authenticate, (req, res, next) => authController.logoutAll(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.getCurrentUser(req, res, next));

export const authRouter = router;
