import { Router, Request, Response, NextFunction } from 'express';
import { investmentsService } from '../investments/investments.service';
import { ApiResponse, MutualFundHolding } from '@finance/types';
import { optionalAuthenticate } from '../../core/middleware/authenticate';

const router = Router();
router.use(optionalAuthenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo_user';
    const mutualFunds = await investmentsService.getMutualFunds(userId);
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

