import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, User } from '@finance/types';
import { authService } from '../auth/auth.service';
import { authenticate } from '../../core/middleware/authenticate';

export class UsersService {
  public async getProfile(): Promise<User> {
    return authService.getDemoUser();
  }
}

export const usersService = new UsersService();

const router = Router();
router.use(authenticate);

router.get('/profile', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getProfile();
    const response: ApiResponse<User> = {
      success: true,
      data: user,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const usersRouter = router;

