import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, Budget } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const MOCK_BUDGETS: Budget[] = [
  {
    id: 'budget_001',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'November 2026 Household Budget (Mock)',
    period: 'MONTHLY',
    startDate: '2026-11-01T00:00:00Z',
    endDate: '2026-11-30T23:59:59Z',
    totalLimitAmount: 5000.0,
    totalSpentAmount: 1845.2,
    currency: 'USD',
    alertThresholdPercentage: 80,
    isActive: true,
    categoryBudgets: [
      {
        categoryId: 'cat_groceries',
        categoryName: 'Groceries & Dining',
        limitAmount: 1200.0,
        spentAmount: 430.5,
        remainingAmount: 769.5,
        percentageUsed: 35.88
      },
      {
        categoryId: 'cat_utilities',
        categoryName: 'Utilities & Bills',
        limitAmount: 600.0,
        spentAmount: 310.0,
        remainingAmount: 290.0,
        percentageUsed: 51.67
      }
    ],
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-04T05:00:00Z'
  }
];

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response: ApiResponse<Budget[]> = {
      success: true,
      data: MOCK_BUDGETS,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const budgetsRouter = router;

