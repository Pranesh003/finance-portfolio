import { Router, Request, Response, NextFunction } from 'express';
import { transactionsService } from '../transactions/transactions.service';
import { ApiResponse, FinancialTransaction } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const income = await transactionsService.getIncome();
    const response: ApiResponse<FinancialTransaction[]> = {
      success: true,
      data: income,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const incomeRouter = router;

