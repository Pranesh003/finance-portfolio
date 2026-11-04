import { Router, Request, Response, NextFunction } from 'express';
import { investmentsService } from '../investments/investments.service';
import { ApiResponse, CryptoHolding } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const crypto = await investmentsService.getCrypto();
    const response: ApiResponse<CryptoHolding[]> = {
      success: true,
      data: crypto,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const cryptoRouter = router;

