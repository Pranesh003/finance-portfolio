import { Router, Request, Response, NextFunction } from 'express';
import { investmentsService } from '../investments/investments.service';
import { ApiResponse, BondHolding } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const bonds = await investmentsService.getBonds();
    const response: ApiResponse<BondHolding[]> = {
      success: true,
      data: bonds,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const bondsRouter = router;

