import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate, authorize } from '../../core/middleware/authenticate';
import { validate } from '../../core/middleware/validate';
import {
  updateProfileSchema,
  updatePreferencesSchema,
  changePasswordSchema,
  onboardingSchema
} from '@finance/validation';

const router = Router();
router.use(authenticate);

router.get('/profile', (req, res, next) => userController.getProfile(req, res, next));
router.patch('/profile', validate(updateProfileSchema), (req, res, next) => userController.updateProfile(req, res, next));
router.patch('/preferences', validate(updatePreferencesSchema), (req, res, next) => userController.updatePreferences(req, res, next));
router.post('/onboarding', validate(onboardingSchema), (req, res, next) => userController.submitOnboarding(req, res, next));
router.post('/change-password', validate(changePasswordSchema), (req, res, next) => userController.changePassword(req, res, next));

router.get('/sessions', (req, res, next) => userController.getSessions(req, res, next));
router.delete('/sessions/:id', (req, res, next) => userController.revokeSession(req, res, next));
router.delete('/sessions', (req, res, next) => userController.revokeAllOtherSessions(req, res, next));

router.post('/deactivate', (req, res, next) => userController.deactivateAccount(req, res, next));
router.post('/delete-request', (req, res, next) => userController.requestAccountDeletion(req, res, next));
router.get('/audit-logs', (req, res, next) => userController.getAuditLogs(req, res, next));

// RBAC Protected Admin Endpoint
router.get('/admin/all', authorize('ADMIN'), (req, res, next) => userController.listAllUsersAdmin(req, res, next));

export const usersRouter = router;
