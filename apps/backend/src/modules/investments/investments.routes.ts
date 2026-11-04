import { Router, Request, Response, NextFunction } from 'express';
import { investmentsService } from './investments.service';
import { ApiResponse } from '@finance/types';
import { authenticate } from '../../core/middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/portfolios', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const portfolios = await investmentsService.getPortfolios();
    const response: ApiResponse<typeof portfolios> = {
      success: true,
      data: portfolios,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/stocks', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stocks = await investmentsService.getStocks();
    const response: ApiResponse<typeof stocks> = {
      success: true,
      data: stocks,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/mutual-funds', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const mutualFunds = await investmentsService.getMutualFunds();
    const response: ApiResponse<typeof mutualFunds> = {
      success: true,
      data: mutualFunds,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/etfs', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const etfs = await investmentsService.getETFs();
    const response: ApiResponse<typeof etfs> = {
      success: true,
      data: etfs,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/bonds', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const bonds = await investmentsService.getBonds();
    const response: ApiResponse<typeof bonds> = {
      success: true,
      data: bonds,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/crypto', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const crypto = await investmentsService.getCrypto();
    const response: ApiResponse<typeof crypto> = {
      success: true,
      data: crypto,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/precious-metals', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const metals = await investmentsService.getPreciousMetals();
    const response: ApiResponse<typeof metals> = {
      success: true,
      data: metals,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export const investmentsRouter = router;

