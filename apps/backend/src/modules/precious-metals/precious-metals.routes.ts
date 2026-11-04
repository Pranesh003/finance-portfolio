import { Router, Request, Response, NextFunction } from 'express';
import { investmentsService } from '../investments/investments.service';
import { ApiResponse, PreciousMetalHolding } from '@finance/types';
import { optionalAuthenticate } from '../../core/middleware/authenticate';

const router = Router();
router.use(optionalAuthenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo_user';
    const metals = await investmentsService.getPreciousMetals(userId);
    const response: ApiResponse<PreciousMetalHolding[]> = {
      success: true,
      data: metals,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const preciousMetalsRouter = router;

