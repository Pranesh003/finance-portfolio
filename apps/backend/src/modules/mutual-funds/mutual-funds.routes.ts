import { Router, Request, Response, NextFunction } from 'express';
import { investmentsService } from '../investments/investments.service';
import { ApiResponse, MutualFundHolding } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const mutualFunds = await investmentsService.getMutualFunds();
    const response: ApiResponse<MutualFundHolding[]> = {
      success: true,
      data: mutualFunds,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const mutualFundsRouter = router;

