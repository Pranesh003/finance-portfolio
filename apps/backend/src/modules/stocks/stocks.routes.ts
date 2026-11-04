import { Router, Request, Response, NextFunction } from 'express';
import { investmentsService } from '../investments/investments.service';
import { ApiResponse, StockHolding } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo_user';
    const stocks = await investmentsService.getStocks(userId);
    const response: ApiResponse<StockHolding[]> = {
      success: true,
      data: stocks,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const stocksRouter = router;

