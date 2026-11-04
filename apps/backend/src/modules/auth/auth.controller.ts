import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { env } from '../../config/env';
import { ApiResponse } from '@finance/types';

export class AuthController {
  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      domain: env.COOKIE_DOMAIN || undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      domain: env.COOKIE_DOMAIN || undefined,
      path: '/'
    });
  }

  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const result = await authService.register(req.body, ip, userAgent);

      this.setRefreshCookie(res, result.tokens.refreshToken);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Account registered successfully',
        data: result,
        timestamp: new Date().toISOString()
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const result = await authService.login(req.body, ip, userAgent);

      this.setRefreshCookie(res, result.tokens.refreshToken);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Authentication successful',
        data: result,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async socialAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const result = await authService.socialAuth(req.body, ip, userAgent);

      this.setRefreshCookie(res, result.tokens.refreshToken);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: `${req.body.provider} authentication successful`,
        data: result,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async sendPhoneOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const result = await authService.sendPhoneOtp(req.body, ip);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: result.message,
        data: result,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async verifyPhoneOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const result = await authService.verifyPhoneOtp(req.body, ip, userAgent);

      this.setRefreshCookie(res, result.tokens.refreshToken);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Phone verification successful',
        data: result,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const result = await authService.requestPasswordReset(req.body, ip, userAgent);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: result.message,
        data: result,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const result = await authService.resetPassword(req.body, ip, userAgent);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: result.message,
        data: result,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const token = req.body.token || (req.query.token as string);
      const result = await authService.verifyEmail(token, ip);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: result.message,
        data: result,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async resendEmailVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await authService.resendEmailVerification(userId);
      const response: ApiResponse<typeof result> = {
        success: true,
        message: result.message,
        data: result,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // Read from body or cookie
      const rawCookies = req.headers.cookie || '';
      const cookieMatch = rawCookies.match(/refreshToken=([^;]+)/);
      const token = req.body?.refreshToken || (cookieMatch ? cookieMatch[1] : undefined);

      if (!token) {
        res.status(401).json({ success: false, message: 'Refresh token missing' });
        return;
      }

      const tokens = await authService.refreshToken(token, ip, userAgent);
      this.setRefreshCookie(res, tokens.refreshToken);

      const response: ApiResponse<typeof tokens> = {
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawCookies = req.headers.cookie || '';
      const cookieMatch = rawCookies.match(/refreshToken=([^;]+)/);
      const token = req.body?.refreshToken || (cookieMatch ? cookieMatch[1] : undefined);

      await authService.logout(req.body?.sessionId, token, req.user?.id);
      this.clearRefreshCookie(res);

      const response: ApiResponse<{ loggedOut: boolean }> = {
        success: true,
        message: 'Logged out successfully',
        data: { loggedOut: true },
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      await authService.logoutAll(userId);
      this.clearRefreshCookie(res);

      const response: ApiResponse<{ loggedOutAll: boolean }> = {
        success: true,
        message: 'Logged out from all active devices successfully',
        data: { loggedOutAll: true },
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const user = userId ? authService.getUserById(userId) : authService.getDemoUser();

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
        timestamp: new Date().toISOString()
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
