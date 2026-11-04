import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, AppNotification } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_001',
    userId: '00000000-0000-0000-0000-000000000001',
    topic: 'GOAL_MILESTONE',
    title: 'Milestone Achieved (Mock)',
    message: 'Congratulations! You reached your milestone "3 Months Expenses Reached".',
    priority: 'NORMAL',
    channels: ['IN_APP', 'PUSH'],
    isRead: false,
    createdAt: '2026-11-03T18:00:00Z',
    updatedAt: '2026-11-03T18:00:00Z'
  }
];

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response: ApiResponse<AppNotification[]> = {
      success: true,
      data: MOCK_NOTIFICATIONS,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const notificationsRouter = router;

