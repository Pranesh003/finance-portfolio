import { Router, Request, Response, NextFunction } from 'express';
import { transactionsService } from './transactions.service';
import { ApiResponse, FinancialTransaction } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const transactions = await transactionsService.listTransactions();
    const response: ApiResponse<FinancialTransaction[]> = {
      success: true,
      data: transactions,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await transactionsService.createTransaction(req.body);
    const response: ApiResponse<FinancialTransaction> = {
      success: true,
      message: 'Transaction recorded successfully',
      data: created,
      timestamp: new Date().toISOString()
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

export const transactionsRouter = router;

