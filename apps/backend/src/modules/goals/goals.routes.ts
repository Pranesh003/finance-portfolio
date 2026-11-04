import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, FinancialGoal } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const MOCK_GOALS: FinancialGoal[] = [
  {
    id: 'goal_001',
    userId: '00000000-0000-0000-0000-000000000001',
    title: 'Emergency Fund 6 Months (Mock)',
    description: 'Liquid rainy-day reserves in High Yield Savings',
    category: 'EMERGENCY_FUND',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    targetAmount: 50000.0,
    currentAmount: 35200.8,
    currency: 'USD',
    targetDate: '2027-06-30T00:00:00Z',
    monthlyContributionTarget: 1000.0,
    projectedCompletionDate: '2027-04-15T00:00:00Z',
    milestones: [
      {
        id: 'ms_01',
        name: '3 Months Expenses Reached',
        targetAmount: 25000.0,
        targetDate: '2026-06-01T00:00:00Z',
        isReached: true,
        reachedAt: '2026-05-20T00:00:00Z'
      },
      {
        id: 'ms_02',
        name: '6 Months Fully Funded',
        targetAmount: 50000.0,
        targetDate: '2027-06-30T00:00:00Z',
        isReached: false
      }
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  }
];

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response: ApiResponse<FinancialGoal[]> = {
      success: true,
      data: MOCK_GOALS,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const goalsRouter = router;

