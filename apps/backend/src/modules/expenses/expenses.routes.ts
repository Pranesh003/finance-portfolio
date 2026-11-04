import { Router, Request, Response, NextFunction } from 'express';
import { transactionsService } from '../transactions/transactions.service';
import { ApiResponse, FinancialTransaction } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const expenses = await transactionsService.getExpenses();
    const response: ApiResponse<FinancialTransaction[]> = {
      success: true,
      data: expenses,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const expensesRouter = router;

