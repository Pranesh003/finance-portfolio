import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { ApiResponse } from '@finance/types';
import { UnauthorizedError } from '../../core/errors/AppError';

export class UserController {
  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError('Unauthorized');

      const user = await userService.getProfile(userId);
      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError('Unauthorized');

      const updated = await userService.updateProfile(userId, req.body);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Profile updated successfully',
        data: updated,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError('Unauthorized');

      const updated = await userService.updatePreferences(userId, req.body);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Preferences updated successfully',
        data: updated,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async submitOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError('Unauthorized');

      const updated = await userService.submitOnboarding(userId, req.body);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Onboarding completed successfully',
        data: updated,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError('Unauthorized');

      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      await userService.changePassword(userId, req.body, ip, userAgent);

      const response: ApiResponse<{ changed: boolean }> = {
        success: true,
        message: 'Password changed successfully',
        data: { changed: true },
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError('Unauthorized');

      const currentSessionId = (req.user as any)?.sessionId;
      const sessions = await userService.getActiveSessions(userId, currentSessionId);

      const response: ApiResponse<typeof sessions> = {
        success: true,
        data: sessions,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async revokeSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError('Unauthorized');

      const sessionId = req.params.id;
      if (!sessionId) {
        res.status(400).json({ success: false, message: 'Session ID is required' });
        return;
      }

      await userService.revokeSession(userId, sessionId);

      const response: ApiResponse<{ revoked: boolean }> = {
        success: true,
        message: 'Session revoked successfully',
        data: { revoked: true },
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async revokeAllOtherSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError('Unauthorized');

      const currentSessionId = (req.user as any)?.sessionId;
      await userService.revokeAllOtherSessions(userId, currentSessionId);

      const response: ApiResponse<{ revokedOther: boolean }> = {
        success: true,
        message: 'All other active sessions revoked',
        data: { revokedOther: true },
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async deactivateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError('Unauthorized');

      const ip = req.ip || req.socket.remoteAddress;
      await userService.deactivateAccount(userId, ip);

      const response: ApiResponse<{ deactivated: boolean }> = {
        success: true,
        message: 'Account has been deactivated',
        data: { deactivated: true },
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async requestAccountDeletion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError('Unauthorized');

      const ip = req.ip || req.socket.remoteAddress;
      await userService.requestAccountDeletion(userId, ip);

      const response: ApiResponse<{ requested: boolean }> = {
        success: true,
        message: 'Account deletion request submitted. You will receive a confirmation link.',
        data: { requested: true },
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError('Unauthorized');

      const logs = await userService.getAuditLogs(userId);
      const response: ApiResponse<typeof logs> = {
        success: true,
        data: logs,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public async listAllUsersAdmin(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.listAllUsersAdmin();
      const response: ApiResponse<typeof users> = {
        success: true,
        message: 'Admin access granted: system users retrieved',
        data: users,
        timestamp: new Date().toISOString()
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
