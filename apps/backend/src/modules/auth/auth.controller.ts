import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '@finance/types';

export class AuthController {
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
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

  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
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

  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokens = await authService.refreshToken(req.body.refreshToken);
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

  public async getCurrentUser(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = authService.getDemoUser();
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

