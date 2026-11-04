import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../core/middleware/validate';
import { loginSchema, registerSchema, refreshTokenSchema } from '@finance/validation';
import { authenticate } from '../../core/middleware/authenticate';

const router = Router();

router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/register', validate(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post('/refresh-token', validate(refreshTokenSchema), (req, res, next) => authController.refreshToken(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.getCurrentUser(req, res, next));

export const authRouter = router;

